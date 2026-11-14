import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router'

import { Header } from './components/Header.jsx'

const AnalyzerPage = lazy(() => import('./pages/AnalyzerPage.jsx'))
const KnowledgePage = lazy(() => import('./pages/KnowledgePage.jsx'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'))

export default function App () {
  return (
    <>
      <Header />
      <Suspense fallback={<p style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-3)' }}>Cargando…</p>}>
        <Routes>
          <Route path='/' element={<AnalyzerPage />} />
          <Route path='/conocimiento' element={<KnowledgePage />} />
          <Route path='*' element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <footer style={{ marginTop: 'auto', padding: '1.25rem 1rem', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-3)', borderTop: '1px solid var(--border)' }}>
        SmartOps AI · FRIOCHAP S.A.C. — La IA propone, el operador decide.
      </footer>
    </>
  )
}
