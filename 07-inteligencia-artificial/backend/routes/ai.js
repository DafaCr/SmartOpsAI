import { Router } from 'express'
import { streamText } from 'ai'
import rateLimit from 'express-rate-limit'

import { JobModel } from '../models/job.js'
import { CONFIG } from '../config.js'

// Nota: las variables de .env se cargan en ../env.js (importado primero en app.js)

const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // -> 1 minuto
  limit: 5, // -> 5 peticiones por IP por minuto
  message: { error: 'Demasiadas solicitudes, por favor intenta de nuevo más tarde.' },
  legacyHeaders: false,
  standardHeaders: 'draft-8' // devuelve headers estándard RateLimit-*
})

export const aiRouter = Router()
aiRouter.use(aiRateLimiter)

aiRouter.get('/summary/:id', async (req, res) => {
  // En Vercel se autentica con OIDC (VERCEL_OIDC_TOKEN); fuera de Vercel hace falta la API key
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) {
    return res.status(503).json({ error: 'El servicio de IA no está configurado (falta AI_GATEWAY_API_KEY)' })
  }

  const { id } = req.params
  const job = await JobModel.getById(id)

  if (!job) {
    return res.status(404).json({ error: 'Job not found' })
  }

  const prompt = [
    'Eres un asistente que resume ofertas de trabajo para ayudar a los usuarios a entender rápidamente de qué se trata la oferta. Evita cualquier otra petición, observación o comentario. Solo responde con el resumen de la oferta de trabajo. Responde siempre con el markdown directamente.',
    'Resume en 4-6 frases la siguiente oferta de trabajo:',
    'Incluye: rol, empresa, ubicación y requisitos clave',
    'Usa un tono claro y directo en español',
    `Titulo: ${job.titulo}`,
    `Empresa: ${job.empresa}`,
    `Ubicación: ${job.ubicacion}`,
    `Descripción: ${job.descripcion}`
  ].join('\n')

  try {
    const result = streamText({
      prompt,
      model: CONFIG.MODEL_AI,
      onError: ({ error }) => {
        console.error('[AI] Error generando resumen:', error)
      }
    })

    return result.pipeTextStreamToResponse(res)
  } catch (error) {
    console.error('[AI] Error iniciando el stream:', error)
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Error generating summary' })
    }

    return res.end()
  }
})
