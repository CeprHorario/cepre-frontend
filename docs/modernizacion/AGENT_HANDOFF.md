# Traspaso operativo

Actualizado: 2026-11-03. Trabajo autorizado integralmente; no pedir de nuevo
autorización para lotes del alcance. No declarar terminado sin puertas cumplidas.

## Mandato de continuidad

El usuario exige **completar todas las fases sin detenerse por entregable**.
Continuar desde H2 hasta H10: al verificar cada hito, registrar el checkpoint y
ejecutar el siguiente, sin esperar otro «continúa» ni emitir un cierre parcial de
la ejecución. Las aprobaciones de pilotos/capturas son validaciones técnicas
contra el plan, no nuevas solicitudes de aprobación humana.

Aplicar [la regla completa del contrato](MASTER_PLAN.md#ejecución-continua-hasta-la-entrega-integral).
Solo pausar por bloqueo imprescindible, riesgo fuera del alcance, instrucción del
usuario o límite técnico real; agotar antes las tareas independientes. Si un límite
interrumpe la ejecución, este traspaso permite reanudarla sin reautorizar fases.
No rebajar las puertas de calidad ni presentar como final lo que siga pendiente.

## Estado

**H1 funcional verificado**: F1.0–F1.5 y D-05 tienen evidencia vigente; cinco suites
de partes reconciliadas y 21 recorridos adicionales. H2 en ejecución: 32 rutas
capturadas y auditadas a 390 px; faltan variantes/estados y teclado/zoom. H3 en
ejecución: piloto Docentes aplicado (avatar, horas, detalle por teclado y reflow de
tabla); faltan horario del Monitor y evidencias. Consultar [progreso](MIGRATION_PROGRESS.md), [línea base funcional H1](FUNCTIONAL_BASELINE.md),
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

## Continuación exacta

1. Revisar Git de ambos repositorios y leer pendientes exactos de MIGRATION_PROGRESS.
2. Seguir `backend/test/records-browser.md`: iniciar solo DB/GCS aislados y harness;
   frontend `127.0.0.1:5174` con API `127.0.0.1:3000`. No tocar puerto 5173 ajeno.
3. **H2/H3:** cerrar estados/variantes faltantes y ejecutar pilotos B (horario del
   Monitor, revisando consumidores de ScheduleView) y C (evidencias en dos zonas),
   con capturas/teclado/móvil. Después H4: reflow global, foco y estados; las 8
   rutas que aún desbordan a 390 px están registradas en baseline.json.
4. Ampliar fixtures/composición local solo donde falten para H2, sin presentar
   endpoints simulados como integración ni modificar servicios productivos para
   acomodar pruebas. El harness aún no compone todas las pantallas/controladores.
5. K-01 ya caracterizado: dos solicitudes independientes; no introducir atomicidad
   nueva dentro de estética. Defectos funcionales nuevos se registran aparte.
6. Después de H2: tres pilotos H3 (Docentes/horario Monitor/evidencias), validar antes
   de extender estilos H4–H9 y regresión integral H10. Mantener contratos/payloads/
   permisos/persistencia. Ejecutar esta secuencia sin detenerse en cada hito;
   actualizar progreso/traspaso como control interno, no como cierre parcial.

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
