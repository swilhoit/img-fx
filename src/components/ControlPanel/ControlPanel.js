'use client'

import styles from './ControlPanel.module.scss'

export default function ControlPanel ({ children }) {
  return (
    <div className={styles.panel}>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  )
}
