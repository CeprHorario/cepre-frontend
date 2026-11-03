# Línea base funcional posterior a Fase 1

Fecha: 2026-11-03. Alcance: flujos corregidos/caracterizados en H1, no todas las
pantallas de H2. Fuente: código vigente y 46 recorridos Chromium sobre compilado,
API aislada, PostgreSQL y GCS emulado. No contiene autenticación ni datos reales.
Permite detectar diferencias funcionales durante el rediseño; no acredita una
auditoría integral de accesibilidad ni servicios productivos.

## Fixtures y reproducción

- `backend/test/records-browser.md` define barreras y composición. IDs/cuentas/
  procesos se leen de `/__test/fixtures`, no se fijan UUID de un arranque anterior.
- `a`/`b`: registros actuales 1–6, salón sin partes y 105 bloques históricos. DNI
  sintéticos: titular `91000001`, reemplazante `91000002` cuando se habilita en el
  fixture, monitor `92000001`, otro monitor `92000002`, supervisor `93000001`.
  Reemplazante inicialmente sin DNI. Antecedentes de otros arranques se conservan:
  filtrar además por proceso del manifest.
- Reiniciar backend antes de cada grupo: partes; fase1/estados; incidencias/
  transportes. Dentro de cada grupo respetar ese orden. No ejecutar suites mutables
  simultáneamente sobre el mismo harness.
- Compilar con `VITE_API_BACK_URL=http://127.0.0.1:3000`, preview en
  `127.0.0.1:5174`, sin HMR. No utilizar ni detener el puerto 5173 ajeno.
- La pareja de commits se registra en AGENT_HANDOFF.md. Backend se verificó con
  sus tres cambios ajenos iniciales aún presentes (65 adiciones/2 eliminaciones),
  no incluidos en commits propios. No atribuir a un hash aislado ese árbol completo.

## Contratos HTTP que deben conservarse

Operaciones/partes/incidencias conservan cookies/credenciales y CSRF existentes.
`X-Class-Session-Account` y `X-Class-Session-Context` son precondiciones del servidor,
**no selectores**. No reintentar una escritura con otra identidad.

| Flujo / rutas UI | HTTP y entrada | Persistencia, omisiones y caché |
|---|---|---|
| Campana/avisos M/D/S/A | `GET /operations/context`, `GET /operations/notifications?page=1&limit=20`, SSE `GET /operations/notifications/stream` | Sin admisión admin; clave cuenta/rol/proceso. SSE invalida GET autorizado, no inserta payload. Avisos por sondeo 60 s, contexto 15 s. Cancelar/retirar scope anterior e ignorar eventos tardíos. |
| Resolver aviso | `POST /operations/notifications/:id/resolve` o `/resolve-all`, cuerpo `{}` | Solo destinatario; invalidar su clave. No decide solicitud ni modifica horario/parte. |
| Solicitudes | Formulario existente de motivo/tipo/fecha/persona/bloques/documentos | Remontar workspace por cuenta/rol/proceso: intención A no pasa a B. API/aprobación/cancelación/ejecución no cambian. Reglas completas en OPERACIONES.md y backend. |
| Excel docente | `GET /operations/availability/me/template`, `POST .../preview` multipart `file`, `PUT /operations/availability/me` con `{intervals}` | Descargar/previsualizar no guarda; PUT solo al confirmar. Archivo/preview/respuesta tardía no pasan a otro scope. Conservar asignaciones e invalidaciones de disponibilidad/compatibilidad. |
| Filtro A `/admin/partes` | `GET /classes`; `GET /class-session-records?from&to&page&limit&classId...` | Catálogo completo solo A. Salón reinicia página 1; vacío conserva selección; «Todos» omite classId. M/S no reciben catálogo general. |
| Entrada M `/monitor/partes` | `GET /class-session-records/journals?from&to&page&limit` | Agrupar antes de paginar fecha/salón/turno; fecha DESC, desempate salón/turno. Total de jornadas incluso en página vacía; rango ≤93 días; 25/50/100 jornadas. Sin ID diario nuevo ni reconstrucción histórica. |
| Abrir jornada M | Listado existente con from=to=fecha, classId, shiftId, páginas de 100 hasta total | Todos los bloques, comprobar total/duplicados. Retorno conserva rango/página y bloquea pendientes; A/S mantienen entrada directa. Horas reales vacías hasta acción explícita. |
| Guardar M / corregir A | `PATCH /class-session-records/:id`; A `POST /:id/corrections`; expectedVersion original, solo diferencias y motivo A | Versión/cierre/campos autorizados del servidor. Monitor envía classState/observaciones clasificadas, no efectivos editables. Horas explícitas en Lima, no copiar programación. Corrección A no reabre plazo. |
| Observaciones M | structuredObservations: ≤20 UUID; target TEACHER/STUDENT/CLASSROOM; descripción 3–2000; alumno con nombres/apellidos | Docente efectivo → reemplazante autorizado → titular. Sin DNI guarda y avisa, sin atribuir al titular incorrecto. Editar/retirar crea eventos; no borra original ni duplica antecedente. Sin textarea libre. |
| Conflicto de parte | 409, comparación base/borrador/servidor | Incluir classState y structuredObservations legibles (D-05). Sin reintento; descarte explícito. El pendiente protege retorno al listado. |
| Evidencias M/A | `POST /class-session-files/records/:id`, multipart `file`; asociación separada `POST .../captures/initial|final` con `{fileId,expectedVersion}`; A correcciones con motivo | Subida GCS una vez; retener solo respuesta. Subida sin asociar ≠ asociada; revalidar plazo/versión. Descartar referencia no borra remoto. Imagen íntegra/zoom/foco. |
| Revisión S | `POST /class-session-records/:id/reviews`, versión/resultados/confirmación existentes | Revisar cerrado no cambia cierre/ejecución; revisión histórica explícita. Acusar alerta no resuelve incidencia. |
| Incidencias S/A | `GET /incidences`, `GET /incidences/people?subjectRole&search&page`; `POST /incidences` con operationId, subjectAccountId, subjectRole, title, description, occurredAt | DNI del perfil, texto inmutable. S: sus monitores activos/hoy Lima; futuro/día pasado/ajenos rechazados; sin historia propia/entre procesos. M usa observaciones, no POST genérico. |
| Historia/resolución A | `GET /incidences?dni&page`, `GET /:id/history`; `PATCH /:id` con `{expectedVersion,status,reason}` | DNI reúne A/B; resolver/reabrir auditados; 409 conserva motivo. Texto original intacto. Invalidar incidences/warnings/dni-counts. |
| Avisos DNI A | `POST /incidences/dni-summary` con `{dnis}`; botón historial en Monitores/Importar | Contadores e historia reales, otros procesos/resueltos incluidos. Aviso no bloquea registro/importación; sin petición por fila. |
| Preview importación A | `GET /imports/monitores/columns`; `POST /imports/monitores/preview`, multipart `archivo` | CSV válido; consultar avisos/historia/cancelar no llama `/apply`. Tipos generales siguen Docentes/Monitores/Supervisores. |
| Incidencia rápida A/S | Editor título/fecha Lima/observación; people por correo y POST autorizado | Remontar por scope; no transferir intención ni reenviar POST a otro proceso. |
| Borrador incidencia | Memoria por cuenta/proceso; navegación/beforeunload/logout protegidos | Conservar vuelve al formulario sin escritura; descarte explícito. Protección compartida fuera de rutas. |

## Estados y acciones caracterizados

- Partes M: listado/hoja, histórico, editable/futuro/cerrado, selección, filtros,
  detalle, observaciones, subida pendiente/asociada, zoom, conflicto, mantenimiento,
  pérdida de acceso, sesión caducada, salida/logout y descarte.
- Partes S: revisión de cerrado, versión histórica, alertas/acuse y consulta sin
  edición M/A. A: corrección con motivo/captura, reemplazo, lote parcial,
  configuración/versiones, reportes e historial técnico.
- Incidencias: sin DNI, clasificación docente/alumno/aula, original/eventos,
  restricciones S, historia A por DNI, resolver/reabrir/versión antigua, avisos de
  personal/importación y borrador protegido.
- Supervisor/Configuración: error inicial/Reintentar; error ≠ vacío/carga infinita.
  Fallos y parte de catálogos UI se inyectan y declaran en `estados.json`.
- AdminHub/RoomCard/selector S: sin interactividad anidada, destinos y teclado
  conservados. Sin quitar información para simplificar.

## Evidencia y límites

| Ejecución | Recorridos | Archivo |
|---|---:|---|
| `npm run test:partes:browser` | 25 (9+8+3+2+3) | `../partes-evidence/*.json`, capturas indexadas |
| `npm run test:modernizacion:browser` | 6 | `evidence/fase1.json` |
| `npm run test:modernizacion:states` | 4 | `evidence/estados.json` |
| `npm run test:modernizacion:incidencias` | 6 | `evidence/incidencias.json` |
| `npm run test:modernizacion:transportes` | 5 | `evidence/transportes.json` |

Backend en base nueva aleatoria: 6 preparación + 171 regresión; 14 omitidos
declarados. Smoke separado: 3. Frontend: 4 availability + 9 partes, lint/typecheck/
build. Chromium local, sin OAuth/IAM/Firestore productivos, Firefox/WebKit ni lector
de pantalla. Negativos con page.request prueban API desde Chromium, no acciones
visibles inexistentes. No equivale a todas las pantallas/estados de H2.

K-01: desasignar/asignar docente son solicitudes independientes; fallo intermedio
persiste la retirada y exige recuperación explícita. Sin atomicidad nueva,
dependencias nuevas, migraciones productivas ni despliegue.
