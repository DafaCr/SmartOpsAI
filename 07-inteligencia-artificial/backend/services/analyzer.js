import { streamText, parsePartialJson } from 'ai'

import { CONFIG } from '../config.js'
import { SYSTEM_PROMPT, buildUserMessage } from '../prompts/smartops.js'
import { parseAnalysis } from '../schemas/analysis.js'
import { retrieveFragments } from './knowledge.js'

// Cada cuánto (ms) como máximo se envía un análisis parcial al cliente
const PARTIAL_INTERVAL_MS = 60

export class AnalysisError extends Error {
  constructor (message, { cause, raw } = {}) {
    super(message, { cause })
    this.name = 'AnalysisError'
    this.raw = raw
  }
}

// El modelo puede envolver el JSON en ```json … ```: se ignora lo previo a la primera llave
function jsonCandidate (text) {
  const start = text.indexOf('{')
  return start === -1 ? null : text.slice(start)
}

async function parsePartial (text) {
  const candidate = jsonCandidate(text)
  if (!candidate) return null
  const { value } = await parsePartialJson(candidate)
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null
}

/**
 * Analiza una solicitud en streaming. Emite eventos:
 *  - { type: 'documentos', documentos }  fragmentos enviados al modelo
 *  - { type: 'parcial', analisis }       JSON parcial mientras el modelo escribe
 *  - { type: 'final', analisis }         JSON completo y validado
 * Lanza AnalysisError si la respuesta final no cumple el formato del prompt.
 *
 * `model` se puede inyectar (tests); por defecto CONFIG.MODEL_AI vía Vercel AI Gateway.
 */
export async function * streamAnalysis ({ texto, origen, rol }, { model = CONFIG.MODEL_AI, abortSignal } = {}) {
  const fragmentos = retrieveFragments(texto, { rol })

  yield {
    type: 'documentos',
    documentos: fragmentos.map(({ ref, titulo, apartado, texto }) => ({ ref, titulo, apartado, texto }))
  }

  const result = streamText({
    model,
    system: SYSTEM_PROMPT,
    prompt: buildUserMessage({ origen, texto, fragmentos }),
    temperature: 0,
    maxOutputTokens: 2000,
    abortSignal
  })

  let text = ''
  let lastSent = ''
  let lastSentAt = 0

  for await (const part of result.fullStream) {
    if (part.type === 'error') throw part.error
    if (part.type !== 'text-delta') continue

    text += part.text
    if (Date.now() - lastSentAt < PARTIAL_INTERVAL_MS) continue

    const partial = await parsePartial(text)
    const serialized = partial && JSON.stringify(partial)
    if (serialized && serialized !== lastSent) {
      lastSent = serialized
      lastSentAt = Date.now()
      yield { type: 'parcial', analisis: partial }
    }
  }

  let analisis
  try {
    analisis = parseAnalysis(text)
  } catch (error) {
    throw new AnalysisError('El modelo devolvió una respuesta con formato inválido', { cause: error, raw: text })
  }

  // Solo se aceptan como fuentes los fragmentos que realmente se enviaron al modelo
  const enviados = new Set(fragmentos.map(f => f.ref))
  analisis.fuentes = analisis.fuentes.filter(ref => enviados.has(ref))

  yield { type: 'final', analisis }
}

/**
 * Traduce errores técnicos (AI Gateway, formato…) a un mensaje claro para el usuario.
 */
export function describeError (error) {
  if (error instanceof AnalysisError) {
    return { status: 502, message: 'La IA devolvió una respuesta que no cumple el formato esperado. Inténtalo de nuevo.' }
  }

  const message = String(error?.message ?? '')
  const status = error?.statusCode

  if (/credit card/i.test(message)) {
    return { status: 402, message: 'Vercel AI Gateway requiere una tarjeta registrada en tu cuenta para activar los créditos (incluso para modelos gratuitos).' }
  }
  if (status === 401 || error?.name === 'GatewayAuthenticationError') {
    return { status: 401, message: 'La API key de Vercel AI Gateway no es válida.' }
  }
  if (status === 429 || error?.name === 'GatewayRateLimitError') {
    return { status: 429, message: 'El proveedor de IA está saturado. Espera unos segundos y vuelve a intentarlo.' }
  }
  if (status === 404 || error?.name === 'GatewayModelNotFoundError') {
    return { status: 500, message: `El modelo configurado (${CONFIG.MODEL_AI}) no existe en Vercel AI Gateway.` }
  }
  return { status: 500, message: 'Error al analizar la solicitud. Inténtalo de nuevo.' }
}
