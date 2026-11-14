import * as z from 'zod'

export const ORIGENES = ['WhatsApp', 'Correo', 'Teléfono', 'Web']

// Cuerpo de POST /api/ai/analizar
export const solicitudSchema = z.object({
  texto: z.string().trim()
    .min(5, 'Describe la solicitud (mínimo 5 caracteres)')
    .max(4000, 'La solicitud es demasiado larga (máximo 4000 caracteres)'),
  origen: z.enum(ORIGENES).default('Web'),
  rol: z.enum(['operaciones', 'administracion', 'todos']).default('operaciones')
})

// Valores cerrados: deben coincidir exactamente con los del prompt (o ser null)
const nullableEnum = values => z.enum(values).nullable().default(null)

// Texto libre: los modelos a veces envían null o "" cuando no aplica → null
const optionalText = z.preprocess(
  value => (typeof value === 'string' && value.trim() ? value.trim() : null),
  z.string().nullable()
)

// Listas: null o ausente → []; se descartan elementos vacíos o que no son texto
const textList = z.preprocess(
  value => (Array.isArray(value) ? value.filter(item => typeof item === 'string' && item.trim()).map(item => item.trim()) : []),
  z.array(z.string())
)

// Respuesta del modelo (formato definido en prompts/smartops.js)
export const analysisSchema = z.object({
  estado: z.enum(['analizada', 'derivada', 'rechazada']),
  motivo_estado: optionalText,
  categoria: nullableEnum(['Incidencia técnica', 'Solicitud de servicio o instalación', 'Consulta de información', 'Consulta administrativa', 'Información insuficiente']),
  prioridad: nullableEnum(['Alta', 'Media', 'Baja']),
  motivo_prioridad: optionalText,
  responsable: optionalText,
  resumen: optionalText,
  recomendacion: textList,
  informacion_faltante: textList,
  confianza: nullableEnum(['Alta', 'Media', 'Baja']),
  fuentes: textList
})

// Extrae el JSON aunque el modelo lo envuelva en ```json ... ``` o añada texto alrededor
export function parseAnalysis (rawText) {
  const start = rawText.indexOf('{')
  const end = rawText.lastIndexOf('}')
  if (start === -1 || end <= start) {
    throw new Error('La respuesta del modelo no contiene JSON')
  }
  const analisis = analysisSchema.parse(JSON.parse(rawText.slice(start, end + 1)))

  // Regla del prompt: si "rechazada", categoria, prioridad, responsable y
  // confianza en null y listas vacías (se aplica aunque el modelo no la cumpla)
  if (analisis.estado === 'rechazada') {
    return {
      ...analisis,
      categoria: null,
      prioridad: null,
      motivo_prioridad: null,
      responsable: null,
      confianza: null,
      recomendacion: [],
      informacion_faltante: [],
      fuentes: []
    }
  }
  return analisis
}
