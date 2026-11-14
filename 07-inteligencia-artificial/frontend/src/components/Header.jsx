import { NavLink, Link } from 'react-router'

import { useApi } from '../hooks/useApi.js'
import styles from './Header.module.css'

export function Header () {
  const { data: health, error } = useApi('/health')

  const status = error
    ? { tone: 'off', label: 'Servidor sin conexión' }
    : !health
        ? { tone: 'loading', label: 'Conectando…' }
        : health.ai
          ? { tone: 'on', label: `IA conectada · ${health.model}` }
          : { tone: 'warn', label: 'IA sin configurar' }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to='/' className={styles.brand} aria-label='SmartOps AI, inicio'>
          <Logo />
          <span className={styles.brandText}>
            <strong>SmartOps AI</strong>
            <small>FRIOCHAP · Mesa de Operaciones</small>
          </span>
        </Link>

        <nav className={styles.nav} aria-label='Principal'>
          <NavLink to='/' end className={({ isActive }) => isActive ? styles.active : undefined}>
            Analizar
          </NavLink>
          <NavLink to='/conocimiento' className={({ isActive }) => isActive ? styles.active : undefined}>
            Base de conocimiento
          </NavLink>
        </nav>

        <span className={`${styles.status} ${styles[status.tone]}`} title={status.label}>
          <span className={styles.dot} aria-hidden='true' />
          <span className={styles.statusLabel}>{status.label}</span>
        </span>
      </div>
    </header>
  )
}

function Logo () {
  return (
    <svg className={styles.logo} viewBox='0 0 32 32' aria-hidden='true'>
      <rect width='32' height='32' rx='9' fill='currentColor' />
      <g stroke='#fff' strokeWidth='2' strokeLinecap='round' fill='none'>
        <path d='M16 7v18M8.2 11.5l15.6 9M8.2 20.5l15.6-9' />
        <path d='M13.5 8.5 16 11l2.5-2.5M13.5 23.5 16 21l2.5 2.5' />
      </g>
    </svg>
  )
}
