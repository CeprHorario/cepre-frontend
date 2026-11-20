# Partes, solicitudes y reportes

## Cambios pendientes de validación integral

La última ampliación está en desarrollo: requiere completar las regresiones y las pruebas de navegador, revisar visualmente las dos cartas institucionales y aplicar, con respaldo previo, la migración de proceso `202611190001_replacement_execution`. Esa migración todavía no está aplicada en el entorno local habitual. No se consideran aprobadas las pruebas interrumpidas al detener el proyecto.

El formulario contextual obtiene del servidor la identidad y el salón del monitor, ofrece candidatos de su área y docentes de su curso disponibles en las horas seleccionadas. La cobertura completa se resume en un rango; la parcial enumera los bloques. Las cartas de docente y monitor tienen redacciones distintas, dirigidas al Dr. Arnaldo Valdivia Loaiza, con firma y anexos. La previsualización no guarda la solicitud; supervisor y administración disponen de visor PDF del expediente registrado. Aprobar no requiere escribir un motivo; rechazar, devolver y solicitar cancelación sí.

La ampliación incorpora RN provisional con docente identificado y sustento documental posterior, aviso de emergencia del monitor y registro de cobertura por supervisor/administrador para un bloque o sus consecutivos. El reemplazo docente de emergencia completa las horas programadas de los bloques cubiertos; esta es una excepción explícita a la captura manual de horas. Las coberturas aprobadas actualizan el efectivo del parte y conservan la cuenta oficial del salón. Las reservas futuras no dependen de que existan los partes y un cambio de horario deja un aviso de revisión.

La tolerancia de ingreso se configura al crear el proceso. El estado T puede calcularse automáticamente; una tardanza del reemplazante normal conserva RN y genera su observación. RE conserva su estado. Las horas reales se limitan al bloque y el descanso permitido. La lista administrativa ofrece plantilla general de disponibilidad y las fichas individuales descargan nombres/curso; la identidad escrita en el Excel nunca decide el destinatario.

Los componentes de `features/operations` son compartidos. `useOperations` obtiene del servidor la cuenta, el rol y el proceso vigentes; las claves de caché incluyen los tres. Los encabezados de contexto son precondiciones, no seleccionan el esquema. La identidad nunca se envía en el formulario.

El contexto no depende de admisión ni de una consulta administrativa: funciona con caché vacía para todos sus roles. Se revalida periódicamente y al detectar cambio de contexto; el scope anterior se cancela y retira. SSE invalida la lectura autorizada en lugar de insertar un payload sin precondiciones en la caché; los eventos tardíos de una conexión cerrada se ignoran. El sondeo conserva el mismo scope de cuenta/rol/proceso.

## Diseño

Se usan los componentes existentes Button, Field, Dialog y SimpleLayout. Guinda identifica acciones principales; marino, cabeceras de documento; ámbar, avisos pendientes; verde, disponibilidad confirmada. Rojo indica errores o bloques terminados incompletos. Las tablas separan columnas con bordes, permiten desplazamiento horizontal y mantienen las etiquetas legibles. Los modales distinguen Cancelar de Confirmar; previsualizar no persiste.

El parte conserva las columnas agrupadas del formato original: horario programado, control real, docente, estado, observaciones y capturas. Las horas sugeridas nunca se guardan automáticamente. No se infiere ausencia por no completar un campo. El historial técnico es administrativo.

## Flujos

- Docente: disponibilidad Excel en su panel; solicitudes en `/docente/solicitudes`.
- Monitor: observaciones clasificadas desde el bloque; solicitudes propias y emergencia de aula en `/monitor/solicitudes`.
- Supervisor: incidencias de sus monitores en `/supervisor/incidencias`; solicitudes y revisión autorizada en `/supervisor/solicitudes`.
- Administrador: `/admin/reportes`, `/admin/solicitudes`, `/admin/incidencias` y acciones de incidencia en los listados de personal.

La campana comparte la misma consulta que el aviso del panel. SSE actualiza las notificaciones; la conexión se renueva para revalidar autenticación y existe sondeo de respaldo. Resolver un aviso no decide una solicitud.

El monitor envía al supervisor y este remite al administrador. El docente envía al coordinador de su curso y notifica también al administrador; el coordinador revisa antes del permiso final. Supervisor y coordinador solicitan directamente al administrador. Los estados son PENDING (revisión), ADMIN_PENDING (permiso final), CHANGES, APPROVED, REJECTED, CANCELLED y SUPERSEDED. Ninguna conformidad previa aplica coberturas: únicamente la aprobación final administrativa las reserva y aplica. No existe autoaprobación. Los permisos de coordinación se limitan a su curso y a las rutas expresas de solicitudes; no habilitan edición de partes, incidencias, personas ni disponibilidad.

Devolver exige un motivo. El solicitante corrige y reenvía en un documento nuevo con `revisesId`; el anterior queda SUPERSEDED, con documentos y eventos conservados. El rechazo definitivo no admite editar esa solicitud. La cancelación se solicita con motivo y sigue REVIEW → ADMIN para monitores y docentes, o ADMIN para solicitudes directas o cancelaciones iniciadas por el revisor responsable. Mientras se tramita, un permiso aprobado sigue activo. Rechazar la cancelación conserva el permiso; devolverla permite corregir el motivo. Autorizarla revoca por conjuntos las coberturas futuras sin borrar documentos, partes ni eventos. Si la cobertura ya empezó, tiene ejecución o cambios posteriores, no se revierte automáticamente.

Se propone el turno completo por defecto y permite seleccionar bloques para una cobertura parcial. Monitores y supervisores prefieren otro turno; la excepción del mismo turno exige declarar que no se encontró reemplazante de otro turno y justificarlo. El solapamiento parcial entre turnos se evalúa en los bloques solicitados. Un monitor solo puede cubrir un salón de reemplazo por jornada, incluso en horas disjuntas; la comprobación se repite al aprobar. La cuenta original del salón conserva acceso; el encabezado muestra al reemplazante cuando cubre toda la jornada, o ambos nombres en cobertura parcial. Los reemplazos de supervisor y coordinador son documentales, sin cambiar alcances ni cuentas. El docente reemplazante consulta sus coberturas aprobadas por fecha en su panel, con enlaces del salón y estilo diferenciado. No se modifica el horario semanal.

Se generan Word institucional y PDF conservando los logos UNSA y CEPRUNSA de las plantillas originales. Ambos contienen fecha de emisión, fecha de reemplazo, identidad obtenida del servidor, bloques, motivo y espacio de firma. Domicilio, distrito y CUI se declaran si no están registrados; no se inventan. El Word contiene las imágenes y referencia los anexos PDF. El expediente PDF contiene todas las páginas de evidencia; su límite final es 2 MiB. Los anexos admiten PDF, PNG y JPEG, según el motivo. La optimización de imágenes es explícita. Ambos documentos permanecen privados, ligados a la versión de la solicitud, y se descargan mediante autorización del servidor.

## Planificación semanal de partes

En `/admin/partes`, antes de seleccionar salón, `WeeklyPartsPlanner` muestra la semana actual y la siguiente. Solo administración puede elegir un día programado de lunes a sábado de la próxima semana para dictarlo el domingo inmediatamente anterior. Se habilita después de generar la semana actual. Guardar requiere confirmación y una versión vigente; puede quitarse el adelanto antes del cierre. No se eligen fechas arbitrarias ni se trasladan partes existentes.

La decisión cierra al finalizar el último turno configurado del sábado anterior. La tarea local genera la siguiente semana en una transacción, con bloqueo por proceso e inserciones por conjuntos. Un fallo revierte la semana completa; repetir la tarea conserva los registros. Se revalidan cruces de salón, docente, monitor y reemplazos autorizados. Solicitudes pendientes o aprobadas en fechas afectadas impiden cambiar la planificación.

`date` es la fecha real de ejecución; `academicDate` conserva la fecha original cuando hay adelanto. Horarios, apertura, cierre de edición, solicitudes y recordatorios usan la ejecución del domingo. La hoja y los reportes muestran ambas fechas. El día original no genera un segundo parte. Al generar se notifican administración y personal vinculado, con deduplicación. El cambio no reescribe el horario semanal ni la disponibilidad permanente.

Los endpoints administrativos son `GET /class-session-records/weeks/planning`, `PATCH /class-session-records/weeks/advance` (`weekStart`, `weekday` 1–6 o `null`, `expectedVersion`) y `POST /class-session-records/weeks/generate`. Las claves de caché y encabezados mantienen el contexto autorizado de cuenta y proceso.

## Disponibilidad del docente

La plantilla es común para todos los docentes del proceso, con todos sus turnos y bloques inicialmente en No disponible. Incluye únicamente Guía y Disponibilidad; los nombres y curso de la guía son referencias editables y no deciden el destino. Se descarga como `Disponibilidad_<proceso>.xlsx`. El formato condicional colorea Disponible de verde y No disponible de gris, también para valores booleanos. Se leen los valores, nunca los colores. Cambios en identificadores de bloques, turnos u horas se señalan como errores; una plantilla de otro proceso o incompleta se rechaza. La carga individual identifica al docente mediante el panel autorizado. La previsualización devuelve `{ process, teacherId, teacher: { id, name, course }, rows, intervals, valid }`; nombre y curso de destino provienen de la base, no del Excel. Un modal final exige confirmar el nombre, curso y proceso antes de reemplazar su disponibilidad. Se conservan asignaciones y se normalizan tiempos coincidentes. Un docente solo puede cargar para sí mismo; administración selecciona el destinatario.

## Observaciones e historial

Las observaciones de docente se vinculan al DNI de quien dicta el bloque. Las de alumnos requieren nombres y apellidos; las de aula no generan antecedentes personales de docentes. Las observaciones de monitores y supervisores utilizan formularios separados. El supervisor solo registra hechos de sus monitores en el día actual de Lima. Docentes, monitores y supervisores no consultan antecedentes propios.

Los reportes separan antecedentes personales, observaciones de bloques, solicitudes y seguimiento del personal. Exportan datos registrados y minutos reales de la configuración; no calculan sanciones ni inventan justificaciones. El histórico por DNI conserva los procesos anteriores.
# Anexos y validación de solicitudes

El inicio administrativo incorpora `AdminOverview`: salones completos y docentes usan las consultas existentes del panel; permisos administrativos consulta el total de solicitudes `ADMIN_PENDING` con `limit=1`; incidencias reutiliza la clave de caché del aviso histórico y mantiene el alcance de todos los procesos. Los indicadores son enlaces a los módulos; solicitudes conserva el filtro `estado` en la URL. Las métricas no disponibles muestran «—», nunca un cero inventado. No se recalculan totales desde una página de resultados. Las consultas de permisos e incidencias se actualizan cada minuto mientras está abierto el panel.

La lista de solicitudes utiliza `requests-workspace.css`, acotado a esta pantalla. Los estados combinan texto, icono y color; las barras representan etapas reales (solicitud, revisión cuando corresponde, permiso administrativo), no porcentajes de ejecución. Canceladas, rechazadas y sustituidas no muestran una progresión inventada. El total pertenece a la consulta filtrada y paginada. Los permisos y las acciones conservan sus reglas anteriores. La búsqueda de reemplazantes indica «Buscar por nombre o correo».

Cada archivo del formulario tiene una descripción obligatoria de 3–160 caracteres. `annexDescriptions` se envía en el JSON multipart, en el mismo orden que los archivos `evidence`; quitar un anexo retira también su descripción. El backend valida la correspondencia y utiliza únicamente la descripción en la carta Word y el expediente PDF. Los clientes históricos que omiten este campo conservan el nombre original.

El formulario muestra campos obligatorios, errores por campo y un listado de datos pendientes. Domicilio y distrito requieren al menos 3 caracteres, el motivo y la justificación de excepción al menos 10. CUI sigue siendo opcional. Con datos completos se indica que primero debe previsualizarse; cambiar datos, archivos o descripciones vuelve a bloquear el envío hasta revisar el nuevo PDF. Descargar PDF se presenta como botón de enlace.

Dentro del formulario, Ctrl+V agrega imágenes del portapapeles como anexos, con los mismos límites y descripción obligatoria que los archivos seleccionados. El pegado de texto conserva su comportamiento normal. Cada imagen del expediente comienza debajo de su título en una página independiente, conserva su proporción y respeta los márgenes.
