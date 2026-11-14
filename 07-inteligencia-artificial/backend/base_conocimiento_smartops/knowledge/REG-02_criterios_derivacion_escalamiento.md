---
id: REG-02
titulo: Criterios de derivación y escalamiento
version: 1.0
fecha: 2026-11-14
area: Operaciones
acceso: todos
estado: corpus de referencia para el MVP — pendiente de validación por FRIOCHAP
---

# REG-02 — Criterios de derivación y escalamiento

## 1. Principio
Todo análisis de SmartOps AI es revisado por el operador. Además, ciertos casos requieren que el operador **escale de inmediato** a un responsable específico antes de responder al cliente.

## 2. Casos que se escalan de inmediato

| Situación | Escalar a | Acción inicial del operador |
|---|---|---|
| Riesgo para personas: fuga de gas o refrigerante, humo, olor a quemado, chispas, descarga eléctrica, heridos | Responsable SSOMA + Jefe de Operaciones | Transmitir indicaciones de SEG-01 §2 y confirmar que las personas están a salvo |
| Producto perecible, medicamentos o vacunas en riesgo | Supervisor Técnico de Refrigeración | Confirmar temperatura actual y si existe cámara de respaldo |
| Ambiente crítico sin climatización (servidores, área clínica) | Supervisor Técnico de Climatización | Confirmar temperatura del ambiente y medidas temporales del cliente |
| Reclamo formal, mención del Libro de Reclamaciones, Indecopi, abogados o acciones legales | Gerencia General | Registrar textualmente y no emitir opinión sobre responsabilidad |
| Cliente molesto, amenaza con publicar en redes o cancelar contrato | Jefe de Operaciones | Acusar recibo con cortesía y confirmar que un responsable lo contactará |
| Disputa de facturación, cobro indebido o reembolso | Administración y Finanzas | Solicitar número de comprobante |
| Garantía | Supervisor técnico del rubro + Administración | Solicitar comprobante y fecha de instalación o servicio (ADM-02) |

## 3. Casos que requieren revisión técnica antes de recomendar
- No existe documento en la base de conocimiento que respalde la recomendación.
- El equipo, marca o código de alarma no figura en TEC-01 ni TEC-02.
- La solicitud describe síntomas contradictorios o varios equipos con fallas distintas.
- Se trata de sistemas industriales con amoníaco (R-717), CO₂ (R-744) o refrigerantes inflamables (R-290), aun sin fuga reportada.

## 4. Casos que no se atienden por este canal
- Solicitudes ajenas a los servicios de FRIOCHAP.
- Pedidos de contraseñas, accesos o datos personales de otros clientes o colaboradores.
- Solicitudes de instrucciones para que el cliente manipule refrigerante, abra tableros eléctricos o anule protecciones.

En estos casos el operador responde con cortesía que la solicitud no puede atenderse por este medio y, si corresponde, ofrece la vía adecuada.

## 5. Registro del escalamiento
Todo escalamiento registra: responsable contactado, hora, medio y respuesta recibida. Un caso escalado no se cierra sin la conformidad del responsable.
