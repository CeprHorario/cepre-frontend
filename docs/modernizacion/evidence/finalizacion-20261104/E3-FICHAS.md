# Fichas E3 · árbol recibido tras E2

Generado desde evidencia real del 2026-11-04T18:51:26.494Z; 37 rutas/variantes,35 IDs.
Chromium156.0.8078.79, compilado5189/API3109, fixtures sintéticos. Datos proceden de Nest/PostgreSQL; errores/vacíos/carga retenida están identificados como inyección.

**Estado: caracterización de base, no cierre de E3 ni certificación de todas las pantallas.**
La pasada registra datos/carga/error/vacío,13 formularios iniciales, foco/colores y negativos de coordinación. No convierte abrir un formulario en probar válido/guardando/error/éxito. Esos estados se enumeran como controles abiertos; no son no-aplica ni equivalen a verificación.

## Contratos transversales

- Cabecera: AppHeader/ModuleLayout; sesión HttpOnly, contexto/rol de servidor. La campana conserva transporte propio; no se midió duplicación desde capturas.
- Catálogos/salones/personal: api/services.ts → api/queries.ts → propietarios indicados. Paginación/filtros en URL conservados; write controls solo admin.
- Horarios de lectura: ScheduleView; asignación: WeekGrid editable (excepción conservada). Turnos porID, disponibilidad persistida sin borrar asignaciones.
- Personas: TeacherForm/PersonForm, eliminación lógica y resultados masivos por useRemoval; no se llamó a eliminar en baseline.
- Solicitudes/avisos: useOperations con cuenta/rol/proceso, precondiciones X-Class-Session-Account/Context; decidir distinto de ejecutar o resolver aviso.
- Incidencias: versión/motivo, autoría, DNI y alcance servidor; supervisor nunca antecedentes propios. No se alteró historia para capturas.
- Escrituras: no se confirmaron guardados de negocio en esta pasada; payloads/persistencia se prueban con los recorridos específicos de cada lote y contratos02/03/07 del plan.
- Partes:56 huellas y16 referencias iniciales intactas. UI04/24/27 son conservación, no rediseño; capturas nuevas fuera de propuestas.

## UI-01 · public · `/`

- Propietario: `src/auth/guards.tsx + features/auth/LoginPage.tsx + auth/AuthProvider.tsx`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: sin sesión; OAuth real fuera del harness.
- Títulos: Sistema de horarios académicos / Iniciar sesión.
- Columnas: Sin tabla en esta presentación.
- Campos/filtros iniciales: No hay campos en el DOM inicial.
- Acciones iniciales: Continuar con Google.
- Destinos:  → https://mail.google.com/mail/?view=cm&fs=1&to=ceprunsa%40unsa.edu.pe.
- HTTP real observado: GET /api/auth/user-info →401; GET /api/system/status →200.
- Estados registrados: data@1920, data@390; no hay consulta primaria retenida en esta ruta; controles globales/asistente/Partes requieren su recorrido específico.
- Foco/teclado: 20 Tab registrados; 0 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 9 combinaciones efectivas; 0 por debajo del mínimo aplicable, 9 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-01-public-1920-data.png) | 0 | No |
| data | 390 | [imagen](UI-01-public-390-data.png) | 0 | No |

## UI-03 · admin · `/admin`

- Propietario: `src/features/admin/AdminHub.tsx`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: capacidad específica del rol, no una autorización de escritura por estar autenticado.
- Títulos: sr_ed1a76a016e6430091b64a1dc8d97169_a / ⚠ Incidencias pendientes · 0 / Pendientes del proceso / Salones por turno.
- Columnas: Sin tabla en esta presentación.
- Campos/filtros iniciales: No hay campos en el DOM inicial.
- Acciones iniciales: No hay botones locales en el DOM inicial.
- Destinos: Ver incidencias e historial → /admin/incidencias; Partes diarios Registro, seguimiento, reemplazos y reportes del proceso. → /admin/partes; Generar proceso Crea un proceso de admisión con turnos, salones y horarios automáticos. → /admin/generar; Gestionar datos Usuarios, salones y cursos del proceso actual. → /admin/gestionar/docentes; Docentes 3 → /admin/gestionar/docentes; Monitores 2 → /admin/gestionar/monitores; Salones 3 → /admin/gestionar/salones; Cursos 2 → /admin/gestionar/cursos; Supervisores 2 → /admin/gestionar/supervisores; Coordinadores 2 → /admin/gestionar/coordinadores; Importar archivos Carga docentes, monitores o supervisores desde CSV o JSON. → /admin/importar; Configurar sistema Modo mantenimiento y proceso visible para cada rol. → /admin/configuracion; Reportes de seguimiento Consulta y exporta el seguimiento del personal y las observaciones del proceso. → /admin/reportes; Solicitudes y reemplazos Revisa solicitudes, decide reemplazos y consulta sus documentos de respaldo. → /admin/solicitudes; Incidencias e historial Registra incidencias y consulta los antecedentes del personal entre procesos. → /admin/incidencias; Ver salones → /admin/gestionar/salones?estado=faltan; Revisar → /admin/gestionar/salones?estado=sin-enlaces.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/admissions/current →200; GET /api/operations/context →200; GET /api/incidences/warnings →200; GET /api/classes →200; GET /api/supervisors?page=1&limit=1 →200; GET /api/teachers?page=1&limit=1 →200; GET /api/system/runtime-config →200; GET /api/courses →200; GET /api/coordinators?page=1&limit=1 →200; GET /api/monitors?page=1&limit=1 →200; GET /api/operations/notifications/stream →200; GET /api/operations/notifications?page=1&limit=20 →200.
- Estados registrados: data@1920, data@390, error@1920, error@390, empty@1920, empty@390; carga retenida@1920/390 (baseline-loading-chromium.json).
- Foco/teclado: 20 Tab registrados; 0 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 18 combinaciones efectivas; 0 por debajo del mínimo aplicable, 0 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-03-admin-1920-data.png) | 0 | No |
| data | 390 | [imagen](UI-03-admin-390-data.png) | 0 | No |
| error | 1920 | [imagen](UI-03-admin-1920-error.png) | 0 | http://127.0.0.1:3109/api/classes |
| error | 390 | [imagen](UI-03-admin-390-error.png) | 0 | http://127.0.0.1:3109/api/classes |
| empty | 1920 | [imagen](UI-03-admin-1920-empty.png) | 0 | http://127.0.0.1:3109/api/classes |
| empty | 390 | [imagen](UI-03-admin-390-empty.png) | 0 | http://127.0.0.1:3109/api/classes |
| carga retenida | 1920 | [imagen](UI-03-admin-1920-loading.png) | — | Lectura retenida,1peticiones |
| carga retenida | 390 | [imagen](UI-03-admin-390-loading.png) | — | Lectura retenida,1peticiones |

## UI-04 · admin · `/admin/partes`

- Propietario: `src/features/partes/PartsPage.tsx + OfficialPartsSheet.tsx (congelados)`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: capacidad específica del rol, no una autorización de escritura por estar autenticado.
- Títulos: Parte diario.
- Columnas: # / Programado Intervalo programado del bloque / Hora real Inicio y fin declarados; no se copian del horario / Curso / Docente / Estado Declaración del bloque; una propuesta no es autorización ni ejecución / Observaciones Notas de clase; el seguimiento privado del monitor está fuera de esta tabla / Capturas Miniaturas privadas; el original solo se descarga al ampliar / Inicio / Fin.
- Campos/filtros iniciales: Fecha de la jornada [date,habilitado]; Aula de la jornada [select-one,habilitado].
- Acciones iniciales: Más opciones de Partes; Seguimiento del monitor; Hora de Lima; el punto indica el bloque actual; Intervalo programado del bloque; Inicio y fin declarados; no se copian del horario; Declaración del bloque; una propuesta no es autorización ni ejecución; Notas de clase; el seguimiento privado del monitor está fuera de esta tabla; Miniaturas privadas; el original solo se descarga al ampliar; Opciones del parte #1; Editar hora real del parte #1; Editar estado del parte #1; Editar observaciones del parte #1; Editar captura de inicio del parte #1; Editar captura de fin del parte #1; Opciones del parte #2; Editar hora real del parte #2; Editar estado del parte #2; Editar observaciones del parte #2; Ampliar captura de inicio del parte #2; Editar captura de inicio del parte #2; Ampliar captura de fin del parte #2; Editar captura de fin del parte #2; Opciones del parte #3; Editar hora real del parte #3; Editar estado del parte #3; Editar observaciones del parte #3; Editar captura de inicio del parte #3; Editar captura de fin del parte #3; Opciones del parte #4; Editar hora real del parte #4; Editar estado del parte #4; Editar observaciones del parte #4; Editar captura de inicio del parte #4; Editar captura de fin del parte #4; Opciones del parte #5; Editar hora real del parte #5; Editar estado del parte #5; Editar observaciones del parte #5; Editar captura de inicio del parte #5; Editar captura de fin del parte #5; Opciones del parte #6; Editar hora real del parte #6; Editar estado del parte #6; Editar observaciones del parte #6; Editar captura de inicio del parte #6; Editar captura de fin del parte #6.
- Destinos: No hay enlaces locales en el DOM inicial.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/operations/notifications/stream →200; GET /api/admissions/current →200; GET /api/class-session-records/workspace →200; GET /api/class-session-records/workspace?date=2026-11-04&classId=8d838af7-7db1-4fc0-aa8c-eade1f6c5b1d&shiftId=1 →200; GET /api/class-session-files/thumbnails?refs=%5B%7B%22recordId%22%3A2%2C%22slot%22%3A%22initial%22%2C%22fileId%22%3A%2201a1a7c9-268f-7284-864c-7acd4abd44b0%22%2C%22generation%22%3A%221793816340138024%22%7D%2C%7B%22recordId%22%3A2%2C%22slot%22%3A%22final%22%2C%22fileId%22%3A%2201a1a7c9-271e-780a-8c0d-e7d0ec9bf58d%22%2C%22generation%22%3A%221793816340265314%22%7D%5D →200.
- Estados registrados: data@1920, data@390; no hay consulta primaria retenida en esta ruta; controles globales/asistente/Partes requieren su recorrido específico.
- Foco/teclado: 20 Tab registrados; 1 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 13 combinaciones efectivas; 6 por debajo del mínimo aplicable, 0 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-04-admin-1920-data.png) | 0 | No |
| data | 390 | [imagen](UI-04-admin-390-data.png) | 0 | No |

## UI-05 · admin · `/admin/solicitudes`

- Propietario: `src/features/operations/RequestsPage.tsx`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: capacidad específica del rol, no una autorización de escritura por estar autenticado.
- Títulos: Solicitudes y reemplazos.
- Columnas: Fecha y solicitante / Trabajo solicitado / Estado / Documento / Acciones.
- Campos/filtros iniciales: Filtrar solicitudes por estado [select-one,habilitado].
- Acciones iniciales: Anterior (deshabilitada); Siguiente (deshabilitada).
- Destinos: Incidencias e historial → /admin/incidencias.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/admissions/current →200; GET /api/operations/notifications/stream →200; GET /api/operations/context →200; GET /api/operations/requests?page=1&limit=20 →200.
- Estados registrados: data@1920, data@390, error@1920, error@390, empty@1920, empty@390; carga retenida@1920/390 (baseline-loading-chromium.json).
- Foco/teclado: 20 Tab registrados; 2 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 8 combinaciones efectivas; 0 por debajo del mínimo aplicable, 0 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-05-admin-1920-data.png) | 0 | No |
| data | 390 | [imagen](UI-05-admin-390-data.png) | 0 | No |
| error | 1920 | [imagen](UI-05-admin-1920-error.png) | 0 | http://127.0.0.1:3109/api/operations/requests* |
| error | 390 | [imagen](UI-05-admin-390-error.png) | 0 | http://127.0.0.1:3109/api/operations/requests* |
| empty | 1920 | [imagen](UI-05-admin-1920-empty.png) | 0 | http://127.0.0.1:3109/api/operations/requests* |
| empty | 390 | [imagen](UI-05-admin-390-empty.png) | 0 | http://127.0.0.1:3109/api/operations/requests* |
| carga retenida | 1920 | [imagen](UI-05-admin-1920-loading.png) | — | Lectura retenida,1peticiones |
| carga retenida | 390 | [imagen](UI-05-admin-390-loading.png) | — | Lectura retenida,1peticiones |

## UI-06 · admin · `/admin/incidencias`

- Propietario: `src/features/incidencias/IncidencesPage.tsx + IncidencesPanel.tsx`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: capacidad específica del rol, no una autorización de escritura por estar autenticado.
- Títulos: Incidencias e historial / Incidencias e historial por persona.
- Columnas: Persona / DNI / Proceso y fecha / Incidencia / Estado / .
- Campos/filtros iniciales: DNI para historial [text,habilitado].
- Acciones iniciales: Registrar incidencia; Buscar historial; Anterior (deshabilitada); Siguiente (deshabilitada).
- Destinos: Volver al panel → /admin.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/admissions/current →200; GET /api/class-session-records/context →200; GET /api/operations/notifications/stream →200; GET /api/incidences?page=1 →200.
- Estados registrados: data@1920, form-initial@1920, data@390, error@1920, error@390, empty@1920, empty@390; carga retenida@1920/390 (baseline-loading-chromium.json).
- Foco/teclado: 20 Tab registrados; 2 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 10 combinaciones efectivas; 0 por debajo del mínimo aplicable, 0 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-06-admin-1920-data.png) | 0 | No |
| form-initial | 1920 | [imagen](UI-06-admin-form.png) | 0 | No |
| data | 390 | [imagen](UI-06-admin-390-data.png) | 0 | No |
| error | 1920 | [imagen](UI-06-admin-1920-error.png) | 0 | http://127.0.0.1:3109/api/incidences?* |
| error | 390 | [imagen](UI-06-admin-390-error.png) | 0 | http://127.0.0.1:3109/api/incidences?* |
| empty | 1920 | [imagen](UI-06-admin-1920-empty.png) | 0 | http://127.0.0.1:3109/api/incidences?* |
| empty | 390 | [imagen](UI-06-admin-390-empty.png) | 0 | http://127.0.0.1:3109/api/incidences?* |
| carga retenida | 1920 | [imagen](UI-06-admin-1920-loading.png) | — | Lectura retenida,1peticiones |
| carga retenida | 390 | [imagen](UI-06-admin-390-loading.png) | — | Lectura retenida,1peticiones |

### Formulario inicial observado

| Campo | Tipo | Obligatorio | Estado | Límites HTML | Opciones |
|---|---|---|---|---|---|
| DNI para historial | text | No | Editable | min,max,longitud8 |  |
| Persona reportada Docente Monitor Supervisor Coordinador Administrador | select-one | No | Editable | min—,max—,longitud— | Docente, Monitor, Supervisor, Coordinador, Administrador |
| Buscar persona por nombre o DNI | text | No | Editable | min,max,longitud-1 |  |
| Seleccionar persona Selecciona una persona con DNI Docente Reemplazante ficticio · Completar DNI Docente Otro curso · Completar DNI teacher Prueba A · 91000001 | select-one | No | Editable | min—,max—,longitud— | Selecciona una persona con DNI, Docente Reemplazante ficticio · Completar DNI, Docente Otro curso · Completar DNI, teacher Prueba A · 91000001 |
| Título | text | No | Editable | min,max,longitud120 |  |
| Hora en que ocurrió | datetime-local | No | Editable | min,max,longitud-1 |  |
| Observaciones | textarea | No | Editable | min—,max—,longitud4000 |  |

Inicial/foco capturados. Control abierto explícito: validar estados inválido/válido/guardando/error/éxito, payload, resultado persistido y cierre de esta variante; no presentarlos como probados por la captura.

## UI-08 · admin · `/admin/generar`

- Propietario: `src/features/admin/generar/GenerarProcesoPage.tsx`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: capacidad específica del rol, no una autorización de escritura por estar autenticado.
- Títulos: Datos del proceso.
- Columnas: Sin tabla en esta presentación.
- Campos/filtros iniciales: Proceso * [select-one,habilitado]; Año * [select-one,habilitado]; Sede * [select-one,habilitado]; Fecha de inicio * [date,habilitado]; Fecha de fin * [date,habilitado]; Dominio de correo * [select-one,habilitado].
- Acciones iniciales: 1 Datos del proceso; 2 Turnos (deshabilitada); 3 Salones por área (deshabilitada); 4 Revisar y crear (deshabilitada).
- Destinos: No hay enlaces locales en el DOM inicial.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/admissions/current →200; GET /api/sedes →200; GET /api/shifts →200; GET /api/operations/notifications/stream →200.
- Estados registrados: data@1920, data@390; no hay consulta primaria retenida en esta ruta; controles globales/asistente/Partes requieren su recorrido específico.
- Foco/teclado: 20 Tab registrados; 1 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 12 combinaciones efectivas; 0 por debajo del mínimo aplicable, 0 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-08-admin-1920-data.png) | 0 | No |
| data | 390 | [imagen](UI-08-admin-390-data.png) | 0 | No |

## UI-09 · admin · `/admin/importar`

- Propietario: `src/features/admin/importar/ImportarPage.tsx`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: capacidad específica del rol, no una autorización de escritura por estar autenticado.
- Títulos: Importar archivos / Registrar docentes.
- Columnas: Cabecera exacta / Valor / Formato / Ejemplo / Descripción.
- Campos/filtros iniciales: (sin etiqueta) [file,habilitado].
- Acciones iniciales: Docentes; Monitores; Supervisores; Descargar plantilla Excel; Seleccionar archivo; Arrastrar o seleccionar archivo para importar.
- Destinos: No hay enlaces locales en el DOM inicial.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/admissions/current →200; GET /api/imports/docentes/columns →200; GET /api/operations/notifications/stream →200.
- Estados registrados: data@1920, data@390, error@1920, error@390, empty@1920, empty@390; carga retenida@1920/390 (baseline-loading-chromium.json).
- Foco/teclado: 20 Tab registrados; 0 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 15 combinaciones efectivas; 0 por debajo del mínimo aplicable, 0 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-09-admin-1920-data.png) | 0 | No |
| data | 390 | [imagen](UI-09-admin-390-data.png) | 0 | No |
| error | 1920 | [imagen](UI-09-admin-1920-error.png) | 0 | http://127.0.0.1:3109/api/imports/docentes/columns |
| error | 390 | [imagen](UI-09-admin-390-error.png) | 0 | http://127.0.0.1:3109/api/imports/docentes/columns |
| empty | 1920 | [imagen](UI-09-admin-1920-empty.png) | 0 | http://127.0.0.1:3109/api/imports/docentes/columns |
| empty | 390 | [imagen](UI-09-admin-390-empty.png) | 0 | http://127.0.0.1:3109/api/imports/docentes/columns |
| carga retenida | 1920 | [imagen](UI-09-admin-1920-loading.png) | — | Lectura retenida,1peticiones |
| carga retenida | 390 | [imagen](UI-09-admin-390-loading.png) | — | Lectura retenida,1peticiones |

## UI-11 · admin · `/admin/gestionar/docentes`

- Propietario: `src/features/admin/docentes/DocentesPage.tsx + TeacherForm.tsx + TeacherDetailDrawer.tsx`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: capacidad específica del rol, no una autorización de escritura por estar autenticado.
- Títulos: Docentes.
- Columnas: Incidencia / Docente / Curso / Dedicación / Horas / Acciones.
- Campos/filtros iniciales: Buscar docente [search,habilitado]; Curso [select-one,habilitado]; Filas por página [select-one,habilitado].
- Acciones iniciales: Exportar Excel; Agregar docente; Seleccionar; Registrar incidencia; Asignar salones; Ver detalle; Ver horario; Editar datos; Eliminar; Registrar incidencia; Asignar salones; Ver detalle; Ver horario; Editar datos; Eliminar; Registrar incidencia; Asignar salones; Ver detalle; Ver horario; Editar datos; Eliminar; Página anterior (deshabilitada); Página 1; Página siguiente (deshabilitada).
- Destinos: No hay enlaces locales en el DOM inicial.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/admissions/current →200; GET /api/courses →200; GET /api/teachers?page=1&limit=10 →200; GET /api/teachers?page=1&limit=1 →200; GET /api/monitors?page=1&limit=1 →200; GET /api/coordinators?page=1&limit=1 →200; GET /api/supervisors?page=1&limit=1 →200; GET /api/classes →200; GET /api/operations/notifications/stream →200; GET /api/operations/context →200.
- Estados registrados: data@1920, form-initial@1920, data@390, error@1920, error@390, empty@1920, empty@390; carga retenida@1920/390 (baseline-loading-chromium.json).
- Foco/teclado: 20 Tab registrados; 0 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 15 combinaciones efectivas; 0 por debajo del mínimo aplicable, 0 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-11-admin-1920-data.png) | 0 | No |
| form-initial | 1920 | [imagen](UI-11-admin-form.png) | 0 | No |
| data | 390 | [imagen](UI-11-admin-390-data.png) | 0 | No |
| error | 1920 | [imagen](UI-11-admin-1920-error.png) | 0 | http://127.0.0.1:3109/api/teachers?* |
| error | 390 | [imagen](UI-11-admin-390-error.png) | 0 | http://127.0.0.1:3109/api/teachers?* |
| empty | 1920 | [imagen](UI-11-admin-1920-empty.png) | 0 | http://127.0.0.1:3109/api/teachers?* |
| empty | 390 | [imagen](UI-11-admin-390-empty.png) | 0 | http://127.0.0.1:3109/api/teachers?* |
| carga retenida | 1920 | [imagen](UI-11-admin-1920-loading.png) | — | Lectura retenida,2peticiones |
| carga retenida | 390 | [imagen](UI-11-admin-390-loading.png) | — | Lectura retenida,2peticiones |

### Formulario inicial observado

| Campo | Tipo | Obligatorio | Estado | Límites HTML | Opciones |
|---|---|---|---|---|---|
| Buscar docente | search | No | Editable | min,max,longitud-1 |  |
| Curso | select-one | No | Editable | min—,max—,longitud— | Todos los cursos, Course, Curso fuera de alcance |
| Filas por página | select-one | No | Editable | min—,max—,longitud— | 10, 20, 50 |
| Correo de acceso * | email | No | Editable | min,max,longitud-1 |  |
| DNI * | text | No | Editable | min,max,longitud-1 |  |
| Nombres * | text | No | Editable | min,max,longitud-1 |  |
| Apellidos * | text | No | Editable | min,max,longitud-1 |  |
| Correo personal (opcional) | email | No | Editable | min,max,longitud-1 |  |
| Celular * | text | No | Editable | min,max,longitud-1 |  |
| Otros celulares (opcional) | text | No | Editable | min,max,longitud-1 |  |
| Curso * | select-one | No | Editable | min—,max—,longitud— | Selecciona…, Course, Curso fuera de alcance |
| Dedicación * | select-one | No | Editable | min—,max—,longitud— | Tiempo completo, Medio tiempo, Tiempo libre |
| Marcar como coordinador de curso Solo es una marca informativa. Para dar acceso de coordinador, créalo en Coordinadores. | checkbox | No | Editable | min,max,longitud-1 |  |

Inicial/foco capturados. Control abierto explícito: validar estados inválido/válido/guardando/error/éxito, payload, resultado persistido y cierre de esta variante; no presentarlos como probados por la captura.

## UI-12 · admin · `/admin/gestionar/docentes/47d1fa83-0474-4087-88c5-7a8a79347c68/asignar`

- Propietario: `src/features/admin/docentes/AsignarSalonesPage.tsx + availability.ts`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: capacidad específica del rol, no una autorización de escritura por estar autenticado.
- Títulos: Prueba A, teacher / Disponibilidad / Salones compatibles / Salones asignados.
- Columnas: Sin tabla en esta presentación.
- Campos/filtros iniciales: Área [select-one,habilitado].
- Acciones iniciales: Volver a docentes; Disponibilidad en Excel; Editar disponibilidad; Shift · 08:00–13:40; Seleccionar; Quitar todas las asignaciones; Quitar Aula ficticia A.
- Destinos: No hay enlaces locales en el DOM inicial.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/admissions/current →200; GET /api/teachers/47d1fa83-0474-4087-88c5-7a8a79347c68 →200; GET /api/courses →200; GET /api/teachers/47d1fa83-0474-4087-88c5-7a8a79347c68/schedules →200; GET /api/areas →200; GET /api/hour-sessions →200; GET /api/teachers?page=1&limit=1 →200; GET /api/supervisors?page=1&limit=1 →200; GET /api/monitors?page=1&limit=1 →200; GET /api/operations/notifications/stream →200; GET /api/coordinators?page=1&limit=1 →200; GET /api/schedules/teachers/47d1fa83-0474-4087-88c5-7a8a79347c68/availability →200; GET /api/classes →200; GET /api/teachers?page=1&limit=500&courseId=1 →200; GET /api/operations/context →200.
- Estados registrados: data@1920, data@390, error@1920, error@390, empty@1920, empty@390; carga retenida@1920/390 (baseline-loading-chromium.json).
- Foco/teclado: 20 Tab registrados; 0 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 20 combinaciones efectivas; 0 por debajo del mínimo aplicable, 1 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-12-admin-1920-data.png) | 0 | No |
| data | 390 | [imagen](UI-12-admin-390-data.png) | 0 | No |
| error | 1920 | [imagen](UI-12-admin-1920-error.png) | 0 | http://127.0.0.1:3109/api/teachers/47d1fa83-0474-4087-88c5-7a8a79347c68/schedules |
| error | 390 | [imagen](UI-12-admin-390-error.png) | 0 | http://127.0.0.1:3109/api/teachers/47d1fa83-0474-4087-88c5-7a8a79347c68/schedules |
| empty | 1920 | [imagen](UI-12-admin-1920-empty.png) | 0 | http://127.0.0.1:3109/api/teachers/47d1fa83-0474-4087-88c5-7a8a79347c68/schedules |
| empty | 390 | [imagen](UI-12-admin-390-empty.png) | 0 | http://127.0.0.1:3109/api/teachers/47d1fa83-0474-4087-88c5-7a8a79347c68/schedules |
| carga retenida | 1920 | [imagen](UI-12-admin-1920-loading.png) | — | Lectura retenida,1peticiones |
| carga retenida | 390 | [imagen](UI-12-admin-390-loading.png) | — | Lectura retenida,1peticiones |

## UI-13 · admin · `/admin/gestionar/docentes/47d1fa83-0474-4087-88c5-7a8a79347c68/horario`

- Propietario: `src/features/admin/docentes/HorarioDocentePage.tsx`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: capacidad específica del rol, no una autorización de escritura por estar autenticado.
- Títulos: Horario de Prueba A, teacher / Horario semanal / Salones y enlaces.
- Columnas: Sin tabla en esta presentación.
- Campos/filtros iniciales: No hay campos en el DOM inicial.
- Acciones iniciales: Volver; Asignar salones; Semana; Por día; Quitar.
- Destinos: No hay enlaces locales en el DOM inicial.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/admissions/current →200; GET /api/teachers/47d1fa83-0474-4087-88c5-7a8a79347c68 →200; GET /api/teachers/47d1fa83-0474-4087-88c5-7a8a79347c68/schedules →200; GET /api/hour-sessions →200; GET /api/courses →200; GET /api/monitors?page=1&limit=1 →200; GET /api/teachers?page=1&limit=1 →200; GET /api/coordinators?page=1&limit=1 →200; GET /api/supervisors?page=1&limit=1 →200; GET /api/classes →200; GET /api/operations/notifications/stream →200.
- Estados registrados: data@1920, data@390, error@1920, error@390, empty@1920, empty@390; carga retenida@1920/390 (baseline-loading-chromium.json).
- Foco/teclado: 20 Tab registrados; 1 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 19 combinaciones efectivas; 0 por debajo del mínimo aplicable, 1 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-13-admin-1920-data.png) | 0 | No |
| data | 390 | [imagen](UI-13-admin-390-data.png) | 0 | No |
| error | 1920 | [imagen](UI-13-admin-1920-error.png) | 0 | http://127.0.0.1:3109/api/teachers/47d1fa83-0474-4087-88c5-7a8a79347c68/schedules |
| error | 390 | [imagen](UI-13-admin-390-error.png) | 0 | http://127.0.0.1:3109/api/teachers/47d1fa83-0474-4087-88c5-7a8a79347c68/schedules |
| empty | 1920 | [imagen](UI-13-admin-1920-empty.png) | 0 | http://127.0.0.1:3109/api/teachers/47d1fa83-0474-4087-88c5-7a8a79347c68/schedules |
| empty | 390 | [imagen](UI-13-admin-390-empty.png) | 0 | http://127.0.0.1:3109/api/teachers/47d1fa83-0474-4087-88c5-7a8a79347c68/schedules |
| carga retenida | 1920 | [imagen](UI-13-admin-1920-loading.png) | — | Lectura retenida,1peticiones |
| carga retenida | 390 | [imagen](UI-13-admin-390-loading.png) | — | Lectura retenida,1peticiones |

## UI-14 · admin · `/admin/gestionar/monitores`

- Propietario: `src/features/admin/personas/MonitoresPage.tsx + PersonForm.tsx`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: capacidad específica del rol, no una autorización de escritura por estar autenticado.
- Títulos: Monitores.
- Columnas: Incidencia / DNI / Salón / Monitor / Correo de acceso / Celular / Turno / Acciones.
- Campos/filtros iniciales: Buscar monitor [search,habilitado]; Área [select-one,habilitado]; Turno [select-one,habilitado]; Filas por página [select-one,habilitado].
- Acciones iniciales: Agregar monitor; Seleccionar; Registrar incidencia; Editar datos; Eliminar; Registrar incidencia; Editar datos; Eliminar; Página anterior (deshabilitada); Página 1; Página siguiente (deshabilitada).
- Destinos: No hay enlaces locales en el DOM inicial.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/admissions/current →200; GET /api/shifts →200; GET /api/classes →200; GET /api/monitors?page=1&limit=20 →200; GET /api/areas →200; GET /api/teachers?page=1&limit=1 →200; GET /api/monitors?page=1&limit=1 →200; GET /api/class-session-records/context →200; GET /api/courses →200; GET /api/coordinators?page=1&limit=1 →200; GET /api/supervisors?page=1&limit=1 →200; GET /api/operations/notifications/stream →200; GET /api/operations/context →200; POST /api/incidences/dni-summary →201.
- Estados registrados: data@1920, form-initial@1920, data@390, error@1920, error@390, empty@1920, empty@390; carga retenida@1920/390 (baseline-loading-chromium.json).
- Foco/teclado: 20 Tab registrados; 0 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 15 combinaciones efectivas; 0 por debajo del mínimo aplicable, 0 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-14-admin-1920-data.png) | 0 | No |
| form-initial | 1920 | [imagen](UI-14-admin-form.png) | 0 | No |
| data | 390 | [imagen](UI-14-admin-390-data.png) | 0 | No |
| error | 1920 | [imagen](UI-14-admin-1920-error.png) | 0 | http://127.0.0.1:3109/api/monitors?* |
| error | 390 | [imagen](UI-14-admin-390-error.png) | 0 | http://127.0.0.1:3109/api/monitors?* |
| empty | 1920 | [imagen](UI-14-admin-1920-empty.png) | 0 | http://127.0.0.1:3109/api/monitors?* |
| empty | 390 | [imagen](UI-14-admin-390-empty.png) | 0 | http://127.0.0.1:3109/api/monitors?* |
| carga retenida | 1920 | [imagen](UI-14-admin-1920-loading.png) | — | Lectura retenida,2peticiones |
| carga retenida | 390 | [imagen](UI-14-admin-390-loading.png) | — | Lectura retenida,2peticiones |

### Formulario inicial observado

| Campo | Tipo | Obligatorio | Estado | Límites HTML | Opciones |
|---|---|---|---|---|---|
| Buscar monitor | search | No | Editable | min,max,longitud-1 |  |
| Área | select-one | No | Editable | min—,max—,longitud— | Todas las áreas, Area |
| Turno | select-one | No | Editable | min—,max—,longitud— | Todos los turnos, Shift |
| Filas por página | select-one | No | Editable | min—,max—,longitud— | 10, 20, 50 |
| Correo de acceso | email | No | Editable | min,max,longitud-1 |  |
| DNI (opcional) | text | No | Editable | min,max,longitud-1 |  |
| Nombres * | text | No | Editable | min,max,longitud-1 |  |
| Apellidos * | text | No | Editable | min,max,longitud-1 |  |
| Correo personal (opcional) | email | No | Editable | min,max,longitud-1 |  |
| Celular (opcional) | text | No | Editable | min,max,longitud-1 |  |
| Otros celulares (opcional) | text | No | Editable | min,max,longitud-1 |  |
| Área * | select-one | No | Editable | min—,max—,longitud— | Selecciona…, Area |
| Turno * | select-one | No | Editable | min—,max—,longitud— | Selecciona…, Shift · 08:00–23:59 |

Inicial/foco capturados. Control abierto explícito: validar estados inválido/válido/guardando/error/éxito, payload, resultado persistido y cierre de esta variante; no presentarlos como probados por la captura.

## UI-15 · admin · `/admin/gestionar/supervisores`

- Propietario: `src/features/admin/personas/SupervisoresPage.tsx + PersonForm.tsx`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: capacidad específica del rol, no una autorización de escritura por estar autenticado.
- Títulos: Supervisores.
- Columnas: Incidencia / Supervisor / Celular / Turno / Acciones.
- Campos/filtros iniciales: Filas por página [select-one,habilitado].
- Acciones iniciales: Agregar supervisor; Seleccionar; Registrar incidencia; Monitores; Editar datos; Eliminar; Registrar incidencia; Monitores; Editar datos; Eliminar; Página anterior (deshabilitada); Página 1; Página siguiente (deshabilitada).
- Destinos: No hay enlaces locales en el DOM inicial.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/admissions/current →200; GET /api/shifts →200; GET /api/teachers?page=1&limit=1 →200; GET /api/supervisors?page=1&limit=20 →200; GET /api/monitors?page=1&limit=1 →200; GET /api/coordinators?page=1&limit=1 →200; GET /api/courses →200; GET /api/supervisors?page=1&limit=1 →200; GET /api/classes →200; GET /api/operations/notifications/stream →200; GET /api/operations/context →200.
- Estados registrados: data@1920, form-initial@1920, data@390, error@1920, error@390, empty@1920, empty@390; carga retenida@1920/390 (baseline-loading-chromium.json).
- Foco/teclado: 20 Tab registrados; 0 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 13 combinaciones efectivas; 0 por debajo del mínimo aplicable, 0 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-15-admin-1920-data.png) | 0 | No |
| form-initial | 1920 | [imagen](UI-15-admin-form.png) | 0 | No |
| data | 390 | [imagen](UI-15-admin-390-data.png) | 0 | No |
| error | 1920 | [imagen](UI-15-admin-1920-error.png) | 0 | http://127.0.0.1:3109/api/supervisors?* |
| error | 390 | [imagen](UI-15-admin-390-error.png) | 0 | http://127.0.0.1:3109/api/supervisors?* |
| empty | 1920 | [imagen](UI-15-admin-1920-empty.png) | 0 | http://127.0.0.1:3109/api/supervisors?* |
| empty | 390 | [imagen](UI-15-admin-390-empty.png) | 0 | http://127.0.0.1:3109/api/supervisors?* |
| carga retenida | 1920 | [imagen](UI-15-admin-1920-loading.png) | — | Lectura retenida,2peticiones |
| carga retenida | 390 | [imagen](UI-15-admin-390-loading.png) | — | Lectura retenida,2peticiones |

### Formulario inicial observado

| Campo | Tipo | Obligatorio | Estado | Límites HTML | Opciones |
|---|---|---|---|---|---|
| Filas por página | select-one | No | Editable | min—,max—,longitud— | 10, 20, 50 |
| Correo de acceso * | email | No | Editable | min,max,longitud-1 |  |
| DNI * | text | No | Editable | min,max,longitud-1 |  |
| Nombres * | text | No | Editable | min,max,longitud-1 |  |
| Apellidos * | text | No | Editable | min,max,longitud-1 |  |
| Correo personal (opcional) | email | No | Editable | min,max,longitud-1 |  |
| Celular (opcional) | text | No | Editable | min,max,longitud-1 |  |
| Otros celulares (opcional) | text | No | Editable | min,max,longitud-1 |  |
| Turno que supervisa * | select-one | No | Editable | min—,max—,longitud— | Selecciona…, Shift |

Inicial/foco capturados. Control abierto explícito: validar estados inválido/válido/guardando/error/éxito, payload, resultado persistido y cierre de esta variante; no presentarlos como probados por la captura.

## UI-16 · admin · `/admin/gestionar/supervisores/1d206ba5-d60a-4636-a1a7-23026ae738fd/monitores`

- Propietario: `src/features/admin/personas/SupervisorMonitoresPage.tsx`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: capacidad específica del rol, no una autorización de escritura por estar autenticado.
- Títulos: Monitores de Prueba A, supervisor / Asignados / Disponibles.
- Columnas: Sin tabla en esta presentación.
- Campos/filtros iniciales: Área [select-one,habilitado].
- Acciones iniciales: Volver a supervisores; Quitar; Quitar.
- Destinos: No hay enlaces locales en el DOM inicial.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/admissions/current →200; GET /api/shifts →200; GET /api/areas →200; GET /api/supervisors?page=1&limit=100 →200; GET /api/teachers?page=1&limit=1 →200; GET /api/coordinators?page=1&limit=1 →200; GET /api/monitors?page=1&limit=1 →200; GET /api/courses →200; GET /api/supervisors?page=1&limit=1 →200; GET /api/supervisors/1d206ba5-d60a-4636-a1a7-23026ae738fd/monitors →200; GET /api/classes →200; GET /api/operations/notifications/stream →200.
- Estados registrados: data@1920, data@390, error@1920, error@390, empty@1920, empty@390; carga retenida@1920/390 (baseline-loading-chromium.json).
- Foco/teclado: 20 Tab registrados; 1 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 14 combinaciones efectivas; 0 por debajo del mínimo aplicable, 0 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-16-admin-1920-data.png) | 0 | No |
| data | 390 | [imagen](UI-16-admin-390-data.png) | 0 | No |
| error | 1920 | [imagen](UI-16-admin-1920-error.png) | 0 | http://127.0.0.1:3109/api/supervisors/*/monitors* |
| error | 390 | [imagen](UI-16-admin-390-error.png) | 0 | http://127.0.0.1:3109/api/supervisors/*/monitors* |
| empty | 1920 | [imagen](UI-16-admin-1920-empty.png) | 0 | http://127.0.0.1:3109/api/supervisors/*/monitors* |
| empty | 390 | [imagen](UI-16-admin-390-empty.png) | 0 | http://127.0.0.1:3109/api/supervisors/*/monitors* |
| carga retenida | 1920 | [imagen](UI-16-admin-1920-loading.png) | — | Lectura retenida,1peticiones |
| carga retenida | 390 | [imagen](UI-16-admin-390-loading.png) | — | Lectura retenida,1peticiones |

## UI-17 · admin · `/admin/gestionar/coordinadores`

- Propietario: `src/features/admin/personas/CoordinadoresPage.tsx + PersonForm.tsx`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: capacidad específica del rol, no una autorización de escritura por estar autenticado.
- Títulos: Coordinadores.
- Columnas: Incidencia / Coordinador / Alcance / DNI / Celular / Acciones.
- Campos/filtros iniciales: No hay campos en el DOM inicial.
- Acciones iniciales: Agregar coordinador; Seleccionar; Registrar incidencia; Editar datos; Eliminar; Registrar incidencia; Editar datos; Eliminar; Página anterior (deshabilitada); Página 1; Página siguiente (deshabilitada).
- Destinos: No hay enlaces locales en el DOM inicial.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/admissions/current →200; GET /api/courses →200; GET /api/coordinators?page=1&limit=20 →200; GET /api/teachers?page=1&limit=1 →200; GET /api/monitors?page=1&limit=1 →200; GET /api/supervisors?page=1&limit=1 →200; GET /api/coordinators?page=1&limit=1 →200; GET /api/classes →200; GET /api/operations/notifications/stream →200; GET /api/operations/context →200.
- Estados registrados: data@1920, form-initial@1920, data@390, error@1920, error@390, empty@1920, empty@390; carga retenida@1920/390 (baseline-loading-chromium.json).
- Foco/teclado: 20 Tab registrados; 0 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 15 combinaciones efectivas; 0 por debajo del mínimo aplicable, 0 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-17-admin-1920-data.png) | 0 | No |
| form-initial | 1920 | [imagen](UI-17-admin-form.png) | 0 | No |
| data | 390 | [imagen](UI-17-admin-390-data.png) | 0 | No |
| error | 1920 | [imagen](UI-17-admin-1920-error.png) | 0 | http://127.0.0.1:3109/api/coordinators?* |
| error | 390 | [imagen](UI-17-admin-390-error.png) | 0 | http://127.0.0.1:3109/api/coordinators?* |
| empty | 1920 | [imagen](UI-17-admin-1920-empty.png) | 0 | http://127.0.0.1:3109/api/coordinators?* |
| empty | 390 | [imagen](UI-17-admin-390-empty.png) | 0 | http://127.0.0.1:3109/api/coordinators?* |
| carga retenida | 1920 | [imagen](UI-17-admin-1920-loading.png) | — | Lectura retenida,2peticiones |
| carga retenida | 390 | [imagen](UI-17-admin-390-loading.png) | — | Lectura retenida,2peticiones |

### Formulario inicial observado

| Campo | Tipo | Obligatorio | Estado | Límites HTML | Opciones |
|---|---|---|---|---|---|
| Correo de acceso * | email | No | Editable | min,max,longitud-1 |  |
| DNI * | text | No | Editable | min,max,longitud-1 |  |
| Nombres * | text | No | Editable | min,max,longitud-1 |  |
| Apellidos * | text | No | Editable | min,max,longitud-1 |  |
| Correo personal (opcional) | email | No | Editable | min,max,longitud-1 |  |
| Celular (opcional) | text | No | Editable | min,max,longitud-1 |  |
| Otros celulares (opcional) | text | No | Editable | min,max,longitud-1 |  |
| Alcance | select-one | No | Editable | min—,max—,longitud— | Coordinador general, Course, Curso fuera de alcance |

Inicial/foco capturados. Control abierto explícito: validar estados inválido/válido/guardando/error/éxito, payload, resultado persistido y cierre de esta variante; no presentarlos como probados por la captura.

## UI-18 · admin · `/admin/gestionar/salones`

- Propietario: `src/features/admin/salones/SalonesPage.tsx`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: capacidad específica del rol, no una autorización de escritura por estar autenticado.
- Títulos: Salones.
- Columnas: Sin tabla en esta presentación.
- Campos/filtros iniciales: Buscar salón [search,habilitado]; Estado [select-one,habilitado].
- Acciones iniciales: Tarjetas; Tabla; Agregar salones; Todas; Area; Shift 08:00 – 23:59 · 3 salones 3 con docentes faltantes.
- Destinos: Aula → /admin/gestionar/salones/1b4fab76-34d8-4e7c-8b28-90ac3d307508; Aula → /admin/gestionar/salones/8d838af7-7db1-4fc0-aa8c-eade1f6c5b1d; Aula → /admin/gestionar/salones/a7641977-62c9-4796-8181-9b75230c02b1.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/admissions/current →200; GET /api/classes →200; GET /api/areas →200; GET /api/shifts →200; GET /api/courses →200; GET /api/teachers?page=1&limit=1 →200; GET /api/monitors?page=1&limit=1 →200; GET /api/coordinators?page=1&limit=1 →200; GET /api/supervisors?page=1&limit=1 →200; GET /api/operations/notifications/stream →200.
- Estados registrados: data@1920, form-initial@1920, data@390, error@1920, error@390, empty@1920, empty@390; carga retenida@1920/390 (baseline-loading-chromium.json).
- Foco/teclado: 20 Tab registrados; 0 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 17 combinaciones efectivas; 0 por debajo del mínimo aplicable, 0 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-18-admin-1920-data.png) | 0 | No |
| form-initial | 1920 | [imagen](UI-18-admin-form.png) | 0 | No |
| data | 390 | [imagen](UI-18-admin-390-data.png) | 0 | No |
| error | 1920 | [imagen](UI-18-admin-1920-error.png) | 0 | http://127.0.0.1:3109/api/classes |
| error | 390 | [imagen](UI-18-admin-390-error.png) | 0 | http://127.0.0.1:3109/api/classes |
| empty | 1920 | [imagen](UI-18-admin-1920-empty.png) | 0 | http://127.0.0.1:3109/api/classes |
| empty | 390 | [imagen](UI-18-admin-390-empty.png) | 0 | http://127.0.0.1:3109/api/classes |
| carga retenida | 1920 | [imagen](UI-18-admin-1920-loading.png) | — | Lectura retenida,1peticiones |
| carga retenida | 390 | [imagen](UI-18-admin-390-loading.png) | — | Lectura retenida,1peticiones |

### Formulario inicial observado

| Campo | Tipo | Obligatorio | Estado | Límites HTML | Opciones |
|---|---|---|---|---|---|
| Buscar salón | search | No | Editable | min,max,longitud-1 |  |
| Estado | select-one | No | Editable | min—,max—,longitud— | Estado: todos, Faltan docentes (3), Completos (0), Sin enlaces (3) |
| Área * | select-one | No | Editable | min—,max—,longitud— | Selecciona…, Area |
| Turno * | select-one | No | Editable | min—,max—,longitud— | Selecciona…, Shift · 08:00–23:59 |
| Cantidad de salones a agregar * | number | No | Editable | min1,max500,longitud-1 |  |

Inicial/foco capturados. Control abierto explícito: validar estados inválido/válido/guardando/error/éxito, payload, resultado persistido y cierre de esta variante; no presentarlos como probados por la captura.

## UI-19 · admin · `/admin/gestionar/salones/8d838af7-7db1-4fc0-aa8c-eade1f6c5b1d`

- Propietario: `src/features/admin/salones/SalonDetallePage.tsx`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: capacidad específica del rol, no una autorización de escritura por estar autenticado.
- Títulos: AulaAreaCompleto / Horario semanal / Docentes por curso.
- Columnas: Sin tabla en esta presentación.
- Campos/filtros iniciales: No hay campos en el DOM inicial.
- Acciones iniciales: Volver a salones; Eliminar; Editar Google Meet; Editar Google Classroom; Semana; Por día; Cambiar.
- Destinos: No hay enlaces locales en el DOM inicial.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/admissions/current →200; GET /api/courses →200; GET /api/classes →200; GET /api/classes/8d838af7-7db1-4fc0-aa8c-eade1f6c5b1d/teachers →200; GET /api/classes/8d838af7-7db1-4fc0-aa8c-eade1f6c5b1d/schedules →200; GET /api/hour-sessions →200; GET /api/monitors?page=1&limit=1 →200; GET /api/coordinators?page=1&limit=1 →200; GET /api/teachers?page=1&limit=1 →200; GET /api/supervisors?page=1&limit=1 →200; GET /api/operations/notifications/stream →200.
- Estados registrados: data@1920, data@390, error@1920, error@390, empty@1920, empty@390; carga retenida@1920/390 (baseline-loading-chromium.json).
- Foco/teclado: 20 Tab registrados; 0 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 21 combinaciones efectivas; 0 por debajo del mínimo aplicable, 1 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-19-admin-1920-data.png) | 0 | No |
| data | 390 | [imagen](UI-19-admin-390-data.png) | 0 | No |
| error | 1920 | [imagen](UI-19-admin-1920-error.png) | 0 | http://127.0.0.1:3109/api/classes/8d838af7-7db1-4fc0-aa8c-eade1f6c5b1d/schedules |
| error | 390 | [imagen](UI-19-admin-390-error.png) | 0 | http://127.0.0.1:3109/api/classes/8d838af7-7db1-4fc0-aa8c-eade1f6c5b1d/schedules |
| empty | 1920 | [imagen](UI-19-admin-1920-empty.png) | 0 | http://127.0.0.1:3109/api/classes/8d838af7-7db1-4fc0-aa8c-eade1f6c5b1d/schedules |
| empty | 390 | [imagen](UI-19-admin-390-empty.png) | 0 | http://127.0.0.1:3109/api/classes/8d838af7-7db1-4fc0-aa8c-eade1f6c5b1d/schedules |
| carga retenida | 1920 | [imagen](UI-19-admin-1920-loading.png) | — | Lectura retenida,1peticiones |
| carga retenida | 390 | [imagen](UI-19-admin-390-loading.png) | — | Lectura retenida,1peticiones |

## UI-20 · admin · `/admin/gestionar/cursos`

- Propietario: `src/features/admin/cursos/CursosPage.tsx / CourseDialog`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: capacidad específica del rol, no una autorización de escritura por estar autenticado.
- Títulos: Cursos.
- Columnas: Curso / Así se ve en el horario / Acciones.
- Campos/filtros iniciales: No hay campos en el DOM inicial.
- Acciones iniciales: Agregar curso; Editar Course; Eliminar Course; Editar Curso fuera de alcance; Eliminar Curso fuera de alcance.
- Destinos: No hay enlaces locales en el DOM inicial.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/admissions/current →200; GET /api/courses →200; GET /api/teachers?page=1&limit=1 →200; GET /api/monitors?page=1&limit=1 →200; GET /api/supervisors?page=1&limit=1 →200; GET /api/coordinators?page=1&limit=1 →200; GET /api/classes →200; GET /api/operations/notifications/stream →200.
- Estados registrados: data@1920, form-initial@1920, data@390, error@1920, error@390, empty@1920, empty@390; carga retenida@1920/390 (baseline-loading-chromium.json).
- Foco/teclado: 20 Tab registrados; 1 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 14 combinaciones efectivas; 0 por debajo del mínimo aplicable, 0 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-20-admin-1920-data.png) | 0 | No |
| form-initial | 1920 | [imagen](UI-20-admin-form.png) | 0 | No |
| data | 390 | [imagen](UI-20-admin-390-data.png) | 0 | No |
| error | 1920 | [imagen](UI-20-admin-1920-error.png) | 0 | http://127.0.0.1:3109/api/courses |
| error | 390 | [imagen](UI-20-admin-390-error.png) | 0 | http://127.0.0.1:3109/api/courses |
| empty | 1920 | [imagen](UI-20-admin-1920-empty.png) | 0 | http://127.0.0.1:3109/api/courses |
| empty | 390 | [imagen](UI-20-admin-390-empty.png) | 0 | http://127.0.0.1:3109/api/courses |
| carga retenida | 1920 | [imagen](UI-20-admin-1920-loading.png) | — | Lectura retenida,1peticiones |
| carga retenida | 390 | [imagen](UI-20-admin-390-loading.png) | — | Lectura retenida,1peticiones |

### Formulario inicial observado

| Campo | Tipo | Obligatorio | Estado | Límites HTML | Opciones |
|---|---|---|---|---|---|
| Nombre del curso * | text | No | Editable | min,max,longitud-1 |  |
| Color | color | No | Editable | min,max,longitud-1 |  |

Inicial/foco capturados. Control abierto explícito: validar estados inválido/válido/guardando/error/éxito, payload, resultado persistido y cierre de esta variante; no presentarlos como probados por la captura.

## UI-22 · teacher · `/docente/solicitudes`

- Propietario: `src/features/operations/RequestsPage.tsx / RequestForm`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: capacidad específica del rol, no una autorización de escritura por estar autenticado.
- Títulos: Solicitudes y reemplazos.
- Columnas: Fecha y solicitante / Trabajo solicitado / Estado / Documento / Acciones.
- Campos/filtros iniciales: Filtrar solicitudes por estado [select-one,habilitado].
- Acciones iniciales: Solicitar reemplazo; Anterior (deshabilitada); Siguiente (deshabilitada).
- Destinos: No hay enlaces locales en el DOM inicial.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/operations/context →200; GET /api/operations/notifications/stream →200; GET /api/operations/requests?page=1&limit=20 →200.
- Estados registrados: data@1920, form-initial@1920, data@390, error@1920, error@390, empty@1920, empty@390; carga retenida@1920/390 (baseline-loading-chromium.json).
- Foco/teclado: 20 Tab registrados; 2 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 7 combinaciones efectivas; 0 por debajo del mínimo aplicable, 0 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-22-teacher-1920-data.png) | 0 | No |
| form-initial | 1920 | [imagen](UI-22-teacher-form.png) | 0 | No |
| data | 390 | [imagen](UI-22-teacher-390-data.png) | 0 | No |
| error | 1920 | [imagen](UI-22-teacher-1920-error.png) | 0 | http://127.0.0.1:3109/api/operations/requests* |
| error | 390 | [imagen](UI-22-teacher-390-error.png) | 0 | http://127.0.0.1:3109/api/operations/requests* |
| empty | 1920 | [imagen](UI-22-teacher-1920-empty.png) | 0 | http://127.0.0.1:3109/api/operations/requests* |
| empty | 390 | [imagen](UI-22-teacher-390-empty.png) | 0 | http://127.0.0.1:3109/api/operations/requests* |
| carga retenida | 1920 | [imagen](UI-22-teacher-1920-loading.png) | — | Lectura retenida,1peticiones |
| carga retenida | 390 | [imagen](UI-22-teacher-390-loading.png) | — | Lectura retenida,1peticiones |

### Formulario inicial observado

| Campo | Tipo | Obligatorio | Estado | Límites HTML | Opciones |
|---|---|---|---|---|---|
| Filtrar solicitudes por estado | select-one | No | Editable | min—,max—,longitud— | Todos los estados, Pendiente, Aprobada, Rechazada, Cancelada |
| Fecha de trabajo | date | No | Editable | min2026-11-04,max,longitud-1 |  |
| Buscar salón | text | No | Editable | min,max,longitud-1 |  |
| Salón | select-one | No | Editable | min—,max—,longitud— | Selecciona salón, Aula ficticia A |
| Buscar reemplazante compatible | text | No | Editable | min,max,longitud-1 |  |
| Reemplazante propuesto | select-one | No | Editable | min—,max—,longitud— | Selecciona reemplazante |
| Motivo documentado | textarea | No | Editable | min—,max—,longitud4000 |  |
| Evidencias (PDF, JPG o PNG; hasta 5 archivos) | file | No | Editable | min,max,longitud-1 |  |
| Optimizar imágenes para reducir el PDF | checkbox | No | Editable | min,max,longitud-1 |  |

Inicial/foco capturados. Control abierto explícito: validar estados inválido/válido/guardando/error/éxito, payload, resultado persistido y cierre de esta variante; no presentarlos como probados por la captura.

## UI-23 · monitor · `/monitor`

- Propietario: `src/features/monitor/MonitorPanel.tsx + shared/useClassroomSchedule.ts`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: capacidad específica del rol, no una autorización de escritura por estar autenticado.
- Títulos: Docentes del salón.
- Columnas: Sin tabla en esta presentación.
- Campos/filtros iniciales: No hay campos en el DOM inicial.
- Acciones iniciales: Enlaces; Agregar; Semana; Por día; Course Prueba A, teacher teacher@test.invalid · N/A.
- Destinos: Solicitar reemplazo → /monitor/solicitudes; Registrar parte diario → /monitor/partes.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/operations/context →200; GET /api/monitors/information →200; GET /api/monitors/cargar/horario →200; GET /api/courses →200; GET /api/operations/notifications/stream →200; GET /api/hour-sessions →200; GET /api/monitors/datos/teachers →200; GET /api/operations/notifications?page=1&limit=20 →200.
- Estados registrados: data@1920, form-initial@1920, data@390, error@1920, error@390, empty@1920, empty@390; carga retenida@1920/390 (baseline-loading-chromium.json).
- Foco/teclado: 20 Tab registrados; 1 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 17 combinaciones efectivas; 0 por debajo del mínimo aplicable, 1 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-23-monitor-1920-data.png) | 0 | No |
| form-initial | 1920 | [imagen](UI-23-monitor-form.png) | 0 | No |
| data | 390 | [imagen](UI-23-monitor-390-data.png) | 0 | No |
| error | 1920 | [imagen](UI-23-monitor-1920-error.png) | 0 | http://127.0.0.1:3109/api/monitors/cargar/horario |
| error | 390 | [imagen](UI-23-monitor-390-error.png) | 0 | http://127.0.0.1:3109/api/monitors/cargar/horario |
| empty | 1920 | [imagen](UI-23-monitor-1920-empty.png) | 0 | http://127.0.0.1:3109/api/monitors/cargar/horario |
| empty | 390 | [imagen](UI-23-monitor-390-empty.png) | 0 | http://127.0.0.1:3109/api/monitors/cargar/horario |
| carga retenida | 1920 | [imagen](UI-23-monitor-1920-loading.png) | — | Lectura retenida,1peticiones |
| carga retenida | 390 | [imagen](UI-23-monitor-390-loading.png) | — | Lectura retenida,1peticiones |

### Formulario inicial observado

| Campo | Tipo | Obligatorio | Estado | Límites HTML | Opciones |
|---|---|---|---|---|---|
| Google Meet | url | No | Editable | min,max,longitud-1 |  |
| Google Classroom | url | No | Editable | min,max,longitud-1 |  |

Inicial/foco capturados. Control abierto explícito: validar estados inválido/válido/guardando/error/éxito, payload, resultado persistido y cierre de esta variante; no presentarlos como probados por la captura.

## UI-24 · monitor · `/monitor/partes`

- Propietario: `src/features/partes/PartsPage.tsx + OfficialPartsSheet.tsx (congelados)`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: capacidad específica del rol, no una autorización de escritura por estar autenticado.
- Títulos: Parte diario.
- Columnas: # / Programado Intervalo programado del bloque / Hora real Inicio y fin declarados; no se copian del horario / Curso / Docente / Estado Declaración del bloque; una propuesta no es autorización ni ejecución / Observaciones Notas de clase; el seguimiento privado del monitor está fuera de esta tabla / Capturas Miniaturas privadas; el original solo se descarga al ampliar / Inicio / Fin.
- Campos/filtros iniciales: Fecha de la jornada [date,habilitado].
- Acciones iniciales: Más opciones de Partes; Hora de Lima; el punto indica el bloque actual; Intervalo programado del bloque; Inicio y fin declarados; no se copian del horario; Declaración del bloque; una propuesta no es autorización ni ejecución; Notas de clase; el seguimiento privado del monitor está fuera de esta tabla; Miniaturas privadas; el original solo se descarga al ampliar; Opciones del parte #1; Editar hora real del parte #1; Editar estado del parte #1; Editar observaciones del parte #1; Editar captura de inicio del parte #1; Editar captura de fin del parte #1; Opciones del parte #2; Editar hora real del parte #2; Editar estado del parte #2; Editar observaciones del parte #2; Ampliar captura de inicio del parte #2; Editar captura de inicio del parte #2; Ampliar captura de fin del parte #2; Editar captura de fin del parte #2; Opciones del parte #3; Editar hora real del parte #3; Editar estado del parte #3; Editar observaciones del parte #3; Editar captura de inicio del parte #3; Editar captura de fin del parte #3; Opciones del parte #4; Editar hora real del parte #4; Editar estado del parte #4; Editar observaciones del parte #4; Editar captura de inicio del parte #4; Editar captura de fin del parte #4; Opciones del parte #5; Editar hora real del parte #5; Editar estado del parte #5; Editar observaciones del parte #5; Editar captura de inicio del parte #5; Editar captura de fin del parte #5; Opciones del parte #6; Editar hora real del parte #6; Editar estado del parte #6; Editar observaciones del parte #6; Editar captura de inicio del parte #6; Editar captura de fin del parte #6.
- Destinos: No hay enlaces locales en el DOM inicial.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/operations/notifications/stream →200; GET /api/class-session-records/workspace →200; GET /api/class-session-files/thumbnails?refs=%5B%7B%22recordId%22%3A2%2C%22slot%22%3A%22initial%22%2C%22fileId%22%3A%2201a1a7c9-268f-7284-864c-7acd4abd44b0%22%2C%22generation%22%3A%221793816340138024%22%7D%2C%7B%22recordId%22%3A2%2C%22slot%22%3A%22final%22%2C%22fileId%22%3A%2201a1a7c9-271e-780a-8c0d-e7d0ec9bf58d%22%2C%22generation%22%3A%221793816340265314%22%7D%5D →200.
- Estados registrados: data@1920, data@390; no hay consulta primaria retenida en esta ruta; controles globales/asistente/Partes requieren su recorrido específico.
- Foco/teclado: 20 Tab registrados; 0 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 23 combinaciones efectivas; 7 por debajo del mínimo aplicable, 0 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-24-monitor-1920-data.png) | 0 | No |
| data | 390 | [imagen](UI-24-monitor-390-data.png) | 0 | No |

## UI-25 · monitor · `/monitor/solicitudes`

- Propietario: `src/features/operations/RequestsPage.tsx / RequestForm`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: capacidad específica del rol, no una autorización de escritura por estar autenticado.
- Títulos: Solicitudes y reemplazos.
- Columnas: Fecha y solicitante / Trabajo solicitado / Estado / Documento / Acciones.
- Campos/filtros iniciales: Filtrar solicitudes por estado [select-one,habilitado].
- Acciones iniciales: Solicitar reemplazo; Anterior (deshabilitada); Siguiente (deshabilitada).
- Destinos: No hay enlaces locales en el DOM inicial.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/operations/context →200; GET /api/operations/notifications/stream →200; GET /api/operations/requests?page=1&limit=20 →200.
- Estados registrados: data@1920, form-initial@1920, data@390, error@1920, error@390, empty@1920, empty@390; carga retenida@1920/390 (baseline-loading-chromium.json).
- Foco/teclado: 20 Tab registrados; 2 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 7 combinaciones efectivas; 0 por debajo del mínimo aplicable, 0 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-25-monitor-1920-data.png) | 0 | No |
| form-initial | 1920 | [imagen](UI-25-monitor-form.png) | 0 | No |
| data | 390 | [imagen](UI-25-monitor-390-data.png) | 0 | No |
| error | 1920 | [imagen](UI-25-monitor-1920-error.png) | 0 | http://127.0.0.1:3109/api/operations/requests* |
| error | 390 | [imagen](UI-25-monitor-390-error.png) | 0 | http://127.0.0.1:3109/api/operations/requests* |
| empty | 1920 | [imagen](UI-25-monitor-1920-empty.png) | 0 | http://127.0.0.1:3109/api/operations/requests* |
| empty | 390 | [imagen](UI-25-monitor-390-empty.png) | 0 | http://127.0.0.1:3109/api/operations/requests* |
| carga retenida | 1920 | [imagen](UI-25-monitor-1920-loading.png) | — | Lectura retenida,1peticiones |
| carga retenida | 390 | [imagen](UI-25-monitor-390-loading.png) | — | Lectura retenida,1peticiones |

### Formulario inicial observado

| Campo | Tipo | Obligatorio | Estado | Límites HTML | Opciones |
|---|---|---|---|---|---|
| Filtrar solicitudes por estado | select-one | No | Editable | min—,max—,longitud— | Todos los estados, Pendiente, Aprobada, Rechazada, Cancelada |
| Fecha de trabajo | date | No | Editable | min2026-11-04,max,longitud-1 |  |
| Tipo de solicitud | select-one | No | Editable | min—,max—,longitud— | Reemplazo de mi trabajo, Falta docente en el aula |
| Buscar salón | text | No | Editable | min,max,longitud-1 |  |
| Salón | select-one | No | Editable | min—,max—,longitud— | Selecciona salón, Aula ficticia A |
| Buscar reemplazante compatible | text | No | Editable | min,max,longitud-1 |  |
| Reemplazante propuesto | select-one | No | Editable | min—,max—,longitud— | Selecciona reemplazante |
| Motivo documentado | textarea | No | Editable | min—,max—,longitud4000 |  |
| Evidencias (PDF, JPG o PNG; hasta 5 archivos) | file | No | Editable | min,max,longitud-1 |  |
| Optimizar imágenes para reducir el PDF | checkbox | No | Editable | min,max,longitud-1 |  |

Inicial/foco capturados. Control abierto explícito: validar estados inválido/válido/guardando/error/éxito, payload, resultado persistido y cierre de esta variante; no presentarlos como probados por la captura.

## UI-26 · supervisor · `/supervisor`

- Propietario: `src/features/supervisor/SupervisorPanel.tsx + shared/useClassroomSchedule.ts`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: capacidad específica del rol, no una autorización de escritura por estar autenticado.
- Títulos: Mis salones / Aula ficticia A / Horario / Docentes del salón.
- Columnas: Sin tabla en esta presentación.
- Campos/filtros iniciales: Buscar salón [search,habilitado].
- Acciones iniciales: Todos; Sin enlaces · 2; Aula Prueba A, monitor; Aula Prueba A, otherMonitor; Semana; Por día; Course Prueba A, teacher teacher@test.invalid · N/A.
- Destinos: Solicitar reemplazo → /supervisor/solicitudes; Revisar partes → /supervisor/partes; Incidencias de monitores → /supervisor/incidencias; monitor@test.invalid → https://mail.google.com/mail/?view=cm&fs=1&to=monitor%40test.invalid.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/operations/context →200; GET /api/supervisors/getMonitors →200; GET /api/operations/notifications/stream →200; GET /api/operations/notifications?page=1&limit=20 →200; GET /api/monitors/7c52c934-0d05-43cd-987c-0b2db9884db5/horario →200; GET /api/courses →200; GET /api/hour-sessions →200; GET /api/monitors/7c52c934-0d05-43cd-987c-0b2db9884db5/teachers →200.
- Estados registrados: data@1920, data@390, error@1920, error@390, empty@1920, empty@390; carga retenida@1920/390 (baseline-loading-chromium.json).
- Foco/teclado: 20 Tab registrados; 0 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 16 combinaciones efectivas; 0 por debajo del mínimo aplicable, 0 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-26-supervisor-1920-data.png) | 0 | No |
| data | 390 | [imagen](UI-26-supervisor-390-data.png) | 0 | No |
| error | 1920 | [imagen](UI-26-supervisor-1920-error.png) | 0 | http://127.0.0.1:3109/api/supervisors/getMonitors* |
| error | 390 | [imagen](UI-26-supervisor-390-error.png) | 0 | http://127.0.0.1:3109/api/supervisors/getMonitors* |
| empty | 1920 | [imagen](UI-26-supervisor-1920-empty.png) | 0 | http://127.0.0.1:3109/api/supervisors/getMonitors* |
| empty | 390 | [imagen](UI-26-supervisor-390-empty.png) | 0 | http://127.0.0.1:3109/api/supervisors/getMonitors* |
| carga retenida | 1920 | [imagen](UI-26-supervisor-1920-loading.png) | — | Lectura retenida,1peticiones |
| carga retenida | 390 | [imagen](UI-26-supervisor-390-loading.png) | — | Lectura retenida,1peticiones |

## UI-27 · supervisor · `/supervisor/partes`

- Propietario: `src/features/partes/PartsPage.tsx + OfficialPartsSheet.tsx (congelados)`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: capacidad específica del rol, no una autorización de escritura por estar autenticado.
- Títulos: Parte diario.
- Columnas: # / Programado Intervalo programado del bloque / Hora real Inicio y fin declarados; no se copian del horario / Curso / Docente / Estado Declaración del bloque; una propuesta no es autorización ni ejecución / Observaciones Notas de clase; el seguimiento privado del monitor está fuera de esta tabla / Capturas Miniaturas privadas; el original solo se descarga al ampliar / Inicio / Fin.
- Campos/filtros iniciales: Fecha de la jornada [date,habilitado]; Aula de la jornada [select-one,habilitado].
- Acciones iniciales: Más opciones de Partes; Seguimiento del monitor; Hora de Lima; el punto indica el bloque actual; Intervalo programado del bloque; Inicio y fin declarados; no se copian del horario; Declaración del bloque; una propuesta no es autorización ni ejecución; Notas de clase; el seguimiento privado del monitor está fuera de esta tabla; Miniaturas privadas; el original solo se descarga al ampliar; Opciones del parte #1; Editar hora real del parte #1; Editar estado del parte #1; Editar observaciones del parte #1; Editar captura de inicio del parte #1; Editar captura de fin del parte #1; Opciones del parte #2; Editar hora real del parte #2; Editar estado del parte #2; Editar observaciones del parte #2; Ampliar captura de inicio del parte #2; Editar captura de inicio del parte #2; Ampliar captura de fin del parte #2; Editar captura de fin del parte #2; Opciones del parte #3; Editar hora real del parte #3; Editar estado del parte #3; Editar observaciones del parte #3; Editar captura de inicio del parte #3; Editar captura de fin del parte #3; Opciones del parte #4; Editar hora real del parte #4; Editar estado del parte #4; Editar observaciones del parte #4; Editar captura de inicio del parte #4; Editar captura de fin del parte #4; Opciones del parte #5; Editar hora real del parte #5; Editar estado del parte #5; Editar observaciones del parte #5; Editar captura de inicio del parte #5; Editar captura de fin del parte #5; Opciones del parte #6; Editar hora real del parte #6; Editar estado del parte #6; Editar observaciones del parte #6; Editar captura de inicio del parte #6; Editar captura de fin del parte #6.
- Destinos: No hay enlaces locales en el DOM inicial.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/operations/notifications/stream →200; GET /api/class-session-records/workspace →200; GET /api/class-session-files/thumbnails?refs=%5B%7B%22recordId%22%3A2%2C%22slot%22%3A%22initial%22%2C%22fileId%22%3A%2201a1a7c9-268f-7284-864c-7acd4abd44b0%22%2C%22generation%22%3A%221793816340138024%22%7D%2C%7B%22recordId%22%3A2%2C%22slot%22%3A%22final%22%2C%22fileId%22%3A%2201a1a7c9-271e-780a-8c0d-e7d0ec9bf58d%22%2C%22generation%22%3A%221793816340265314%22%7D%5D →200; GET /api/class-session-records/workspace?date=2026-11-04&classId=8d838af7-7db1-4fc0-aa8c-eade1f6c5b1d&shiftId=1 →200.
- Estados registrados: data@1920, data@390; no hay consulta primaria retenida en esta ruta; controles globales/asistente/Partes requieren su recorrido específico.
- Foco/teclado: 20 Tab registrados; 0 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 23 combinaciones efectivas; 7 por debajo del mínimo aplicable, 0 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-27-supervisor-1920-data.png) | 0 | No |
| data | 390 | [imagen](UI-27-supervisor-390-data.png) | 0 | No |

## UI-28 · supervisor · `/supervisor/solicitudes`

- Propietario: `src/features/operations/RequestsPage.tsx / RequestForm`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: capacidad específica del rol, no una autorización de escritura por estar autenticado.
- Títulos: Solicitudes y reemplazos.
- Columnas: Fecha y solicitante / Trabajo solicitado / Estado / Documento / Acciones.
- Campos/filtros iniciales: Filtrar solicitudes por estado [select-one,habilitado].
- Acciones iniciales: Solicitar reemplazo; Anterior (deshabilitada); Siguiente (deshabilitada).
- Destinos: No hay enlaces locales en el DOM inicial.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/operations/context →200; GET /api/operations/notifications/stream →200; GET /api/operations/requests?page=1&limit=20 →200.
- Estados registrados: data@1920, form-initial@1920, data@390, error@1920, error@390, empty@1920, empty@390; carga retenida@1920/390 (baseline-loading-chromium.json).
- Foco/teclado: 20 Tab registrados; 2 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 7 combinaciones efectivas; 0 por debajo del mínimo aplicable, 0 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-28-supervisor-1920-data.png) | 0 | No |
| form-initial | 1920 | [imagen](UI-28-supervisor-form.png) | 0 | No |
| data | 390 | [imagen](UI-28-supervisor-390-data.png) | 0 | No |
| error | 1920 | [imagen](UI-28-supervisor-1920-error.png) | 0 | http://127.0.0.1:3109/api/operations/requests* |
| error | 390 | [imagen](UI-28-supervisor-390-error.png) | 0 | http://127.0.0.1:3109/api/operations/requests* |
| empty | 1920 | [imagen](UI-28-supervisor-1920-empty.png) | 0 | http://127.0.0.1:3109/api/operations/requests* |
| empty | 390 | [imagen](UI-28-supervisor-390-empty.png) | 0 | http://127.0.0.1:3109/api/operations/requests* |
| carga retenida | 1920 | [imagen](UI-28-supervisor-1920-loading.png) | — | Lectura retenida,1peticiones |
| carga retenida | 390 | [imagen](UI-28-supervisor-390-loading.png) | — | Lectura retenida,1peticiones |

### Formulario inicial observado

| Campo | Tipo | Obligatorio | Estado | Límites HTML | Opciones |
|---|---|---|---|---|---|
| Filtrar solicitudes por estado | select-one | No | Editable | min—,max—,longitud— | Todos los estados, Pendiente, Aprobada, Rechazada, Cancelada |
| Fecha de trabajo | date | No | Editable | min2026-11-04,max,longitud-1 |  |
| Tipo de solicitud | select-one | No | Editable | min—,max—,longitud— | Reemplazo de mi trabajo, Falta docente en el aula |
| Buscar salón | text | No | Editable | min,max,longitud-1 |  |
| Salón | select-one | No | Editable | min—,max—,longitud— | Selecciona salón, Aula ficticia A, Aula sin partes A |
| Buscar reemplazante compatible | text | No | Editable | min,max,longitud-1 |  |
| Reemplazante propuesto | select-one | No | Editable | min—,max—,longitud— | Selecciona reemplazante |
| Motivo documentado | textarea | No | Editable | min—,max—,longitud4000 |  |
| Evidencias (PDF, JPG o PNG; hasta 5 archivos) | file | No | Editable | min,max,longitud-1 |  |
| Optimizar imágenes para reducir el PDF | checkbox | No | Editable | min,max,longitud-1 |  |

Inicial/foco capturados. Control abierto explícito: validar estados inválido/válido/guardando/error/éxito, payload, resultado persistido y cierre de esta variante; no presentarlos como probados por la captura.

## UI-07 · admin · `/admin/reportes`

- Propietario: `src/features/operations/ReportsPage.tsx`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: capacidad específica del rol, no una autorización de escritura por estar autenticado.
- Títulos: Reportes de seguimiento.
- Columnas: Sin tabla en esta presentación.
- Campos/filtros iniciales: Desde [date,habilitado]; Hasta [date,habilitado]; Reporte Incidencias personales Observaciones de bloques y alumnos Solicitudes y reemplazos Seguimiento de personal [select-one,habilitado].
- Acciones iniciales: Exportar Excel; Anterior (deshabilitada); Siguiente (deshabilitada).
- Destinos: Administrar reemplazos y documentos → /admin/solicitudes; Administrar incidencias e historial → /admin/incidencias.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/operations/context →200; GET /api/admissions/current →200; GET /api/operations/notifications/stream →200; GET /api/operations/reports?from=2026-11-04&to=2026-11-04&type=incidences&page=1&limit=25 →200.
- Estados registrados: data@1920, data@390, error@1920, error@390, empty@1920, empty@390; carga retenida@1920/390 (baseline-loading-chromium.json).
- Foco/teclado: 20 Tab registrados; 1 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 8 combinaciones efectivas; 0 por debajo del mínimo aplicable, 0 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-07-admin-1920-data.png) | 0 | No |
| data | 390 | [imagen](UI-07-admin-390-data.png) | 0 | No |
| error | 1920 | [imagen](UI-07-admin-1920-error.png) | 0 | http://127.0.0.1:3109/api/operations/reports?* |
| error | 390 | [imagen](UI-07-admin-390-error.png) | 0 | http://127.0.0.1:3109/api/operations/reports?* |
| empty | 1920 | [imagen](UI-07-admin-1920-empty.png) | 0 | http://127.0.0.1:3109/api/operations/reports?* |
| empty | 390 | [imagen](UI-07-admin-390-empty.png) | 0 | http://127.0.0.1:3109/api/operations/reports?* |
| carga retenida | 1920 | [imagen](UI-07-admin-1920-loading.png) | — | Lectura retenida,1peticiones |
| carga retenida | 390 | [imagen](UI-07-admin-390-loading.png) | — | Lectura retenida,1peticiones |

## UI-10 · admin · `/admin/configuracion`

- Propietario: `src/features/admin/configuracion/ConfiguracionPage.tsx`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: capacidad específica del rol, no una autorización de escritura por estar autenticado.
- Títulos: Configurar sistema / Modo mantenimiento / Proceso visible / Historial de cambios.
- Columnas: Sin tabla en esta presentación.
- Campos/filtros iniciales: Mensaje para los usuarios [textarea,habilitado]; Finalización estimada (opcional) [datetime-local,habilitado]; Administradores [select-one,habilitado]; Docentes, monitores, supervisores y coordinadores [select-one,habilitado]; Motivo del cambio * [text,habilitado].
- Acciones iniciales: Activar mantenimiento; Descartar (deshabilitada); Guardar configuración (deshabilitada); Restaurar.
- Destinos: No hay enlaces locales en el DOM inicial.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/admissions/current →200; GET /api/system/runtime-config →200; GET /api/system/runtime-config/history?limit=20 →200; GET /api/admissions →200; GET /api/operations/notifications/stream →200; GET /api/system/schemas →200.
- Estados registrados: data@1920, data@390, error@1920, error@390; carga retenida@1920/390 (baseline-loading-chromium.json).
- Foco/teclado: 20 Tab registrados; 1 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 14 combinaciones efectivas; 0 por debajo del mínimo aplicable, 0 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-10-admin-1920-data.png) | 0 | No |
| data | 390 | [imagen](UI-10-admin-390-data.png) | 0 | No |
| error | 1920 | [imagen](UI-10-admin-1920-error.png) | 0 | http://127.0.0.1:3109/api/system/runtime-config |
| error | 390 | [imagen](UI-10-admin-390-error.png) | 0 | http://127.0.0.1:3109/api/system/runtime-config |
| carga retenida | 1920 | [imagen](UI-10-admin-1920-loading.png) | — | Lectura retenida,1peticiones |
| carga retenida | 390 | [imagen](UI-10-admin-390-loading.png) | — | Lectura retenida,1peticiones |

## UI-21 · teacher · `/docente`

- Propietario: `src/features/docente/DocentePanel.tsx + AvailabilityWorkbookPanel.tsx`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: capacidad específica del rol, no una autorización de escritura por estar autenticado.
- Títulos: Sin heading semántico en el estado recibido; no se inventa uno en la ficha.
- Columnas: Sin tabla en esta presentación.
- Campos/filtros iniciales: No hay campos en el DOM inicial.
- Acciones iniciales: Disponibilidad en Excel; Semana; Por día; Mis salones.
- Destinos: Solicitar reemplazo → /docente/solicitudes.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/operations/context →200; GET /api/hour-sessions →200; GET /api/classes/getClassOfTeacher →200; GET /api/operations/notifications/stream →200; GET /api/operations/notifications?page=1&limit=20 →200.
- Estados registrados: data@1920, form-initial@1920, data@390, error@1920, error@390, empty@1920, empty@390; carga retenida@1920/390 (baseline-loading-chromium.json).
- Foco/teclado: 20 Tab registrados; 1 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 15 combinaciones efectivas; 0 por debajo del mínimo aplicable, 1 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-21-teacher-1920-data.png) | 0 | No |
| form-initial | 1920 | [imagen](UI-21-teacher-form.png) | 0 | No |
| data | 390 | [imagen](UI-21-teacher-390-data.png) | 0 | No |
| error | 1920 | [imagen](UI-21-teacher-1920-error.png) | 0 | http://127.0.0.1:3109/api/classes/getClassOfTeacher |
| error | 390 | [imagen](UI-21-teacher-390-error.png) | 0 | http://127.0.0.1:3109/api/classes/getClassOfTeacher |
| empty | 1920 | [imagen](UI-21-teacher-1920-empty.png) | 0 | http://127.0.0.1:3109/api/classes/getClassOfTeacher |
| empty | 390 | [imagen](UI-21-teacher-390-empty.png) | 0 | http://127.0.0.1:3109/api/classes/getClassOfTeacher |
| carga retenida | 1920 | [imagen](UI-21-teacher-1920-loading.png) | — | Lectura retenida,1peticiones |
| carga retenida | 390 | [imagen](UI-21-teacher-390-loading.png) | — | Lectura retenida,1peticiones |

### Formulario inicial observado

| Campo | Tipo | Obligatorio | Estado | Límites HTML | Opciones |
|---|---|---|---|---|---|
| Cargar Excel | file | No | Editable | min,max,longitud-1 |  |

Inicial/foco capturados. Control abierto explícito: validar estados inválido/válido/guardando/error/éxito, payload, resultado persistido y cierre de esta variante; no presentarlos como probados por la captura.

## UI-29 · supervisor · `/supervisor/incidencias`

- Propietario: `src/features/incidencias/IncidencesPage.tsx + IncidencesPanel.tsx`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: capacidad específica del rol, no una autorización de escritura por estar autenticado.
- Títulos: Incidencias e historial / Incidencias de monitores.
- Columnas: Persona / DNI / Proceso y fecha / Incidencia / Estado / .
- Campos/filtros iniciales: No hay campos en el DOM inicial.
- Acciones iniciales: Registrar incidencia; Anterior (deshabilitada); Siguiente (deshabilitada).
- Destinos: Volver al panel → /supervisor.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/class-session-records/context →200; GET /api/operations/notifications/stream →200; GET /api/incidences?page=1 →200.
- Estados registrados: data@1920, form-initial@1920, data@390, error@1920, error@390, empty@1920, empty@390; carga retenida@1920/390 (baseline-loading-chromium.json).
- Foco/teclado: 20 Tab registrados; 2 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 9 combinaciones efectivas; 0 por debajo del mínimo aplicable, 0 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-29-supervisor-1920-data.png) | 0 | No |
| form-initial | 1920 | [imagen](UI-29-supervisor-form.png) | 0 | No |
| data | 390 | [imagen](UI-29-supervisor-390-data.png) | 0 | No |
| error | 1920 | [imagen](UI-29-supervisor-1920-error.png) | 0 | http://127.0.0.1:3109/api/incidences?* |
| error | 390 | [imagen](UI-29-supervisor-390-error.png) | 0 | http://127.0.0.1:3109/api/incidences?* |
| empty | 1920 | [imagen](UI-29-supervisor-1920-empty.png) | 0 | http://127.0.0.1:3109/api/incidences?* |
| empty | 390 | [imagen](UI-29-supervisor-390-empty.png) | 0 | http://127.0.0.1:3109/api/incidences?* |
| carga retenida | 1920 | [imagen](UI-29-supervisor-1920-loading.png) | — | Lectura retenida,1peticiones |
| carga retenida | 390 | [imagen](UI-29-supervisor-390-loading.png) | — | Lectura retenida,1peticiones |

### Formulario inicial observado

| Campo | Tipo | Obligatorio | Estado | Límites HTML | Opciones |
|---|---|---|---|---|---|
| Persona reportada Monitor | select-one | No | Editable | min—,max—,longitud— | Monitor |
| Buscar persona por nombre o DNI | text | No | Editable | min,max,longitud-1 |  |
| Seleccionar persona Selecciona una persona con DNI otherMonitor Prueba A · 92000002 monitor Prueba A · 92000001 | select-one | No | Editable | min—,max—,longitud— | Selecciona una persona con DNI, otherMonitor Prueba A · 92000002, monitor Prueba A · 92000001 |
| Título | text | No | Editable | min,max,longitud120 |  |
| Hora en que ocurrió | datetime-local | No | Editable | min,max,longitud-1 |  |
| Observaciones | textarea | No | Editable | min—,max—,longitud4000 |  |

Inicial/foco capturados. Control abierto explícito: validar estados inválido/válido/guardando/error/éxito, payload, resultado persistido y cierre de esta variante; no presentarlos como probados por la captura.

## UI-30 · coordinator · `/coordinador/docentes`

- Propietario: `src/features/admin/docentes/DocentesPage.tsx (readOnly general)`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: solo lectura de su ámbito; pruebas negativas separadas en baseline-scope-chromium.json.
- Títulos: Docentes.
- Columnas: Incidencia / Docente / Curso / Dedicación / Horas / Acciones.
- Campos/filtros iniciales: Buscar docente [search,habilitado]; Curso [select-one,habilitado]; Filas por página [select-one,habilitado].
- Acciones iniciales: Horario; Horario; Horario; Página anterior (deshabilitada); Página 1; Página siguiente (deshabilitada).
- Destinos: No hay enlaces locales en el DOM inicial.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/courses →200; GET /api/teachers?page=1&limit=10 →200; GET /api/operations/notifications/stream →200.
- Estados registrados: data@1920, data@390, error@1920, error@390, empty@1920, empty@390; carga retenida@1920/390 (baseline-loading-chromium.json).
- Foco/teclado: 20 Tab registrados; 1 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 11 combinaciones efectivas; 0 por debajo del mínimo aplicable, 0 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-30-coordinator-1920-data.png) | 0 | No |
| data | 390 | [imagen](UI-30-coordinator-390-data.png) | 0 | No |
| error | 1920 | [imagen](UI-30-coordinator-1920-error.png) | 0 | http://127.0.0.1:3109/api/teachers?* |
| error | 390 | [imagen](UI-30-coordinator-390-error.png) | 0 | http://127.0.0.1:3109/api/teachers?* |
| empty | 1920 | [imagen](UI-30-coordinator-1920-empty.png) | 0 | http://127.0.0.1:3109/api/teachers?* |
| empty | 390 | [imagen](UI-30-coordinator-390-empty.png) | 0 | http://127.0.0.1:3109/api/teachers?* |
| carga retenida | 1920 | [imagen](UI-30-coordinator-1920-loading.png) | — | Lectura retenida,1peticiones |
| carga retenida | 390 | [imagen](UI-30-coordinator-390-loading.png) | — | Lectura retenida,1peticiones |

## UI-31 · courseCoordinator · `/coordinador/docentes`

- Propietario: `src/features/admin/docentes/DocentesPage.tsx (readOnly curso)`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: solo lectura de su ámbito; pruebas negativas separadas en baseline-scope-chromium.json.
- Títulos: Docentes.
- Columnas: Incidencia / Docente / Curso / Dedicación / Horas / Acciones.
- Campos/filtros iniciales: Buscar docente [search,habilitado]; Filas por página [select-one,habilitado].
- Acciones iniciales: Horario; Horario; Página anterior (deshabilitada); Página 1; Página siguiente (deshabilitada).
- Destinos: No hay enlaces locales en el DOM inicial.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/courses →200; GET /api/teachers?page=1&limit=10 →200; GET /api/operations/notifications/stream →200.
- Estados registrados: data@1920, data@390, error@1920, error@390, empty@1920, empty@390; carga retenida@1920/390 (baseline-loading-chromium.json).
- Foco/teclado: 20 Tab registrados; 0 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 11 combinaciones efectivas; 0 por debajo del mínimo aplicable, 0 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-31-courseCoordinator-1920-data.png) | 0 | No |
| data | 390 | [imagen](UI-31-courseCoordinator-390-data.png) | 0 | No |
| error | 1920 | [imagen](UI-31-courseCoordinator-1920-error.png) | 0 | http://127.0.0.1:3109/api/teachers?* |
| error | 390 | [imagen](UI-31-courseCoordinator-390-error.png) | 0 | http://127.0.0.1:3109/api/teachers?* |
| empty | 1920 | [imagen](UI-31-courseCoordinator-1920-empty.png) | 0 | http://127.0.0.1:3109/api/teachers?* |
| empty | 390 | [imagen](UI-31-courseCoordinator-390-empty.png) | 0 | http://127.0.0.1:3109/api/teachers?* |
| carga retenida | 1920 | [imagen](UI-31-courseCoordinator-1920-loading.png) | — | Lectura retenida,1peticiones |
| carga retenida | 390 | [imagen](UI-31-courseCoordinator-390-loading.png) | — | Lectura retenida,1peticiones |

## UI-32 · coordinator · `/coordinador/docentes/47d1fa83-0474-4087-88c5-7a8a79347c68/horario`

- Propietario: `src/features/admin/docentes/HorarioDocentePage.tsx (readOnly)`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: solo lectura de su ámbito; pruebas negativas separadas en baseline-scope-chromium.json.
- Títulos: Horario de Prueba A, teacher / Horario semanal / Salones y enlaces.
- Columnas: Sin tabla en esta presentación.
- Campos/filtros iniciales: No hay campos en el DOM inicial.
- Acciones iniciales: Volver; Semana; Por día.
- Destinos: No hay enlaces locales en el DOM inicial.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/teachers/47d1fa83-0474-4087-88c5-7a8a79347c68 →200; GET /api/courses →200; GET /api/hour-sessions →200; GET /api/operations/notifications/stream →200; GET /api/teachers/47d1fa83-0474-4087-88c5-7a8a79347c68/schedules →200.
- Estados registrados: data@1920, data@390, error@1920, error@390, empty@1920, empty@390; carga retenida@1920/390 (baseline-loading-chromium.json).
- Foco/teclado: 20 Tab registrados; 2 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 14 combinaciones efectivas; 0 por debajo del mínimo aplicable, 1 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-32-coordinator-1920-data.png) | 0 | No |
| data | 390 | [imagen](UI-32-coordinator-390-data.png) | 0 | No |
| error | 1920 | [imagen](UI-32-coordinator-1920-error.png) | 0 | http://127.0.0.1:3109/api/teachers/47d1fa83-0474-4087-88c5-7a8a79347c68/schedules |
| error | 390 | [imagen](UI-32-coordinator-390-error.png) | 0 | http://127.0.0.1:3109/api/teachers/47d1fa83-0474-4087-88c5-7a8a79347c68/schedules |
| empty | 1920 | [imagen](UI-32-coordinator-1920-empty.png) | 0 | http://127.0.0.1:3109/api/teachers/47d1fa83-0474-4087-88c5-7a8a79347c68/schedules |
| empty | 390 | [imagen](UI-32-coordinator-390-empty.png) | 0 | http://127.0.0.1:3109/api/teachers/47d1fa83-0474-4087-88c5-7a8a79347c68/schedules |
| carga retenida | 1920 | [imagen](UI-32-coordinator-1920-loading.png) | — | Lectura retenida,1peticiones |
| carga retenida | 390 | [imagen](UI-32-coordinator-390-loading.png) | — | Lectura retenida,1peticiones |

## UI-32 · courseCoordinator · `/coordinador/docentes/47d1fa83-0474-4087-88c5-7a8a79347c68/horario`

- Propietario: `src/features/admin/docentes/HorarioDocentePage.tsx (readOnly)`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: solo lectura de su ámbito; pruebas negativas separadas en baseline-scope-chromium.json.
- Títulos: Horario de Prueba A, teacher / Horario semanal / Salones y enlaces.
- Columnas: Sin tabla en esta presentación.
- Campos/filtros iniciales: No hay campos en el DOM inicial.
- Acciones iniciales: Volver; Semana; Por día.
- Destinos: No hay enlaces locales en el DOM inicial.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/teachers/47d1fa83-0474-4087-88c5-7a8a79347c68 →200; GET /api/hour-sessions →200; GET /api/courses →200; GET /api/teachers/47d1fa83-0474-4087-88c5-7a8a79347c68/schedules →200; GET /api/operations/notifications/stream →200.
- Estados registrados: data@1920, data@390, error@1920, error@390, empty@1920, empty@390; carga retenida@1920/390 (baseline-loading-chromium.json).
- Foco/teclado: 20 Tab registrados; 2 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 14 combinaciones efectivas; 0 por debajo del mínimo aplicable, 1 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-32-courseCoordinator-1920-data.png) | 0 | No |
| data | 390 | [imagen](UI-32-courseCoordinator-390-data.png) | 0 | No |
| error | 1920 | [imagen](UI-32-courseCoordinator-1920-error.png) | 0 | http://127.0.0.1:3109/api/teachers/47d1fa83-0474-4087-88c5-7a8a79347c68/schedules |
| error | 390 | [imagen](UI-32-courseCoordinator-390-error.png) | 0 | http://127.0.0.1:3109/api/teachers/47d1fa83-0474-4087-88c5-7a8a79347c68/schedules |
| empty | 1920 | [imagen](UI-32-courseCoordinator-1920-empty.png) | 0 | http://127.0.0.1:3109/api/teachers/47d1fa83-0474-4087-88c5-7a8a79347c68/schedules |
| empty | 390 | [imagen](UI-32-courseCoordinator-390-empty.png) | 0 | http://127.0.0.1:3109/api/teachers/47d1fa83-0474-4087-88c5-7a8a79347c68/schedules |
| carga retenida | 1920 | [imagen](UI-32-courseCoordinator-1920-loading.png) | — | Lectura retenida,1peticiones |
| carga retenida | 390 | [imagen](UI-32-courseCoordinator-390-loading.png) | — | Lectura retenida,1peticiones |

## UI-33 · coordinator · `/coordinador/salones`

- Propietario: `src/features/admin/salones/SalonesPage.tsx (readOnly general)`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: solo lectura de su ámbito; pruebas negativas separadas en baseline-scope-chromium.json.
- Títulos: Salones.
- Columnas: Sin tabla en esta presentación.
- Campos/filtros iniciales: Buscar salón [search,habilitado]; Estado [select-one,habilitado].
- Acciones iniciales: Tarjetas; Tabla; Todas; Area; Shift 08:00 – 23:59 · 3 salones 3 con docentes faltantes.
- Destinos: Aula → /coordinador/salones/1b4fab76-34d8-4e7c-8b28-90ac3d307508; Aula → /coordinador/salones/8d838af7-7db1-4fc0-aa8c-eade1f6c5b1d; Aula → /coordinador/salones/a7641977-62c9-4796-8181-9b75230c02b1.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/areas →200; GET /api/courses →200; GET /api/classes →200; GET /api/shifts →200; GET /api/operations/notifications/stream →200.
- Estados registrados: data@1920, data@390, error@1920, error@390, empty@1920, empty@390; carga retenida@1920/390 (baseline-loading-chromium.json).
- Foco/teclado: 20 Tab registrados; 0 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 13 combinaciones efectivas; 0 por debajo del mínimo aplicable, 0 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-33-coordinator-1920-data.png) | 0 | No |
| data | 390 | [imagen](UI-33-coordinator-390-data.png) | 0 | No |
| error | 1920 | [imagen](UI-33-coordinator-1920-error.png) | 0 | http://127.0.0.1:3109/api/classes |
| error | 390 | [imagen](UI-33-coordinator-390-error.png) | 0 | http://127.0.0.1:3109/api/classes |
| empty | 1920 | [imagen](UI-33-coordinator-1920-empty.png) | 0 | http://127.0.0.1:3109/api/classes |
| empty | 390 | [imagen](UI-33-coordinator-390-empty.png) | 0 | http://127.0.0.1:3109/api/classes |
| carga retenida | 1920 | [imagen](UI-33-coordinator-1920-loading.png) | — | Lectura retenida,1peticiones |
| carga retenida | 390 | [imagen](UI-33-coordinator-390-loading.png) | — | Lectura retenida,1peticiones |

## UI-34 · courseCoordinator · `/coordinador/salones`

- Propietario: `src/features/admin/salones/SalonesPage.tsx (readOnly curso)`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: solo lectura de su ámbito; pruebas negativas separadas en baseline-scope-chromium.json.
- Títulos: Salones.
- Columnas: Sin tabla en esta presentación.
- Campos/filtros iniciales: Buscar salón [search,habilitado]; Estado [select-one,habilitado].
- Acciones iniciales: Tarjetas; Tabla; Todas; Area; Shift 08:00 – 23:59 · 2 salones 2 con docentes faltantes.
- Destinos: No hay enlaces locales en el DOM inicial.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/areas →200; GET /api/shifts →200; GET /api/courses →200; GET /api/classes →200; GET /api/operations/notifications/stream →200.
- Estados registrados: data@1920, data@390, error@1920, error@390, empty@1920, empty@390; carga retenida@1920/390 (baseline-loading-chromium.json).
- Foco/teclado: 20 Tab registrados; 1 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 13 combinaciones efectivas; 0 por debajo del mínimo aplicable, 0 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-34-courseCoordinator-1920-data.png) | 0 | No |
| data | 390 | [imagen](UI-34-courseCoordinator-390-data.png) | 0 | No |
| error | 1920 | [imagen](UI-34-courseCoordinator-1920-error.png) | 0 | http://127.0.0.1:3109/api/classes |
| error | 390 | [imagen](UI-34-courseCoordinator-390-error.png) | 0 | http://127.0.0.1:3109/api/classes |
| empty | 1920 | [imagen](UI-34-courseCoordinator-1920-empty.png) | 0 | http://127.0.0.1:3109/api/classes |
| empty | 390 | [imagen](UI-34-courseCoordinator-390-empty.png) | 0 | http://127.0.0.1:3109/api/classes |
| carga retenida | 1920 | [imagen](UI-34-courseCoordinator-1920-loading.png) | — | Lectura retenida,1peticiones |
| carga retenida | 390 | [imagen](UI-34-courseCoordinator-390-loading.png) | — | Lectura retenida,1peticiones |

## UI-35 · coordinator · `/coordinador/salones/8d838af7-7db1-4fc0-aa8c-eade1f6c5b1d`

- Propietario: `src/features/admin/salones/SalonDetallePage.tsx (readOnly)`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: solo lectura de su ámbito; pruebas negativas separadas en baseline-scope-chromium.json.
- Títulos: AulaAreaCompleto / Horario semanal / Docentes por curso.
- Columnas: Sin tabla en esta presentación.
- Campos/filtros iniciales: No hay campos en el DOM inicial.
- Acciones iniciales: Volver a salones; Semana; Por día.
- Destinos: No hay enlaces locales en el DOM inicial.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/courses →200; GET /api/classes/8d838af7-7db1-4fc0-aa8c-eade1f6c5b1d/schedules →200; GET /api/classes →200; GET /api/classes/8d838af7-7db1-4fc0-aa8c-eade1f6c5b1d/teachers →200; GET /api/hour-sessions →200; GET /api/operations/notifications/stream →200.
- Estados registrados: data@1920, data@390, error@1920, error@390, empty@1920, empty@390; carga retenida@1920/390 (baseline-loading-chromium.json).
- Foco/teclado: 20 Tab registrados; 2 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 16 combinaciones efectivas; 0 por debajo del mínimo aplicable, 1 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-35-coordinator-1920-data.png) | 0 | No |
| data | 390 | [imagen](UI-35-coordinator-390-data.png) | 0 | No |
| error | 1920 | [imagen](UI-35-coordinator-1920-error.png) | 0 | http://127.0.0.1:3109/api/classes/8d838af7-7db1-4fc0-aa8c-eade1f6c5b1d/schedules |
| error | 390 | [imagen](UI-35-coordinator-390-error.png) | 0 | http://127.0.0.1:3109/api/classes/8d838af7-7db1-4fc0-aa8c-eade1f6c5b1d/schedules |
| empty | 1920 | [imagen](UI-35-coordinator-1920-empty.png) | 0 | http://127.0.0.1:3109/api/classes/8d838af7-7db1-4fc0-aa8c-eade1f6c5b1d/schedules |
| empty | 390 | [imagen](UI-35-coordinator-390-empty.png) | 0 | http://127.0.0.1:3109/api/classes/8d838af7-7db1-4fc0-aa8c-eade1f6c5b1d/schedules |
| carga retenida | 1920 | [imagen](UI-35-coordinator-1920-loading.png) | — | Lectura retenida,1peticiones |
| carga retenida | 390 | [imagen](UI-35-coordinator-390-loading.png) | — | Lectura retenida,1peticiones |

## UI-35 · courseCoordinator · `/coordinador/salones/8d838af7-7db1-4fc0-aa8c-eade1f6c5b1d`

- Propietario: `src/features/admin/salones/SalonDetallePage.tsx (readOnly)`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: solo lectura de su ámbito; pruebas negativas separadas en baseline-scope-chromium.json.
- Títulos: AulaAreaCompleto / Horario semanal / Docentes por curso.
- Columnas: Sin tabla en esta presentación.
- Campos/filtros iniciales: No hay campos en el DOM inicial.
- Acciones iniciales: Volver a salones; Semana; Por día.
- Destinos: No hay enlaces locales en el DOM inicial.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200; GET /api/classes/8d838af7-7db1-4fc0-aa8c-eade1f6c5b1d/schedules →200; GET /api/classes →200; GET /api/classes/8d838af7-7db1-4fc0-aa8c-eade1f6c5b1d/teachers →200; GET /api/courses →200; GET /api/hour-sessions →200; GET /api/operations/notifications/stream →200.
- Estados registrados: data@1920, data@390, error@1920, error@390, empty@1920, empty@390; carga retenida@1920/390 (baseline-loading-chromium.json).
- Foco/teclado: 20 Tab registrados; 1 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 16 combinaciones efectivas; 0 por debajo del mínimo aplicable, 1 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-35-courseCoordinator-1920-data.png) | 0 | No |
| data | 390 | [imagen](UI-35-courseCoordinator-390-data.png) | 0 | No |
| error | 1920 | [imagen](UI-35-courseCoordinator-1920-error.png) | 0 | http://127.0.0.1:3109/api/classes/8d838af7-7db1-4fc0-aa8c-eade1f6c5b1d/schedules |
| error | 390 | [imagen](UI-35-courseCoordinator-390-error.png) | 0 | http://127.0.0.1:3109/api/classes/8d838af7-7db1-4fc0-aa8c-eade1f6c5b1d/schedules |
| empty | 1920 | [imagen](UI-35-courseCoordinator-1920-empty.png) | 0 | http://127.0.0.1:3109/api/classes/8d838af7-7db1-4fc0-aa8c-eade1f6c5b1d/schedules |
| empty | 390 | [imagen](UI-35-courseCoordinator-390-empty.png) | 0 | http://127.0.0.1:3109/api/classes/8d838af7-7db1-4fc0-aa8c-eade1f6c5b1d/schedules |
| carga retenida | 1920 | [imagen](UI-35-courseCoordinator-1920-loading.png) | — | Lectura retenida,1peticiones |
| carga retenida | 390 | [imagen](UI-35-courseCoordinator-390-loading.png) | — | Lectura retenida,1peticiones |

## UI-02 · admin · `/admin/ruta-inexistente`

- Propietario: `src/app/NotFoundPage.tsx + app/RouteError.tsx`. Fixture: `sr_ed1a76a016e6430091b64a1dc8d97169_a`.
- Acceso: capacidad específica del rol, no una autorización de escritura por estar autenticado.
- Títulos: Sin heading semántico en el estado recibido; no se inventa uno en la ficha.
- Columnas: Sin tabla en esta presentación.
- Campos/filtros iniciales: No hay campos en el DOM inicial.
- Acciones iniciales: No hay botones locales en el DOM inicial.
- Destinos: No hay enlaces locales en el DOM inicial.
- HTTP real observado: GET /api/system/status →200; GET /api/auth/user-info →200.
- Estados registrados: data@1920, data@390; no hay consulta primaria retenida en esta ruta; controles globales/asistente/Partes requieren su recorrido específico.
- Foco/teclado: 20 Tab registrados; 0 posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02.
- Colores: 3 combinaciones efectivas; 0 por debajo del mínimo aplicable, 0 requieren comprobación visual por imagen/opacity. No equivale a certificación integral.
- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.
- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).
- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).

| Estado | Ancho | Captura | Error JS | HTTP inyectado |
|---|---:|---|---:|---|
| data | 1920 | [imagen](UI-02-admin-1920-data.png) | 0 | No |
| data | 390 | [imagen](UI-02-admin-390-data.png) | 0 | No |

## Puertas abiertas de E3

1. Ciclo completo de formularios/overlays y tarea por variante (no solo apertura); estados del generador/importador/acceso y filtros secundarios.
2. Revisión visual individual de todas las capturas, contraste/foco detectados y teclado completo de los overlays.
3. Latencias por ruta/interacción con muestras comparables y grafo de JS/CSS; tamaño baseline del build no sustituye latencia.
4. Zoom200 real, motores adicionales y lector: BLQ-01/02, no aprobados.
5. El estado permanece en08-PROGRESO; esta ficha no autoriza cerrar E3 ni declarar entrega integral.
