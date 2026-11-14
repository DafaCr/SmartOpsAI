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

const nullableEnum = values => z.enum(values).nullable()

// Respuesta del modelo (formato definido en prompts/smartops.js)
export const analysisSchema = z.object({
  estado: z.enum(['analizada', 'derivada', 'rechazada']),
  motivo_estado: z.string(),
  categoria: nullableEnum(['Incidencia técnica', 'Solicitud de servicio o instalación', 'Consulta de información', 'Consulta administrativa', 'Información insuficiente']),
  prioridad: nullableEnum(['Alta', 'Media', 'Baja']),
  motivo_prioridad: z.string().nullable().default(null),
  responsable: z.string().nullable(),
  resumen: z.string(),
  recomendacion: z.array(z.string()).default([]),
  informacion_faltante: z.array(z.string()).default([]),
  confianza: nullableEnum(['Alta', 'Media', 'Baja']),
  fuentes: z.array(z.string()).default([])
})

// Extrae el JSON aunque el modelo lo envuelva en ```json ... ``` o añada texto alrededor
export function parseAnalysis (rawText) {
  const start = rawText.indexOf('{')
  const end = rawText.lastIndexOf('}')
  if (start === -1 || end <= start) {
    throw new Error('La respuesta del modelo no contiene JSON')
  }
  return analysisSchema.parse(JSON.parse(rawText.slice(start, end + 1)))
}
