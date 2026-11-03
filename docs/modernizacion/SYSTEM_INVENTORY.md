# Inventario del sistema

Fuente inicial: `src/app/router.tsx`, manifiestos y contratos especializados.
**No es todavía la línea base H2**: faltan recorridos, campos exhaustivos y
capturas actuales de cada variante. No usar capturas históricas como sustituto.

## Rutas y variantes

Todas conservan destino/permisos. Roles: A administrador, D docente/profesor,
M monitor, S supervisor, C coordinación (general/curso se verifican separados).
Rutas relativas de la propuesta se expanden aquí para evitar ambigüedad.

| ID | Rol/ruta | Dueño / capacidades esenciales | Línea base |
|---|---|---|---|
| UI-01 | Público `/` y estados de sesión | SessionGate, login, acceso, mantenimiento, rol desconocido | Pendiente de confirmar |
| UI-02 | Todos: error de ruta / no encontrada | RouteError / NotFoundPage | Pendiente de confirmar |
| UI-03 | A `/admin` | AdminHub: accesos, conteos y filtros enlazados | Pendiente de confirmar |
| UI-04 | A `/admin/partes` | PartsPage: filtros/hoja/selección/revisión/operaciones/historial | Pendiente de confirmar |
| UI-05 | A `/admin/solicitudes` | RequestsPage: consultar/decidir/PDF | Pendiente de confirmar |
| UI-06 | A `/admin/incidencias` | IncidencesPage: DNI/historial/resolver/reabrir | Pendiente de confirmar |
| UI-07 | A `/admin/reportes` | ReportsPage: cuatro tipos/filtros/paginación/Excel | Pendiente de confirmar |
| UI-08 | A `/admin/generar` | GenerarProcesoPage: cuatro pasos/cálculos/borrador/runtime | Pendiente de confirmar |
| UI-09 | A `/admin/importar` | ImportarPage: docentes/monitores/supervisores, validar/previsualizar/aplicar | Pendiente de confirmar |
| UI-10 | A `/admin/configuracion` | ConfiguracionPage: mantenimiento/procesos/versiones/motivo/restaurar | Pendiente de confirmar |
| UI-11 | A `/admin/gestionar/docentes` | DocentesPage: búsqueda/filtros/exportar/selección/drawer/disponibilidad | Pendiente de confirmar |
| UI-12 | A `/admin/gestionar/docentes/:id/asignar` | AsignarSalonesPage: grilla editable/compatibles/asignados | Pendiente de confirmar |
| UI-13 | A `/admin/gestionar/docentes/:id/horario` | HorarioDocentePage: horario/enlaces | Pendiente de confirmar |
| UI-14 | A `/admin/gestionar/monitores` | MonitoresPage: alta/perfil/salón/DNI/selección/eliminación lógica | Pendiente de confirmar |
| UI-15 | A `/admin/gestionar/supervisores` | SupervisoresPage: turno/perfil/eliminación lógica | Pendiente de confirmar |
| UI-16 | A `/admin/gestionar/supervisores/:id/monitores` | SupervisorMonitoresPage: asignados/disponibles/área/turno/paginación | Pendiente de confirmar |
| UI-17 | A `/admin/gestionar/coordinadores` | CoordinadoresPage: general/curso/perfil/eliminación lógica | Pendiente de confirmar |
| UI-18 | A `/admin/gestionar/salones` | SalonesPage: tabla/tarjetas/filtros/turnos/alta múltiple | Pendiente de confirmar |
| UI-19 | A `/admin/gestionar/salones/:id` | SalonDetallePage: horario/docentes/enlaces/asignar/retirar/eliminar | Pendiente de confirmar |
| UI-20 | A `/admin/gestionar/cursos` | CursosPage: CRUD/editor/color/rechazo por asociaciones | Pendiente de confirmar |
| UI-21 | D `/docente` | DocentePanel: horario/salones/enlaces/Excel | Pendiente de confirmar |
| UI-22 | D `/docente/solicitudes` | RequestsPage: propias/candidatos/evidencias/cancelar | Pendiente de confirmar |
| UI-23 | M `/monitor` | MonitorPanel: salón/horario/directorio/editar enlaces | Pendiente de confirmar |
| UI-24 | M `/monitor/partes` | PartsPage: jornadas/hoja/observaciones/evidencias/borradores | Pendiente de confirmar |
| UI-25 | M `/monitor/solicitudes` | RequestsPage: propias/emergencia de salón | Pendiente de confirmar |
| UI-26 | S `/supervisor` | SupervisorPanel: solo sus salones/monitores/búsqueda/horario | Pendiente de confirmar |
| UI-27 | S `/supervisor/partes` | PartsPage: recursos autorizados/revisión explícita | Pendiente de confirmar |
| UI-28 | S `/supervisor/solicitudes` | RequestsPage: propias/decisiones autorizadas | Pendiente de confirmar |
| UI-29 | S `/supervisor/incidencias` | IncidencesPage: sus monitores, hechos hoy Lima | Pendiente de confirmar |
| UI-30 | C general `/coordinador/docentes` | DocentesPage readOnly, filtro de curso | Pendiente de confirmar |
| UI-31 | C curso `/coordinador/docentes` | DocentesPage readOnly, curso restringido | Pendiente de confirmar |
| UI-32 | C general/curso `/coordinador/docentes/:id/horario` | HorarioDocentePage readOnly; dos variantes | Pendiente de confirmar |
| UI-33 | C general `/coordinador/salones` | SalonesPage readOnly, permite detalle | Pendiente de confirmar |
| UI-34 | C curso `/coordinador/salones` | SalonesPage readOnly, detalle restringido | Pendiente de confirmar |
| UI-35 | C general/curso `/coordinador/salones/:id` | SalonDetallePage readOnly, alcance servidor | Pendiente de confirmar |

Redirecciones: `/admin/gestionar` → docentes; `/coordinador` → docentes.
Los estados globales no son necesariamente rutas nuevas; conservar resolución
actual de SessionGate. No crear páginas adicionales por inventariarlos.

### Caracterización incremental vigente

- **UI-24:** entrada por lista de jornadas, rango inicial de hoy menos 30 días a
  hoy, tamaño 25/50/100, total y orden explícitos; agrupación fecha/salón/turno.
  Abrir muestra todos los bloques (6 actuales y 105 históricos comprobados).
  Fecha/aula/turno quedan fijados al grupo; se mantienen filtros de personas,
  curso y revisión, operaciones/detalle/evidencias y retorno protegido por pendientes.
  Ver `evidence/fase1.json` y los 25 recorridos reconciliados de partes; retorno con
  conflicto/subida pendiente también probado. No equivale a todos los estados H2.
- **UI-04:** selector de salón administrativo usa catálogo completo, conserva valor
  con resultado vacío y «Todos». No cambia catálogo de otros roles.
- **UI-26 / UI-10:** error inicial distinto de vacío/carga y Reintentar comprobados.
- **UI-03 / UI-18 / UI-26:** semántica corregida en tarjetas y selector; destinos
  conservados. Ver `evidence/estados.json`, con catálogos/fallos UI identificados.
- **UI-05/22/25/28 + campana/Excel/acción rápida:** contexto frío, SSE real,
  respaldo por sondeo y cambios de identidad/proceso/respuestas tardías probados
  en `evidence/transportes.json`. No se declara cada formulario completo migrado.
- **UI-06/29 + personal/importación:** matriz H1 de incidencias en `fase1.json`
  e `incidencias.json`: DNI, efectivo/reemplazante, alcance/fecha, versiones/historia,
  avisos y protección de borrador. Controladores reales locales, sin aplicar lote.
- [Línea base funcional H1](FUNCTIONAL_BASELINE.md): contratos de red, campos,
  omisiones y persistencia del área intervenida; base para H2, no sustituto global.
- La columna de línea base sigue pendiente: estas comprobaciones parciales no
  equivalen a fichas completas por ruta, rol, resolución y estado.

## Propietarios y consumidores compartidos

| Superficie | Propietario existente | Consumidores / revisión |
|---|---|---|
| Layout/sidebar/breadcrumbs/usuario | components/layout | Todas las rutas y variantes; persistencia de menú |
| Acciones/controles/feedback | components/ui | Button/Field/Table/Menu/Selection/Overlay/Contact, todas las pantallas |
| Horario semanal/diario | ScheduleView, lib/schedule | D/M/S, salón y horario docente A/C; shiftId, intervalos |
| Asignación editable | WeekGrid + AsignarSalonesPage | Excepción deliberada a ScheduleView |
| Directorio/contactos | TeacherDirectory/Contact | M/S; Gmail/portapapeles compartidos |
| Personas | PersonForm/useRemoval/Selection | Docentes, monitores, supervisores, coordinadores |
| Avisos/solicitudes/Excel/reportes | features/operations | Campana, paneles, solicitudes y disponibilidad; contexto común |
| Hoja/observaciones/evidencias | features/partes | M/S/A, permisos diferentes; estado en memoria |
| Historial por DNI | features/incidencias | Personal, importación, observaciones y antecedentes autorizados |
| Importación | ImportarPage + API imports | Tres tipos generales, disponibilidad Excel en flujo propio docente |
| Identidad | assets, estilos globales | Logos/imaginería/fuentes/colores, no reemplazar por demos |

## Ficha obligatoria por pantalla (completar en H0/H2)

Ruta/rol/variante; fixture sintético e identidad/proceso; campos, obligatoriedad y
límites; alta vs edición; acciones/enlaces/columnas/filtros; payloads representativos;
dependencias/cachés; estados aplicables; teclado; resolución; captura; resultado
persistido; problema previo; referencia de prueba/evidencia; estado/pendiente.

Estados: inicial/carga/actualización, datos/vacío/sin coincidencias, error, lectura/
deshabilitado/ocupado, formulario inicial/inválido/válido/guardando/fallido,
confirmar/cancelar/resultado, selección simple/múltiple, overlays, borrador/
conflicto/pérdida de acceso, cuenta/proceso/mantenimiento, plazo futuro/abierto/
cerrado, archivo seleccionado/subido/sin asociar/asociado, teclado/foco/zoom/
movimiento reducido. «Con datos» por sí solo nunca completa una ficha.
