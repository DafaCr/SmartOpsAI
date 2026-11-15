import { useId, useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { useAnalysis } from '../context/AnalysisContext.jsx'
import { useApi } from '../hooks/useApi.js'
import { Icon } from '../components/Icon.jsx'
import { RecentRequests } from '../components/RecentRequests.jsx'
import { CANALES, PLANTILLAS, ROLES, formatSeconds } from '../lib/format.js'
import styles from './NewRequestPage.module.css'

const MAX_LENGTH = 4000

export default function NewRequestPage () {
  const navigate = useNavigate()
  const { analyze, stream, history, health } = useAnalysis()
  const kb = useApi('/kb')
  const textoId = useId()
  const rolId = useId()

  const [texto, setTexto] = useState('')
  const [origen, setOrigen] = useState('WhatsApp')
  const [rol, setRol] = useState('operaciones')

  const busy = stream.status === 'buscando' || stream.status === 'analizando'
  const canSubmit = texto.trim().length >= 5 && !busy

  const submit = () => {
    if (!canSubmit) return
    analyze({ texto: texto.trim(), origen, rol })
    navigate('/resultado')
  }

  const documentos = kb.data?.documentos ?? []
  const secciones = documentos.reduce((n, d) => n + d.secciones.length, 0)
  const tiempos = history.entries.map(e => e.elapsedMs).filter(Number.isFinite)
  const tiempoMedio = tiempos.length ? tiempos.reduce((a, b) => a + b, 0) / tiempos.length : null

  return (
    <main className={styles.page}>
      <title>Nueva solicitud · SmartOps AI</title>

      <header className={`${styles.intro} rise`} style={{ '--i': 0 }}>
        <div className={styles.eyebrowRow}>
          <span className={`eyebrow ${styles.eyebrow}`}>Módulo de ingesta inteligente</span>
          <span className={styles.sep} aria-hidden='true' />
          <span className={styles.eyebrowMuted}>Mesa de Operaciones</span>
        </div>
        <h1>Nueva solicitud</h1>
        <p>
          Ingresa la solicitud operativa tal como llegó. SmartOps AI la clasificará, priorizará y
          sugerirá acciones según la base de conocimiento de FRIOCHAP, para tu validación.
        </p>
      </header>

      <form
        className={`card ${styles.form} rise`}
        style={{ '--i': 1 }}
        onSubmit={(e) => { e.preventDefault(); submit() }}
      >
        <div className={styles.channelRow}>
          <span className={styles.label} id='canal-label'>Canal de origen:</span>
          <div className={styles.channels} role='radiogroup' aria-labelledby='canal-label'>
            {CANALES.map(c => (
              <button
                key={c.value}
                type='button'
                role='radio'
                aria-checked={origen === c.value}
                className={origen === c.value ? `${styles.channel} ${styles.channelActive}` : styles.channel}
                onClick={() => setOrigen(c.value)}
              >
                <Icon name={c.icon} size={18} />
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.templates}>
          <span>Plantillas rápidas:</span>
          {PLANTILLAS.map(p => (
            <button key={p.label} type='button' onClick={() => setTexto(p.texto)}>
              {p.label}
            </button>
          ))}
        </div>

        <div className={styles.field}>
          <div className={styles.fieldHead}>
            <label htmlFor={textoId} className={styles.label}>Escribe o pega la solicitud recibida</label>
            <span className={styles.counter}>{texto.length} caracteres</span>
          </div>
          <div className={styles.textareaWrap}>
            <textarea
              id={textoId}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault()
                  submit()
                }
              }}
              placeholder='Ingresa los detalles técnicos o el mensaje directo del cliente…'
              autoFocus
              rows={6}
              maxLength={MAX_LENGTH}
              required
            />
          </div>
        </div>

        <div className={styles.context}>
          <div className={styles.contextMain}>
            <span className={styles.contextIcon}><Icon name='psychology' size={18} /></span>
            <div>
              <p className={styles.contextTitle}>
                Contexto del análisis
                {documentos.length > 0 && <span className='chip'>{documentos.length} documentos · {secciones} secciones</span>}
              </p>
              <p className={styles.contextText}>
                Se consultarán las secciones autorizadas para el área
                <select id={rolId} aria-label='Tu área' value={rol} onChange={(e) => setRol(e.target.value)}>
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </p>
            </div>
          </div>
          <div className={styles.model}>
            {health.data?.ai
              ? (
                <>
                  <span className={styles.ping} aria-hidden='true' />
                  <span title='Modelo de IA activo'>{health.data.model}</span>
                </>
                )
              : <span className={styles.modelOff}>{health.error ? 'Servidor sin conexión' : health.data ? 'IA sin configurar' : 'Conectando…'}</span>}
          </div>
        </div>

        <div className={styles.footer}>
          <p className={styles.disclaimer}>
            <Icon name='verified_user' size={16} />
            La IA solo asiste y clasifica. Ninguna acción se ejecuta sin aprobación humana.
          </p>
          <button type='submit' className={`btn btn-primary ${styles.submit}`} disabled={!canSubmit}>
            <Icon name={busy ? 'progress_activity' : 'auto_awesome'} size={20} className={busy ? styles.spin : 'icon-spark'} />
            {busy ? 'Analizando…' : 'Analizar con IA'}
          </button>
        </div>
      </form>

      <div className='rise' style={{ '--i': 2 }}>
        <RecentRequests entries={history.entries.slice(0, 4)} />
      </div>

      <div className={`${styles.systemBar} rise`} style={{ '--i': 3 }}>
        <div className={styles.systemStats}>
          <span className={styles.systemOk}>
            <span className={styles.systemDot} aria-hidden='true' />
            Motor SmartOps AI: {health.data?.ai ? 'operativo' : health.error ? 'sin conexión' : 'sin configurar'}
          </span>
          <span className={styles.bullet} aria-hidden='true'>•</span>
          <span>Tiempo medio de análisis: <strong>{formatSeconds(tiempoMedio)}</strong></span>
          <span className={styles.bullet} aria-hidden='true'>•</span>
          <span>Analizadas en este navegador: <strong>{history.entries.length}</strong></span>
        </div>
        <Link to='/conocimiento' className={styles.systemLink}>
          <Icon name='menu_book' size={16} />
          Consultar la base de conocimiento
        </Link>
      </div>
    </main>
  )
}
