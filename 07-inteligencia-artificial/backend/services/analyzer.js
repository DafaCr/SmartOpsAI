import { generateText } from 'ai'

import { CONFIG } from '../config.js'
import { SYSTEM_PROMPT, buildUserMessage } from '../prompts/smartops.js'
import { parseAnalysis } from '../schemas/analysis.js'
import { retrieveFragments } from './knowledge.js'

export class AnalysisError extends Error {
  constructor (message, { cause, raw } = {}) {
    super(message, { cause })
    this.name = 'AnalysisError'
    this.raw = raw
  }
}

/**
 * Analiza una solicitud: recupera fragmentos, llama al modelo con el prompt
 * fijo y valida el JSON de respuesta.
 * `model` se puede inyectar (tests); por defecto usa CONFIG.MODEL_AI vía AI Gateway.
 */
export async function analyzeRequest ({ texto, origen, rol }, { model = CONFIG.MODEL_AI } = {}) {
  const fragmentos = retrieveFragments(texto, { rol })

  const { text } = await generateText({
    model,
    system: SYSTEM_PROMPT,
    prompt: buildUserMessage({ origen, texto, fragmentos }),
    temperature: 0,
    maxOutputTokens: 1000
  })

  try {
    const analisis = parseAnalysis(text)
    // Solo se aceptan como fuentes los fragmentos que realmente se enviaron
    const enviados = new Set(fragmentos.map(f => f.ref))
    analisis.fuentes = analisis.fuentes.filter(ref => enviados.has(ref))
    return {
      analisis,
      documentos: fragmentos.map(({ ref, titulo, apartado }) => ({ ref, titulo, apartado }))
    }
  } catch (error) {
    throw new AnalysisError('El modelo devolvió una respuesta con formato inválido', { cause: error, raw: text })
  }
}
