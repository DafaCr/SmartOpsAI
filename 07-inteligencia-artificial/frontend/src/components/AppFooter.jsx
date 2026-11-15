import { useId } from 'react'
import styles from './AppFooter.module.css'

// Firma del estudio. `name` + `accent` forman la marca (Daru + Studio).
const STUDIO = {
  name: 'Daru',
  accent: 'Studio',
  author: 'Damner Carranza',
  url: 'https://darustudio.com'
}

const STUDIO_FULL = `${STUDIO.name}${STUDIO.accent}`

export function AppFooter () {
  const year = new Date().getFullYear()

  const studioName = (
    <span className={styles.studioName}>
      <StudioMark />
      <span>
        {STUDIO.name}<span className={styles.accent}>{STUDIO.accent}</span>
      </span>
    </span>
  )

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.legal}>
          © {year} FRIOCHAP S.A.C. · SmartOps AI
          <span className={styles.sep} aria-hidden='true'>—</span>
          <span className={styles.motto}>La IA propone, el operador decide.</span>
        </p>

        <div className={styles.signature}>
          <p className={styles.signatureMain}>
            <span className={styles.by}>Diseñado y desarrollado por</span>
            {STUDIO.url
              ? (
                <a href={STUDIO.url} target='_blank' rel='noopener noreferrer' className={styles.studio} title={`${STUDIO_FULL} — ${STUDIO.author}`}>
                  {studioName}
                </a>
                )
              : <span className={styles.studio} title={`${STUDIO_FULL} — ${STUDIO.author}`}>{studioName}</span>}
          </p>
          <p className={styles.author}>Un proyecto de {STUDIO.author}</p>
        </div>
      </div>
    </footer>
  )
}

// Monograma "D" del estudio, con degradado de marca
function StudioMark () {
  const gradientId = useId()
  return (
    <svg className={styles.mark} viewBox='0 0 20 20' aria-hidden='true'>
      <defs>
        <linearGradient id={gradientId} x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stopColor='var(--corporate)' />
          <stop offset='100%' stopColor='var(--primary)' />
        </linearGradient>
      </defs>
      <rect width='20' height='20' rx='6' fill={`url(#${gradientId})`} />
      <path d='M6.5 5.5h3.6a4.5 4.5 0 0 1 0 9H6.5z' fill='none' stroke='#fff' strokeWidth='1.8' strokeLinejoin='round' />
    </svg>
  )
}
