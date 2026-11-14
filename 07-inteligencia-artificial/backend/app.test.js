import { test, describe, before, after, afterEach } from 'node:test'
import assert from 'node:assert'

// Los tests nunca llaman a la IA real: se vacía la clave antes de cargar la app
// (process.loadEnvFile no sobrescribe variables ya definidas)
process.env.AI_GATEWAY_API_KEY = ''

const { default: app } = await import('./app.js')
const { mockStreamingModel, readNdjson, ANALISIS_EMERGENCIA } = await import('./test-utils.js')

let server
const PORT = 3456
const BASE_URL = `http://localhost:${PORT}`

before(async () => {
  await new Promise((resolve, reject) => {
    server = app.listen(PORT, resolve)
    server.on('error', reject)
  })
})

after(async () => {
  await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve()))
})

const analizar = body => fetch(`${BASE_URL}/api/ai/analizar`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
})

describe('GET /api/health', () => {
  test('responde ok con el modelo configurado', async () => {
    const response = await fetch(`${BASE_URL}/api/health`)
    assert.strictEqual(response.status, 200)
    const body = await response.json()
    assert.strictEqual(body.status, 'ok')
    assert.ok(body.model)
  })
})

describe('GET /api/kb', () => {
  test('devuelve los documentos de la base de conocimiento', async () => {
    const response = await fetch(`${BASE_URL}/api/kb`)
    assert.strictEqual(response.status, 200)
    const { documentos } = await response.json()
    assert.ok(documentos.some(d => d.doc === 'POL-01'))
  })
})

describe('rutas desconocidas', () => {
  test('devuelven 404 en JSON', async () => {
    const response = await fetch(`${BASE_URL}/api/no-existe`)
    assert.strictEqual(response.status, 404)
  })
})

describe('POST /api/ai/analizar', () => {
  afterEach(() => {
    delete app.locals.aiModel
    process.env.AI_GATEWAY_API_KEY = ''
  })

  test('rechaza una solicitud sin texto (400)', async () => {
    const response = await analizar({ texto: '' })
    assert.strictEqual(response.status, 400)
    assert.ok((await response.json()).error)
  })

  test('rechaza un origen no válido (400)', async () => {
    const response = await analizar({ texto: 'La cámara no enfría', origen: 'Telegram' })
    assert.strictEqual(response.status, 400)
  })

  test('avisa si la IA no está configurada (503)', async () => {
    const response = await analizar({ texto: 'La cámara no enfría' })
    assert.strictEqual(response.status, 503)
  })

  test('responde en streaming NDJSON: documentos, parciales y final', async () => {
    process.env.AI_GATEWAY_API_KEY = 'test'
    app.locals.aiModel = mockStreamingModel(JSON.stringify(ANALISIS_EMERGENCIA), { chunkSize: 5 })

    const response = await analizar({ texto: 'El split de la cocina bota chispas', origen: 'WhatsApp' })
    assert.strictEqual(response.status, 200)
    assert.match(response.headers.get('content-type'), /application\/x-ndjson/)

    const events = await readNdjson(response)
    assert.strictEqual(events[0].type, 'documentos')
    assert.ok(events.some(e => e.type === 'parcial'))
    assert.strictEqual(events.at(-1).type, 'final')
    assert.strictEqual(events.at(-1).analisis.responsable, 'SSOMA + Jefe de Operaciones')
  })

  test('envía un evento de error legible si falla el proveedor', async () => {
    process.env.AI_GATEWAY_API_KEY = 'test'
    const error = Object.assign(new Error('AI Gateway requires a valid credit card on file'), { statusCode: 403 })
    app.locals.aiModel = mockStreamingModel('', { error })

    const events = await readNdjson(await analizar({ texto: 'La cámara no enfría' }))
    const last = events.at(-1)
    assert.strictEqual(last.type, 'error')
    assert.match(last.error, /tarjeta/)
  })
})
