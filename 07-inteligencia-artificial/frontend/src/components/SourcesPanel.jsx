import { useEffect, useRef } from 'react'

import { Icon } from './Icon.jsx'
import styles from './SourcesPanel.module.css'

/**
 * Documentos consultados: primero los citados por la IA (con su texto),
 * luego el resto de fragmentos que se le enviaron.
 */
export function SourcesPanel ({ documentos, fuentes, openRef, onToggle }) {
  const citadas = fuentes.map(ref => documentos.find(d => d.ref === ref)).filter(Boolean)
  const resto = documentos.filter(d => !fuentes.includes(d.ref))
  const openItemRef = useRef(null)

  useEffect(() => {
    if (openRef) openItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [openRef])

  return (
    <section className={`card ${styles.panel}`} aria-labelledby='fuentes-title'>
      <div className={styles.head}>
        <Icon name='menu_book' size={20} className={styles.blue} />
        <h2 id='fuentes-title'>Documentos consultados</h2>
        <span className={styles.count}>{documentos.length}</span>
      </div>

      {documentos.length === 0 && <p className={styles.empty}>Buscando en la base de conocimiento…</p>}

      {citadas.length > 0 && (
        <>
          <p className={`eyebrow ${styles.groupLabel}`}>Citados en el análisis</p>
          <ul className={styles.list}>
            {citadas.map(d => (
              <Item key={d.ref} doc={d} cited open={openRef === d.ref} onToggle={onToggle} itemRef={openRef === d.ref ? openItemRef : null} />
            ))}
          </ul>
        </>
      )}

      {resto.length > 0 && (
        <details className={styles.more} open={resto.some(d => d.ref === openRef)}>
          <summary>
            {citadas.length > 0 ? `Otros ${resto.length} fragmentos enviados al modelo` : `${resto.length} fragmentos enviados al modelo`}
          </summary>
          <ul className={styles.list}>
            {resto.map(d => (
              <Item key={d.ref} doc={d} open={openRef === d.ref} onToggle={onToggle} itemRef={openRef === d.ref ? openItemRef : null} />
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}

function Item ({ doc, cited = false, open, onToggle, itemRef }) {
  return (
    <li ref={itemRef} className={open ? styles.itemOpen : undefined}>
      <button type='button' className={styles.itemHead} onClick={() => onToggle(open ? null : doc.ref)} aria-expanded={open}>
        <span className={cited ? styles.refCited : styles.ref}>{doc.ref}</span>
        <span className={styles.itemTitle}>{doc.apartado}</span>
        <Icon name={open ? 'expand_less' : 'expand_more'} size={18} className={styles.chevron} />
      </button>
      {open && (
        <blockquote className={styles.quote}>
          <p className={styles.quoteDoc}>{doc.titulo}</p>
          <p>{doc.texto}</p>
        </blockquote>
      )}
    </li>
  )
}
