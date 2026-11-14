import { useDeferredValue, useId, useState } from 'react'

import { useApi } from '../hooks/useApi.js'
import styles from './KnowledgePage.module.css'

const ACCESO_LABEL = { todos: 'Todos', operaciones: 'Operaciones', administracion: 'Administración' }

const normalize = text => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default function KnowledgePage () {
  const searchId = useId()
  const { data, error, loading } = useApi('/kb')
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)

  const q = normalize(deferredQuery.trim())
  const documentos = (data?.documentos ?? [])
    .map(doc => ({
      ...doc,
      secciones: q
        ? doc.secciones.filter(s => normalize(`${doc.doc} ${doc.titulo} ${s.apartado} ${s.texto}`).includes(q))
        : doc.secciones
    }))
    .filter(doc => doc.secciones.length > 0)

  return (
    <main className={styles.page}>
      <title>Base de conocimiento · SmartOps AI</title>

      <div className={styles.intro}>
        <h1>Base de conocimiento</h1>
        <p>
          Documentos que SmartOps AI consulta para analizar cada solicitud. Solo estas fuentes están
          autorizadas; el modelo cita el código y la sección (por ejemplo, <code>REG-01 §3</code>).
        </p>
      </div>

      <label htmlFor={searchId} className='visually-hidden'>Buscar en la base de conocimiento</label>
      <input
        id={searchId}
        type='search'
        className={styles.search}
        placeholder='Buscar: fuga, garantía, alarma HI, factura…'
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && <p className={styles.muted}>Cargando documentos…</p>}
      {error && <p className={styles.error}>No se pudo cargar la base de conocimiento: {error}</p>}
      {data && documentos.length === 0 && <p className={styles.muted}>Sin resultados para «{query}».</p>}

      <div className={styles.docs}>
        {documentos.map(doc => (
          <details key={doc.doc} className={styles.doc} open={Boolean(q)}>
            <summary>
              <span className={styles.code}>{doc.doc}</span>
              <span className={styles.title}>{doc.titulo}</span>
              <span className={styles.acceso}>{ACCESO_LABEL[doc.acceso] ?? doc.acceso}</span>
            </summary>
            <div className={styles.sections}>
              {doc.secciones.map(s => (
                <section key={s.ref}>
                  <h3><span className={styles.code}>{s.ref}</span> {s.apartado}</h3>
                  <p>{s.texto}</p>
                </section>
              ))}
            </div>
          </details>
        ))}
      </div>
    </main>
  )
}
