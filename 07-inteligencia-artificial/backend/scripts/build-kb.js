// Genera kb/fragments.json a partir de los .md de la base de conocimiento.
// Ejecuta `npm run build:kb` cada vez que edites un documento.
// (Se genera un JSON para que Vercel lo incluya en la función sin depender de fs.)
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE_DIR = join(ROOT, 'base_conocimiento_smartops', 'knowledge')
const OUTPUT = join(ROOT, 'kb', 'fragments.json')

function parseFrontmatter (raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) return { meta: {}, body: raw }
  const meta = {}
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':')
    if (idx > 0) meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
  }
  return { meta, body: raw.slice(match[0].length) }
}

// Convierte el markdown de una sección en una sola línea legible
const isTableRow = line => line.startsWith('|')
const isTableSeparator = line => /^\|?[\s:|-]+$/.test(line) && line.includes('-')
const tableCells = line => line.replace(/^\||\|$/g, '').split('|').map(cell => cell.trim())

// Convierte una tabla Markdown en frases "Columna: valor; Columna: valor."
function tableToText (rows) {
  const [header, ...body] = rows.filter(row => !isTableSeparator(row)).map(tableCells)
  if (!header || body.length === 0) return rows.join(' ')
  return body
    .map(cells => header.map((col, i) => cells[i] ? `${col}: ${cells[i]}` : null).filter(Boolean).join('; ') + '.')
    .join(' ')
}

function toOneLine (markdown) {
  const lines = markdown.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
  const parts = []
  for (let i = 0; i < lines.length; i++) {
    if (!isTableRow(lines[i])) {
      // "### Prioridad Alta" → "Prioridad Alta:"
      parts.push(lines[i].replace(/^#{3,6}\s*(.+?):?$/, '$1:'))
      continue
    }
    const table = []
    while (i < lines.length && isTableRow(lines[i])) table.push(lines[i++])
    i--
    parts.push(tableToText(table))
  }
  return parts
    .join(' ')
    .replace(/\*\*(.+?)\*\*/g, '$1') // quita negritas de Markdown
    .replace(/\s+/g, ' ')
    .trim()
}

export function buildFragments () {
  const files = readdirSync(SOURCE_DIR).filter(f => f.endsWith('.md')).sort()
  const fragments = []

  for (const file of files) {
    const { meta, body } = parseFrontmatter(readFileSync(join(SOURCE_DIR, file), 'utf8'))
    if (!meta.id || meta.id.startsWith('IDX')) continue // el índice no es fuente

    const sections = body.split(/^## /m).slice(1)
    for (const section of sections) {
      const [headingLine, ...rest] = section.split(/\r?\n/)
      const num = headingLine.match(/^(\d+)\./)?.[1]
      if (!num) continue
      const heading = headingLine.replace(/^\d+\.\s*/, '').trim()
      fragments.push({
        ref: `${meta.id} §${num}`,
        doc: meta.id,
        section: Number(num),
        titulo: meta.titulo,
        apartado: heading,
        acceso: meta.acceso ?? 'todos',
        texto: toOneLine(`${heading}. ${rest.join('\n')}`)
      })
    }
  }
  return fragments
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const fragments = buildFragments()
  writeFileSync(OUTPUT, JSON.stringify(fragments, null, 2) + '\n')
  console.log(`kb/fragments.json: ${fragments.length} fragmentos de ${new Set(fragments.map(f => f.doc)).size} documentos`)
}
