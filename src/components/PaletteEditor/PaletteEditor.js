'use client'

import { useCallback } from 'react'
import styles from './PaletteEditor.module.scss'

const DEFAULT_NEW_COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff']

export default function PaletteEditor ({ colors, onChange }) {
  const addColor = useCallback(() => {
    const unused = DEFAULT_NEW_COLORS.find(c => !colors.includes(c)) || '#888888'
    onChange([...colors, unused])
  }, [colors, onChange])

  const removeColor = useCallback((idx) => {
    if (colors.length <= 2) return
    onChange(colors.filter((_, i) => i !== idx))
  }, [colors, onChange])

  const updateColor = useCallback((idx, val) => {
    const next = [...colors]
    next[idx] = val
    onChange(next)
  }, [colors, onChange])

  return (
    <div className={styles.wrapper}>
      <div className={styles.label}>Palette Colors</div>
      <div className={styles.swatches}>
        {colors.map((c, i) => (
          <div key={i} className={styles.swatchWrap}>
            <input
              type="color"
              value={c}
              onChange={(e) => updateColor(i, e.target.value)}
              className={styles.swatch}
            />
            {colors.length > 2 && (
              <button className={styles.remove} onClick={() => removeColor(i)}>&times;</button>
            )}
          </div>
        ))}
        {colors.length < 16 && (
          <button className={styles.addBtn} onClick={addColor}>+</button>
        )}
      </div>
    </div>
  )
}
