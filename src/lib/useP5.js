'use client'

import { useEffect, useRef } from 'react'

export default function useP5 (sketch, deps = []) {
  const containerRef = useRef(null)
  const p5Ref = useRef(null)

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

      // Clear any leftover canvases from the container
      const existing = containerRef.current.querySelectorAll('canvas')
      existing.forEach(c => c.remove())

      const instance = new p5(sketch, containerRef.current)
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
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  return { containerRef, p5Ref }
}
