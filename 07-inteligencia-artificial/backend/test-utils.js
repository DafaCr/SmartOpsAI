import { MockLanguageModelV3, simulateReadableStream } from 'ai/test'

/**
 * Modelo simulado que "escribe" `text` en trozos de `chunkSize` caracteres
 * (o falla con `error`). Guarda la última llamada en `model.lastCall`.
 */
export function mockStreamingModel (text, { chunkSize = 12, chunkDelayInMs = 1, error } = {}) {
  const model = new MockLanguageModelV3({
    doStream: async (options) => {
      model.lastCall = options
      if (error) throw error

      const chunks = [{ type: 'text-start', id: 't1' }]
      for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push({ type: 'text-delta', id: 't1', delta: text.slice(i, i + chunkSize) })
      }
      chunks.push(
        { type: 'text-end', id: 't1' },
        {
          type: 'finish',
          finishReason: { unified: 'stop', raw: 'stop' },
          usage: {
            inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: 0 },
            outputTokens: { total: 10, text: 10, reasoning: 0 }
          }
        }
      )
      return { stream: simulateReadableStream({ chunks, chunkDelayInMs }) }
    }
  })
  return model
}

export const ANALISIS_EMERGENCIA = {
  estado: 'derivada',
  motivo_estado: 'Riesgo para personas: chispas y olor a quemado.',
  categoria: 'Incidencia técnica',
  prioridad: 'Alta',
  motivo_prioridad: 'Riesgo eléctrico con personas en el área.',
  responsable: 'SSOMA + Jefe de Operaciones',
  resumen: 'Split de la cocina de Miraflores bota chispas y huele a quemado.',
  recomendacion: ['Alejar a las personas y no manipular el equipo (SEG-01 §2).', 'Si hay humo o fuego, llamar al 116.'],
  informacion_faltante: ['Dirección exacta de la sede'],
  confianza: 'Alta',
  fuentes: ['SEG-01 §2', 'REG-02 §2', 'XXX-99 §1']
}

export const ANALISIS_RECHAZADA = {
  estado: 'rechazada',
  motivo_estado: 'Solo atendemos solicitudes relacionadas con los servicios de FRIOCHAP.',
  categoria: null,
  prioridad: null,
  motivo_prioridad: null,
  responsable: null,
  resumen: 'Consulta ajena a FRIOCHAP.',
  recomendacion: [],
  informacion_faltante: [],
  confianza: null,
  fuentes: []
}

// Lee una respuesta NDJSON completa y devuelve la lista de eventos
export async function readNdjson (response) {
  const text = await response.text()
  return text.split('\n').filter(Boolean).map(line => JSON.parse(line))
}
