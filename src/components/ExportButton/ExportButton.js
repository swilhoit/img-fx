'use client'

import { useEffect, useCallback } from 'react'
import styles from './ExportButton.module.scss'

export default function ExportButton ({ onExport }) {
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
    </footer>
  )
}
