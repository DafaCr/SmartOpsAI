import { useId, useState } from 'react'

import { useAnalyzeRequest } from '../hooks/useAnalyzeRequest.jsx'
import styles from './Analizar.module.css'

const ORIGENES = ['WhatsApp', 'Correo', 'Teléfono', 'Web']
const ROLES = [
  { value: 'operaciones', label: 'Operaciones' },
  { value: 'administracion', label: 'Administración' },
  { value: 'todos', label: 'General' }
]

const EJEMPLOS = [
  'Buenas, en la cocina del local de Miraflores el split está botando chispas y huele a quemado.',
  'La cámara de congelados marca -5 °C desde la mañana y tenemos mercadería adentro. Alarma HI.',
  'Quisiera cotizar el mantenimiento preventivo de 6 equipos de aire acondicionado para nuestra oficina.',
  'Necesito una copia de la factura de octubre, por favor.'
]

const ESTADO_LABEL = {
  analizada: 'Analizada',
  derivada: 'Derivada a una persona',
  rechazada: 'Rechazada'
}

export default function AnalizarPage () {
  const textoId = useId()
  const origenId = useId()
  const rolId = useId()

  const [texto, setTexto] = useState('')
  const [origen, setOrigen] = useState('WhatsApp')
  const [rol, setRol] = useState('operaciones')
  const { result, loading, error, analyze } = useAnalyzeRequest()

  const handleSubmit = (event) => {
    event.preventDefault()
    if (texto.trim().length < 5 || loading) return
    analyze({ texto: texto.trim(), origen, rol })
  }

  return (
    <main className={styles.page}>
      <title>Analizar solicitud | SmartOps AI</title>

      <section className={styles.intro}>
        <h1>Analizar solicitud</h1>
        <p>
          SmartOps AI propone categoría, prioridad, responsable y pasos a seguir
          según la base de conocimiento de FRIOCHAP. La decisión final es del operador.
        </p>
      </section>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor={textoId}>Mensaje del cliente</label>
        <textarea
          id={textoId}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder='Pega aquí el mensaje recibido…'
          rows={6}
          maxLength={4000}
          required
        />

        <div className={styles.examples}>
          <span>Ejemplos:</span>
          {EJEMPLOS.map((ejemplo, i) => (
            <button type='button' key={i} onClick={() => setTexto(ejemplo)}>
              {ejemplo.slice(0, 38)}…
            </button>
          ))}
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor={origenId}>Canal de origen</label>
            <select id={origenId} value={origen} onChange={(e) => setOrigen(e.target.value)}>
              {ORIGENES.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor={rolId}>Tu área</label>
            <select id={rolId} value={rol} onChange={(e) => setRol(e.target.value)}>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <button className={styles.submit} type='submit' disabled={loading || texto.trim().length < 5}>
            {loading ? 'Analizando…' : 'Analizar'}
          </button>
        </div>
      </form>

      {error && <p className={styles.error} role='alert'>{error}</p>}

      {result && <AnalysisResult analisis={result.analisis} documentos={result.documentos} />}
    </main>
  )
}

function AnalysisResult ({ analisis, documentos }) {
  const titles = Object.fromEntries(documentos.map(d => [d.ref, `${d.titulo} — ${d.apartado}`]))

  return (
    <section className={styles.result} aria-live='polite'>
      <header className={styles.resultHeader}>
        <span className={`${styles.badge} ${styles[`estado_${analisis.estado}`]}`}>
          {ESTADO_LABEL[analisis.estado] ?? analisis.estado}
        </span>
        {analisis.prioridad && (
          <span className={`${styles.badge} ${styles[`prioridad_${analisis.prioridad}`]}`}>
            Prioridad {analisis.prioridad}
          </span>
        )}
        {analisis.confianza && (
          <span className={styles.badge}>Confianza {analisis.confianza}</span>
        )}
      </header>

      <p className={styles.motivo}>{analisis.motivo_estado}</p>

      {analisis.estado !== 'rechazada' && (
        <dl className={styles.grid}>
          <div>
            <dt>Categoría</dt>
            <dd>{analisis.categoria}</dd>
          </div>
          <div>
            <dt>Responsable</dt>
            <dd>{analisis.responsable}</dd>
          </div>
          <div className={styles.wide}>
            <dt>Resumen</dt>
            <dd>{analisis.resumen}</dd>
          </div>
          {analisis.motivo_prioridad && (
            <div className={styles.wide}>
              <dt>Motivo de la prioridad</dt>
              <dd>{analisis.motivo_prioridad}</dd>
            </div>
          )}
        </dl>
      )}

      {analisis.recomendacion.length > 0 && (
        <>
          <h2>Recomendación</h2>
          <ol className={styles.list}>
            {analisis.recomendacion.map((paso, i) => <li key={i}>{paso}</li>)}
          </ol>
        </>
      )}

      {analisis.informacion_faltante.length > 0 && (
        <>
          <h2>Información a pedir al cliente</h2>
          <ul className={styles.list}>
            {analisis.informacion_faltante.map((dato, i) => <li key={i}>{dato}</li>)}
          </ul>
        </>
      )}

      {analisis.fuentes.length > 0 && (
        <>
          <h2>Fuentes</h2>
          <ul className={styles.sources}>
            {analisis.fuentes.map(ref => (
              <li key={ref} title={titles[ref]}>
                <strong>{ref}</strong> {titles[ref]}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
