---
id: TEC-01
titulo: Guía de diagnóstico inicial — refrigeración comercial
version: 1.0
fecha: 2026-11-14
area: Técnica
acceso: operaciones
estado: corpus de referencia para el MVP — pendiente de validación por FRIOCHAP
---

# TEC-01 — Guía de diagnóstico inicial: refrigeración comercial

## 1. Alcance
Cámaras frigoríficas de conservación y congelación, vitrinas, congeladores horizontales, conservadoras y máquinas de hielo. Esta guía orienta el diagnóstico **remoto inicial** del operador; el diagnóstico definitivo lo realiza el técnico en sitio.

## 2. Rangos de temperatura de referencia
- Conservación de refrigerados: 0 °C a +5 °C.
- Congelación: −18 °C o menos.
- Alerta de conservación: sobre +8 °C por más de 30 minutos.
- Alerta de congelación: sobre −12 °C por más de 30 minutos.

## 3. Verificaciones seguras que puede hacer el cliente
1. Confirmar que el equipo tiene energía: display encendido, luces del equipo.
2. Verificar que la puerta cierra bien y que el burlete no está roto.
3. Confirmar que no se cargó producto caliente o en exceso recientemente.
4. Verificar que la unidad condensadora exterior no está obstruida por cajas o basura.
5. Tomar foto del display y del código de alarma.
6. Observar si el evaporador interior tiene bloque de hielo.

El cliente **no** debe abrir tableros, mover válvulas ni manipular tuberías (SEG-01 §4).

## 4. Síntomas frecuentes

### 4.1 No enfría o temperatura alta
- Causas probables: falta de energía o disparo de protección, compresor detenido, condensador sucio u obstruido, falta de refrigerante por fuga, ventilador del evaporador detenido, evaporador congelado.
- Recomendación: aplicar verificaciones §3; si hay producto, prioridad Alta y escalamiento a Supervisor Técnico de Refrigeración (REG-02); sugerir al cliente trasladar producto a cámara de respaldo si dispone de ella.

### 4.2 Exceso de hielo o escarcha en el evaporador
- Causas probables: deshielo que no funciona, puerta mal cerrada, burlete dañado, humedad alta en la cámara.
- Recomendación: verificar cierre de puerta; programar visita técnica. Prioridad Media salvo que la temperatura esté fuera de rango.

### 4.3 Ruido anormal o vibración
- Causas probables: ventilador desbalanceado, soporte suelto, compresor con desgaste.
- Recomendación: si no hay olor a quemado ni humo, prioridad Media; si lo hay, aplicar SEG-01.

### 4.4 Agua en el piso de la cámara
- Causas probables: drenaje de deshielo obstruido, resistencia de drenaje dañada.
- Recomendación: señalizar piso resbaladizo; visita técnica, prioridad Media.

### 4.5 Equipo enciende y se apaga continuamente
- Causas probables: sonda defectuosa, presostato, falta de refrigerante, condensador sucio.
- Recomendación: registrar frecuencia de los ciclos y código; visita técnica, prioridad Media o Alta según temperatura.

## 5. Códigos de alarma de referencia
Códigos habituales en controladores digitales instalados por FRIOCHAP. El significado exacto debe confirmarse con la marca y modelo del controlador.

| Código | Significado habitual | Prioridad orientativa |
|---|---|---|
| HA / HI | Alta temperatura en cámara | Alta |
| LA / LO | Baja temperatura en cámara | Media (Alta si congela producto refrigerado) |
| P1 / E1 | Falla de sonda de ambiente | Media |
| P2 / E2 | Falla de sonda de evaporador | Media |
| dA / dor | Puerta abierta por tiempo prolongado | Media |
| HP | Alta presión | Alta |
| LP | Baja presión (posible fuga) | Alta |
| EE | Error de memoria del controlador | Media |

Si el código no figura en esta tabla, se solicita foto del display y marca/modelo del controlador, y se marca para revisión técnica (REG-02 §3).
