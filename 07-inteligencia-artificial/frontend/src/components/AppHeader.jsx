import { useEffect, useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router'

import { useAnalysis } from '../context/AnalysisContext.jsx'
import { Icon } from './Icon.jsx'
import styles from './AppHeader.module.css'

const NAV = [
  { to: '/', label: 'Analizar', icon: 'edit_square', end: true },
  { to: '/metricas', label: 'Métricas', icon: 'monitoring' },
  { to: '/conocimiento', label: 'Base de conocimiento', short: 'Docs', icon: 'menu_book' }
]

export function AppHeader () {
  const { health, history, stream } = useAnalysis()
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const pendientes = history.entries.filter(e => !e.decision).length
  const analizando = stream.status === 'buscando' || stream.status === 'analizando'

  // Al hacer scroll la cabecera pasa a "vidrio" con más sombra
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const ia = health.error
    ? { tone: 'off', label: 'Servidor sin conexión' }
    : !health.data
        ? { tone: 'loading', label: 'Conectando…' }
        : health.data.ai
          ? { tone: 'on', label: 'IA operativa' }
          : { tone: 'warn', label: 'IA sin configurar' }

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      {analizando && <span className={styles.progress} aria-hidden='true' />}
      <div className={styles.inner}>
        <Link to='/' className={styles.brand} aria-label='SmartOps AI, nueva solicitud'>
          <Logo />
          <span className={styles.brandText}>
            <span className={styles.brandName}>SmartOps <span>AI</span></span>
            <span className={styles.company}>FRIOCHAP S.A.C. · Mesa de Operaciones</span>
          </span>
        </Link>

        <nav className={styles.nav} aria-label='Principal'>
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              aria-label={item.label}
              className={({ isActive }) => (isActive ? `${styles.navLink} ${styles.active}` : styles.navLink)}
            >
              <Icon name={item.icon} size={19} />
              <span className={item.short ? styles.longLabel : styles.label}>{item.label}</span>
              {item.short && <span className={styles.shortLabel}>{item.short}</span>}
              {item.to === '/metricas' && pendientes > 0 && (
                <span className={styles.count} title={`${pendientes} análisis por validar`}>{pendientes}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={styles.right}>
          <span className={styles.status} title={health.data?.model ? `Modelo: ${health.data.model}` : undefined}>
            <span className={`${styles.dot} ${styles[ia.tone]}`} aria-hidden='true' />
            {ia.label}
          </span>
          {pathname !== '/' && (
            <Link to='/' className={`btn btn-primary ${styles.cta}`} aria-label='Nueva solicitud'>
              <Icon name='add' size={18} />
              <span className={styles.ctaLabel}>Nueva solicitud</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

function Logo () {
  return (
    <span className={styles.logoWrap}>
      <svg className={styles.logo} viewBox='0 0 32 32' aria-hidden='true'>
        <defs>
          <linearGradient id='logo-g' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#4FA9FF' />
            <stop offset='100%' stopColor='#0B6FD6' />
          </linearGradient>
        </defs>
        <rect width='32' height='32' rx='9' fill='url(#logo-g)' />
        <g stroke='#fff' strokeWidth='2' strokeLinecap='round' fill='none'>
          <path d='M16 7v18M8.2 11.5l15.6 9M8.2 20.5l15.6-9' />
          <path d='M13.5 8.5 16 11l2.5-2.5M13.5 23.5 16 21l2.5 2.5' />
        </g>
      </svg>
    </span>
  )
}
