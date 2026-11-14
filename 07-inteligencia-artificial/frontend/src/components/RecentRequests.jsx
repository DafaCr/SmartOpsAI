import { Link } from 'react-router'

import { Icon } from './Icon.jsx'
import { DecisionBadge } from './DecisionBadge.jsx'
import { CATEGORIA_ICON, ESTADOS, canal, efectivo, prioridadClass, timeAgo } from '../lib/format.js'
import styles from './RecentRequests.module.css'

export function RecentRequests ({ entries }) {
  return (
    <section className={styles.section} aria-labelledby='recientes-title'>
      <div className={styles.head}>
        <h2 id='recientes-title'>Solicitudes analizadas recientemente</h2>
        {entries.length > 0 && (
          <Link to='/metricas' className={styles.more}>
            Ver registro completo <Icon name='arrow_forward' size={14} />
          </Link>
        )}
      </div>

      {entries.length === 0
        ? (
          <p className={styles.empty}>
            <Icon name='inbox' size={20} />
            Aún no hay análisis. Los que hagas aparecerán aquí (se guardan en este navegador).
          </p>
          )
        : (
          <div className={styles.grid}>
            {entries.map(entry => {
              const { categoria, prioridad } = efectivo(entry)
              const c = canal(entry.solicitud.origen)
              return (
                <Link key={entry.id} to={`/resultado/${entry.id}`} className={`card ${styles.item}`}>
                  <span className={styles.icon}>
                    <Icon name={entry.analisis.estado === 'rechazada' ? 'block' : CATEGORIA_ICON[categoria] ?? 'ac_unit'} size={20} />
                  </span>
                  <span className={styles.body}>
                    <span className={styles.titleRow}>
                      <span className={styles.title}>{categoria ?? ESTADOS[entry.analisis.estado]?.label}</span>
                      {prioridad && <span className={`pill ${prioridadClass(prioridad)}`}>{prioridad}</span>}
                    </span>
                    <span className={styles.text}>{entry.analisis.resumen || entry.solicitud.texto}</span>
                    <span className={styles.meta}>
                      <span className={styles.metaItem}><Icon name={c.icon} size={14} /> {c.label}</span>
                      <span aria-hidden='true'>•</span>
                      <span>{timeAgo(entry.createdAt)}</span>
                      <span aria-hidden='true'>•</span>
                      <DecisionBadge decision={entry.decision} compact />
                    </span>
                  </span>
                </Link>
              )
            })}
          </div>
          )}
    </section>
  )
}
