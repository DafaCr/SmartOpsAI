# SmartOps AI

Asistente de la Mesa de Operaciones de **FRIOCHAP S.A.C.** (climatización y refrigeración). Recibe el mensaje de un cliente y propone **estado, categoría, prioridad, responsable, pasos a seguir y datos a pedir**, citando los documentos de la base de conocimiento. La respuesta llega **en streaming**: se ve cómo se construye el análisis en tiempo real. Un operador toma la decisión final.

## Cómo funciona

```
Navegador (React)                 Backend (Express)                       Vercel AI Gateway
─────────────────                 ─────────────────                       ─────────────────
POST /api/ai/analizar  ───────▶   1. Valida { texto, origen, rol }
{ texto, origen, rol }            2. Busca fragmentos en la base
                                     de conocimiento (filtrados por rol)
       ◀── documentos ──────────  3. Prompt fijo + mensaje  ────────────▶  modelo (streaming)
       ◀── parcial (×N) ────────  4. Parsea el JSON parcial  ◀───────────  tokens
       ◀── final ───────────────  5. Valida el JSON con zod
```

La respuesta es **NDJSON** (una línea JSON por evento):

| Evento | Contenido |
|---|---|
| `documentos` | Fragmentos `[CÓDIGO §n]` enviados al modelo (con su texto) |
| `parcial` | Análisis incompleto mientras el modelo escribe |
| `final` | Análisis completo, validado, con fuentes verificadas |
| `error` | Mensaje legible si algo falla |

## Estructura

```
vercel.json                          Vercel Services: backend en /api, frontend en /
07-inteligencia-artificial/
├── backend/                         API Express
│   ├── prompts/smartops.js          ★ Prompt fijo del sistema y formato del mensaje
│   ├── services/analyzer.js         Streaming con el modelo + validación
│   ├── services/knowledge.js        Búsqueda de fragmentos (RAG) y filtro por rol
│   ├── schemas/analysis.js          Esquemas zod (entrada y JSON de respuesta)
│   ├── routes/ai.js                 POST /api/ai/analizar (NDJSON)
│   ├── routes/kb.js                 GET /api/kb
│   ├── base_conocimiento_smartops/  Documentos .md (fuente de verdad)
│   ├── kb/fragments.json            Fragmentos generados (npm run build:kb)
│   └── *.test.js                    Tests (modelo simulado, sin coste)
└── frontend/                        React + Vite
    └── src/
        ├── pages/AnalyzerPage.jsx   Pantalla principal
        ├── pages/KnowledgePage.jsx  Consulta de la base de conocimiento
        ├── hooks/useAnalysisStream.js  Lector del stream
        └── components/AnalysisView.jsx Resultado visual en vivo
```

## Desarrollo local

Requisitos: Node 20.12 o superior.

```bash
cd 07-inteligencia-artificial
npm install
cp backend/.env.example backend/.env    # y pega tu AI_GATEWAY_API_KEY
npm run dev:backend                     # http://localhost:1234
npm run dev:frontend                    # http://localhost:5173 (proxy /api → 1234)
```

Comandos útiles (desde `07-inteligencia-artificial/`):

| Comando | Para qué |
|---|---|
| `npm test` | Tests del backend (no llaman a la IA real) |
| `npm run lint` | Lint del frontend |
| `npm run build` | Build de producción del frontend |
| `npm run build:kb --workspace=backend` | Regenerar fragmentos tras editar un documento |

## Configuración

Variables del backend (`backend/.env` en local, panel de Vercel en producción):

| Variable | Obligatoria | Descripción |
|---|---|---|
| `AI_GATEWAY_API_KEY` | Solo fuera de Vercel | Clave de Vercel AI Gateway. En Vercel se usa OIDC automáticamente. |
| `MODEL_AI` | No | Modelo `proveedor/modelo`. Por defecto `google/gemini-2.5-flash-lite` (rápido, barato y disponible en el plan gratuito). |
| `MODEL_AI_FALLBACKS` | No | Modelos de respaldo separados por comas. Por defecto `openai/gpt-5-mini`. Vacío = sin respaldo. |
| `ALLOWED_ORIGINS` | No | Orígenes CORS extra si el frontend está en otro dominio. |

> **Importante:** Vercel AI Gateway exige **una tarjeta registrada** en la cuenta, incluso con modelos gratuitos. En el **plan gratuito** algunos modelos (Claude, Gemini 3, GPT-5.4…) no están disponibles y hay límites de peticiones por minuto; por eso se configura un modelo de respaldo.

## Despliegue en Vercel

1. Importa el repositorio en Vercel con el *Root Directory* en la raíz (lee `vercel.json`).
2. Registra una tarjeta en **Vercel → AI Gateway** para activar los créditos.
3. Despliega. Frontend en `/`, API en `/api/*`, mismo dominio (sin CORS).

## Editar el comportamiento de la IA

- **Reglas del modelo:** `backend/prompts/smartops.js`. Si cambias el formato del JSON, actualiza `analysisSchema` en `backend/schemas/analysis.js`.
- **Documentos:** edita los `.md` de `backend/base_conocimiento_smartops/knowledge/` y ejecuta `npm run build:kb`. Un test avisa si olvidas regenerar.
- **Secciones que siempre se envían:** `CORE_REFS` en `backend/services/knowledge.js`.
