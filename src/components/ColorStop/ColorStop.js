'use client'

import styles from './ColorStop.module.scss'

export default function ColorStop ({ stops, onChange, onAdd, onRemove }) {
  const updateStop = (index, field, value) => {
    const next = [...stops]
    next[index] = { ...next[index], [field]: value }
    onChange(next)
  }

  return (
    <div className={styles.wrapper}>
      {stops.map((stop, i) => (
        <div key={i} className={styles.stop}>
          <input
            type="color"
            value={stop.color}
            onChange={(e) => updateStop(i, 'color', e.target.value)}
            className={styles.color}
          />
          <input
            type="number"
            value={stop.position}
            min={0}
            max={100}
            onChange={(e) => updateStop(i, 'position', parseInt(e.target.value) || 0)}
            className={styles.position}
          />
          <span>%</span>
          {stops.length > 2 && (
            <button className={styles.remove} onClick={() => onRemove(i)}>-</button>
          )}
        </div>
      ))}
      <button className={styles.add} onClick={onAdd}>+ add stop</button>
    </div>
  )
}
