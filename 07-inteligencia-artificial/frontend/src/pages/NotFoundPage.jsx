import { Link } from 'react-router'

export default function NotFoundPage () {
  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '4rem 1rem', textAlign: 'center' }}>
      <title>Página no encontrada · SmartOps AI</title>
      <h1 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Página no encontrada</h1>
      <p style={{ color: 'var(--text-2)', marginBottom: '1.25rem' }}>La dirección que buscas no existe.</p>
      <Link to='/'>Volver a analizar solicitudes</Link>
    </main>
  )
}
