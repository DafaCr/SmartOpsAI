import fragments from '../kb/fragments.json' with { type: 'json' }

// Secciones que el prompt del sistema cita por nombre: se envían siempre
// (si el rol tiene acceso) para que el modelo pueda aplicar sus reglas.
const CORE_REFS = [
  'SEG-01 §2',
  'REG-02 §2', 'REG-02 §3', 'REG-02 §4',
  'REG-01 §3', 'REG-01 §4',
  'POL-01 §5', 'POL-01 §6', 'POL-01 §8',
  'TEC-01 §3', 'TEC-02 §2',
  'TEC-03 §1'
]

// Fragmentos adicionales elegidos por relevancia con el texto de la solicitud
const EXTRA_FRAGMENTS = 8

// Qué niveles de `acceso` puede ver cada rol
const ACCESS_BY_ROLE = {
  operaciones: ['todos', 'operaciones'],
  administracion: ['todos', 'administracion'],
  todos: ['todos']
}

export const ROLES = Object.keys(ACCESS_BY_ROLE)

const STOPWORDS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'al', 'en', 'que', 'se', 'no', 'por',
  'para', 'con', 'sin', 'su', 'sus', 'es', 'son', 'lo', 'le', 'les', 'me', 'mi', 'mis', 'nos', 'ya', 'hay',
  'muy', 'mas', 'pero', 'como', 'esta', 'este', 'esto', 'estos', 'estas', 'ese', 'esa', 'eso', 'tiene',
  'tienen', 'tengo', 'hace', 'desde', 'hasta', 'sobre', 'entre', 'cuando', 'donde', 'porque', 'favor',
  'hola', 'buenos', 'buenas', 'dias', 'tardes', 'noches', 'gracias'
])

function normalize (text) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

// Tokens con un "stemming" mínimo: prefijo de 5 letras (frio/frios, enfria/enfriamiento...)
function tokenize (text) {
  return normalize(text)
    .split(/[^a-z0-9-]+/)
    .filter(token => token.length > 2 && !STOPWORDS.has(token))
    .map(token => token.slice(0, 5))
}

// Índice en memoria: tokens por fragmento + frecuencia documental (idf)
const indexed = fragments.map(fragment => ({
  fragment,
  tokens: new Set(tokenize(`${fragment.titulo} ${fragment.apartado} ${fragment.texto}`)),
  headingTokens: new Set(tokenize(`${fragment.titulo} ${fragment.apartado}`))
}))

const docFreq = new Map()
for (const { tokens } of indexed) {
  for (const token of tokens) docFreq.set(token, (docFreq.get(token) ?? 0) + 1)
}

function score (queryTokens, item) {
  let total = 0
  for (const token of queryTokens) {
    if (!item.tokens.has(token)) continue
    const idf = Math.log(1 + indexed.length / docFreq.get(token))
    total += idf * (item.headingTokens.has(token) ? 2 : 1)
  }
  return total
}

/**
 * Fragmentos a enviar al modelo: los obligatorios + los más relevantes
 * para el texto de la solicitud, filtrados por el rol del usuario.
 */
export function retrieveFragments (texto, { rol = 'operaciones', extra = EXTRA_FRAGMENTS } = {}) {
  const allowed = ACCESS_BY_ROLE[rol] ?? ACCESS_BY_ROLE.todos
  const visible = indexed.filter(item => allowed.includes(item.fragment.acceso))

  const core = CORE_REFS
    .map(ref => visible.find(item => item.fragment.ref === ref))
    .filter(Boolean)

  const queryTokens = [...new Set(tokenize(texto))]
  const ranked = visible
    .filter(item => !core.includes(item))
    .map(item => ({ item, score: score(queryTokens, item) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, extra)
    .map(({ item }) => item)

  return [...core, ...ranked].map(item => item.fragment)
}

// Formato pedido: [CÓDIGO §n] Título — texto
export function formatFragment (fragment) {
  return `[${fragment.ref}] ${fragment.titulo} — ${fragment.texto}`
}
