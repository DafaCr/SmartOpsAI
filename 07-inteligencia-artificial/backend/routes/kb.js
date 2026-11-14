import { Router } from 'express'

import { listDocuments } from '../services/knowledge.js'

export const kbRouter = Router()

// GET /api/kb  → documentos de la base de conocimiento con sus secciones
kbRouter.get('/', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300')
  res.json({ documentos: listDocuments() })
})
