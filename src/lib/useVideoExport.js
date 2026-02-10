'use client'

import { useState, useRef, useCallback } from 'react'

export default function useVideoExport (containerRef) {
  const [recording, setRecording] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(3)
  const [fps, setFps] = useState(30)

  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  const startRecording = useCallback(() => {
    const canvas = containerRef.current?.querySelector('canvas')
    if (!canvas) return

    chunksRef.current = []
    setProgress(0)
    setRecording(true)

    const stream = canvas.captureStream(fps)
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4'

    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 8000000
    })

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.onstop = () => {
      const ext = mimeType.includes('webm') ? 'webm' : 'mp4'
      const blob = new Blob(chunksRef.current, { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `animation.${ext}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setRecording(false)
      setProgress(0)
    }

    recorder.start(100)
    recorderRef.current = recorder

    const totalMs = duration * 1000
    const startTime = Date.now()

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const pct = Math.min(1, elapsed / totalMs)
      setProgress(pct)

      if (elapsed >= totalMs) {
        clearInterval(timerRef.current)
        timerRef.current = null
        if (recorderRef.current && recorderRef.current.state === 'recording') {
          recorderRef.current.stop()
        }
      }
    }, 100)
  }, [containerRef, duration, fps])

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop()
    }
  }, [])

  return {
    recording,
    progress,
    duration, setDuration,
    fps, setFps,
    startRecording,
    stopRecording
  }
}
