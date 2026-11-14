import { useState } from 'react'

import styles from './SourceList.module.css'

/**
 * Fuentes citadas por el modelo. Cada una se puede abrir para leer el
 * fragmento exacto de la base de conocimiento que se le envió.
 */
export function SourceList ({ fuentes, documentos, streaming }) {
  const [open, setOpen] = useState(null)
  const byRef = Object.fromEntries(documentos.map(d => [d.ref, d]))
  const abierto = open && byRef[open]

  return (
    <section className={styles.sources}>
      <h3>Fuentes citadas</h3>

      {fuentes.length > 0
        ? (
          <div className={styles.chips}>
            {fuentes.map(ref => (
              <button
                key={ref}
                type='button'
                className={open === ref ? styles.chipActive : styles.chip}
                onClick={() => setOpen(open === ref ? null : ref)}
                aria-expanded={open === ref}
                title={byRef[ref] ? `${byRef[ref].titulo} — ${byRef[ref].apartado}` : undefined}
              >
                <span className={styles.ref}>{ref}</span>
                {byRef[ref] && <span className={styles.apartado}>{byRef[ref].apartado}</span>}
              </button>
            ))}
          </div>
          )
        : (
          <p className={styles.none}>{streaming ? 'Esperando a que el modelo cite sus fuentes…' : 'Sin fuentes citadas.'}</p>
          )}

      {abierto && (
        <blockquote className={styles.quote}>
          <p className={styles.quoteTitle}>[{abierto.ref}] {abierto.titulo}</p>
          <p>{abierto.texto}</p>
        </blockquote>
      )}

      {documentos.length > 0 && (
        <details className={styles.details}>
          <summary>Ver los {documentos.length} fragmentos consultados</summary>
          <ul>
            {documentos.map(d => (
              <li key={d.ref}>
                <button type='button' onClick={() => setOpen(d.ref)}>
                  <span className={styles.ref}>{d.ref}</span> {d.titulo} — {d.apartado}
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}
