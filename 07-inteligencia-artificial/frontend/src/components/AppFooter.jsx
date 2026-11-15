import styles from './AppFooter.module.css'

// Firma del estudio. Pon aquí la URL de DaruStudio para que el nombre sea un enlace.
const STUDIO = {
  name: 'DaruStudio',
  author: 'Damner Carranza',
  url: 'https://darustudio.com'
}

export function AppFooter () {
  const year = new Date().getFullYear()

  const studioName = (
    <span className={styles.studioName}>
      <StudioMark />
      {STUDIO.name}
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
                <a href={STUDIO.url} target='_blank' rel='noopener noreferrer' className={styles.studio} title={`${STUDIO.name} — ${STUDIO.author}`}>
                  {studioName}
                </a>
                )
              : <span className={styles.studio} title={`${STUDIO.name} — ${STUDIO.author}`}>{studioName}</span>}
          </p>
          <p className={styles.author}>
            <span className={styles.flourish} aria-hidden='true' />
            Un proyecto de <span className={styles.authorName}>{STUDIO.author}</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

// Monograma "D" del estudio
function StudioMark () {
  return (
    <svg className={styles.mark} viewBox='0 0 20 20' aria-hidden='true'>
      <rect width='20' height='20' rx='6' fill='currentColor' />
      <path d='M6.5 5.5h3.6a4.5 4.5 0 0 1 0 9H6.5z' fill='none' stroke='#fff' strokeWidth='1.8' strokeLinejoin='round' />
    </svg>
  )
}
