# Evidencia vigente de modernización

Solo fixtures sintéticos del harness local. Los resultados JSON identifican
recorridos, límites y fecha. Una captura no acredita por sí sola verificación.
Los recorridos con fallos inyectados se distinguen de integración real.

Checkpoint de cierre H1: 2026-11-03; pareja exacta en AGENT_HANDOFF.md. Los cuatro
JSON corresponden al compilado con API aislada y preview en 127.0.0.1:5174.

| Resultado | Recorridos | Alcance |
|---|---:|---|
| [fase1.json](fase1.json) | 6 | Contexto, filtro de servidor desde página 2, jornada 105 bloques, observaciones/resolución/historia |
| [estados.json](estados.json) | 4 | Error/reintento/semántica; fallos y parte de catálogos UI inyectados explícitamente |
| [incidencias.json](incidencias.json) | 6 | DNI/efectivo, supervisor/hoy/alcance, conflicto, historia A/B, avisos reales personal/importación y borrador |
| [transportes.json](transportes.json) | 5 | SSE nativo, fallo SSE/sondeo real, cuenta y respuestas tardías, Excel e incidencia rápida por scope |

SSE/HTTP/Excel/PostgreSQL son reales del harness; la caída de SSE, retención de
respuestas y despacho de un evento antiguo se identifican como inyecciones.
No se simulan datos exitosos de integración. Sumadas a los [25 recorridos de
partes](../../partes-evidence/README.md): 46, no 46 pantallas completas.
La captura 1920×1080 del listado fue revisada; no constituye línea base integral H2.
No incluyen credenciales, cookies, tokens ni datos personales reales.
