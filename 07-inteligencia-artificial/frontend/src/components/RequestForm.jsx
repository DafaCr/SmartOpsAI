import { useId, useState } from 'react'

import { EJEMPLOS, ORIGENES, ROLES } from '../lib/format.js'
import styles from './RequestForm.module.css'

const MAX_LENGTH = 4000

export function RequestForm ({ busy, onSubmit, onCancel }) {
  const textoId = useId()
  const rolId = useId()
  const [texto, setTexto] = useState('')
  const [origen, setOrigen] = useState('WhatsApp')
  const [rol, setRol] = useState('operaciones')

  const canSubmit = texto.trim().length >= 5 && !busy

  const submit = () => {
    if (canSubmit) onSubmit({ texto: texto.trim(), origen, rol })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    submit()
  }

  // Ctrl/Cmd + Enter envía
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.labelRow}>
        <label htmlFor={textoId}>Mensaje del cliente</label>
        <span className={styles.counter}>{texto.length}/{MAX_LENGTH}</span>
      </div>
      <textarea
        id={textoId}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder='Pega aquí el mensaje tal como llegó: qué equipo, qué pasa, dónde…'
        rows={7}
        maxLength={MAX_LENGTH}
        required
      />

      <div className={styles.examples}>
        <span>Probar con:</span>
        {EJEMPLOS.map(ejemplo => (
          <button type='button' key={ejemplo.label} onClick={() => setTexto(ejemplo.texto)} disabled={busy}>
            {ejemplo.label}
          </button>
        ))}
      </div>

      <fieldset className={styles.origen}>
        <legend>Canal de origen</legend>
        <div className={styles.segmented}>
          {ORIGENES.map(o => (
            <label key={o} className={origen === o ? styles.checked : undefined}>
              <input
                type='radio'
                name='origen'
                value={o}
                checked={origen === o}
                onChange={() => setOrigen(o)}
              />
              {o}
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.footer}>
        <div className={styles.field}>
          <label htmlFor={rolId}>Tu área</label>
          <select id={rolId} value={rol} onChange={(e) => setRol(e.target.value)}>
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>

        {busy
          ? (
            <button type='button' className={styles.secondary} onClick={onCancel}>
              Detener
            </button>
            )
          : (
            <button type='submit' className={styles.primary} disabled={!canSubmit}>
              Analizar solicitud
              <kbd>Ctrl ↵</kbd>
            </button>
            )}
      </div>
    </form>
  )
}
