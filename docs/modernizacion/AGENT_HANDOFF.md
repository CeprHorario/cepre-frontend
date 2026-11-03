# Traspaso operativo

Actualizado: 2026-11-03. Trabajo autorizado integralmente; no pedir de nuevo
autorización para lotes del alcance. No declarar terminado sin puertas cumplidas.

## Estado

H0 en ejecución. Contratos creados; Fase 1 por implementar/verificar. Ningún
rediseño iniciado. Consultar [progreso](MIGRATION_PROGRESS.md) para resultados y
[plan](MASTER_PLAN.md) para secuencia/aceptación.

## Repositorios y protección

Trabajar desde `/home/joel/git/cepr`, que no es repo. Git por separado en frontend
y backend. Versiones iniciales: frontend `4ee6350`, backend `2427812`.
Preservar los cambios previos de backend `.env.example` y ambos archivos
`src/modules/runtime-config/runtime-config.service{,.spec}.ts`; no commit/reset
ni edición accidental de ellos. No tocar demos ni configuraciones productivas.

## Archivos intervenidos

Solo los seis documentos de `frontend/docs/modernizacion/` en este checkpoint.
No asumir que inventario de rutas equivale a inventario exhaustivo por estado.

## Verificación inicial

Frontend lint (11 warnings previos), typecheck, build, availability 4/4 y partes
9/9 pasan antes de cambios. Build advierte bundle grande; métricas en progreso.
Playwright gestionado 0.1.21 disponible, no instalar otra copia.
Docker records inicialmente detenido. No hay verificación vigente de navegador,
backend, Firefox/WebKit/lector de pantalla ni pantallas completas.

## Continuación exacta

1. Versionar documentos en frontend antes de implementación.
2. Seguir `backend/test/records-browser.md`: iniciar solo DB/GCS aislados y harness;
   frontend `127.0.0.1:5174` con API `127.0.0.1:3000`. No tocar puerto 5173 ajeno.
3. Ejecutar navegador para registrar expectativas desfasadas antes de corregir.
4. F1.1: desacoplar useOperations de admisión admin; conservar scope y guards de
   cuenta/proceso. Revisar NotificationBell/OperationsNotice/RequestsPage/Excel/
   incidencias y endpoint real de contexto. Añadir regresiones de caché fría.
5. F1.2 filtro desde catálogo admin; F1.3 jornadas completas; F1.4 incidencias;
   F1.5 estados/semántica. Reconciliar ROLES y pruebas, clasificar K-01.
6. Actualizar progreso/traspaso en cada checkpoint. H2/visual solo tras H1.

Comandos ejecutados: `git status --short`, `git log -1 --oneline` por repo;
`git diff --no-ext-diff --no-textconv --stat` backend;
frontend `npm run lint && npm run typecheck && npm run test:availability && npm run test:partes && npm run build`;
`playwright-cli --version`; backend `docker compose -f compose.records.yaml ps`.

## Límites de seguridad y cierre

Fixtures y archivos sintéticos, nada productivo; no guardar autenticación. El
harness bloquea OAuth y sustituye runtime/registro/revocación distribuida; sus
resultados no validan servicios Google productivos. Cerrar navegador propio y
harness con SIGTERM al finalizar; no matar procesos ajenos ni eliminar volúmenes.
Rollback solo del lote propio, nunca reset amplio. El siguiente agente debe
consultar Git actual: estos hashes son puntos iniciales, no promesa de árbol limpio.
