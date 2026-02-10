'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// Simple Perlin-like noise using sine harmonics
function smoothNoise (t, seed) {
  return (
    Math.sin(t * 1.0 + seed * 100) * 0.5 +
    Math.sin(t * 2.3 + seed * 47) * 0.25 +
    Math.sin(t * 4.1 + seed * 23) * 0.125
  ) / 0.875
}

/**
 * Registers animatable parameters and drives them with smooth random motion.
 *
 * @param {Object} paramDefs - { [key]: { value, set, min, max, step } }
 *   Each entry describes a numeric slider parameter.
 *   `value` and `set` come from the page's useState.
 *   `min`, `max`, `step` define the slider range.
 *
 * @returns {{ animationState, setAnimationState, AnimationControlProps }}
 *   animationState: { enabled, speed, randomness, intensity }
 *   setAnimationState: setter
 *   AnimationControlProps: pass directly to <AnimationControls />
 */
export default function useAnimation (paramDefs, initialExcluded) {
  const [enabled, setEnabled] = useState(false)
  const [speed, setSpeed] = useState(0.5)
  const [randomness, setRandomness] = useState(0.5)
  const [intensity, setIntensity] = useState(0.5)
  const [excluded, setExcluded] = useState(() => new Set(initialExcluded || []))

  const defsRef = useRef(paramDefs)
  defsRef.current = paramDefs

  const excludedRef = useRef(excluded)
  excludedRef.current = excluded

  const toggleExcluded = useCallback((key) => {
    setExcluded(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const seedsRef = useRef(null)
  const baselineRef = useRef(null)
  const lastSetRef = useRef({})
  const frameRef = useRef(null)
  const timeRef = useRef(0)
  const lastFrameRef = useRef(0)

  // Capture baseline values and generate random seeds on enable
  const start = useCallback(() => {
    const defs = defsRef.current
    const seeds = {}
    const baseline = {}
    for (const key of Object.keys(defs)) {
      seeds[key] = Math.random() * 1000
      baseline[key] = defs[key].value
    }
    seedsRef.current = seeds
    baselineRef.current = baseline
    lastSetRef.current = {}
    timeRef.current = 0
    lastFrameRef.current = performance.now()
    setEnabled(true)
  }, [])

  const stop = useCallback(() => {
    setEnabled(false)
    // Restore baseline values
    if (baselineRef.current) {
      const defs = defsRef.current
      for (const key of Object.keys(defs)) {
        if (baselineRef.current[key] !== undefined) {
          defs[key].set(baselineRef.current[key])
        }
      }
    }
  }, [])

  const toggle = useCallback(() => {
    if (enabled) stop()
    else start()
  }, [enabled, start, stop])

  // Randomize seeds to get a new motion pattern
  const reseed = useCallback(() => {
    if (!seedsRef.current) return
    for (const key of Object.keys(seedsRef.current)) {
      seedsRef.current[key] = Math.random() * 1000
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      return
    }

    function tick (now) {
      const dt = (now - lastFrameRef.current) / 1000
      lastFrameRef.current = now
      timeRef.current += dt * speed * 2

      const defs = defsRef.current
      const seeds = seedsRef.current
      const baseline = baselineRef.current

      const ex = excludedRef.current

      for (const key of Object.keys(defs)) {
        if (ex.has(key)) continue

        const { value, set, min, max, step } = defs[key]
        const range = max - min

        // Detect manual slider change: if current value differs from
        // what animation last set, user moved the slider -- update baseline
        if (lastSetRef.current[key] !== undefined && value !== lastSetRef.current[key]) {
          baseline[key] = value
        }

        const base = baseline[key]

        // Noise-based offset scaled by intensity and randomness
        const noiseVal = smoothNoise(timeRef.current * (0.5 + randomness * 1.5), seeds[key])
        const offset = noiseVal * range * intensity * 0.5

        let newVal = base + offset
        newVal = Math.min(max, Math.max(min, newVal))

        // Snap to step
        if (step >= 1) {
          newVal = Math.round(newVal / step) * step
        } else {
          const precision = Math.round(1 / step)
          newVal = Math.round(newVal * precision) / precision
        }

        lastSetRef.current[key] = newVal
        set(newVal)
      }

      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [enabled, speed, randomness, intensity])

  return {
    enabled,
    toggle,
    reseed,
    speed, setSpeed,
    randomness, setRandomness,
    intensity, setIntensity,
    excluded, toggleExcluded,
    paramKeys: Object.keys(paramDefs)
  }
}
