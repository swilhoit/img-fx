'use client'

import { useState, useRef, useCallback } from 'react'

export default function useVideoExport (containerRef) {
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(5)

  const abortRef = useRef(false)

  const exportVideo = useCallback(async () => {
    const canvas = containerRef.current?.querySelector('canvas')
    if (!canvas || exporting) return

    abortRef.current = false
    setExporting(true)
    setProgress(0)

    const fps = 30
    const frameDurationUs = Math.round(1_000_000 / fps)
    const totalFrames = duration * fps
    const width = canvas.width
    const height = canvas.height

    try {
      const { Muxer, ArrayBufferTarget } = await import('mp4-muxer')

      const target = new ArrayBufferTarget()
      const muxer = new Muxer({
        target,
        video: {
          codec: 'avc',
          width,
          height
        },
        fastStart: 'in-memory'
      })

      const encoder = new VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: (e) => console.error('VideoEncoder error:', e)
      })

      encoder.configure({
        codec: 'avc1.640028',
        width,
        height,
        bitrate: 8_000_000,
        framerate: fps
      })

      for (let i = 0; i < totalFrames; i++) {
        if (abortRef.current) break

        await new Promise(r => requestAnimationFrame(r))

        const timestamp = i * frameDurationUs
        const frame = new VideoFrame(canvas, {
          timestamp,
          duration: frameDurationUs
        })
        encoder.encode(frame, { keyFrame: i % (fps * 2) === 0 })
        frame.close()

        setProgress((i + 1) / totalFrames)
      }

      await encoder.flush()
      encoder.close()
      muxer.finalize()

      if (!abortRef.current) {
        const blob = new Blob([target.buffer], { type: 'video/mp4' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `animation-${duration}s.mp4`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (e) {
      console.warn('VideoEncoder not available, falling back to MediaRecorder:', e)
      if (!abortRef.current) await fallbackRecord(canvas, duration, setProgress)
    }

    setExporting(false)
    setProgress(0)
  }, [containerRef, exporting, duration])

  const cancel = useCallback(() => {
    abortRef.current = true
  }, [])

  return { exporting, progress, duration, setDuration, exportVideo, cancel }
}

function fallbackRecord (canvas, durationSec, setProgress) {
  return new Promise((resolve) => {
    const stream = canvas.captureStream(30)
    const mimeType = MediaRecorder.isTypeSupported('video/mp4')
      ? 'video/mp4'
      : 'video/webm'
    const chunks = []
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 })
    const totalMs = durationSec * 1000
    const startTime = Date.now()

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data)
    }

    const interval = setInterval(() => {
      setProgress(Math.min(1, (Date.now() - startTime) / totalMs))
    }, 100)

    recorder.onstop = () => {
      clearInterval(interval)
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm'
      const blob = new Blob(chunks, { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `animation-${durationSec}s.${ext}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      resolve()
    }

    recorder.start(100)
    setTimeout(() => recorder.stop(), totalMs)
  })
}
