// En producción (Vercel Services) frontend y backend comparten dominio:
// el backend vive en /api. En local, Vite redirige /api al backend (vite.config.js).
// VITE_API_URL solo hace falta si el backend está en otro dominio.
export const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
