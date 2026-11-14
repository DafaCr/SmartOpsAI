import { createContext, useCallback, useContext, useMemo, useState } from 'react'

import { useAnalysisStream } from '../hooks/useAnalysisStream.js'
import { useHistory } from '../hooks/useHistory.js'
import { useApi } from '../hooks/useApi.js'

const AnalysisContext = createContext(null)

/**
 * Estado compartido entre pantallas: el análisis en curso (streaming),
 * el historial con las decisiones del operador y el estado del servidor.
 */
export function AnalysisProvider ({ children }) {
  const history = useHistory()
  const health = useApi('/health')
  const [currentId, setCurrentId] = useState(null)

  const handleComplete = useCallback((entry) => {
    setCurrentId(history.add(entry))
  }, [history])

  const stream = useAnalysisStream({ onComplete: handleComplete })

  const analyze = useCallback((solicitud) => {
    setCurrentId(null)
    stream.analyze(solicitud)
  }, [stream])

  const value = useMemo(() => ({
    stream,
    analyze,
    currentId,
    history,
    health
  }), [stream, analyze, currentId, history, health])

  return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAnalysis () {
  const context = useContext(AnalysisContext)
  if (!context) throw new Error('useAnalysis debe usarse dentro de <AnalysisProvider>')
  return context
}
