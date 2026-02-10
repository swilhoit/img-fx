'use client'

import styles from './ColorInput.module.scss'

export default function ColorInput ({ label, value, onChange }) {
  return (
    <div className={styles.wrapper}>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.swatch}
        aria-label={label}
      />
      <label className={styles.label}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          const v = e.target.value
          if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v)
        }}
        className={styles.hex}
        maxLength={7}
        spellCheck={false}
      />
    </div>
  )
}
