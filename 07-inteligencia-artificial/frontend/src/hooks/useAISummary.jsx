import { useState } from "react"

import { API_URL } from '../config.js'

export function useAISummary (jobId) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const generateSummary = async () => {
    setLoading(true)
    setError(null)
    setSummary('')

    try {
      const response = await fetch(`${API_URL}/ai/summary/${jobId}`)
      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error ?? 'Error al generar el resumen')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        // cada chunk es un fragmento de texto
        const chunkText = decoder.decode(value, { stream: true })
        setSummary(prev => prev + chunkText)
      }
    } catch (err) {
      setError(err.message || 'Error al generar el resumen')
    } finally {
      setLoading(false)
    }
  }

  return {
    summary,
    loading,
    error,
    generateSummary
  }
}