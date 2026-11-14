import { useEffect, useState } from 'react'

import { Icon } from './Icon.jsx'
import {
  ESTADOS, CATEGORIA_ICON, CONFIANZA_NIVEL, asArray, analysisToText, formatSeconds
} from '../lib/format.js'
import styles from './AiCard.module.css'

const PRIORIDAD = {
  Alta: { className: styles.prioAlta, icon: 'emergency' },
  Media: { className: styles.prioMedia, icon: 'warning' },
  Baja: { className: styles.prioBaja, icon: 'low_priority' }
}

/**
 * Tarjeta oscura con la evaluación de SmartOps AI. Mientras `streaming`,
 * los campos que aún no llegaron se muestran como esqueletos.
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

  return (
    <article className={styles.card} aria-busy={streaming}>
      <div className={styles.glow} aria-hidden='true' />

      <header className={styles.header}>
        <div className={styles.titleWrap}>
          <span className={styles.titleIcon}><Icon name='psychology' size={24} /></span>
          <div>
            <h2>
              Evaluación sugerida por SmartOps AI
              <span className={styles.titleDot} aria-hidden='true' />
            </h2>
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
            <span className={styles.muted}>Confianza:</span>
            {a.confianza
              ? <ConfidenceMeter level={a.confianza} />
              : streaming ? <Skeleton width='4rem' /> : <span className={styles.muted}>—</span>}
          </span>
        </div>
      </header>

      {streaming && <StreamSteps status={status} documentos={documentos} />}

      <div className={styles.estadoRow}>
        {estado
          ? (
            <span className={`${styles.estado} ${styles[`estado_${a.estado}`]}`}>
              <Icon name={estado.icon} size={16} />
              {estado.label}
            </span>
            )
          : <Skeleton width='8rem' height='1.7rem' />}
        <p className={styles.motivoEstado}>
          <Text value={a.motivo_estado} streaming={streaming} width='70%' />
        </p>
      </div>

      {riesgoPersonas && (
        <div className={styles.alert} role='alert'>
          <Icon name='health_and_safety' size={22} />
          <p>
            <strong>Riesgo para personas.</strong> Indicaciones iniciales (SEG-01 §2): alejar a las personas del área,
            no manipular el equipo ni tableros y, si hay humo, fuego o heridos, llamar al <b>116</b> (Bomberos) o <b>106</b> (SAMU).
          </p>
        </div>
      )}

      {!rechazada && (
        <>
          <div className={styles.grid}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Categoría sugerida</span>
              {a.categoria
                ? (
                  <span className={styles.categoria}>
                    <Icon name={CATEGORIA_ICON[a.categoria] ?? 'category'} size={20} />
                    {a.categoria}
                  </span>
                  )
                : <Text value={null} streaming={streaming} width='11rem' height='2.4rem' />}
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Nivel de prioridad</span>
              {prio
                ? (
                  <span className={`${styles.prioridad} ${prio.className}`}>
                    <Icon name={prio.icon} size={20} />
                    Prioridad: {a.prioridad}
                  </span>
                  )
                : <Text value={null} streaming={streaming} width='9rem' height='2.4rem' />}
              {(a.motivo_prioridad || (streaming && !a.motivo_prioridad && a.prioridad)) && (
                <div className={`${styles.motivo} ${prio?.className ?? ''}`}>
                  <strong>Motivo:</strong> <Text value={a.motivo_prioridad} streaming={streaming} width='80%' />
                </div>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>Responsable sugerido</span>
            <span className={styles.responsable}>
              <Icon name='groups' size={20} className={styles.blue} />
              <Text value={a.responsable} streaming={streaming} width='14rem' />
            </span>
          </div>
        </>
      )}

      <div className={styles.summary}>
        <span className={styles.sectionLabel}>
          <Icon name='summarize' size={16} className={styles.blue} />
          Resumen ejecutivo generado por IA
        </span>
        <p>
          {a.resumen ? `“${a.resumen}”` : <Text value={null} streaming={streaming} lines={2} />}
        </p>
      </div>

      {(pasos.length > 0 || (streaming && !rechazada)) && (
        <section className={styles.steps}>
          <span className={styles.sectionLabel}>
            <Icon name='checklist' size={16} className={styles.blue} />
            Plan de acción sugerido{pasos.length > 0 && ` (${pasos.length} ${pasos.length === 1 ? 'paso' : 'pasos'})`}
          </span>
          {pasos.length > 0
            ? (
              <ol>
                {pasos.map((paso, i) => (
                  <li key={i}>
                    <span className={styles.stepNum}>{i + 1}</span>
                    <p>{paso}</p>
                  </li>
                ))}
              </ol>
              )
            : <SkeletonLines lines={3} />}
        </section>
      )}

      {faltante.length > 0 && (
        <section className={styles.missing}>
          <span className={styles.sectionLabel}>
            <Icon name='help_outline' size={16} className={styles.amber} />
            Información faltante a pedir al cliente
          </span>
          <ul>
            {faltante.map((dato, i) => (
              <li key={i}><Icon name='add' size={16} className={styles.blue} />{dato}</li>
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
                {fuentes.map(ref => (
                  <button key={ref} type='button' onClick={() => onSourceClick?.(ref)} title='Ver el texto citado'>
                    {ref}
                  </button>
                ))}
              </div>
              )
            : <span className={styles.muted}>Esperando a que el modelo cite sus fuentes…</span>}
        </section>
      )}

      {!streaming && analisis && (
        <div className={styles.cardFooter}>
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

function Text ({ value, streaming, width, height, lines = 1 }) {
  if (typeof value === 'string' && value) return value
  if (streaming) return lines > 1 ? <SkeletonLines lines={lines} /> : <Skeleton width={width} height={height} />
  return <span className={styles.muted}>—</span>
}

function Skeleton ({ width = '100%', height = '0.95rem' }) {
  return <span className={styles.skeleton} style={{ width, height }} aria-hidden='true' />
}

function SkeletonLines ({ lines }) {
  return (
    <span className={styles.skeletonLines} aria-hidden='true'>
      {Array.from({ length: lines }, (_, i) => <Skeleton key={i} width={i === lines - 1 ? '60%' : '100%'} />)}
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
        <span style={{ width: `${(value / 3) * 100}%` }} />
      </span>
    </span>
  )
}

function CopyButton ({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }
  return (
    <button type='button' className={styles.copy} onClick={copy}>
      <Icon name={copied ? 'check' : 'content_copy'} size={16} />
      {copied ? 'Copiado' : 'Copiar análisis'}
    </button>
  )
}
