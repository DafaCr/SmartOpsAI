import './env.js' // debe ir primero: carga .env antes que el resto de módulos
import express from 'express'
import { pathToFileURL } from 'node:url'
import { jobsRouter } from './routes/jobs.js'
import { corsMiddleware } from './middlewares/cors.js'
import { DEFAULTS } from './config.js'
import { aiRouter } from './routes/ai.js'

const PORT = process.env.PORT ?? DEFAULTS.PORT
const app = express()

app.set('trust proxy', 1)
app.disable('x-powered-by')

app.use(corsMiddleware())
app.use(express.json())

app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.use('/jobs', jobsRouter)
app.use('/ai', aiRouter)

// Solo levantamos el servidor si se ejecuta directamente (node app.js).
// En Vercel y en los tests se importa `app` sin llamar a listen.
const isMainModule = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMainModule) {
  app.listen(PORT, () => {
    console.log(`Servidor levantado en http://localhost:${PORT}`)
  })
}

export default app
