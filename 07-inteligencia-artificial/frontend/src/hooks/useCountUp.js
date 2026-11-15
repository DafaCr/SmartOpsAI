import { useEffect, useRef, useState } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Anima un número desde su valor anterior hasta `target` (ease-out).
 * Devuelve null si target es null. Respeta "reducir movimiento".
 */
export function useCountUp (target, duration = 800) {
  const [value, setValue] = useState(target == null ? null : 0)
  const fromRef = useRef(0)

  useEffect(() => {
    if (target == null) {
      setValue(null)
      return
    }
    if (prefersReducedMotion()) {
      setValue(target)
      fromRef.current = target
      return
    }

    const from = fromRef.current ?? 0
    const start = performance.now()
    let frame

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(from + (target - from) * eased)
      if (t < 1) frame = requestAnimationFrame(tick)
      else fromRef.current = target
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return value
}
