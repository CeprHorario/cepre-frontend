# Partes, solicitudes y reportes

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

Solo administración decide reemplazos normales de docentes y de supervisores. El supervisor titular o administración decide los de monitores y emergencias de aula. No existe autoaprobación. La aprobación reserva bloques del día y conserva el horario semanal. Una operación repetida con el mismo identificador debe conservar su contenido.

El PDF incluye formulario y todas las páginas de evidencia; el límite del documento final es 2 MiB. La optimización de imágenes es explícita. Los archivos permanecen privados y se descargan mediante la autorización del servidor.

## Disponibilidad

La plantilla se genera por docente y proceso con todos sus turnos y bloques. Incluye únicamente Guía y Disponibilidad. El formato condicional colorea Disponible de verde y No disponible de gris, también para valores booleanos. Se leen los valores, nunca los colores. Cambios en IDs, turnos u horas se señalan como errores; una plantilla ajena o incompleta se rechaza. Confirmar reemplaza intervalos de disponibilidad, conserva asignaciones y normaliza tiempos coincidentes.

## Observaciones e historial

Las observaciones de docente se vinculan al DNI de quien dicta el bloque. Las de alumnos requieren nombres y apellidos; las de aula no generan antecedentes personales de docentes. Las observaciones de monitores y supervisores utilizan formularios separados. El supervisor solo registra hechos de sus monitores en el día actual de Lima. Docentes, monitores y supervisores no consultan antecedentes propios.

Los reportes separan antecedentes personales, observaciones de bloques, solicitudes y seguimiento del personal. Exportan datos registrados y minutos reales de la configuración; no calculan sanciones ni inventan justificaciones. El histórico por DNI conserva los procesos anteriores.
