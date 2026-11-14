import { useEffect, useState } from 'react'

import { API_URL } from '../config.js'

/**
 * GET sencillo a la API con estados de carga y error.
 */
export function useApi (path) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    fetch(`${API_URL}${path}`, { signal: controller.signal })
      .then(async response => {
        const body = await response.json().catch(() => null)
        if (!response.ok) throw new Error(body?.error ?? `Error ${response.status}`)
        setData(body)
        setError(null)
      })
      .catch(err => {
        if (!controller.signal.aborted) setError(err.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [path])

  return { data, error, loading }
}
