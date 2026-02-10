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
          {videoExport.exporting ? (
            <>
              <div className={styles.progress}>
                <div className={styles.bar} style={{ width: `${videoExport.progress * 100}%` }} />
              </div>
              <div className={styles.progressLabel}>
                Generating video... {Math.round(videoExport.progress * 100)}%
              </div>
              <button className={styles.cancelBtn} onClick={videoExport.cancel}>
                Cancel
              </button>
            </>
          ) : (
            <div className={styles.exportRow}>
              <button className={styles.exportBtn} onClick={videoExport.exportVideo}>
                Export video
              </button>
              <select
                className={styles.durationSelect}
                value={videoExport.duration}
                onChange={(e) => videoExport.setDuration(Number(e.target.value))}
              >
                <option value={5}>5s</option>
                <option value={10}>10s</option>
              </select>
            </div>
          )}
        </div>
      )}
    </footer>
  )
}
