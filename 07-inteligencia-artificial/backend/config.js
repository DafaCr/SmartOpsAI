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

export const CONFIG = {
  // Modelo servido a través de Vercel AI Gateway (formato proveedor/modelo)
  MODEL_AI: process.env.MODEL_AI || 'anthropic/claude-haiku-5.5'
}
