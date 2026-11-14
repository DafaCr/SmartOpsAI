// Carga las variables de .env en local. En producción (Vercel, Render...)
// no hay archivo .env: las variables vienen del panel del hosting.
try {
  process.loadEnvFile()
} catch {
  // sin .env -> se usan las variables de entorno del sistema
}
