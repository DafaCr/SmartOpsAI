import { useCallback, useState } from 'react'

const KEY = 'smartops.historial.v1'
const MAX_ENTRIES = 100

function load () {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter(e => e?.id && e?.analisis && e?.solicitud) : []
  } catch {
    return []
  }
}

function save (entries) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries))
  } catch {
    // almacenamiento no disponible (modo privado, cuota llena…): queda solo en memoria
  }
}

/**
 * Registro local de análisis y decisiones del operador (solo en este navegador).
 */
export function useHistory () {
  const [entries, setEntries] = useState(load)

  const update = useCallback((updater) => {
    setEntries(prev => {
      const next = updater(prev)
      save(next)
      return next
    })
  }, [])

  // Devuelve el id de la nueva entrada
  const add = useCallback((entry) => {
    const id = crypto.randomUUID()
    update(prev => [{ id, decision: null, ...entry }, ...prev].slice(0, MAX_ENTRIES))
    return id
  }, [update])

  const decide = useCallback((id, decision) => {
    update(prev => prev.map(e => (e.id === id ? { ...e, decision: decision && { ...decision, at: Date.now() } } : e)))
  }, [update])

  const clear = useCallback(() => update(() => []), [update])

  return { entries, add, decide, clear }
}
