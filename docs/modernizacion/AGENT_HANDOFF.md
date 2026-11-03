# Traspaso operativo

Actualizado: 2026-11-03. Trabajo autorizado integralmente; no pedir de nuevo
autorización para lotes del alcance. No declarar terminado sin puertas cumplidas.

## Estado

H0 y Fase 1 en ejecución. Primer lote funcional implementado y verificado en sus
recorridos declarados; **Fase 1 completa aún no aceptada**. Ningún
rediseño iniciado. Consultar [progreso](MIGRATION_PROGRESS.md) para resultados y
[plan](MASTER_PLAN.md) para secuencia/aceptación.

## Repositorios y protección

Trabajar desde `/home/joel/git/cepr`, que no es repo. Git por separado en frontend
y backend. Versiones iniciales: frontend `4ee6350`, backend `2427812`.
Contratos anteriores al código: frontend `e5632ad`. Pareja de código probada:
**frontend `db16f2e` + backend `f9e4f95`**. La actualización posterior de este
traspaso/progreso no altera código ni el artefacto verificado.
Preservar los cambios previos de backend `.env.example` y ambos archivos
`src/modules/runtime-config/runtime-config.service{,.spec}.ts`; no commit/reset
ni edición accidental de ellos. No tocar demos ni configuraciones productivas.

## Archivos intervenidos

Frontend: los seis contratos y evidencia de modernización; ROLES/OPERACIONES/
partes; contexto/campana/solicitudes/Excel/IncidenceAction; PartsPage/useParts/
PartsView/service/types y MonitorJournals nuevo; estados de Supervisor y
Configuración; semántica de AdminHub/RoomCard/selector supervisor; dos suites
nuevas de navegador y runner/scripts npm. Backend: DTO/controlador/servicio de
partes, fixtures/harness/smoke, pruebas de jornadas/K-01 y documentación.
Los commits separan exactamente archivos propios; no incluyen runtime ajeno.
No asumir que inventario de rutas equivale a inventario exhaustivo por estado.

## Verificación inicial

Frontend lint (11 warnings previos), typecheck, build, availability 4/4 y partes
9/9 pasan. Backend lint/typecheck/build pasan vía Compose. Runner completo en base
nueva: 6 preparación + 171 regresión pasan, 14 omitidos declarados. Smoke opt-in
separado: 3/3. Nuevos navegadores: 6 integración parcial + 4 estados/semántica,
también sobre compilado; JSON/captura en evidence. Bundle sigue grande, métricas
en progreso. Playwright gestionado 0.1.21, no instalar otra copia.

**Falla conocida:** `npm run test:partes:browser` espera una fila directamente en
la entrada monitor y mantiene controles/permisos retirados. No se borraron esas
pruebas ni se presenta la suite nueva como su sustituto. No hay H2, verificación
de todas las pantallas, Firefox/WebKit/lector de pantalla ni cierre integral.

## Continuación exacta

1. Revisar Git de ambos repositorios y leer pendientes exactos de MIGRATION_PROGRESS.
2. Seguir `backend/test/records-browser.md`: iniciar solo DB/GCS aislados y harness;
   frontend `127.0.0.1:5174` con API `127.0.0.1:3000`. No tocar puerto 5173 ajeno.
3. Reconciliar los cinco scripts históricos y runner. Mantener cobertura de GCS,
   conflictos, aislamiento, mantenimiento y protección de salida sin restaurar
   permisos/controles retirados. La nueva entrada requiere elegir jornada.
4. Completar pruebas pendientes de F1.1/F1.3/R-I01 según progreso. useOperations ya
   obtiene contexto directo; formularios de solicitudes/Excel/incidencia se montan
   por scope para no trasladar intención/respuestas. No repetir escrituras.
5. K-01 ya reproducido/clasificado: dos operaciones no son atómicas. No reingeniería
   silenciosa. Completar inventario y contrato relevante antes de cerrar H1.
6. Solo después H1: capturas integrales H2, tres pilotos H3 y migración por módulos.
   Actualizar progreso/traspaso en cada checkpoint. No pedir otra autorización del
   alcance ya concedido y no declarar todo el plan terminado.

Comandos ejecutados: `git status --short`, `git log -1 --oneline` por repo;
`git diff --no-ext-diff --no-textconv --stat` backend;
frontend `npm run lint && npm run typecheck && npm run test:availability && npm run test:partes && npm run build`;
`playwright-cli --version`; backend `docker compose -f compose.records.yaml ps`.

Verificación actual adicional: Compose `npm ci --no-audit --no-fund` (dependencias
declaradas faltantes, lock sin cambios), `npm run test:records:all`, lint/typecheck/
build; smoke con `RECORDS_BROWSER_HARNESS=smoke` y `test/records-browser.jest.cjs`;
frontend `npm run test:modernizacion:browser` y `npm run test:modernizacion:states`.
Para compilar la prueba sin usar el backend configurado por defecto:
`VITE_API_BACK_URL=http://127.0.0.1:3000 npm run build`; luego
`npm run preview -- --host 127.0.0.1 --port 5174 --strictPort`.
Reiniciar solo el backend del harness antes de cada repetición de la suite mutable.
Los JSON se escriben tras cerrar el navegador; Vite dev recarga al editar docs/tests.

## Estado del entorno al checkpoint

Se cerraron las sesiones Chromium propias, Vite dev/preview propios de 5174 y los
servicios backend/DB/GCS de `cepr-records-test`, sin borrar volúmenes. El puerto
5173 ajeno no se intervino. Reiniciar el entorno declarado antes de continuar.
Frontend queda limpio tras versionar este checkpoint; backend conserva únicamente
los tres cambios ajenos iniciales (65 adiciones/2 eliminaciones), fuera de commits.

## Límites de seguridad y cierre

Fixtures y archivos sintéticos, nada productivo; no guardar autenticación. El
harness bloquea OAuth y sustituye runtime/registro/revocación distribuida; sus
resultados no validan servicios Google productivos. Cerrar navegador propio y
harness con SIGTERM al finalizar; no matar procesos ajenos ni eliminar volúmenes.
Rollback solo del lote propio, nunca reset amplio. El siguiente agente debe
consultar Git actual: estos hashes son puntos iniciales, no promesa de árbol limpio.
