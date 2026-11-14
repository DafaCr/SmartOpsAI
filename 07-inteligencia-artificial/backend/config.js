export const DEFAULTS = {
  PORT: 1234
}

/**
 * ¿Puede el backend autenticarse en Vercel AI Gateway?
 * - Con AI_GATEWAY_API_KEY (local o configurada en el panel de Vercel).
 * - Desplegado en Vercel (VERCEL=1): se usa OIDC. El token llega en cada
 *   petición (cabecera x-vercel-oidc-token), no como variable de entorno.
 * - En local con `vercel env pull` / `vercel dev`: VERCEL_OIDC_TOKEN.
 */
export const isAIConfigured = () => Boolean(
  process.env.AI_GATEWAY_API_KEY?.trim() ||
  process.env.VERCEL_OIDC_TOKEN ||
  process.env.VERCEL
)

const list = value => (value ?? '').split(',').map(item => item.trim()).filter(Boolean)

export const CONFIG = {
  // Modelo principal, servido por Vercel AI Gateway (formato proveedor/modelo).
  // Disponible en el plan gratuito; probado con los casos de ejemplo.
  MODEL_AI: process.env.MODEL_AI || 'google/gemini-2.5-flash-lite',

  // Modelos de respaldo, en orden: el Gateway los usa si el principal falla
  // o alcanza su límite de peticiones. Separados por comas en MODEL_AI_FALLBACKS.
  MODEL_AI_FALLBACKS: process.env.MODEL_AI_FALLBACKS !== undefined
    ? list(process.env.MODEL_AI_FALLBACKS)
    : ['openai/gpt-5-mini']
}
