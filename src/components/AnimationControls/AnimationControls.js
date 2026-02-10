'use client'

import ControlGroup from '@/components/ControlGroup/ControlGroup'
import SliderInput from '@/components/SliderInput/SliderInput'
import styles from './AnimationControls.module.scss'

export default function AnimationControls ({ enabled, toggle, reseed, speed, setSpeed, randomness, setRandomness, intensity, setIntensity, excluded, toggleExcluded, paramKeys }) {
  return (
    <ControlGroup title="Animation" defaultOpen={false}>
      <div className={styles.row}>
        <button className={`${styles.toggle} ${enabled ? styles.active : ''}`} onClick={toggle}>
          {enabled ? '■ Stop' : '▶ Animate'}
        </button>
        {enabled && (
          <button className={styles.reseed} onClick={reseed} title="Randomize motion pattern">
            ↻
          </button>
        )}
      </div>
      <SliderInput label="Speed" value={speed} onChange={setSpeed} min={0.05} max={2} step={0.05} />
      <SliderInput label="Randomness" value={randomness} onChange={setRandomness} min={0} max={1} step={0.01} />
      <SliderInput label="Intensity" value={intensity} onChange={setIntensity} min={0.01} max={1} step={0.01} />
      {paramKeys && paramKeys.length > 0 && (
        <div className={styles.params}>
          <div className={styles.paramsLabel}>Parameters</div>
          {paramKeys.map(key => (
            <label key={key} className={styles.paramToggle}>
              <input
                type="checkbox"
                checked={!excluded.has(key)}
                onChange={() => toggleExcluded(key)}
              />
              <span>{key}</span>
            </label>
          ))}
        </div>
      )}
    </ControlGroup>
  )
}
