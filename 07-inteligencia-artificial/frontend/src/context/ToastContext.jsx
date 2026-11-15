import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

import { Icon } from '../components/Icon.jsx'
import styles from './Toast.module.css'

const ToastContext = createContext(null)

const TONES = {
  success: 'check_circle',
  info: 'info',
  primary: 'edit_note',
  critical: 'cancel'
}

/**
 * Avisos breves (decisión registrada, análisis copiado…) en la esquina inferior.
 */
export function ToastProvider ({ children }) {
  const [toasts, setToasts] = useState([])
  const counter = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts(list => list.map(t => (t.id === id ? { ...t, leaving: true } : t)))
    setTimeout(() => setToasts(list => list.filter(t => t.id !== id)), 220)
  }, [])

  const show = useCallback((message, { tone = 'success', duration = 3200 } = {}) => {
    const id = ++counter.current
    setToasts(list => [...list.slice(-2), { id, message, tone }])
    setTimeout(() => dismiss(id), duration)
  }, [dismiss])

  const value = useMemo(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.region} role='status' aria-live='polite'>
        {toasts.map(t => (
          <div key={t.id} className={`${styles.toast} ${styles[t.tone]} ${t.leaving ? styles.leaving : ''}`}>
            <Icon name={TONES[t.tone] ?? 'info'} size={20} fill />
            <span>{t.message}</span>
            <button type='button' onClick={() => dismiss(t.id)} aria-label='Cerrar aviso'>
              <Icon name='close' size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast () {
  return useContext(ToastContext) ?? { show: () => {} }
}
