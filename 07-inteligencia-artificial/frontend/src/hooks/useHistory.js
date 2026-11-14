import { useCallback, useState } from 'react'

const KEY = 'smartops.historial.v1'
const MAX_ENTRIES = 12

function load () {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function save (entries) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries))
  } catch {
    // almacenamiento no disponible (modo privado, cuota llena…): el historial queda solo en memoria
  }
}

/**
 * Historial local de los últimos análisis (solo en este navegador).
 */
export function useHistory () {
  const [entries, setEntries] = useState(load)

  const add = useCallback((entry) => {
    setEntries(prev => {
      const next = [{ id: crypto.randomUUID(), ...entry }, ...prev].slice(0, MAX_ENTRIES)
      save(next)
      return next
    })
  }, [])

  const clear = useCallback(() => {
    setEntries([])
    save([])
  }, [])

  return { entries, add, clear }
}
