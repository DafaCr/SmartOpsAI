import { useState } from 'react'

import { ESTADOS, PRIORIDAD_TONE, CONFIANZA_NIVEL, asArray, analysisToText } from '../lib/format.js'
import { SourceList } from './SourceList.jsx'
import styles from './AnalysisView.module.css'

/**
 * Muestra el análisis de SmartOps AI. Mientras `streaming` es true, los campos
 * que aún no han llegado aparecen como esqueletos y se rellenan en vivo.
 */
export function AnalysisView ({ analisis, documentos, solicitud, streaming }) {
  const a = analisis ?? {}
  const estado = ESTADOS[a.estado]
  const rechazada = a.estado === 'rechazada'
  const recomendacion = asArray(a.recomendacion)
  const faltante = asArray(a.informacion_faltante)
  const riesgoPersonas = a.estado === 'derivada' && a.prioridad === 'Alta' && /SSOMA/i.test(a.responsable ?? '')

  return (
    <article className={`${styles.card} ${styles[`tone_${estado?.tone ?? 'pending'}`]}`} aria-busy={streaming}>
      <header className={styles.banner}>
        <div className={styles.bannerMain}>
          <div className={styles.bannerTop}>
            {estado
              ? <span className={styles.estado}>{estado.label}</span>
              : <Skeleton width='7rem' height='1.6rem' />}
            {a.estado === 'derivada' && a.responsable && (
              <span className={styles.derivarA}>→ {a.responsable}</span>
            )}
          </div>
          <p className={styles.motivo}>
            <Text value={a.motivo_estado} streaming={streaming} width='80%' />
          </p>
        </div>
        {!streaming && analisis && <CopyButton text={analysisToText(analisis, solicitud)} />}
      </header>

      {riesgoPersonas && (
        <div className={styles.alert} role='alert'>
          <strong>Riesgo para personas.</strong> Indicaciones iniciales (SEG-01 §2): alejar a las personas del
          área, no manipular el equipo ni tableros y, si hay humo, fuego o heridos, llamar al <b>116</b> (Bomberos)
          o <b>106</b> (SAMU).
        </div>
      )}

      {!rechazada && (
        <dl className={styles.tiles}>
          <Tile label='Categoría'>
            <Text value={a.categoria} streaming={streaming} width='9rem' />
          </Tile>
          <Tile label='Prioridad'>
            {a.prioridad
              ? <span className={`${styles.prioridad} ${styles[`tone_${PRIORIDAD_TONE[a.prioridad]}`]}`}>{a.prioridad}</span>
              : <Text value={a.prioridad} streaming={streaming} width='4rem' />}
          </Tile>
          <Tile label='Responsable'>
            <Text value={a.responsable} streaming={streaming} width='8rem' />
          </Tile>
          <Tile label='Confianza'>
            {a.confianza
              ? <ConfidenceMeter level={a.confianza} />
              : <Text value={a.confianza} streaming={streaming} width='5rem' />}
          </Tile>
        </dl>
      )}

      <Section title='Resumen'>
        <p className={styles.resumen}>
          <Text value={a.resumen} streaming={streaming} width='95%' lines={2} />
        </p>
      </Section>

      {!rechazada && (a.motivo_prioridad || streaming) && (
        <Section title='Motivo de la prioridad'>
          <p><Text value={a.motivo_prioridad} streaming={streaming} width='70%' /></p>
        </Section>
      )}

      {(recomendacion.length > 0 || (streaming && !rechazada)) && (
        <Section title='Pasos recomendados'>
          {recomendacion.length > 0
            ? (
              <ol className={styles.steps}>
                {recomendacion.map((paso, i) => <li key={i}>{paso}</li>)}
              </ol>
              )
            : <SkeletonLines lines={2} />}
        </Section>
      )}

      {faltante.length > 0 && (
        <Section title='Información a pedir al cliente'>
          <ul className={styles.checklist}>
            {faltante.map((dato, i) => <li key={i}>{dato}</li>)}
          </ul>
        </Section>
      )}

      <SourceList fuentes={asArray(a.fuentes)} documentos={documentos} streaming={streaming} />

      <p className={styles.disclaimer}>
        Propuesta generada por IA a partir de la base de conocimiento. La decisión final es del operador.
      </p>
    </article>
  )
}

function Section ({ title, children }) {
  return (
    <section className={styles.section}>
      <h3>{title}</h3>
      {children}
    </section>
  )
}

function Tile ({ label, children }) {
  return (
    <div className={styles.tile}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

// Texto que puede no haber llegado todavía: esqueleto mientras se escribe, guion si quedó vacío
function Text ({ value, streaming, width, lines = 1 }) {
  if (typeof value === 'string' && value) return value
  if (streaming) return lines > 1 ? <SkeletonLines lines={lines} /> : <Skeleton width={width} />
  return <span className={styles.empty}>—</span>
}

function Skeleton ({ width = '100%', height = '0.95rem' }) {
  return <span className={styles.skeleton} style={{ width, height }} aria-hidden='true' />
}

function SkeletonLines ({ lines }) {
  return (
    <span className={styles.skeletonLines} aria-hidden='true'>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? '60%' : '100%'} />
      ))}
    </span>
  )
}

function ConfidenceMeter ({ level }) {
  const value = CONFIANZA_NIVEL[level] ?? 0
  return (
    <span className={styles.meter} title={`Confianza ${level}`}>
      <span className={styles.bars} aria-hidden='true'>
        {[1, 2, 3].map(n => <span key={n} className={n <= value ? styles.barOn : undefined} />)}
      </span>
      {level}
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
      {copied ? '✓ Copiado' : 'Copiar análisis'}
    </button>
  )
}
