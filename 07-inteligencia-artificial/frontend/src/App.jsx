import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router'

import { AnalysisProvider } from './context/AnalysisContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { AppHeader } from './components/AppHeader.jsx'
import { AppFooter } from './components/AppFooter.jsx'

const NewRequestPage = lazy(() => import('./pages/NewRequestPage.jsx'))
const ResultPage = lazy(() => import('./pages/ResultPage.jsx'))
const MetricsPage = lazy(() => import('./pages/MetricsPage.jsx'))
const KnowledgePage = lazy(() => import('./pages/KnowledgePage.jsx'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'))

export default function App () {
  // La animación de entrada se reinicia al cambiar de sección
  // (/resultado → /resultado/:id es la misma sección y no se anima de nuevo)
  const { pathname } = useLocation()
  const section = pathname.split('/')[1] || 'inicio'

  return (
    <ToastProvider>
      <AnalysisProvider>
        <AppHeader />
        <Suspense fallback={<p style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--muted)' }}>Cargando…</p>}>
          <div key={section} className='route-enter' style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <Routes>
              <Route path='/' element={<NewRequestPage />} />
              <Route path='/resultado' element={<ResultPage />} />
              <Route path='/resultado/:id' element={<ResultPage />} />
              <Route path='/metricas' element={<MetricsPage />} />
              <Route path='/conocimiento' element={<KnowledgePage />} />
              <Route path='*' element={<NotFoundPage />} />
            </Routes>
          </div>
        </Suspense>
        <AppFooter />
      </AnalysisProvider>
    </ToastProvider>
  )
}
