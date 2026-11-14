---
id: POL-01
titulo: Política de atención y clasificación de solicitudes
version: 1.0
fecha: 2026-11-14
area: Operaciones
acceso: todos
estado: corpus de referencia para el MVP — pendiente de validación por FRIOCHAP
---

# POL-01 — Política de atención y clasificación de solicitudes

## 1. Objetivo y alcance
Establecer cómo FRIOCHAP S.A.C. recibe, registra, clasifica, prioriza y deriva las solicitudes operativas de clientes y sedes. Aplica a todas las solicitudes recibidas por canales oficiales y a todo el personal de la Mesa de Operaciones.

## 2. Canales oficiales de recepción
- **WhatsApp corporativo:** canal principal para incidencias y coordinación de visitas.
- **Correo de operaciones:** solicitudes formales, cotizaciones, órdenes de compra y documentación.
- **Central telefónica:** emergencias y clientes sin acceso a otros canales. Toda llamada se transcribe y registra.

Ninguna solicitud se atiende sin registro previo en el sistema. Las solicitudes recibidas por canales personales de un colaborador deben reingresarse por la Mesa de Operaciones.

## 3. Horario de atención
- Lunes a viernes: 08:00 a 18:00.
- Sábados: 08:00 a 13:00.
- Domingos y feriados: solo guardia de emergencias para clientes con Contrato Premium.

Las solicitudes recibidas fuera de horario se registran y se atienden al inicio del siguiente turno, salvo emergencias según SEG-01 y REG-02.

## 4. Cobertura geográfica
- Atención regular: Lima Metropolitana y Callao.
- Provincias: previa evaluación del Jefe de Operaciones y cotización de traslado y viáticos.

## 5. Categorías de solicitud
Cada solicitud recibe una sola categoría, la que mejor describe la necesidad principal.

| Categoría | Definición | Ejemplos |
|---|---|---|
| Incidencia técnica | Falla, avería, alarma o funcionamiento anormal de un equipo instalado | Cámara que no enfría, split que gotea, alarma de alta temperatura, ruido anormal |
| Solicitud de servicio o instalación | Pedido de un servicio planificado: instalación, mantenimiento preventivo, reubicación, visita de evaluación, cotización técnica | Instalar dos splits en oficina, programar mantenimiento trimestral, evaluar ampliación de cámara |
| Consulta de información | Pregunta técnica o comercial que no reporta falla ni pide servicio concreto | ¿Qué refrigerante usa mi equipo?, ¿cada cuánto se limpia el filtro?, ¿atienden en provincias? |
| Consulta administrativa | Facturación, pagos, comprobantes, contratos, garantías, reclamos | Pedir copia de factura, consultar estado de pago, solicitar garantía |
| Información insuficiente | El mensaje no permite identificar la necesidad o el equipo | «Hola, necesito ayuda», «el equipo está raro» sin más datos |

## 6. Reglas de desempate entre categorías
1. Si el mensaje reporta una falla **y** pide un servicio, prevalece **Incidencia técnica**.
2. Si un reclamo se refiere a una falla que persiste, la categoría es **Incidencia técnica** y el caso se deriva también por reclamo (REG-02).
3. Una solicitud de garantía por falla de un equipo instalado por FRIOCHAP es **Incidencia técnica**; una consulta sobre condiciones de garantía sin falla es **Consulta administrativa**.
4. Un pedido de cotización de equipos o instalación es **Solicitud de servicio o instalación**, no consulta administrativa.
5. Si el mensaje contiene varias solicitudes independientes, se clasifica la de mayor impacto y se recomienda registrar las demás por separado.
6. Si el equipo, la sede o el síntoma no pueden identificarse, se usa **Información insuficiente** y se solicitan los datos de TEC-03.

## 7. Flujo de atención
1. **Recepción:** el operador registra el texto original, canal y fecha.
2. **Análisis asistido:** SmartOps AI propone categoría, prioridad, resumen, recomendación e información faltante.
3. **Validación:** el operador aprueba, corrige o rechaza la propuesta.
4. **Derivación:** el operador comunica el caso al responsable indicado en la sección 8.
5. **Seguimiento:** el caso permanece abierto hasta que el responsable registre su atención.

## 8. Responsables por tipo de caso

| Tipo de caso | Responsable principal |
|---|---|
| Incidencia en refrigeración (cámaras, vitrinas, congeladores, máquinas de hielo) | Supervisor Técnico de Refrigeración |
| Incidencia en climatización (splits, VRF, ductos, chillers, extracción) | Supervisor Técnico de Climatización |
| Instalaciones, proyectos y visitas de evaluación | Jefe de Operaciones |
| Cotizaciones y precios | Área Comercial |
| Facturación, pagos, crédito | Administración y Finanzas |
| Garantías | Supervisor técnico del rubro + Administración |
| Reclamos formales y temas legales | Gerencia General |
| Riesgo para personas o instalaciones | Responsable SSOMA + Jefe de Operaciones |

## 9. Principios de comunicación
- No se informan precios, plazos de llegada ni disponibilidad de técnicos o repuestos sin confirmación del responsable.
- Las respuestas al cliente las envía el operador, nunca de forma automática.
- Toda instrucción al cliente se limita a verificaciones seguras descritas en TEC-01, TEC-02 y SEG-01.
