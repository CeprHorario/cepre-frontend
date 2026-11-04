# Traspaso operativo

Actualizado: 2026-11-03. Trabajo autorizado integralmente; no pedir de nuevo
autorización para lotes del alcance. No declarar terminado sin puertas cumplidas.

## Instrucción prioritaria del cliente: documentación y Partes intocable

**El último encargo es analizar la propuesta oficial y validada y ajustar contratos,
no implementar el refactor ahora.** Se ha documentado el lenguaje visual en
[ANALISIS_PROPUESTA_OFICIAL.md](ANALISIS_PROPUESTA_OFICIAL.md) y
[DESIGN_SYSTEM.md](DESIGN_SYSTEM.md). No activar las instrucciones históricas de
continuidad mientras la tarea siga siendo documental.

La futura ejecución mantiene funcionalidad y aplica esa dirección **solo fuera
de Partes**. El usuario implementará Partes antes por separado; recibir esa versión
y congelarla, no implementarla/alinearla desde este plan. Prohibido tocar la
maqueta/capturas `propuestas/**`, UI-04/24/27, `src/features/partes/**`, sus APIs,
contratos especializados y tests, o alterarlos indirectamente con tokens, fuentes,
layout, controles, toasts, foco/scroll o portales compartidos. Rige
[CF-13/14](FUNCTIONAL_CONTRACT.md) y el [cerrojo completo](MASTER_PLAN.md#cerrojo-de-partes-obligatorio).

Pilotos futuros: Docentes, horario del Monitor **fuera de Partes**, modal de Cursos.
**Retirado el piloto de evidencias. H8 es exclusivamente no alteración**, no rediseño.
No arreglar hallazgos de Partes en un lote visual ni cambiar sus capturas/tests
para pasar la regresión. Esta instrucción prevalece sobre los checkpoints antiguos.

## Mandato de continuidad

El usuario exige **completar todas las fases sin detenerse por entregable**.
Se conserva para una futura orden expresa de implementación, con el alcance
rectificado anterior; no autoriza código en este análisis ni reapertura de H1.
Continuar desde H2 hasta H10: al verificar cada hito, registrar el checkpoint y
ejecutar el siguiente, sin esperar otro «continúa» ni emitir un cierre parcial de
la ejecución. Las aprobaciones de pilotos/capturas son validaciones técnicas
contra el plan, no nuevas solicitudes de aprobación humana.

Aplicar [la regla completa del contrato](MASTER_PLAN.md#ejecución-continua-hasta-la-entrega-integral).
Solo pausar por bloqueo imprescindible, riesgo fuera del alcance, instrucción del
usuario o límite técnico real; agotar antes las tareas independientes. Si un límite
interrumpe la ejecución, este traspaso permite reanudarla sin reautorizar fases.
No rebajar las puertas de calidad ni presentar como final lo que siga pendiente.

En una ventana nueva, aplicar la [ratificación de autonomía](MASTER_PLAN.md#ratificación-de-autonomía-y-reanudación):
revisar el estado real, reconciliar discrepancias y ejecutar, no solo resumir o
proponer. Cerrar primero las verificaciones pendientes de H2 y de los pilotos H3
antes de extender H4–H9, conservando el trabajo ya iniciado. No pedir «continúa»
ni terminar con pendientes ejecutables; completar H10 salvo bloqueo imprescindible
o límite técnico real documentado.

## Estado

**Propuesta oficial y validada:** [monitor.html](propuestas/monitor.html) es la única
propuesta visual conservada; se eliminaron las alternativas anteriores. Incluye
tabla, cabecera de jornada, hora real, estados/reemplazos, observaciones, capturas,
tooltips y línea de tiempo lateral. Maqueta validada con 66 comprobaciones locales;
no es implementación ni valida app/backend/permisos. Las 15 capturas están indexadas
en [propuestas/README.md](propuestas/README.md). No cierra H2/H3/H8 ni acredita
integración; tampoco autoriza intervenir Partes en la ejecución futura hasta H10.

La revisión documental actual analizó la fuente completa y exploró en Chromium
tabla, tooltip, horas, estado, notas, capturas y foco. Detectó límites del motor
manual de ayudas/ARIA/Escape, radiogroups y reducción de movimiento: se registran
en el análisis, sin corregir la referencia ni encargar correcciones en Partes.
La dirección exige color/icono/forma, texto mínimo suficiente y movimiento funcional,
no una interfaz sin etiquetas/errores. Floating UI queda previsto puntualmente
para ayudas de los otros módulos; no se instalaron ni cambiaron dependencias.

**H1 funcional verificado**: F1.0–F1.5 y D-05 tienen evidencia vigente; cinco suites
de partes reconciliadas y 21 recorridos adicionales. H2 en ejecución: 32 rutas
capturadas y auditadas a 390 px con 0 desbordamientos; faltan variantes/estados y
teclado/zoom. H3 en ejecución histórica: Docentes tiene avances técnicos (avatar,
horas, detalle por teclado y reflow), pendientes de puerta visual actual; faltan
horario del Monitor y modal de Cursos, no evidencias de Partes. H4 iniciado con el
reflow global de layout, tarjetas y tablas. Consultar [progreso](MIGRATION_PROGRESS.md), [línea base funcional H1](FUNCTIONAL_BASELINE.md),
[línea base H2](BASELINE_H2.md), [pilotos](H3_PILOTS.md) y [plan](MASTER_PLAN.md). Esto no es la entrega integral del plan.

## Repositorios y protección

Trabajar desde `/home/joel/git/cepr`, que no es repo. Git por separado en frontend
y backend. Versiones iniciales: frontend `4ee6350`, backend `2427812`.
Contratos iniciales `e5632ad`; primer lote `db16f2e`/`f9e4f95`. Pareja vigente:
**frontend `d663e9f` + backend `307579f`**, sobre el compilado de frontend.
Backend mantiene los tres cambios ajenos iniciales (65 adiciones/2 eliminaciones)
en el árbol probado, fuera de los commits: el hash aislado no representa ese árbol
completo. La actualización posterior de este traspaso no cambia código probado.
Preservar los cambios previos de backend `.env.example` y ambos archivos
`src/modules/runtime-config/runtime-config.service{,.spec}.ts`; no commit/reset
ni edición accidental de ellos. No tocar demos ni configuraciones productivas.

## Archivos intervenidos

Frontend: los seis contratos y evidencia de modernización; ROLES/OPERACIONES/
partes; contexto/campana/solicitudes/Excel/IncidenceAction; PartsPage/useParts/
PartsView/service/types y MonitorJournals nuevo; estados de Supervisor y
Configuración; semántica de AdminHub/RoomCard/selector supervisor. Continuación:
Conflict muestra estado/observaciones clasificados (D-05), cinco scripts y runner
históricos reconciliados con helper compartido; suites nuevas de incidencias/
transportes, evidencia e índices regenerados y línea base funcional H1.
Backend: primer lote DTO/controlador/servicio de partes, pruebas jornadas/K-01;
continuación solo harness/smoke/docs con Monitores/Imports/Docentes/Áreas/Turnos y
Drizzle reales. Control local restringido para alternar DNI sintético del reemplazante.
Los commits separan exactamente archivos propios; no incluyen runtime ajeno.
No asumir que inventario de rutas equivale a inventario exhaustivo por estado.

## Verificación inicial

Frontend lint (11 warnings previos), typecheck, build, availability 4/4 y partes
9/9 pasan. Backend lint/typecheck/build pasan vía Compose. Runner completo en base
nueva: 6 preparación + 171 regresión pasan, 14 omitidos declarados. Smoke opt-in
separado: 3/3. Navegador sobre compilado: **25 partes + 6 fase1 + 4 estados +
6 incidencias + 5 transportes = 46 recorridos correctos**, cero pageerror.
Fallos UI/SSE/retención y negativos API están identificados, no son mocks
presentados como integración. Bundle principal 788.09 kB/gzip236.24, CSS78.17/
14.94; sin dependencias nuevas. Playwright gestionado 0.1.21.

La falla histórica de test:partes:browser quedó resuelta conservando cobertura:
sin textarea libre, efectivos editables M, cobertura directa retirada ni ampliación
del plazo. D-05 fue un defecto real de comparación, corregido sin rebajar prueba.
Todavía no hay H2 integral, verificación de todas las pantallas, Firefox/WebKit/
lector de pantalla ni cierre visual/entrega integral.

## Continuación exacta (solo ante una orden posterior de implementación)

La tarea documental termina tras comprobar coherencia/enlaces e inmutabilidad de
archivos; **no ejecutar estos pasos de producto automáticamente en este encargo**.
Los resultados de build/integración de secciones anteriores son checkpoints
históricos, no comandos repetidos por actualizar los planes.

1. Revisar Git de ambos repositorios y pendientes de MIGRATION_PROGRESS. Recibir
   Partes implementado en el trabajo previo del usuario y registrar su línea base
   congelada por rol/estado y dependencias compartidas. Sin ella no extender globals.
2. Seguir `backend/test/records-browser.md`: iniciar solo DB/GCS aislados y harness;
   frontend `127.0.0.1:5174` con API `127.0.0.1:3000`. No tocar puerto 5173 ajeno.
3. **H2/H3:** cerrar estados/variantes de pantallas elegibles; Partes se inspecciona
   en lectura para conservación. Revalidar Docentes contra UX-01–UX-20 y ejecutar
   pilotos de horario del Monitor (ScheduleView/consumidores) y modal de Cursos.
   Capturas/teclado/táctil/zoom y ayudas dentro/fuera de diálogo. Después H4:
   navegación/acceso/estados globales con adopción aislada fuera de Partes.
   El checkpoint anterior registra 0/32 desbordamientos; no equivale a validación nueva.
4. Ampliar fixtures/composición local solo donde falten para H2, sin presentar
   endpoints simulados como integración ni modificar servicios productivos para
   acomodar pruebas. El harness aún no compone todas las pantallas/controladores.
5. K-01 ya caracterizado: dos solicitudes independientes; no introducir atomicidad
   nueva dentro de estética. Defectos funcionales nuevos se registran aparte.
6. Después de H2: tres pilotos H3 (Docentes/horario Monitor/modal de Cursos), validar antes
   de extender estilos H4–H9 y regresión integral H10. Mantener contratos/payloads/
   permisos/persistencia. Ejecutar esta secuencia sin detenerse en cada hito;
   actualizar progreso/traspaso como control interno, no como cierre parcial.
   En cada lote comprobar Partes intacto. H8 solo coteja esa conservación;
   si un compartido lo altera, aislar el cambio externo o bloquearlo, no compensar
   editando el módulo o sus expectativas.

Comandos ejecutados: `git status --short`, `git log -1 --oneline` por repo;
`git diff --no-ext-diff --no-textconv --stat` backend;
frontend `npm run lint && npm run typecheck && npm run test:availability && npm run test:partes && npm run build`;
`playwright-cli --version`; backend `docker compose -f compose.records.yaml ps`.

Verificación actual adicional: Compose `npm ci --no-audit --no-fund` (dependencias
declaradas faltantes, lock sin cambios), `npm run test:records:all`, lint/typecheck/
build; smoke con `RECORDS_BROWSER_HARNESS=smoke` y `test/records-browser.jest.cjs`;
frontend `npm run test:partes:browser`, `test:modernizacion:browser`,
`test:modernizacion:states`, `test:modernizacion:incidencias` y
`test:modernizacion:transportes`.
Para compilar la prueba sin usar el backend configurado por defecto:
`VITE_API_BACK_URL=http://127.0.0.1:3000 npm run build`; luego
`npm run preview -- --host 127.0.0.1 --port 5174 --strictPort`.
Reiniciar backend antes del grupo partes, fase1/estados y de incidencias/transportes;
estos dos últimos pueden ejecutarse juntos en ese orden. No paralelizar mutaciones
sobre el mismo harness. Las pruebas backend en bases distintas sí son independientes.
Los JSON se escriben tras cerrar el navegador; Vite dev recarga al editar docs/tests.

## Estado del entorno al checkpoint

Las sesiones Chromium de los runners están cerradas. Preview 5174 y Compose
backend/DB/GCS siguen activos para continuar H2; sus fixtures quedaron mutados por
la última suite: reiniciar backend antes de otra prueba. 5173 ajeno no se intervino.
Frontend versionado; backend conserva únicamente los tres cambios ajenos iniciales,
fuera de commits. Revisar procesos/Git reales antes de continuar, no inferir que
los servicios permanecen activos tras una interrupción.

## Límites de seguridad y cierre

Fixtures y archivos sintéticos, nada productivo; no guardar autenticación. El
harness bloquea OAuth y sustituye runtime/registro/revocación distribuida; sus
resultados no validan servicios Google productivos. Cerrar navegador propio y
harness con SIGTERM al finalizar; no matar procesos ajenos ni eliminar volúmenes.
Rollback solo del lote propio, nunca reset amplio. El siguiente agente debe
consultar Git actual: estos hashes son puntos iniciales, no promesa de árbol limpio.
