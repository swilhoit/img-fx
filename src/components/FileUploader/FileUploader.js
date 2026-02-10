'use client'

import { useRef, useEffect, useCallback } from 'react'
import styles from './FileUploader.module.scss'

export default function FileUploader ({ label = 'Upload media', accept = '.jpg,.png,.mp4', onFile, id = 'media' }) {
  const inputRef = useRef(null)

  const handleChange = (e) => {
    const file = e.target.files?.[0]
    if (file && onFile) onFile(file)
  }

  const handleKeyboard = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
      e.preventDefault()
      inputRef.current?.click()
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyboard)
    return () => window.removeEventListener('keydown', handleKeyboard)
  }, [handleKeyboard])

  return (
    <div className={styles.uploader}>
      <input
        ref={inputRef}
        type="file"
        id={id}
        accept={accept}
        onChange={handleChange}
      />
      <label htmlFor={id} className={styles.label}>
        {label}
        <span className={styles.shortcut}><kbd>Ctrl</kbd> + <kbd>O</kbd></span>
      </label>
      <div className={styles.display}>[{accept}]</div>
    </div>
  )
}
