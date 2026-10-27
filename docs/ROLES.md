# Mapa de lógica compartida entre roles

Este documento existe para que una misma cosa (un horario, un contacto, un formulario de persona) se comporte igual en todos los roles. **Antes de tocar una pantalla de rol, busca aquí si esa lógica ya tiene dueño.** Si la tiene, cambia el componente compartido, no la pantalla.

El asistente selecciona el proceso recién creado como `schemaRouting.adminSchema` en la configuración operativa, conservando `userSchema` y mantenimiento. Si falla esa selección, informa que el proceso ya se creó y abre Configurar sistema. Guardar o restaurar configuración cancela consultas pendientes y recarga las cachés del proceso. `GET /admissions/current` devuelve el proceso del contexto de la petición (enrutamiento por rol), para que el encabezado coincida con los datos mostrados. El mensaje de mantenimiento puede estar vacío cuando está desactivado; al activarlo es obligatorio.

Las cabeceras Excel y la vista previa usan etiquetas legibles (`Correo Personal`, `Hora Inicio`, etc.), normalizadas a claves internas por el lector. Disponibilidad admite Alcance `Rango` (horas explícitas), `Turno completo` (Turno) o `Todo el día` (límites de todos los turnos del proceso); horas y turno incompatibles con el alcance se rechazan. Los archivos antiguos sin Alcance mantienen Rango. Para desasignar se usa **Quitar todas las asignaciones** en AsignarSalonesPage con confirmación y servicio múltiple, conservando disponibilidad.

Importar archivos permite seleccionar o arrastrar un solo XLSX/CSV/JSON. Ambos caminos pasan por la misma validación y vista previa; los errores de lectura aparecen en un aviso persistente, las filas inválidas se resaltan y bloquean la confirmación de todo el lote. Soltar un archivo nunca aplica la importación automáticamente.

Retirar disponibilidad por Excel también está retirado. Importar solo ofrece Docentes, Monitores, Supervisores y Disponibilidad. En Docentes (solo admin), la selección múltiple ofrece **Quitar disponibilidad**, confirma el listado seleccionado y envía una solicitud `POST /schedules/teachers/availability/clear` con `teacherIds` (1–500 UUID únicos). El backend valida todos los docentes activos del proceso y borra intervalos en conjunto dentro de una transacción serializable. Conserva horarios y cargas; invalida disponibilidad y compatibilidad en frontend. El coordinador no dispone de esta acción.

Corrección del importador de monitores: el archivo no lleva Correo de acceso. Salón + Turno resuelven la cuenta existente; solo se actualiza user_profiles (DNI, nombres, apellidos y contactos). No modifica users, correo, monitor ni salón. Archivos antiguos con Correo solo se aceptan si coincide con el de la cuenta del salón; se rechaza un intento de cambiarlo. Supervisores conservan su correo propio para registro/vinculación.

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
| Sesión | Un error de `/auth/user-info` deja al usuario sin sesión en el proveedor; un 401 de otra operación no limpia la sesión | `auth/AuthProvider.tsx` + `api/queries.ts` (`useMe`) | Todos |

### Excepción conocida

- `AsignarSalonesPage` usa `WeekGrid` directamente porque la grilla es **editable** (marcar disponibilidad y vista previa de asignación). Es la única pantalla que no pasa por `ScheduleView`.

## Contratos del backend en los que se apoya el front

Seguridad: la sesión del navegador usa cookie HttpOnly (Secure en producción), `withCredentials` y `X-Requested-With: ceprunsa` en las escrituras. OAuth confirma `{ authenticated: true }` desde la ventana esperada; nunca entrega el JWT al JavaScript. Se eliminan tokens antiguos de localStorage y no se aceptan tokens por URL. `POST /auth/logout` revoca en servidor el token actual y borra su cookie. Bearer sigue disponible para clientes API y la herramienta local; sus tokens también están sujetos a revocación.

Las escrituras de áreas y perfiles/reasignaciones de monitores son solo administrativas. Los enlaces de salón solo los cambia el administrador o su monitor propietario, con HTTPS y host exacto de Google. El supervisor conserva solo lectura de sus monitores. Las rutas con IDs ajenos responden 403; un permiso histórico de BD no vuelve a habilitar una escritura retirada del código. La consulta pública por correo/DNI responde 410: consultar horarios requiere iniciar sesión.

Creación de procesos: `configuration.sessionMinutes` (1–180, por defecto 40) y `configuration.breakMinutes` (0–120, por defecto 5) se guardan por proceso en `public.admission_processes`. El asistente calcula el fin de cada turno con esas duraciones y sin descanso final. Los procesos anteriores conservan sus bloques. Las plantillas académicas siguen usando 7 bloques por turno (6 en Extraordinario).

`features/admin/importar/ImportarPage.tsx` utiliza el módulo `/imports` del backend para leer Excel con ExcelJS, CSV y JSON. Operaciones: docentes, monitores, supervisores y disponibilidad. Una vista previa valida el archivo completo; una confirmación envía el archivo una vez y el backend lo aplica en una transacción por conjuntos. No hay peticiones por fila. La plantilla Excel incluye Datos, Guia, Horarios, Salones y Cursos. Se rechazan fórmulas y se conservan los DNI almacenados como texto.

Todas las plantillas incluyen también la hoja **Cabeceras**, con nombres exactos, obligatoriedad del valor y de la columna, formato, ejemplo y descripción. Las cabeceras de Datos llevan comentarios y distinguen valores obligatorios (guinda) de opcionales (azul). DNI, correos, teléfonos y horas conservan formato texto; horas máximas usa entero. La guía de cabeceras mostrada antes de subir un archivo y el Excel comparten la definición de `imports/columns.ts`, evitando duplicar reglas en la interfaz.

Monitores: se completan los datos personales del perfil asociado al salón; se conservan el correo de acceso y los identificadores de usuario, monitor y salón. Supervisores: se registra/actualiza por correo y se vincula a los monitores de los salones indicados; el mismo supervisor puede repetirse para varios salones del mismo turno. No se cambia el turno de un supervisor existente mediante importación. Docentes: el lote crea cuentas nuevas y respeta las horas máximas indicadas.

Disponibilidad por archivo: agregar une rangos con los existentes. El retiro completo para varios docentes se realiza mediante selección y confirmación en Docentes; los recortes parciales se editan en el panel individual. Desasignar salones conserva la disponibilidad y actualiza la carga del docente. `AsignarSalonesPage` usa `assignMany`/`unassignMany` de `useAssignmentMutations` con una petición y una transacción para varios salones. La selección para desasignar es opcional (`Selection`).

La disponibilidad del docente pertenece al proceso y se guarda en la base de datos como intervalos de día e inicio/fin, independientes del turno. `features/admin/docentes/availability.ts` calcula cobertura completa, unión y sustracción de intervalos. La pantalla de asignación confirma con «Guardar disponibilidad» y permite cancelar; no utiliza `localStorage`. Las marcas antiguas del navegador no se importan automáticamente porque no identifican el proceso.

Los turnos coincidentes comparten disponibilidad. Un bloque parcialmente cubierto no se marca completo. Las clases ya asignadas no se eliminan al cambiar disponibilidad; toda asignación nueva exige cobertura completa y ausencia de cruces por tiempo real, incluso entre turnos.

La búsqueda de salones/docentes compatibles filtra y pagina en PostgreSQL antes de hidratar la respuesta, conservando los campos existentes. Las páginas son positivas, de 1 a 500 resultados, con orden estable. La confirmación de asignación sigue revalidando disponibilidad, cruces y carga en su transacción.

Compatibilidad de clientes antiguos: `/teachers/json` conserva `creados`/`noCreados`, omite duplicados y calcula las cargas máximas con sus reglas históricas. Sus registros nuevos ahora se insertan por conjuntos en una transacción; no se crean por fila. Para horas máximas explícitas y validación todo o nada se usa `/imports/docentes`.

En la edición, pulsar el encabezado de un día marca o desmarca sus bloques de **todos los turnos**. Pulsar una hora afecta esa fila del turno visible. `WeekGrid.cellNotes` muestra un indicativo verde de ocupación con salón y horas reales, incluso en cruces parciales entre turnos, sin bloquear la edición de disponibilidad.

| Endpoint | Campos que la UI necesita |
|---|---|
| `GET /imports/:kind/template` | XLSX del proceso seleccionado; solo admin |
| `GET /imports/:kind/columns` | Solo admin; lista `{ key, label, required, headerRequired, format, example, description }` para la guía de cabeceras |
| `POST /imports/:kind/preview` | Multipart `archivo`; devuelve `{ schema, total, valid, rows: [{ line, values, errors }] }`; no modifica datos |
| `POST /imports/:kind/apply` | Multipart `archivo` y `schema` de la vista previa; revalida y aplica todo o nada; bloquea si cambió el proceso |
| `PATCH /schedules/{asignar,desasignar}/profesor` | `{ teacherId, classroomIds: string[] }`, UUID únicos, entre 1 y 10000 salones; operación múltiple atómica |
| `POST /schedules/teachers/availability/clear` | Solo admin. `{ teacherIds }`, entre 1 y 500 UUID únicos; borra toda la disponibilidad de los seleccionados conservando horarios y carga |
| `GET /schedules/teachers/:teacherId/availability` | Solo admin. Lista `{ weekday, start, end }`, horas `HH:mm` (fin admite `24:00`), del proceso autorizado |
| `PUT /schedules/teachers/:teacherId/availability` | Solo admin. `{ intervals: [{ weekday, start, end }] }`; reemplazo transaccional y normalización de intervalos solapados/contiguos; `[]` limpia |
| `GET /schedules/salones/disponibles` | Requiere `teacher_id`; filtra por disponibilidad persistida y cruces del docente, además de los bloques consultados |
| `POST /teachers/available`, `PATCH /schedules/asignar/profesor` | Exigen disponibilidad persistida y ausencia de cruces reales entre horarios de cualquier turno |
| `GET /monitors/cargar/horario`, `GET /monitors/:userId/horario` | `courseName` (del bloque, no del docente), `hasTeacher`, `shiftId` |
| `GET /classes/getClassOfTeacher` | `shiftId` de cada salón |
| `GET /supervisors/getMonitors` | `email`, `phone`, `personalEmail` del monitor |
| `GET /monitors/:userId/teachers`, `GET /monitors/datos/teachers` | Responde **404 cuando el salón no tiene docentes**; `MonitorsApi.teachers` lo convierte en lista vacía |
| `POST /classes` | Crea salón + monitor + horario base con el siguiente número del área y turno. Nombre con espacio: `B-314 Biomédicas`. Acepta `monitor` opcional (correo personalizado y datos) |
| `POST /classes/bulk` | Solo administrador. `{ area_id, shift_id, quantity }`, cantidad entera de 1 a 500. Crea salones, monitores y horarios base en una transacción; responde `created`, `monitorsCreated`, `scheduleBlocks`, `classes`. Gestionar → Salones → Agregar salones permite elegir cantidad; coordinador conserva lectura |

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
