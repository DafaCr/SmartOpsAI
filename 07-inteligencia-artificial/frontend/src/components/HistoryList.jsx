import { ESTADOS, PRIORIDAD_TONE, formatTime } from '../lib/format.js'
import styles from './HistoryList.module.css'

export function HistoryList ({ entries, activeId, onSelect, onClear }) {
  if (entries.length === 0) return null

  return (
    <section className={styles.history} aria-label='Análisis recientes'>
      <div className={styles.head}>
        <h2>Recientes</h2>
        <button type='button' onClick={onClear}>Borrar</button>
      </div>
      <ul>
        {entries.map(entry => {
          const { analisis, solicitud } = entry
          const tone = PRIORIDAD_TONE[analisis.prioridad] ?? 'muted'
          return (
            <li key={entry.id}>
              <button
                type='button'
                className={entry.id === activeId ? styles.active : undefined}
                onClick={() => onSelect(entry)}
              >
                <span className={`${styles.dot} ${styles[tone]}`} aria-hidden='true' />
                <span className={styles.body}>
                  <span className={styles.text}>{analisis.resumen || solicitud.texto}</span>
                  <span className={styles.meta}>
                    {ESTADOS[analisis.estado]?.label ?? analisis.estado}
                    {analisis.prioridad && ` · ${analisis.prioridad}`}
                    {` · ${solicitud.origen} · ${formatTime(entry.createdAt)}`}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      <p className={styles.note}>Se guardan solo en este navegador.</p>
    </section>
  )
}
