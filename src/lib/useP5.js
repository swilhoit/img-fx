'use client'

import { useEffect, useRef } from 'react'

/**
 * Hook for p5 instance mode with support for animated parameters.
 *
 * @param {Function} sketchFactory - (paramsRef) => (p) => { p.setup, p.draw }
 *   Receives a ref to the current render params. Sketch should read
 *   paramsRef.current in draw() for smooth animation.
 * @param {Array} structuralDeps - deps that require full p5 re-init (image, canvasSize, showEffect)
 * @param {Object} renderParams - params object updated every render (sliders, colors etc.)
 */
export default function useP5 (sketchFactory, structuralDeps, renderParams) {
  const containerRef = useRef(null)
  const p5Ref = useRef(null)
  const paramsRef = useRef(renderParams)
  paramsRef.current = renderParams

  useEffect(() => {
    let cancelled = false

    async function init () {
      if (!containerRef.current) return
      const p5Module = await import('p5')
      const p5 = p5Module.default

      if (cancelled) return

      if (p5Ref.current) {
        p5Ref.current.remove()
        p5Ref.current = null
      }

      const existing = containerRef.current.querySelectorAll('canvas')
      existing.forEach(c => c.remove())

      const instance = new p5(sketchFactory(paramsRef), containerRef.current)
      p5Ref.current = instance
    }

    init()

    return () => {
      cancelled = true
      if (p5Ref.current) {
        p5Ref.current.remove()
        p5Ref.current = null
      }
    }
  }, structuralDeps) // eslint-disable-line react-hooks/exhaustive-deps

  return { containerRef, p5Ref }
}
