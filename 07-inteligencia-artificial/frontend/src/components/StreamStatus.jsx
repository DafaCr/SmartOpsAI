import { useEffect, useState } from 'react'

import styles from './StreamStatus.module.css'

const STEPS = [
  { key: 'buscando', label: 'Buscando en la base de conocimiento' },
  { key: 'analizando', label: 'Analizando con IA' },
  { key: 'listo', label: 'Análisis validado' }
]

const ORDER = { buscando: 0, analizando: 1, listo: 2 }

// Barra de progreso del análisis en streaming con cronómetro
export function StreamStatus ({ status, startedAt, elapsedMs, documentos }) {
  const current = ORDER[status] ?? -1
  const running = status === 'buscando' || status === 'analizando'

  return (
    <div className={styles.status} role='status' aria-live='polite'>
      <ol className={styles.steps}>
        {STEPS.map((step, i) => {
          const state = i < current || status === 'listo' ? 'done' : i === current ? 'active' : 'pending'
          return (
            <li key={step.key} className={styles[state]}>
              <span className={styles.marker} aria-hidden='true'>{state === 'done' ? '✓' : i + 1}</span>
              <span>
                {step.label}
                {step.key === 'buscando' && documentos.length > 0 && (
                  <small> · {documentos.length} fragmentos</small>
                )}
              </span>
            </li>
          )
        })}
      </ol>
      {running ? <Timer startedAt={startedAt} /> : elapsedMs != null && <span className={styles.time}>{(elapsedMs / 1000).toFixed(1)} s</span>}
    </div>
  )
}

function Timer ({ startedAt }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(id)
  }, [])

  return <span className={styles.time}>{(Math.max(0, now - startedAt) / 1000).toFixed(1)} s</span>
}
