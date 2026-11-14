import { Router } from 'express'
import rateLimit from 'express-rate-limit'

import { solicitudSchema } from '../schemas/analysis.js'
import { streamAnalysis, describeError, AnalysisError } from '../services/analyzer.js'

// Nota: las variables de .env se cargan en ../env.js (importado primero en app.js)

// En Vercel el AI Gateway se autentica con OIDC (VERCEL_OIDC_TOKEN); fuera, con la API key
const isAIConfigured = () => Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN)

const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  limit: 10, // 10 análisis por IP por minuto
  message: { error: 'Demasiadas solicitudes. Espera un minuto e inténtalo de nuevo.' },
  legacyHeaders: false,
  standardHeaders: 'draft-8'
})

export const aiRouter = Router()

/**
 * POST /api/ai/analizar  { texto, origen?, rol? }
 * Responde en streaming NDJSON (una línea JSON por evento):
 *   {"type":"documentos","documentos":[...]}
 *   {"type":"parcial","analisis":{...}}   (varias veces)
 *   {"type":"final","analisis":{...}}     o  {"type":"error","error":"..."}
 */
aiRouter.post('/analizar', aiRateLimiter, async (req, res) => {
  const parsed = solicitudSchema.safeParse(req.body ?? {})
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Solicitud inválida' })
  }

  if (!isAIConfigured()) {
    return res.status(503).json({ error: 'El servicio de IA no está configurado (falta AI_GATEWAY_API_KEY).' })
  }

  // Si el usuario cancela o cierra la pestaña, se corta también la llamada al modelo
  const controller = new AbortController()
  res.on('close', () => {
    if (!res.writableEnded) controller.abort()
  })

  res.status(200)
  res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  const send = event => res.write(JSON.stringify(event) + '\n')

  try {
    // app.locals.aiModel permite inyectar un modelo simulado en los tests
    const options = { abortSignal: controller.signal, model: req.app.locals.aiModel ?? undefined }
    for await (const event of streamAnalysis(parsed.data, options)) {
      send(event)
    }
  } catch (error) {
    if (controller.signal.aborted) return res.end()

    if (error instanceof AnalysisError) {
      console.error('[AI] Respuesta inválida del modelo:', error.cause?.message, '\n', error.raw)
    } else {
      console.error('[AI] Error analizando solicitud:', error)
    }
    send({ type: 'error', error: describeError(error).message })
  }

  res.end()
})
