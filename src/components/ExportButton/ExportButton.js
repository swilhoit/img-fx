'use client'

import { useEffect, useCallback } from 'react'
import SliderInput from '@/components/SliderInput/SliderInput'
import styles from './ExportButton.module.scss'

export default function ExportButton ({ onExport, videoExport, animationEnabled }) {
  const handleExport = useCallback(() => {
    if (onExport) onExport()
  }, [onExport])

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleExport()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleExport])

  return (
    <footer className={styles.footer}>
      <button className={styles.button} onClick={handleExport}>
        Export canvas
        <span className={styles.shortcut}><kbd>Ctrl</kbd> + <kbd>S</kbd></span>
      </button>

      {animationEnabled && videoExport && (
        <div className={styles.video}>
          <SliderInput
            label="Duration (s)"
            value={videoExport.duration}
            onChange={videoExport.setDuration}
            min={1} max={30} step={1}
          />
          <SliderInput
            label="FPS"
            value={videoExport.fps}
            onChange={videoExport.setFps}
            min={10} max={60} step={5}
          />

          {videoExport.recording ? (
            <>
              <div className={styles.progress}>
                <div className={styles.bar} style={{ width: `${videoExport.progress * 100}%` }} />
              </div>
              <button className={styles.stopBtn} onClick={videoExport.stopRecording}>
                ■ Stop recording
              </button>
            </>
          ) : (
            <button className={styles.recordBtn} onClick={videoExport.startRecording}>
              ● Record video
            </button>
          )}
        </div>
      )}
    </footer>
  )
}
