'use client'

import { useState } from 'react'
import styles from './ControlGroup.module.scss'

export default function ControlGroup ({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={styles.group}>
      <div className={styles.title}>
        <h3>{title}</h3>
        <button onClick={() => setOpen(!open)} className={open ? styles.expanded : ''}>
          {open ? '-' : '+'}
        </button>
      </div>
      {open && <div className={styles.content}>{children}</div>}
    </div>
  )
}
