import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'

import { useAnalysis } from '../context/AnalysisContext.jsx'
import { AiCard } from '../components/AiCard.jsx'
import { SourcesPanel } from '../components/SourcesPanel.jsx'
import { DecisionPanel } from '../components/DecisionPanel.jsx'
import { DecisionBadge } from '../components/DecisionBadge.jsx'
import { Icon } from '../components/Icon.jsx'
import { ROLES, asArray, canal, formatSeconds, formatTime, shortRef } from '../lib/format.js'
import styles from './ResultPage.module.css'

/**
 * /resultado      → análisis en curso (streaming)
 * /resultado/:id  → análisis guardado en el historial
 */
export default function ResultPage () {
  const { id } = useParams()
  const navigate = useNavigate()
  const { stream, currentId, history, analyze } = useAnalysis()
  const [openRef, setOpenRef] = useState(null)

  // Al terminar el stream, se pasa a la URL permanente del análisis
  useEffect(() => {
    if (!id && stream.status === 'listo' && currentId) {
      navigate(`/resultado/${currentId}`, { replace: true })
    }
  }, [id, stream.status, currentId, navigate])

  const entry = id ? history.entries.find(e => e.id === id) : null

  if (id && !entry) {
    return (
      <main className={styles.page}>
        <div className={`card ${styles.notFound}`}>
          <Icon name='search_off' size={32} />
          <h1>Análisis no encontrado</h1>
          <p>Puede que se haya borrado el historial de este navegador.</p>
          <Link to='/' className='btn btn-primary'>Nueva solicitud</Link>
        </div>
      </main>
    )
  }

  if (!id && stream.status === 'idle') return <Navigate to='/' replace />

  const live = !entry
  const streaming = live && (stream.status === 'buscando' || stream.status === 'analizando')
  const data = entry
    ? { solicitud: entry.solicitud, analisis: entry.analisis, documentos: entry.documentos ?? [], elapsedMs: entry.elapsedMs, createdAt: entry.createdAt }
    : { solicitud: stream.solicitud, analisis: stream.analisis, documentos: stream.documentos, elapsedMs: stream.elapsedMs, createdAt: stream.startedAt }

  const c = canal(data.solicitud?.origen)
  const area = ROLES.find(r => r.value === data.solicitud?.rol)?.label ?? 'Operaciones'

  const handleSourceClick = (ref) => setOpenRef(ref)

  return (
    <main className={styles.page}>
      <title>Resultado del análisis · SmartOps AI</title>

      <div className={styles.topbar}>
        <div className={styles.topLeft}>
          <Link to='/' className={styles.back}>
            <Icon name='arrow_back' size={18} />
            Volver a nueva solicitud
          </Link>
          <span className={styles.vsep} aria-hidden='true' />
          <h1>Resultado del análisis</h1>
        </div>
        {entry
          ? (
            <div className={styles.status}>
              <DecisionBadge decision={entry.decision} />
              <span className={styles.ticket}>Ref. {shortRef(entry.id)}</span>
            </div>
            )
          : streaming && (
            <div className={`${styles.status} ${styles.statusLive}`}>
              <span className={styles.livePing} aria-hidden='true' />
              Generando análisis…
            </div>
          )}
      </div>

      <div className={styles.grid}>
        <div className={styles.left}>
          <section className={styles.original} aria-labelledby='original-title'>
            <div className={styles.originalHead}>
              <span className={styles.channelIcon}><Icon name={c.icon} size={20} /></span>
              <div>
                <span id='original-title' className={`eyebrow ${styles.muted}`}>Canal entrante</span>
                <span className={styles.channelName}>{c.label}</span>
              </div>
              {data.createdAt && <span className={styles.when}>{formatTime(data.createdAt)}</span>}
            </div>
            <blockquote className={styles.message}>“{data.solicitud?.texto}”</blockquote>
            <div className={styles.meta}>
              <span><Icon name='badge' size={16} /> Área: <strong>{area}</strong></span>
              <span>
                <Icon name='schedule' size={16} />
                {streaming ? 'Analizando…' : <>IA: <strong>{formatSeconds(data.elapsedMs)}</strong></>}
              </span>
            </div>
          </section>

          <SourcesPanel
            documentos={data.documentos}
            fuentes={asArray(data.analisis?.fuentes)}
            openRef={openRef}
            onToggle={setOpenRef}
          />
        </div>

        <div className={styles.right}>
          {live && stream.status === 'error'
            ? (
              <div className={styles.error} role='alert'>
                <Icon name='error' size={24} />
                <div>
                  <strong>No se pudo completar el análisis</strong>
                  <p>{stream.error}</p>
                </div>
                <button type='button' className='btn btn-secondary' onClick={() => analyze(stream.solicitud)}>
                  <Icon name='refresh' size={18} /> Reintentar
                </button>
              </div>
              )
            : live && stream.status === 'cancelado'
              ? <p className={styles.cancelled}>Análisis detenido. <Link to='/'>Volver</Link></p>
              : (
                <AiCard
                  analisis={data.analisis}
                  documentos={data.documentos}
                  solicitud={data.solicitud}
                  status={stream.status}
                  startedAt={stream.startedAt}
                  elapsedMs={data.elapsedMs}
                  streaming={streaming}
                  onSourceClick={handleSourceClick}
                />
                )}

          {streaming && (
            <button type='button' className={`btn btn-secondary ${styles.stop}`} onClick={stream.cancel}>
              <Icon name='stop_circle' size={18} /> Detener análisis
            </button>
          )}

          <div className={`card ${styles.hitl}`}>
            <span className={styles.hitlIcon}><Icon name='verified' size={22} /></span>
            <div>
              <span className={styles.hitlTitle}>Control humano en el bucle</span>
              <p>
                SmartOps AI solo propone. Ninguna acción operativa, despacho técnico ni comunicación al cliente
                se ejecuta sin tu validación.
              </p>
            </div>
          </div>

          {(entry || streaming) && (
            <DecisionPanel
              entry={entry}
              disabled={!entry}
              onDecide={(decision) => history.decide(entry.id, decision)}
            />
          )}
        </div>
      </div>
    </main>
  )
}
