# Mapa de lógica compartida entre roles

Este documento existe para que una misma cosa (un horario, un contacto, un formulario de persona) se comporte igual en todos los roles. **Antes de tocar una pantalla de rol, busca aquí si esa lógica ya tiene dueño.** Si la tiene, cambia el componente compartido, no la pantalla.

## Roles y pantallas

| Rol | Ruta de inicio | Pantallas | Acceso |
|---|---|---|---|
| Administrador | `/admin` | Hub · Generar proceso · Importar · Configuración · Gestionar datos (docentes, monitores, supervisores, coordinadores, salones, cursos) | Escritura |
| Coordinador (general o de curso) | `/coordinador` | Docentes · Horario de docente · Salones · Detalle de salón | Solo lectura (`readOnly`) |
| Docente (`docente` / `profesor`) | `/docente` | Su horario y sus salones | Lectura |
| Monitor | `/monitor` | Horario de su salón, docentes del salón, enlaces | Edita los enlaces de su salón |
| Supervisor | `/supervisor` | Sus salones (de sus monitores) con horario y docentes | Lectura |

El coordinador reutiliza las páginas del admin con `readOnly` (`HorarioDocentePage`, `SalonDetallePage`); no copies esas páginas, pásales la prop.

## Lógica compartida y su dueño

| Qué | Regla | Dueño (único lugar donde se implementa) | Usado por |
|---|---|---|---|
| Ver un horario | Vista inicial **Semana**; luego **Por día**; estados de carga, **error con Reintentar** y vacío | `components/schedule/ScheduleView.tsx` (`DEFAULT_SCHEDULE_VIEW`) | Docente, Monitor, Supervisor, Salón (admin/coord.), Horario de docente (admin/coord.) |
| Horario de un salón | Curso del **propio bloque**; "por asignar" según `hasTeacher`; filas según `shiftId` del bloque | `features/shared/useClassroomSchedule.ts` | Monitor, Supervisor |
| Filas de la grilla | El turno **nunca se deduce por la hora** (varios turnos comparten horas): usar `shiftId` que manda el backend; si hay varios turnos, unirlos y `trimRows` | `lib/schedule.ts` + cada fuente de datos | Todas las grillas |
| Docentes de un salón | Lista lateral + panel de detalle (curso, correo, celular, clases en el salón) | `components/schedule/TeacherDirectory.tsx` | Monitor, Supervisor |
| Correo | Abre la **redacción de Gmail** en pestaña nueva; nunca `mailto:` | `components/ui/Contact.tsx` → `EmailLink` (`lib/contact.ts` → `gmailComposeUrl`) | Todos, incluido el login |
| Celular | **Se copia** al portapapeles con aviso; nunca `tel:` | `components/ui/Contact.tsx` → `PhoneCopy`, `CopyPhoneIconButton` (`lib/contact.ts` → `copyPhone`) | Todos |
| Formulario de persona | Mismo orden: Correo de acceso → DNI → Nombres → Apellidos → Correo personal → Celular → Otros celulares → campos propios del rol (prop `extra`) | `features/admin/personas/PersonForm.tsx` | Docente, Monitor, Supervisor, Coordinador |
| Correo de acceso | Cualquier cuenta de Google (no solo `@cepr.unsa.pe` / `@unsa.edu.pe`); misma etiqueta y ayuda | `lib/validators.ts` → `isLoginEmail`, `LOGIN_EMAIL_LABEL`, `LOGIN_EMAIL_HINT` | Formularios e importación |
| Acciones por fila | Botones de icono visibles en la columna (sin menú desplegable que la tabla recorte) | `components/ui/Menu.tsx` → `RowActions` | Tablas de docentes, monitores, supervisores, coordinadores |
| Eliminar persona | Se llama **Eliminar** (icono papelera), aunque en el backend es lógico (`isActive = false`, endpoint `PATCH …/deactivate`). Confirmación con la consecuencia del rol + «su registro se conserva como inactivo»; en bloque informa éxitos y fallos | `features/admin/personas/useRemoval.tsx` | Docentes, monitores, supervisores, coordinadores |
| Selección múltiple | **Opcional**: sin casillas hasta pulsar «Seleccionar»; barra con el conteo y acciones en bloque; «Cancelar selección» limpia | `components/ui/Selection.tsx` → `useSelectionMode`, `SelectionToggle`, `SelectionBar` | Docentes, monitores, supervisores, coordinadores |
| Nombre corto de salón | `"B-301 Biomédicas"` → `"B-301"` | `lib/format.ts` → `shortClassName` | Todos |
| Sesión | Solo un 401 de `/auth/user-info` cierra la sesión; un 401 por permisos no expulsa | `api/client.ts` | Todos |

### Excepción conocida

- `AsignarSalonesPage` usa `WeekGrid` directamente porque la grilla es **editable** (marcar disponibilidad y vista previa de asignación). Es la única pantalla que no pasa por `ScheduleView`.

## Contratos del backend en los que se apoya el front

La disponibilidad del docente pertenece al proceso y se guarda en la base de datos como intervalos de día e inicio/fin, independientes del turno. `features/admin/docentes/availability.ts` calcula cobertura completa, unión y sustracción de intervalos. La pantalla de asignación confirma con «Guardar disponibilidad» y permite cancelar; no utiliza `localStorage`. Las marcas antiguas del navegador no se importan automáticamente porque no identifican el proceso.

Los turnos coincidentes comparten disponibilidad. Un bloque parcialmente cubierto no se marca completo. Las clases ya asignadas no se eliminan al cambiar disponibilidad; toda asignación nueva exige cobertura completa y ausencia de cruces por tiempo real, incluso entre turnos.

En la edición, pulsar el encabezado de un día marca o desmarca sus bloques de **todos los turnos**. Pulsar una hora afecta esa fila del turno visible. `WeekGrid.cellNotes` muestra un indicativo verde de ocupación con salón y horas reales, incluso en cruces parciales entre turnos, sin bloquear la edición de disponibilidad.

| Endpoint | Campos que la UI necesita |
|---|---|
| `GET /schedules/teachers/:teacherId/availability` | Solo admin. Lista `{ weekday, start, end }`, horas `HH:mm` (fin admite `24:00`), del proceso autorizado |
| `PUT /schedules/teachers/:teacherId/availability` | Solo admin. `{ intervals: [{ weekday, start, end }] }`; reemplazo transaccional y normalización de intervalos solapados/contiguos; `[]` limpia |
| `GET /schedules/salones/disponibles` | Requiere `teacher_id`; filtra por disponibilidad persistida y cruces del docente, además de los bloques consultados |
| `POST /teachers/available`, `PATCH /schedules/asignar/profesor` | Exigen disponibilidad persistida y ausencia de cruces reales entre horarios de cualquier turno |
| `GET /monitors/cargar/horario`, `GET /monitors/:userId/horario` | `courseName` (del bloque, no del docente), `hasTeacher`, `shiftId` |
| `GET /classes/getClassOfTeacher` | `shiftId` de cada salón |
| `GET /supervisors/getMonitors` | `email`, `phone`, `personalEmail` del monitor |
| `GET /monitors/:userId/teachers`, `GET /monitors/datos/teachers` | Responde **404 cuando el salón no tiene docentes**; `MonitorsApi.teachers` lo convierte en lista vacía |
| `POST /classes` | Crea salón + monitor + horario base con el siguiente número del área y turno. Nombre con espacio: `B-314 Biomédicas`. Acepta `monitor` opcional (correo personalizado y datos) |

## Checklist al agregar o cambiar algo de un rol

1. ¿Otro rol muestra lo mismo? Revisa la tabla de arriba. Si ya hay dueño, extiende el dueño (una prop nueva) en vez de escribir la lógica en la pantalla.
2. ¿No hay dueño pero dos roles lo van a usar? Créalo en `components/` (UI) o `features/shared/` (datos) y agrégalo a esta tabla.
3. Busca restos de la regla vieja antes de cerrar:
   ```sh
   grep -rn "tel:\|mailto:" src --include=*.tsx      # solo debe aparecer components/ui/Contact.tsx
   grep -rln "<WeekGrid\|<DayAgenda" src/features    # solo AsignarSalonesPage
   grep -rn "starts.has" src                         # deducir turno por hora: no debe aparecer
   ```
4. Prueba la pantalla con **cada rol que la usa** (`docker/dev-token.js <correo>` genera el token de cualquier usuario del proceso actual).
