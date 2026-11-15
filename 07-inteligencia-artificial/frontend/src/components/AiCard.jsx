import { useEffect, useState } from 'react'

import { Icon } from './Icon.jsx'
import { useToast } from '../context/ToastContext.jsx'
import {
  ESTADOS, CATEGORIA_ICON, CONFIANZA_NIVEL, asArray, analysisToText, formatSeconds
} from '../lib/format.js'
import styles from './AiCard.module.css'

const PRIORIDAD = {
  Alta: { tone: 'alta', icon: 'emergency', hint: 'Atención inmediata' },
  Media: { tone: 'media', icon: 'warning', hint: 'Atención en el turno' },
  Baja: { tone: 'baja', icon: 'low_priority', hint: 'Atención planificada' }
}

/**
 * Evaluación de SmartOps AI. Mientras `streaming`, los campos pendientes son
 * esqueletos y el campo que la IA está escribiendo muestra un cursor.
 */
export function AiCard ({ analisis, documentos, solicitud, status, startedAt, elapsedMs, streaming, onSourceClick }) {
  const a = analisis ?? {}
  const estado = ESTADOS[a.estado]
  const rechazada = a.estado === 'rechazada'
  const pasos = asArray(a.recomendacion)
  const faltante = asArray(a.informacion_faltante)
  const fuentes = asArray(a.fuentes)
  const prio = PRIORIDAD[a.prioridad]
  const riesgoPersonas = a.estado === 'derivada' && a.prioridad === 'Alta' && /SSOMA/i.test(a.responsable ?? '')

  // El último campo del JSON parcial es el que el modelo está escribiendo ahora
  const keys = Object.keys(a)
  const writing = streaming ? keys[keys.length - 1] : null
  const live = field => writing === field

  return (
    <article className={`${styles.card} ${streaming ? styles.isStreaming : ''}`} aria-busy={streaming}>
      <div className={styles.glow} aria-hidden='true' />
      {streaming && <span className={styles.scan} aria-hidden='true' />}

      {/* Cabecera */}
      <header className={styles.header}>
        <div className={styles.titleWrap}>
          <span className={`${styles.titleIcon} ${streaming ? styles.thinking : ''}`}><Icon name='psychology' size={24} /></span>
          <div>
            <h2>Evaluación sugerida por SmartOps AI</h2>
            <p>
              {documentos.length > 0
                ? `Basada en ${documentos.length} fragmentos de la base de conocimiento FRIOCHAP`
                : 'Buscando en la base de conocimiento FRIOCHAP…'}
            </p>
          </div>
        </div>
        <div className={styles.badges}>
          <span className={styles.badge}>
            <Icon name='bolt' size={16} className={styles.blue} />
            {streaming
              ? <>Analizando <Timer startedAt={startedAt} /></>
              : <>Analizado en <strong>{formatSeconds(elapsedMs)}</strong></>}
          </span>
          <span className={styles.badge}>
            <span className={styles.muted}>Confianza</span>
            {a.confianza
              ? <ConfidenceMeter level={a.confianza} />
              : streaming ? <Skeleton width='4.5rem' /> : <span className={styles.muted}>—</span>}
          </span>
        </div>
      </header>

      {streaming && <StreamSteps status={status} documentos={documentos} />}

      {/* Bloque principal: clasificación a la izquierda, prioridad arriba a la derecha */}
      <div className={`${styles.hero} ${rechazada ? styles.heroRejected : ''}`}>
        <div className={styles.classification}>
          <div className={styles.estadoRow}>
            {estado
              ? (
                <span className={`${styles.estado} ${styles[`estado_${a.estado}`]}`}>
                  <Icon name={estado.icon} size={16} />
                  {estado.label}
                </span>
                )
              : <Skeleton width='8rem' height='1.8rem' />}
          </div>
          <p className={styles.motivoEstado}>
            <Text value={a.motivo_estado} streaming={streaming} live={live('motivo_estado')} width='85%' />
          </p>

          {!rechazada && (
            <dl className={styles.facts}>
              <div className={styles.fact}>
                <dt>Categoría sugerida</dt>
                <dd>
                  {a.categoria
                    ? (
                      <span className={styles.categoria}>
                        <Icon name={CATEGORIA_ICON[a.categoria] ?? 'category'} size={18} />
                        {a.categoria}
                      </span>
                      )
                    : <Text value={null} streaming={streaming} width='10rem' height='2rem' />}
                </dd>
              </div>
              <div className={styles.fact}>
                <dt>Responsable sugerido</dt>
                <dd className={styles.responsable}>
                  {a.responsable && <Icon name='groups' size={20} className={styles.blue} />}
                  <Text value={a.responsable} streaming={streaming} live={live('responsable')} width='12rem' />
                </dd>
              </div>
            </dl>
          )}
        </div>

        {!rechazada && (
          <div className={`${styles.priority} ${prio ? styles[`p_${prio.tone}`] : styles.pPending}`}>
            <span className={styles.fieldLabel}>Nivel de prioridad</span>
            {prio
              ? (
                <>
                  <div className={styles.priorityMain} key={a.prioridad}>
                    <span className={styles.priorityIcon}><Icon name={prio.icon} size={28} fill /></span>
                    <div>
                      <span className={styles.priorityValue}>{a.prioridad}</span>
                      <span className={styles.priorityHint}>{prio.hint}</span>
                    </div>
                  </div>
                  {(a.motivo_prioridad || live('motivo_prioridad')) && (
                    <p className={styles.priorityReason}>
                      <Text value={a.motivo_prioridad} streaming={streaming} live={live('motivo_prioridad')} width='90%' />
                    </p>
                  )}
                </>
                )
              : (
                <div className={styles.priorityMain}>
                  <Skeleton width='56px' height='56px' round />
                  <div className={styles.skelStack}><Skeleton width='5rem' height='1.8rem' /><Skeleton width='7rem' /></div>
                </div>
                )}
          </div>
        )}
      </div>

      {riesgoPersonas && (
        <div className={styles.alert} role='alert'>
          <span className={styles.alertIcon}><Icon name='health_and_safety' size={22} /></span>
          <p>
            <strong>Riesgo para personas.</strong> Indicaciones iniciales (SEG-01 §2): alejar a las personas del área,
            no manipular el equipo ni tableros y, si hay humo, fuego o heridos, llamar al <b>116</b> (Bomberos) o <b>106</b> (SAMU).
          </p>
        </div>
      )}

      {/* Resumen */}
      <div className={styles.summary}>
        <span className={styles.sectionLabel}>
          <Icon name='summarize' size={16} className={styles.blue} />
          Resumen ejecutivo
        </span>
        <p>
          {a.resumen
            ? <>“{a.resumen}{live('resumen') && <span className='caret' />}”</>
            : <Text value={null} streaming={streaming} lines={2} />}
        </p>
      </div>

      {/* Dos columnas: plan de acción | datos y fuentes */}
      <div className={styles.columns}>
        {(pasos.length > 0 || (streaming && !rechazada)) && (
          <section className={styles.steps}>
            <span className={styles.sectionLabel}>
              <Icon name='checklist' size={16} className={styles.blue} />
              Plan de acción sugerido
              {pasos.length > 0 && <span className={styles.counter}>{pasos.length}</span>}
            </span>
            {pasos.length > 0
              ? (
                <ol>
                  {pasos.map((paso, i) => (
                    <li key={i} style={{ '--i': i }}>
                      <span className={styles.stepNum}>{i + 1}</span>
                      <p>
                        {paso}
                        {live('recomendacion') && i === pasos.length - 1 && <span className='caret' />}
                      </p>
                    </li>
                  ))}
                </ol>
                )
              : <SkeletonLines lines={3} tall />}
          </section>
        )}

        <div className={styles.side}>
          {faltante.length > 0 && (
            <section className={styles.missing}>
              <span className={styles.sectionLabel}>
                <Icon name='help_outline' size={16} className={styles.amber} />
                Información a pedir
                <span className={styles.counter}>{faltante.length}</span>
              </span>
              <ul>
                {faltante.map((dato, i) => (
                  <li key={i} style={{ '--i': i }}><Icon name='add_circle' size={16} className={styles.amber} />{dato}</li>
                ))}
              </ul>
            </section>
          )}

          {(fuentes.length > 0 || streaming) && (
            <section className={styles.sources}>
              <span className={styles.sectionLabel}>
                <Icon name='menu_book' size={16} className={styles.blue} />
                Fuentes citadas
              </span>
              {fuentes.length > 0
                ? (
                  <div className={styles.sourceChips}>
                    {fuentes.map((ref, i) => (
                      <button key={ref} type='button' style={{ '--i': i }} onClick={() => onSourceClick?.(ref)} title='Ver el texto citado'>
                        {ref}
                        <Icon name='arrow_outward' size={14} />
                      </button>
                    ))}
                  </div>
                  )
                : <span className={styles.waiting}>Esperando a que el modelo cite sus fuentes…</span>}
            </section>
          )}
        </div>
      </div>

      {!streaming && analisis && (
        <div className={styles.cardFooter}>
          <span className={styles.footNote}>
            <Icon name='info' size={16} />
            Propuesta generada por IA a partir de documentos autorizados.
          </span>
          <CopyButton text={analysisToText(analisis, solicitud)} />
        </div>
      )}
    </article>
  )
}

const STEPS = [
  { key: 'buscando', label: 'Buscando documentos' },
  { key: 'analizando', label: 'Analizando con IA' },
  { key: 'listo', label: 'Validando formato' }
]
const ORDER = { buscando: 0, analizando: 1, listo: 2 }

function StreamSteps ({ status, documentos }) {
  const current = ORDER[status] ?? 0
  return (
    <ol className={styles.streamSteps} role='status' aria-live='polite'>
      {STEPS.map((step, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'pending'
        return (
          <li key={step.key} className={styles[`step_${state}`]}>
            <span className={styles.stepMarker} aria-hidden='true'>
              {state === 'done' ? <Icon name='check' size={14} /> : i + 1}
            </span>
            {step.label}
            {step.key === 'buscando' && documentos.length > 0 && <small>· {documentos.length}</small>}
          </li>
        )
      })}
    </ol>
  )
}

function Timer ({ startedAt }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(id)
  }, [])
  return <strong>{(Math.max(0, now - (startedAt ?? now)) / 1000).toFixed(1)} s</strong>
}

function Text ({ value, streaming, live = false, width, height, lines = 1 }) {
  if (typeof value === 'string' && value) return <>{value}{live && <span className='caret' />}</>
  if (streaming) return lines > 1 ? <SkeletonLines lines={lines} /> : <Skeleton width={width} height={height} />
  return <span className={styles.muted}>—</span>
}

function Skeleton ({ width = '100%', height = '0.95rem', round = false }) {
  return <span className={styles.skeleton} style={{ width, height, borderRadius: round ? '16px' : undefined }} aria-hidden='true' />
}

function SkeletonLines ({ lines, tall = false }) {
  return (
    <span className={styles.skeletonLines} aria-hidden='true'>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? '60%' : '100%'} height={tall ? '3rem' : undefined} />
      ))}
    </span>
  )
}

function ConfidenceMeter ({ level }) {
  const value = CONFIANZA_NIVEL[level] ?? 0
  const tone = value === 3 ? styles.confAlta : value === 2 ? styles.confMedia : styles.confBaja
  return (
    <span className={`${styles.confidence} ${tone}`}>
      <strong>{level}</strong>
      <span className={styles.confBar} aria-hidden='true'>
        {[1, 2, 3].map(n => <span key={n} className={n <= value ? styles.on : undefined} style={{ '--i': n }} />)}
      </span>
    </span>
  )
}

function CopyButton ({ text }) {
  const toast = useToast()
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.show('Análisis copiado al portapapeles', { tone: 'info' })
      setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.show('No se pudo copiar el análisis', { tone: 'critical' })
    }
  }
  return (
    <button type='button' className={styles.copy} onClick={copy}>
      <Icon name={copied ? 'check' : 'content_copy'} size={16} />
      {copied ? 'Copiado' : 'Copiar análisis'}
    </button>
  )
}
