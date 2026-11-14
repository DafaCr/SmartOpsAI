import { useAnalysis } from '../context/AnalysisContext.jsx'
import styles from './AppFooter.module.css'

export function AppFooter () {
  const { health } = useAnalysis()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span>© {new Date().getFullYear()} FRIOCHAP S.A.C. — SmartOps AI · La IA propone, el operador decide.</span>
        {health.data?.model && <span className={styles.model}>Modelo: {health.data.model}</span>}
      </div>
    </footer>
  )
}
