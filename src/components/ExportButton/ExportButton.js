'use client'

import { useEffect, useCallback } from 'react'
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
          {videoExport.recording ? (
            <>
              <div className={styles.progress}>
                <div className={styles.bar} style={{ width: `${videoExport.progress * 100}%` }} />
              </div>
              <button className={styles.stopBtn} onClick={videoExport.stop}>
                ■ Stop recording
              </button>
            </>
          ) : (
            <div className={styles.btnRow}>
              <button className={styles.recordBtn} onClick={() => videoExport.record(5)}>
                Record 5s .mp4
              </button>
              <button className={styles.recordBtn} onClick={() => videoExport.record(10)}>
                Record 10s .mp4
              </button>
            </div>
          )}
        </div>
      )}
    </footer>
  )
}
