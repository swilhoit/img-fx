'use client'

import styles from './SelectInput.module.scss'

export default function SelectInput ({ label, value, onChange, options }) {
  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <select value={value} onChange={(e) => onChange(e.target.value)} className={styles.select}>
        {options.map((opt) => {
          const val = typeof opt === 'string' ? opt : opt.value
          const text = typeof opt === 'string' ? opt : opt.label
          return <option key={val} value={val}>{text}</option>
        })}
      </select>
    </div>
  )
}
