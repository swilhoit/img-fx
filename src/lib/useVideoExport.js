'use client'

import { useState, useRef, useCallback } from 'react'

export default function useVideoExport (containerRef) {
  const [recording, setRecording] = useState(false)
  const [progress, setProgress] = useState(0)

  const abortRef = useRef(false)

  const record = useCallback(async (durationSec) => {
    const canvas = containerRef.current?.querySelector('canvas')
    if (!canvas || recording) return

    abortRef.current = false
    setRecording(true)
    setProgress(0)

    const fps = 30
    const totalFrames = durationSec * fps
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

        // Wait for the next animation frame so the canvas updates
        await new Promise(r => requestAnimationFrame(r))

        const frame = new VideoFrame(canvas, {
          timestamp: (i / fps) * 1_000_000
        })
        encoder.encode(frame, { keyFrame: i % (fps * 2) === 0 })
        frame.close()

        setProgress((i + 1) / totalFrames)
      }

      await encoder.flush()
      encoder.close()
      muxer.finalize()

      const blob = new Blob([target.buffer], { type: 'video/mp4' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `animation-${durationSec}s.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      // Fallback to MediaRecorder if VideoEncoder unavailable
      console.warn('VideoEncoder not available, falling back to MediaRecorder:', e)
      await fallbackRecord(canvas, durationSec)
    }

    setRecording(false)
    setProgress(0)
  }, [containerRef, recording])

  const stop = useCallback(() => {
    abortRef.current = true
  }, [])

  return { recording, progress, record, stop }
}

function fallbackRecord (canvas, durationSec) {
  return new Promise((resolve) => {
    const stream = canvas.captureStream(30)
    const mimeType = MediaRecorder.isTypeSupported('video/mp4')
      ? 'video/mp4'
      : 'video/webm'
    const chunks = []
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 })

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data)
    }

    recorder.onstop = () => {
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
    setTimeout(() => recorder.stop(), durationSec * 1000)
  })
}
