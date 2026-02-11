'use client'

import { useEffect, useRef } from 'react'

/**
 * Hook for p5 instance mode with support for animated parameters.
 *
 * @param {Function} sketchFactory - (paramsRef) => (p) => { p.setup, p.draw }
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
    let instance = null

    async function init () {
      if (!containerRef.current) return
      const p5Module = await import('p5')
      const p5 = p5Module.default

      if (cancelled) return

      // Destroy previous instance
      if (p5Ref.current) {
        p5Ref.current.remove()
        p5Ref.current = null
      }

      // Remove ALL canvases from container before creating new one
      const existing = containerRef.current.querySelectorAll('canvas')
      existing.forEach(c => c.remove())

      if (cancelled) return

      instance = new p5(sketchFactory(paramsRef), containerRef.current)
      p5Ref.current = instance
    }

    init()

    return () => {
      cancelled = true
      if (instance) {
        instance.remove()
        instance = null
      }
      if (p5Ref.current) {
        p5Ref.current.remove()
        p5Ref.current = null
      }
      // Final sweep: remove any canvases left behind
      if (containerRef.current) {
        const leftover = containerRef.current.querySelectorAll('canvas')
        leftover.forEach(c => c.remove())
      }
    }
  }, structuralDeps) // eslint-disable-line react-hooks/exhaustive-deps

  return { containerRef, p5Ref }
}
