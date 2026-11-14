import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router'

import { AnalysisProvider } from './context/AnalysisContext.jsx'
import { AppHeader } from './components/AppHeader.jsx'
import { AppFooter } from './components/AppFooter.jsx'

const NewRequestPage = lazy(() => import('./pages/NewRequestPage.jsx'))
const ResultPage = lazy(() => import('./pages/ResultPage.jsx'))
const MetricsPage = lazy(() => import('./pages/MetricsPage.jsx'))
const KnowledgePage = lazy(() => import('./pages/KnowledgePage.jsx'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'))

export default function App () {
  return (
    <AnalysisProvider>
      <AppHeader />
      <Suspense fallback={<p style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--muted)' }}>Cargando…</p>}>
        <Routes>
          <Route path='/' element={<NewRequestPage />} />
          <Route path='/resultado' element={<ResultPage />} />
          <Route path='/resultado/:id' element={<ResultPage />} />
          <Route path='/metricas' element={<MetricsPage />} />
          <Route path='/conocimiento' element={<KnowledgePage />} />
          <Route path='*' element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <AppFooter />
    </AnalysisProvider>
  )
}
