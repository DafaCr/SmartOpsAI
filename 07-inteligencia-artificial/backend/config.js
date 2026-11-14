export const DEFAULTS = {
  LIMIT_PAGINATION: 10,
  LIMIT_OFFSET: 0,
  PORT: 1234
}

export const CONFIG = {
  // Modelo servido a través de Vercel AI Gateway (requiere AI_GATEWAY_API_KEY)
  MODEL_AI: process.env.MODEL_AI ?? 'nvidia/nemotron-3.5-lightning-free'
}
