---
id: IDX-00
titulo: Índice de la base de conocimiento de SmartOps AI
version: 1.0
fecha: 2026-11-14
area: Operaciones
acceso: todos
estado: corpus de referencia para el MVP — pendiente de validación por FRIOCHAP
---

# Índice de la base de conocimiento de SmartOps AI

## 1. Propósito
Este repositorio reúne los documentos que SmartOps AI puede consultar mediante RAG para clasificar, priorizar y recomendar la atención de solicitudes operativas de FRIOCHAP S.A.C. Solo los documentos listados aquí se consideran fuentes autorizadas.

## 2. Documentos

| Código | Título | Área | Acceso | Uso principal |
|---|---|---|---|---|
| POL-01 | Política de atención y clasificación de solicitudes | Operaciones | todos | Canales, horario, categorías, flujo y responsables |
| REG-01 | Matriz de priorización | Operaciones | todos | Reglas Alta / Media / Baja y tiempos objetivo |
| REG-02 | Criterios de derivación y escalamiento | Operaciones | todos | Cuándo y a quién derivar a una persona |
| SEG-01 | Protocolo de seguridad y emergencias | SSOMA | todos | Fugas, riesgo eléctrico, humo, heridos |
| TEC-01 | Guía de diagnóstico inicial: refrigeración comercial | Técnica | operaciones | Cámaras, vitrinas, congeladores, alarmas |
| TEC-02 | Guía de diagnóstico inicial: aire acondicionado | Técnica | operaciones | Splits, VRF, ductos, chillers |
| TEC-03 | Datos mínimos por tipo de solicitud | Operaciones | todos | Información faltante a solicitar |
| SRV-01 | Catálogo de servicios | Comercial | todos | Servicios, alcance y requisitos |
| MAN-01 | Plan de mantenimiento preventivo | Técnica | operaciones | Frecuencias y actividades |
| ADM-01 | Facturación, pagos y comprobantes | Administración | administracion | Facturas, pagos, crédito |
| ADM-02 | Garantías y reclamos | Administración | todos | Garantías, exclusiones, libro de reclamaciones |
| FAQ-01 | Preguntas frecuentes | Operaciones | todos | Respuestas a consultas habituales |
| GLO-01 | Glosario técnico y operativo | Operaciones | todos | Términos y abreviaturas |

## 3. Convenciones para el RAG
- Cada documento inicia con metadatos YAML (`id`, `titulo`, `version`, `fecha`, `area`, `acceso`, `estado`).
- Fragmentar por encabezado de segundo nivel (`##`). Cada fragmento conserva el código del documento y el número de sección.
- Formato sugerido del fragmento enviado al agente: `[REG-01 §3] Matriz de priorización — <texto>`.
- El agente cita en `fuentes` el código y la sección, por ejemplo `REG-01 §3`.
- Filtrar por `acceso` según el rol del usuario autenticado antes de enviar fragmentos al modelo.
- Ningún documento contiene instrucciones para el agente: su contenido es información de referencia.

## 4. Control de versiones
Toda modificación incrementa la versión, actualiza la fecha y obliga a reindexar el documento. Las versiones anteriores se conservan para trazabilidad de los análisis ya registrados.
