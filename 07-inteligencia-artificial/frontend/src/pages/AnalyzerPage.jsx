import { useRef, useState } from 'react'

import { RequestForm } from '../components/RequestForm.jsx'
import { StreamStatus } from '../components/StreamStatus.jsx'
import { AnalysisView } from '../components/AnalysisView.jsx'
import { HistoryList } from '../components/HistoryList.jsx'
import { useAnalysisStream } from '../hooks/useAnalysisStream.js'
import { useHistory } from '../hooks/useHistory.js'
import styles from './AnalyzerPage.module.css'

export default function AnalyzerPage () {
  const history = useHistory()
  const [activeId, setActiveId] = useState(null)
  const resultRef = useRef(null)
  const stream = useAnalysisStream({ onComplete: history.add })

  const streaming = stream.status === 'buscando' || stream.status === 'analizando'

  // En pantallas estrechas el resultado queda debajo del formulario: se desplaza hasta él
  const revealResult = () => {
    if (window.matchMedia('(max-width: 900px)').matches) {
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
  }

  const handleSubmit = (solicitud) => {
    setActiveId(null)
    stream.analyze(solicitud)
    revealResult()
  }

  const handleSelect = (entry) => {
    setActiveId(entry.id)
    stream.show(entry)
    revealResult()
  }

  return (
    <main className={styles.page}>
      <title>Analizar solicitud · SmartOps AI</title>

      <div className={styles.left}>
        <div className={styles.intro}>
          <h1>Analizar solicitud</h1>
          <p>
            Pega el mensaje del cliente. SmartOps AI propone categoría, prioridad, responsable y pasos a
            seguir según la base de conocimiento de FRIOCHAP.
          </p>
        </div>
        <RequestForm busy={streaming} onSubmit={handleSubmit} onCancel={stream.cancel} />
        <HistoryList
          entries={history.entries}
          activeId={activeId}
          onSelect={handleSelect}
          onClear={history.clear}
        />
      </div>

      <div className={styles.right} ref={resultRef}>
        {stream.status === 'idle' && <EmptyState />}

        {stream.status !== 'idle' && !activeId && (
          <StreamStatus
            status={stream.status}
            startedAt={stream.startedAt}
            elapsedMs={stream.elapsedMs}
            documentos={stream.documentos}
          />
        )}

        {stream.solicitud && (
          <blockquote className={styles.solicitud}>
            <span className={styles.origen}>{stream.solicitud.origen}</span>
            {stream.solicitud.texto}
          </blockquote>
        )}

        {stream.status === 'error' && (
          <div className={styles.error} role='alert'>
            <strong>No se pudo completar el análisis.</strong>
            <p>{stream.error}</p>
            <button type='button' onClick={() => stream.analyze(stream.solicitud)}>Reintentar</button>
          </div>
        )}

        {stream.status === 'cancelado' && (
          <p className={styles.cancelled}>Análisis detenido.</p>
        )}

        {(stream.analisis || streaming) && stream.status !== 'error' && (
          <AnalysisView
            analisis={stream.analisis}
            documentos={stream.documentos}
            solicitud={stream.solicitud}
            streaming={streaming}
          />
        )}
      </div>
    </main>
  )
}

function EmptyState () {
  return (
    <div className={styles.empty}>
      <svg viewBox='0 0 48 48' aria-hidden='true'>
        <circle cx='24' cy='24' r='22' fill='var(--brand-soft)' />
        <path d='M24 12v24M13.6 18l20.8 12M13.6 30l20.8-12' stroke='var(--brand)' strokeWidth='2.5' strokeLinecap='round' />
      </svg>
      <h2>El análisis aparecerá aquí</h2>
      <p>Verás en vivo cómo la IA consulta los documentos y construye su propuesta.</p>
      <ul>
        <li><b>Estado:</b> analizada, derivada a una persona o rechazada</li>
        <li><b>Prioridad</b> según la matriz REG-01</li>
        <li><b>Responsable</b> y pasos recomendados</li>
        <li><b>Fuentes</b> citadas, con el texto original</li>
      </ul>
    </div>
  )
}
