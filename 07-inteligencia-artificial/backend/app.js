import './env.js' // debe ir primero: carga .env antes que el resto de módulos
import express from 'express'
import { pathToFileURL } from 'node:url'

import { corsMiddleware } from './middlewares/cors.js'
import { CONFIG, DEFAULTS } from './config.js'
import { aiRouter } from './routes/ai.js'
import { kbRouter } from './routes/kb.js'

const PORT = process.env.PORT ?? DEFAULTS.PORT
const app = express()

app.set('trust proxy', 1)
app.disable('x-powered-by')

app.use(corsMiddleware())
app.use(express.json({ limit: '32kb' }))

// Todas las rutas cuelgan de /api: en Vercel el rewrite /api/(.*) llega con el
// prefijo intacto, y en local el proxy de Vite reenvía /api a este servidor.
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    model: CONFIG.MODEL_AI,
    ai: Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN)
  })
})

app.use('/api/kb', kbRouter)
app.use('/api/ai', aiRouter)

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

// Solo se levanta el servidor si se ejecuta directamente (node app.js).
// En Vercel y en los tests se importa `app` sin llamar a listen.
const isMainModule = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMainModule) {
  app.listen(PORT, () => {
    console.log(`SmartOps AI API en http://localhost:${PORT} (modelo: ${CONFIG.MODEL_AI})`)
  })
}

export default app
