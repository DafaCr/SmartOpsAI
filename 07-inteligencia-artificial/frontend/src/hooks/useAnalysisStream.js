import { useCallback, useEffect, useRef, useState } from 'react'

import { API_URL } from '../config.js'
import { readNdjson } from '../lib/ndjson.js'

const INITIAL = {
  status: 'idle', // idle | buscando | analizando | listo | error | cancelado
  solicitud: null,
  documentos: [],
  analisis: null,
  error: null,
  startedAt: null,
  elapsedMs: null
}

/**
 * Envía la solicitud a POST /api/ai/analizar y va actualizando el estado
 * con cada evento del stream NDJSON (documentos → parciales → final).
 */
export function useAnalysisStream ({ onComplete } = {}) {
  const [state, setState] = useState(INITIAL)
  const controllerRef = useRef(null)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  // Cancela la petición en curso si el componente se desmonta
  useEffect(() => () => controllerRef.current?.abort(), [])

  const analyze = useCallback(async (solicitud) => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    const startedAt = Date.now()

    setState({ ...INITIAL, status: 'buscando', solicitud, startedAt })

    let documentos = []
    try {
      const response = await fetch(`${API_URL}/ai/analizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(solicitud),
        signal: controller.signal
      })

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error ?? `El servidor respondió con un error (${response.status}).`)
      }

      let final = null
      for await (const event of readNdjson(response.body)) {
        if (event.type === 'documentos') {
          documentos = event.documentos
          setState(s => ({ ...s, status: 'analizando', documentos }))
        } else if (event.type === 'parcial') {
          setState(s => ({ ...s, analisis: event.analisis }))
        } else if (event.type === 'final') {
          final = event.analisis
        } else if (event.type === 'error') {
          throw new Error(event.error)
        }
      }

      if (!final) throw new Error('La respuesta se interrumpió antes de terminar. Inténtalo de nuevo.')

      const elapsedMs = Date.now() - startedAt
      setState(s => ({ ...s, status: 'listo', analisis: final, elapsedMs }))
      onCompleteRef.current?.({ solicitud, analisis: final, documentos, elapsedMs, createdAt: Date.now() })
    } catch (error) {
      if (controller.signal.aborted) {
        setState(s => (controllerRef.current === controller ? { ...s, status: 'cancelado' } : s))
        return
      }
      const message = error instanceof TypeError
        ? 'No se pudo conectar con el servidor. Revisa que el backend esté en marcha.'
        : error.message
      setState(s => ({ ...s, status: 'error', error: message }))
    }
  }, [])

  const cancel = useCallback(() => controllerRef.current?.abort(), [])

  // Muestra un análisis guardado (historial) sin llamar a la IA
  const show = useCallback((entry) => {
    controllerRef.current?.abort()
    setState({
      ...INITIAL,
      status: 'listo',
      solicitud: entry.solicitud,
      documentos: entry.documentos ?? [],
      analisis: entry.analisis,
      elapsedMs: entry.elapsedMs ?? null
    })
  }, [])

  const reset = useCallback(() => {
    controllerRef.current?.abort()
    setState(INITIAL)
  }, [])

  return { ...state, analyze, cancel, show, reset }
}
