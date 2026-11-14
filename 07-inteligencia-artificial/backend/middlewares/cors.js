import cors from 'cors'

const DEFAULT_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:1234',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:4173'
]

// Orígenes extra de producción, separados por comas en ALLOWED_ORIGINS
// ej: ALLOWED_ORIGINS=https://mi-app.vercel.app,https://midominio.com
const ENV_ORIGINS = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map(origin => origin.trim().replace(/\/$/, ''))
  .filter(Boolean)

const ACCEPTED_ORIGINS = [...DEFAULT_ORIGINS, ...ENV_ORIGINS]

export const corsMiddleware = ({ acceptedOrigins = ACCEPTED_ORIGINS } = {}) => {
  return cors({
    origin: (origin, callback) => {
      if (!origin || acceptedOrigins.includes(origin)) {
        return callback(null, true)
      }
      // No lanzamos error (daría un 500): simplemente no se envían cabeceras CORS
      return callback(null, false)
    }
  })
}
