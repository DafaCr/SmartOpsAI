import { NavLink, Link } from 'react-router'

import { useAnalysis } from '../context/AnalysisContext.jsx'
import { Icon } from './Icon.jsx'
import styles from './AppHeader.module.css'

const navClass = ({ isActive }) => (isActive ? `${styles.navLink} ${styles.active}` : styles.navLink)

export function AppHeader () {
  const { health, history } = useAnalysis()
  const pendientes = history.entries.filter(e => !e.decision).length

  const ia = health.error
    ? { tone: 'off', label: 'Servidor sin conexión' }
    : !health.data
        ? { tone: 'loading', label: 'Conectando…' }
        : health.data.ai
          ? { tone: 'on', label: 'IA operativa' }
          : { tone: 'warn', label: 'IA sin configurar' }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to='/' className={styles.brand} aria-label='SmartOps AI, nueva solicitud'>
          <Logo />
          <span className={styles.brandName}>SmartOps <span>AI</span></span>
          <span className={styles.divider} aria-hidden='true' />
          <span className={styles.company}>FRIOCHAP S.A.C. | Climatización &amp; Refrigeración</span>
        </Link>

        <nav className={styles.nav} aria-label='Principal'>
          <NavLink to='/' end className={navClass}>Analizar</NavLink>
          <NavLink to='/metricas' className={navClass}>Métricas</NavLink>
          <NavLink to='/conocimiento' className={navClass}>
            <span className={styles.longLabel}>Base de conocimiento</span>
            <span className={styles.shortLabel}>Docs</span>
          </NavLink>
        </nav>

        <div className={styles.status}>
          <span className={`${styles.dot} ${styles[ia.tone]}`} aria-hidden='true' />
          <span className={styles.statusLabel} title={health.data?.model}>{ia.label}</span>
          {pendientes > 0 && (
            <Link to='/metricas' className={styles.pending} title='Análisis pendientes de validación humana'>
              {pendientes} por validar
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

function Logo () {
  return (
    <svg className={styles.logo} viewBox='0 0 32 32' aria-hidden='true'>
      <rect width='32' height='32' rx='8' fill='#1E8FFF' />
      <g stroke='#fff' strokeWidth='2' strokeLinecap='round' fill='none'>
        <path d='M16 7v18M8.2 11.5l15.6 9M8.2 20.5l15.6-9' />
        <path d='M13.5 8.5 16 11l2.5-2.5M13.5 23.5 16 21l2.5 2.5' />
      </g>
    </svg>
  )
}
