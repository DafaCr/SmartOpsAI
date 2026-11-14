import { useState } from 'react'

import { API_URL } from '../config.js'

// Envía una solicitud a POST /api/ai/analizar y devuelve el análisis de SmartOps AI
export function useAnalyzeRequest () {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const analyze = async ({ texto, origen, rol }) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`${API_URL}/ai/analizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto, origen, rol })
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error ?? 'Error al analizar la solicitud')
      }
      setResult(data)
    } catch (err) {
      setError(err.message || 'Error al analizar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  return { result, loading, error, analyze }
}
