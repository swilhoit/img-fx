'use client'

import styles from './Toggle.module.scss'

export default function Toggle ({ label, checked, onChange }) {
  return (
    <div className={styles.toggle}>
      <div className={styles.box}>
        <span>[</span>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-label={label}
        />
        <span>]</span>
      </div>
      <label>{label}</label>
    </div>
  )
}
