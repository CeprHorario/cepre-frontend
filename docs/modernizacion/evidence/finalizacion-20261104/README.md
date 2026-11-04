# Evidencia nueva · finalización2026-11-04

Solo datos sintéticos; proyecto Compose `cepr-finalizacion-local`, API3109,
frontend compilado5189. No son capturas de referencia ni sustituyen el manifiesto.

| Artefacto | Alcance / resultado |
|---|---|
| backend-chromium.json |11 negativos HTTP reales: roles403, DTO400, conflicto409, ruta retirada404 |
| salones-chromium.json |45 controles: paginación0/8/9/20/21/50/61, asignación posterior8/50, una escritura, cargaSQL y errores/reintentos |
| salones-estados-chromium.json |8 controles: carga, vacío, inexistente, datos parciales/previos y respuesta tardía SPA |
| salon-320.png |Reflow local tras correcciones funcionales; captura revisada |
| salon-stale-error.png |Error de revalidación conserva titular/contexto y bloquea candidatos; captura revisada |
| baseline-live.json |Checkpoint incremental de E3; no implica baseline completa ni aceptación visual |
| baseline-chromium.json |Solo existe si concluyó la pasada E3; ver límites dentro del JSON |
| environment-capabilities.json |Disponibilidad real de herramientas; faltan lectores y motores adicionales |
| *-failure.json/png |Fallos reales del runner; no equivalen a pruebas aprobadas |

Reproducir con `node tests/run-finalization.mjs <suite>` desde frontend. Chromium
gestionado156.0.8078.79 / playwright-cli0.1.21. `salones` muta fixtures; no ejecutar
en paralelo con otra suite mutante. Baseline usa lecturas reales en estado data y
declara expresamente las respuestas inyectadas para error/vacío. Formularios
abiertos sin confirmar no prueban persistencia ni todo su ciclo.

La pasada se puede reanudar con `FINALIZATION_RESUME=1` solo conservando proceso y
compilado; el runner rechaza datos de otro fixture. Si cambia el código compartido
o build, iniciar nueva captura, no reutilizar estos resultados como árbol final.

Logs de calidad/DB y recepción inicial están en
`/tmp/opencode/cepr-finalizacion-20261104/`. Estado canónico y pendientes se mantienen
en08-PROGRESO del plan externo, no en un segundo backlog de esta carpeta.
