import { useId, useState } from 'react'

import { Icon } from './Icon.jsx'
import { DecisionBadge } from './DecisionBadge.jsx'
import { CATEGORIAS, DECISIONES, PRIORIDADES, formatTime } from '../lib/format.js'
import styles from './DecisionPanel.module.css'

/**
 * Validación humana del análisis: aprobar, corregir (categoría/prioridad)
 * o rechazar. Nada se ejecuta automáticamente: solo se registra la decisión.
 */
export function DecisionPanel ({ entry, disabled, onDecide }) {
  const [mode, setMode] = useState(null) // null | 'corregir' | 'rechazar'

  if (entry?.decision) {
    const d = DECISIONES[entry.decision.tipo]
    return (
      <section className={`card ${styles.bar} ${styles.doneBar} ${styles[`done_${d?.tone}`] ?? ''}`} aria-label='Decisión del operador'>
        <span className={styles.doneIcon} aria-hidden='true'><Icon name={d?.icon ?? 'check'} size={24} fill /></span>
        <div className={styles.barText}>
          <span className={styles.title}>Decisión del operador</span>
          <span className={styles.registered}>
            <DecisionBadge decision={entry.decision} />
            <span className={styles.at}>{formatTime(entry.decision.at)}</span>
          </span>
          {entry.decision.tipo === 'corregida' && (
            <span className={styles.detail}>
              Corregido a <strong>{entry.decision.categoria}</strong> · prioridad <strong>{entry.decision.prioridad}</strong>
            </span>
          )}
          {entry.decision.nota && <span className={styles.detail}>Nota: “{entry.decision.nota}”</span>}
        </div>
        <button type='button' className='btn btn-secondary' onClick={() => onDecide(null)}>
          <Icon name='undo' size={18} />
          Cambiar decisión
        </button>
        <span className='visually-hidden' role='status'>{d?.label}</span>
      </section>
    )
  }

  return (
    <>
      {mode && (
        <DecisionForm
          key={mode}
          mode={mode}
          analisis={entry?.analisis}
          onCancel={() => setMode(null)}
          onSave={(decision) => { onDecide(decision); setMode(null) }}
        />
      )}

      <section className={`card ${styles.bar} ${styles.pendingBar} ${disabled ? '' : styles.sticky}`} aria-label='Decisión del operador'>
        <div className={styles.barText}>
          <span className={styles.title}>
            <span className={styles.pendingDot} aria-hidden='true' />
            Decisión del operador
          </span>
          <span className={styles.hint}>
            {disabled ? 'Disponible cuando termine el análisis' : 'Valida la propuesta de la IA antes de gestionar la solicitud'}
          </span>
        </div>
        <div className={styles.actions}>
          <button type='button' className='btn btn-reject' disabled={disabled} onClick={() => setMode('rechazar')}>
            <Icon name='close' size={18} />
            Rechazar
          </button>
          <button type='button' className='btn btn-primary' disabled={disabled} onClick={() => setMode('corregir')}>
            <Icon name='edit' size={18} />
            Corregir
          </button>
          <button type='button' className='btn btn-approve' disabled={disabled} onClick={() => onDecide({ tipo: 'aprobada' })}>
            <Icon name='check_circle' size={18} />
            Aprobar
          </button>
        </div>
      </section>
    </>
  )
}

function DecisionForm ({ mode, analisis, onCancel, onSave }) {
  const categoriaId = useId()
  const prioridadId = useId()
  const notaId = useId()
  const [categoria, setCategoria] = useState(analisis?.categoria ?? CATEGORIAS[0])
  const [prioridad, setPrioridad] = useState(analisis?.prioridad ?? 'Media')
  const [nota, setNota] = useState('')
  const corregir = mode === 'corregir'

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = nota.trim() || undefined
    onSave(corregir
      ? { tipo: 'corregida', categoria, prioridad, nota: trimmed }
      : { tipo: 'rechazada', nota: trimmed })
  }

  return (
    <form className={`${styles.form} ${corregir ? styles.formCorrect : styles.formReject}`} onSubmit={handleSubmit}>
      <div className={styles.formHead}>
        <Icon name={corregir ? 'tune' : 'block'} size={22} className={corregir ? styles.blue : styles.red} />
        <h3>{corregir ? 'Corregir la clasificación' : 'Rechazar el análisis'}</h3>
        <button type='button' className={styles.close} onClick={onCancel} aria-label='Cerrar'>
          <Icon name='close' size={20} />
        </button>
      </div>

      {corregir && (
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label htmlFor={categoriaId}>Categoría</label>
            <select id={categoriaId} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className={styles.formField}>
            <label htmlFor={prioridadId}>Prioridad</label>
            <select id={prioridadId} value={prioridad} onChange={(e) => setPrioridad(e.target.value)}>
              {PRIORIDADES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
      )}

      <div className={styles.formField}>
        <label htmlFor={notaId}>{corregir ? 'Observaciones del operador (opcional)' : 'Motivo del rechazo (opcional)'}</label>
        <input
          id={notaId}
          type='text'
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          maxLength={300}
          placeholder={corregir ? 'Ej.: el cliente confirmó por teléfono que no hay producto en riesgo' : 'Ej.: la solicitud ya fue atendida por otro canal'}
        />
      </div>

      <div className={styles.formActions}>
        <button type='button' className='btn btn-secondary' onClick={onCancel}>Cancelar</button>
        <button type='submit' className={`btn ${corregir ? 'btn-primary' : 'btn-reject'}`}>
          {corregir ? 'Guardar corrección' : 'Confirmar rechazo'}
        </button>
      </div>
    </form>
  )
}
