import { Icon } from './Icon.jsx'
import { DECISIONES } from '../lib/format.js'
import styles from './DecisionBadge.module.css'

// Estado de validación humana de un análisis
export function DecisionBadge ({ decision, compact = false }) {
  const d = decision ? DECISIONES[decision.tipo] : null
  if (!d) {
    return (
      <span className={`${styles.badge} ${styles.pending}`}>
        <Icon name='schedule' size={14} />
        {compact ? 'Por validar' : 'Pendiente de validación'}
      </span>
    )
  }
  return (
    <span className={`${styles.badge} ${styles[d.tone]}`}>
      <Icon name={d.icon} size={14} />
      {compact ? d.short ?? d.label : d.label}
    </span>
  )
}
