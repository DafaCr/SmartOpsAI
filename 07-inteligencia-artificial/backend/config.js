export const DEFAULTS = {
  PORT: 1234
}

export const CONFIG = {
  // Modelo servido a través de Vercel AI Gateway (formato proveedor/modelo)
  MODEL_AI: process.env.MODEL_AI || 'nvidia/nemotron-3.5-lightning-free'
}
