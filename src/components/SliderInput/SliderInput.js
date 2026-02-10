'use client'

import styles from './SliderInput.module.scss'

export default function SliderInput ({ label, value, onChange, min = 0, max = 100, step = 1 }) {
  const handleNumber = (e) => {
    const v = parseFloat(e.target.value)
    if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)))
  }

  const handleRange = (e) => {
    onChange(parseFloat(e.target.value))
  }

  return (
    <div className={styles.wrapper} role="group" aria-label={label}>
      <label className={styles.label}>{label}</label>
      <input
        type="number"
        className={styles.number}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={handleNumber}
        aria-label={`${label} value`}
      />
      <input
        type="range"
        className={styles.range}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={handleRange}
        aria-label={`${label} slider`}
      />
    </div>
  )
}
