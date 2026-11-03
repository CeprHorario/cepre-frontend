# Línea base H2 — rutas y estados capturados
Generado: 2026-11-03T13:17:47.903Z. Fixtures sintéticos del harness. Chromium a 1920×1080,
compilado servido en 127.0.0.1:5174. Una captura no acredita por sí sola todos
los estados ni accesibilidad; completa el inventario, no lo sustituye.
Rutas capturadas: **32**. Resultado: correcto.
Errores HTTP inesperados: 0.
## Fichas resumidas
### UI-01 · public · `/` — Inicio de sesión
![Captura](baseline/UI-01-public.png)
- Título: Sistema de horarios académicos
- Secciones: Iniciar sesión
- Campos: 0; filas: 0; desbordamiento horizontal: no.
- Móvil 390 px: sin desbordamiento.
- Acciones: Continuar con Google
- Enlaces: ceprunsa@unsa.edu.pe
- Columnas: —
- HTTP: 401 /api/auth/user-info
### UI-03 · admin · `/admin` — Panel administrativo
![Captura](baseline/UI-03-admin.png)
- Título: sr_9afdf302a3104ce5b7a4f7e71b0cd467_a
- Secciones: ⚠ Incidencias pendientes · 46 · Pendientes del proceso · Salones por turno
- Campos: 0; filas: 0; desbordamiento horizontal: no.
- Móvil 390 px: sin desbordamiento.
- Acciones: Notificaciones: 1 pendientes · AF
- Enlaces: Ir al inicio · Revisar solicitudes · Ver incidencias e historial · Partes diariosRegistro, seguimiento, reemplazos y reportes del proceso. · Generar procesoCrea un proceso de admisión con turnos, salones y horarios automáticos. · Gestionar datosUsuarios, salones y cursos del proceso actual. · Docentes 2 · Monitores 2 · Salones 2 · Cursos 1 · Supervisores 2 · Coordinadores 1
- Columnas: —
### UI-04 · admin · `/admin/partes` — Partes administrativo
![Captura](baseline/UI-04-admin.png)
- Título: Parte diario
- Secciones: PARTE DIARIO DE CLASES
- Campos: 16; filas: 6; desbordamiento horizontal: no.
- Móvil 390 px: sin desbordamiento.
- Acciones: Notificaciones: 1 pendientes · AF · Actualizar · Ver reporte · Registrar reemplazo / emergencia · Resolver cobertura · Anular partes · Restaurar partes · Crear recuperación · Configuración operativa · Curso ficticio · Ver captura de inicio del parte #1: pendiente · Ver captura de fin del parte #1: pendiente · Editar
- Enlaces: Ir al inicio · Inicio · Volver al panel
- Columnas: HORAS PROGRAMADAS · CONTROL DE HORAS · CONTROL DEL PROFESOR · CAPTURAS DE PANTALLA · Acciones · N.º · Hora inicio · Hora fin · Inicio de clase · Fin de clase · Curso · Profesor oficial · Estado · Profesor reemplazante · Observaciones · Inicio de clase · Fin de clase
### UI-05 · admin · `/admin/solicitudes` — Solicitudes administrativo
![Captura](baseline/UI-05-admin.png)
- Título: Solicitudes y reemplazos
- Secciones: —
- Campos: 1; filas: 0; desbordamiento horizontal: no.
- Móvil 390 px: desborda.
- Acciones: Notificaciones: 1 pendientes · AF · Anterior · Siguiente
- Enlaces: Ir al inicio · Panel · Incidencias e historial
- Columnas: Fecha y solicitante · Trabajo solicitado · Estado · Documento · Acciones
### UI-06 · admin · `/admin/incidencias` — Incidencias administrativo
![Captura](baseline/UI-06-admin.png)
- Título: Incidencias e historial
- Secciones: Incidencias e historial por persona
- Campos: 1; filas: 25; desbordamiento horizontal: no.
- Móvil 390 px: sin desbordamiento.
- Acciones: Notificaciones: 1 pendientes · AF · Registrar incidencia · Buscar historial · Resolver · Historial · Reabrir · Historial · Resolver · Historial · Resolver · Historial · Resolver · Historial
- Enlaces: Ir al inicio · Panel · Volver al panel
- Columnas: Persona / DNI · Proceso y fecha · Incidencia · Estado
### UI-07 · admin · `/admin/reportes` — Reportes
![Captura](baseline/UI-07-admin.png)
- Título: Reportes de seguimiento
- Secciones: —
- Campos: 3; filas: 0; desbordamiento horizontal: no.
- Móvil 390 px: sin desbordamiento.
- Acciones: Notificaciones: 1 pendientes · AF · Exportar Excel · Anterior · Siguiente
- Enlaces: Ir al inicio · Panel · Administrar reemplazos y documentos · Administrar incidencias e historial
- Columnas: —
### UI-08 · admin · `/admin/generar` — Generar proceso
![Captura](baseline/UI-08-admin.png)
- Título: Datos del proceso
- Secciones: —
- Campos: 6; filas: 0; desbordamiento horizontal: no.
- Móvil 390 px: sin desbordamiento.
- Acciones: Notificaciones: 1 pendientes · AF · 1Datos del proceso · 2Turnos · 3Salones por área · 4Revisar y crear · Cancelar · Continuar
- Enlaces: Ir al inicio · Menú principal
- Columnas: —
### UI-09 · admin · `/admin/importar` — Importar
![Captura](baseline/UI-09-admin.png)
- Título: Importar archivos
- Secciones: Registrar docentes
- Campos: 1; filas: 10; desbordamiento horizontal: no.
- Móvil 390 px: sin desbordamiento.
- Acciones: Notificaciones: 1 pendientes · AF · Docentes · Monitores · Supervisores · Descargar plantilla Excel · Seleccionar archivo · Arrastrar o seleccionar archivo para importar
- Enlaces: Ir al inicio · Menú principal
- Columnas: Cabecera exacta · Valor · Formato · Ejemplo · Descripción
### UI-10 · admin · `/admin/configuracion` — Configuración
![Captura](baseline/UI-10-admin.png)
- Título: Configurar sistema
- Secciones: Modo mantenimiento · Proceso visible · Historial de cambios
- Campos: 5; filas: 0; desbordamiento horizontal: no.
- Móvil 390 px: sin desbordamiento.
- Acciones: Notificaciones: 1 pendientes · AF · Activar mantenimiento · Descartar · Guardar configuración · Restaurar
- Enlaces: Ir al inicio · Menú principal
- Columnas: —
### UI-11 · admin · `/admin/gestionar/docentes` — Docentes
![Captura](baseline/UI-11-admin.png)
- Título: Docentes
- Secciones: —
- Campos: 3; filas: 2; desbordamiento horizontal: no.
- Móvil 390 px: desborda.
- Acciones: Abrir menú · Notificaciones: 1 pendientes · AF · Usuarios · Académico · Contraer menú · Exportar Excel · Agregar docente · Seleccionar · Registrar incidencia · Asignar salones · Ver horario · Editar datos · Eliminar
- Enlaces: Ir al inicio · Menú principal · Menú principal · Docentes2 · Monitores2 · Supervisores2 · Coordinadores1 · Salones2 · Cursos1
- Columnas: Incidencia · Docente · Curso · Dedicación · Horas · Acciones
### UI-12 · admin · `/admin/gestionar/docentes/2abf057f-d023-45c4-8c93-8757a66183f5/asignar` — Asignar salones
![Captura](baseline/UI-12-admin.png)
- Título: Prueba A, teacher
- Secciones: Disponibilidad · Salones compatibles · Salones asignados
- Campos: 1; filas: 0; desbordamiento horizontal: no.
- Móvil 390 px: desborda.
- Acciones: Abrir menú · Notificaciones: 1 pendientes · AF · Usuarios · Académico · Contraer menú · Volver a docentes · Disponibilidad en Excel · Editar disponibilidad · Shift · 08:00–13:40 · Seleccionar · Quitar todas las asignaciones · Quitar Aula ficticia A
- Enlaces: Ir al inicio · Menú principal · Menú principal · Docentes2 · Monitores2 · Supervisores2 · Coordinadores1 · Salones2 · Cursos1
- Columnas: —
### UI-13 · admin · `/admin/gestionar/docentes/2abf057f-d023-45c4-8c93-8757a66183f5/horario` — Horario docente
![Captura](baseline/UI-13-admin.png)
- Título: Horario de Prueba A, teacher
- Secciones: Horario semanal · Salones y enlaces
- Campos: 0; filas: 0; desbordamiento horizontal: no.
- Móvil 390 px: sin desbordamiento.
- Acciones: Abrir menú · Notificaciones: 1 pendientes · AF · Usuarios · Académico · Contraer menú · Volver · Asignar salones · Semana · Por día · Quitar
- Enlaces: Ir al inicio · Menú principal · Menú principal · Docentes2 · Monitores2 · Supervisores2 · Coordinadores1 · Salones2 · Cursos1
- Columnas: —
### UI-14 · admin · `/admin/gestionar/monitores` — Monitores
![Captura](baseline/UI-14-admin.png)
- Título: Monitores
- Secciones: —
- Campos: 4; filas: 2; desbordamiento horizontal: no.
- Móvil 390 px: desborda.
- Acciones: Abrir menú · Notificaciones: 1 pendientes · AF · Usuarios · Académico · Contraer menú · Agregar monitor · Seleccionar · Registrar incidencia · DNI 92000001: tiene 19 incidencias. Ver historial · Editar datos · Eliminar · Registrar incidencia · Editar datos
- Enlaces: Ir al inicio · Menú principal · Menú principal · Docentes2 · Monitores2 · Supervisores2 · Coordinadores1 · Salones2 · Cursos1
- Columnas: Incidencia · DNI · Salón · Monitor · Correo de acceso · Celular · Turno · Acciones
### UI-15 · admin · `/admin/gestionar/supervisores` — Supervisores
![Captura](baseline/UI-15-admin.png)
- Título: Supervisores
- Secciones: —
- Campos: 1; filas: 2; desbordamiento horizontal: no.
- Móvil 390 px: desborda.
- Acciones: Abrir menú · Notificaciones: 1 pendientes · AF · Usuarios · Académico · Contraer menú · Agregar supervisor · Seleccionar · Registrar incidencia · Monitores · Editar datos · Eliminar · Registrar incidencia · Monitores
- Enlaces: Ir al inicio · Menú principal · Menú principal · Docentes2 · Monitores2 · Supervisores2 · Coordinadores1 · Salones2 · Cursos1
- Columnas: Incidencia · Supervisor · Celular · Turno · Acciones
### UI-16 · admin · `/admin/gestionar/supervisores/dc0d1977-4ac1-40af-a005-66e2a5951441/monitores` — Monitores del supervisor
![Captura](baseline/UI-16-admin.png)
- Título: Monitores de Prueba A, supervisor
- Secciones: Asignados · Disponibles
- Campos: 1; filas: 0; desbordamiento horizontal: no.
- Móvil 390 px: sin desbordamiento.
- Acciones: Abrir menú · Notificaciones: 1 pendientes · AF · Usuarios · Académico · Contraer menú · Volver a supervisores · Quitar · Quitar
- Enlaces: Ir al inicio · Menú principal · Menú principal · Docentes2 · Monitores2 · Supervisores2 · Coordinadores1 · Salones2 · Cursos1
- Columnas: —
### UI-17 · admin · `/admin/gestionar/coordinadores` — Coordinadores
![Captura](baseline/UI-17-admin.png)
- Título: Coordinadores
- Secciones: —
- Campos: 0; filas: 1; desbordamiento horizontal: no.
- Móvil 390 px: desborda.
- Acciones: Abrir menú · Notificaciones: 1 pendientes · AF · Usuarios · Académico · Contraer menú · Agregar coordinador · Seleccionar · Registrar incidencia · Editar datos · Eliminar · Página anterior · Página 1 · Página siguiente
- Enlaces: Ir al inicio · Menú principal · Menú principal · Docentes2 · Monitores2 · Supervisores2 · Coordinadores1 · Salones2 · Cursos1
- Columnas: Incidencia · Coordinador · Alcance · DNI · Celular · Acciones
### UI-18 · admin · `/admin/gestionar/salones` — Salones
![Captura](baseline/UI-18-admin.png)
- Título: Salones
- Secciones: —
- Campos: 2; filas: 0; desbordamiento horizontal: no.
- Móvil 390 px: sin desbordamiento.
- Acciones: Abrir menú · Notificaciones: 1 pendientes · AF · Usuarios · Académico · Contraer menú · Tarjetas · Tabla · Agregar salones · Todas · Area · Shift08:00 – 23:59 · 2 salones2 con docentes faltantes
- Enlaces: Ir al inicio · Menú principal · Menú principal · Docentes2 · Monitores2 · Supervisores2 · Coordinadores1 · Salones2 · Cursos1 · Aula · Aula
- Columnas: —
### UI-19 · admin · `/admin/gestionar/salones/20f87340-a836-4dfc-9955-5a8fa8481eb4` — Detalle del salón
![Captura](baseline/UI-19-admin.png)
- Título: AulaAreaCompleto
- Secciones: Horario semanal · Docentes por curso
- Campos: 0; filas: 0; desbordamiento horizontal: no.
- Móvil 390 px: desborda.
- Acciones: Abrir menú · Notificaciones: 1 pendientes · AF · Usuarios · Académico · Contraer menú · Volver a salones · Eliminar · Editar Google Meet · Editar Google Classroom · Semana · Por día · Cambiar
- Enlaces: Ir al inicio · Menú principal · Menú principal · Docentes2 · Monitores2 · Supervisores2 · Coordinadores1 · Salones2 · Cursos1
- Columnas: —
### UI-20 · admin · `/admin/gestionar/cursos` — Cursos
![Captura](baseline/UI-20-admin.png)
- Título: Cursos
- Secciones: —
- Campos: 0; filas: 1; desbordamiento horizontal: no.
- Móvil 390 px: desborda.
- Acciones: Abrir menú · Notificaciones: 1 pendientes · AF · Usuarios · Académico · Contraer menú · Agregar curso · Editar Course · Eliminar Course
- Enlaces: Ir al inicio · Menú principal · Menú principal · Docentes2 · Monitores2 · Supervisores2 · Coordinadores1 · Salones2 · Cursos1
- Columnas: Curso · Así se ve en el horario · Acciones
### UI-21 · teacher · `/docente` — Panel docente
![Captura](baseline/UI-21-teacher.png)
- Título: sin h1
- Secciones: —
- Campos: 0; filas: 0; desbordamiento horizontal: no.
- Móvil 390 px: sin desbordamiento.
- Acciones: Notificaciones: 1 pendientes · TP · Disponibilidad en Excel · Semana · Por día · Mis salones
- Enlaces: Ir al inicio · Revisar solicitudes · Solicitar reemplazo
- Columnas: —
### UI-22 · teacher · `/docente/solicitudes` — Solicitudes docente
![Captura](baseline/UI-22-teacher.png)
- Título: Solicitudes y reemplazos
- Secciones: —
- Campos: 1; filas: 0; desbordamiento horizontal: no.
- Móvil 390 px: desborda.
- Acciones: Notificaciones: 1 pendientes · TP · Solicitar reemplazo · Anterior · Siguiente
- Enlaces: Ir al inicio · Panel
- Columnas: Fecha y solicitante · Trabajo solicitado · Estado · Documento · Acciones
### UI-23 · monitor · `/monitor` — Panel monitor
![Captura](baseline/UI-23-monitor.png)
- Título: sin h1
- Secciones: Docentes del salón
- Campos: 0; filas: 0; desbordamiento horizontal: no.
- Móvil 390 px: sin desbordamiento.
- Acciones: Notificaciones: 1 pendientes · MP · Enlaces · Agregar · Semana · Por día · CoursePrueba A, teacherteacher@test.invalid · N/A
- Enlaces: Ir al inicio · Revisar solicitudes · Solicitar reemplazo · Registrar parte diario
- Columnas: —
### UI-24 · monitor · `/monitor/partes` — Partes por fecha
![Captura](baseline/UI-24-monitor.png)
- Título: Parte diario
- Secciones: PARTE DIARIO DE CLASES
- Campos: 8; filas: 6; desbordamiento horizontal: no.
- Móvil 390 px: sin desbordamiento.
- Acciones: Notificaciones: 1 pendientes · MP · Volver al listado de jornadas · Actualizar · Curso ficticio · Ver captura de inicio del parte #1: pendiente · Ver captura de fin del parte #1: pendiente · Editar · Más opciones · Curso ficticio · Ver captura de inicio del parte #2: asociada · Ver captura de fin del parte #2: asociada · Editar · Más opciones
- Enlaces: Ir al inicio · Inicio · Volver al panel
- Columnas: HORAS PROGRAMADAS · CONTROL DE HORAS · CONTROL DEL PROFESOR · CAPTURAS DE PANTALLA · Acciones · N.º · Hora inicio · Hora fin · Inicio de clase · Fin de clase · Curso · Profesor oficial · Estado · Profesor reemplazante · Observaciones · Inicio de clase · Fin de clase
### UI-25 · monitor · `/monitor/solicitudes` — Solicitudes monitor
![Captura](baseline/UI-25-monitor.png)
- Título: Solicitudes y reemplazos
- Secciones: —
- Campos: 1; filas: 0; desbordamiento horizontal: no.
- Móvil 390 px: desborda.
- Acciones: Notificaciones: 1 pendientes · MP · Solicitar reemplazo · Anterior · Siguiente
- Enlaces: Ir al inicio · Panel
- Columnas: Fecha y solicitante · Trabajo solicitado · Estado · Documento · Acciones
### UI-26 · supervisor · `/supervisor` — Panel supervisor
![Captura](baseline/UI-26-supervisor.png)
- Título: Mis salones
- Secciones: Aula ficticia A · Horario · Docentes del salón
- Campos: 1; filas: 0; desbordamiento horizontal: no.
- Móvil 390 px: desborda.
- Acciones: Notificaciones: 1 pendientes · SP · Todos · Sin enlaces · 2 · AulaPrueba A, monitor · AulaPrueba A, otherMonitor · Semana · Por día · CoursePrueba A, teacherteacher@test.invalid · N/A
- Enlaces: Ir al inicio · Revisar solicitudes · Solicitar reemplazo · Revisar partes · Incidencias de monitores · monitor@test.invalid
- Columnas: —
### UI-27 · supervisor · `/supervisor/partes` — Partes supervisor
![Captura](baseline/UI-27-supervisor.png)
- Título: Parte diario
- Secciones: PARTE DIARIO DE CLASES
- Campos: 9; filas: 6; desbordamiento horizontal: no.
- Móvil 390 px: sin desbordamiento.
- Acciones: Notificaciones: 1 pendientes · SP · Actualizar · Curso ficticio · Ver captura de inicio del parte #1: pendiente · Ver captura de fin del parte #1: pendiente · Seleccionar · Revisar · Curso ficticio · Ver captura de inicio del parte #2: asociada · Ver captura de fin del parte #2: asociada · Seleccionar · Revisar · Curso ficticio
- Enlaces: Ir al inicio · Inicio · Volver al panel
- Columnas: HORAS PROGRAMADAS · CONTROL DE HORAS · CONTROL DEL PROFESOR · CAPTURAS DE PANTALLA · Acciones · N.º · Hora inicio · Hora fin · Inicio de clase · Fin de clase · Curso · Profesor oficial · Estado · Profesor reemplazante · Observaciones · Inicio de clase · Fin de clase
### UI-28 · supervisor · `/supervisor/solicitudes` — Solicitudes supervisor
![Captura](baseline/UI-28-supervisor.png)
- Título: Solicitudes y reemplazos
- Secciones: —
- Campos: 1; filas: 0; desbordamiento horizontal: no.
- Móvil 390 px: desborda.
- Acciones: Notificaciones: 1 pendientes · SP · Solicitar reemplazo · Anterior · Siguiente
- Enlaces: Ir al inicio · Panel
- Columnas: Fecha y solicitante · Trabajo solicitado · Estado · Documento · Acciones
### UI-29 · supervisor · `/supervisor/incidencias` — Incidencias supervisor
![Captura](baseline/UI-29-supervisor.png)
- Título: Incidencias e historial
- Secciones: Incidencias de monitores
- Campos: 0; filas: 0; desbordamiento horizontal: no.
- Móvil 390 px: sin desbordamiento.
- Acciones: Notificaciones: 1 pendientes · SP · Registrar incidencia · Anterior · Siguiente
- Enlaces: Ir al inicio · Panel · Volver al panel
- Columnas: Persona / DNI · Proceso y fecha · Incidencia · Estado
### UI-30 · coordinator · `/coordinador/docentes` — Docentes coordinación
![Captura](baseline/UI-30-coordinator.png)
- Título: Docentes
- Secciones: —
- Campos: 3; filas: 2; desbordamiento horizontal: no.
- Móvil 390 px: desborda.
- Acciones: Abrir menú · CP · Contraer menú · Horario · Horario · Página anterior · Página 1 · Página siguiente
- Enlaces: Ir al inicio · Docentes · Salones
- Columnas: Incidencia · Docente · Curso · Dedicación · Horas · Acciones
### UI-32 · coordinator · `/coordinador/docentes/2abf057f-d023-45c4-8c93-8757a66183f5/horario` — Horario coordinación
![Captura](baseline/UI-32-coordinator.png)
- Título: Horario de Prueba A, teacher
- Secciones: Horario semanal · Salones y enlaces
- Campos: 0; filas: 0; desbordamiento horizontal: no.
- Móvil 390 px: sin desbordamiento.
- Acciones: Abrir menú · CP · Contraer menú · Volver · Semana · Por día
- Enlaces: Ir al inicio · Docentes · Salones
- Columnas: —
### UI-33 · coordinator · `/coordinador/salones` — Salones coordinación
![Captura](baseline/UI-33-coordinator.png)
- Título: Salones
- Secciones: —
- Campos: 2; filas: 0; desbordamiento horizontal: no.
- Móvil 390 px: sin desbordamiento.
- Acciones: Abrir menú · CP · Contraer menú · Tarjetas · Tabla · Todas · Area · Shift08:00 – 23:59 · 2 salones2 con docentes faltantes
- Enlaces: Ir al inicio · Docentes · Salones · Aula · Aula
- Columnas: —
### UI-35 · coordinator · `/coordinador/salones/20f87340-a836-4dfc-9955-5a8fa8481eb4` — Detalle salón coordinación
![Captura](baseline/UI-35-coordinator.png)
- Título: AulaAreaCompleto
- Secciones: Horario semanal · Docentes por curso
- Campos: 0; filas: 0; desbordamiento horizontal: no.
- Móvil 390 px: desborda.
- Acciones: Abrir menú · CP · Contraer menú · Volver a salones · Semana · Por día
- Enlaces: Ir al inicio · Docentes · Salones
- Columnas: —
## Cobertura que aún falta en H2
- Variantes de coordinación restringida por curso: no hay fixture con `coordinador-<curso>`.
- Estados vacío/error/carga por pantalla: solo se capturó el estado con datos del fixture;
  los errores ya probados en `estados.json` cubren Supervisor/Configuración, no todas.
- Teclado, foco visible, zoom 200 %, reflow por resolución, lector de pantalla y
  Firefox/WebKit: no ejecutados aquí; corresponden a la matriz H2/H10.
- Formularios de alta/edición y overlays: se capturan al migrar cada módulo, con
  contrato de payload/omisiones; esta pasada no abre formularios para no escribir.
- UI-02 (error de ruta/no encontrada) y login en sus estados de fallo no se forzaron.
- Los catálogos de fixture son mínimos: 2 docentes, 2 monitores, 2 salones; no
  representan volumen de producción. Los presupuestos se fijan tras H2 con datos mayores.
