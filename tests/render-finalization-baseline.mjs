import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'docs/modernizacion/evidence/finalizacion-20261104');
const read = name => JSON.parse(readFileSync(resolve(output, name), 'utf8'));
const baseline = read('baseline-chromium.json');
const loading = read('baseline-loading-chromium.json');
const access = read('baseline-access-chromium.json');
const supplemental = existsSync(resolve(output, 'baseline-access-UI-02-chromium.json')) ? read('baseline-access-UI-02-chromium.json') : { routes: [] };
const owners = {
  'UI-01': 'auth/guards.tsx + features/auth/LoginPage.tsx + auth/AuthProvider.tsx',
  'UI-02': 'app/NotFoundPage.tsx + app/RouteError.tsx',
  'UI-03': 'features/admin/AdminHub.tsx',
  'UI-04': 'features/partes/PartsPage.tsx + OfficialPartsSheet.tsx (congelados)',
  'UI-05': 'features/operations/RequestsPage.tsx',
  'UI-06': 'features/incidencias/IncidencesPage.tsx + IncidencesPanel.tsx',
  'UI-07': 'features/operations/ReportsPage.tsx',
  'UI-08': 'features/admin/generar/GenerarProcesoPage.tsx',
  'UI-09': 'features/admin/importar/ImportarPage.tsx',
  'UI-10': 'features/admin/configuracion/ConfiguracionPage.tsx',
  'UI-11': 'features/admin/docentes/DocentesPage.tsx + TeacherForm.tsx + TeacherDetailDrawer.tsx',
  'UI-12': 'features/admin/docentes/AsignarSalonesPage.tsx + availability.ts',
  'UI-13': 'features/admin/docentes/HorarioDocentePage.tsx',
  'UI-14': 'features/admin/personas/MonitoresPage.tsx + PersonForm.tsx',
  'UI-15': 'features/admin/personas/SupervisoresPage.tsx + PersonForm.tsx',
  'UI-16': 'features/admin/personas/SupervisorMonitoresPage.tsx',
  'UI-17': 'features/admin/personas/CoordinadoresPage.tsx + PersonForm.tsx',
  'UI-18': 'features/admin/salones/SalonesPage.tsx',
  'UI-19': 'features/admin/salones/SalonDetallePage.tsx',
  'UI-20': 'features/admin/cursos/CursosPage.tsx / CourseDialog',
  'UI-21': 'features/docente/DocentePanel.tsx + AvailabilityWorkbookPanel.tsx',
  'UI-22': 'features/operations/RequestsPage.tsx / RequestForm',
  'UI-23': 'features/monitor/MonitorPanel.tsx + shared/useClassroomSchedule.ts',
  'UI-24': 'features/partes/PartsPage.tsx + OfficialPartsSheet.tsx (congelados)',
  'UI-25': 'features/operations/RequestsPage.tsx / RequestForm',
  'UI-26': 'features/supervisor/SupervisorPanel.tsx + shared/useClassroomSchedule.ts',
  'UI-27': 'features/partes/PartsPage.tsx + OfficialPartsSheet.tsx (congelados)',
  'UI-28': 'features/operations/RequestsPage.tsx / RequestForm',
  'UI-29': 'features/incidencias/IncidencesPage.tsx + IncidencesPanel.tsx',
  'UI-30': 'features/admin/docentes/DocentesPage.tsx (readOnly general)',
  'UI-31': 'features/admin/docentes/DocentesPage.tsx (readOnly curso)',
  'UI-32': 'features/admin/docentes/HorarioDocentePage.tsx (readOnly)',
  'UI-33': 'features/admin/salones/SalonesPage.tsx (readOnly general)',
  'UI-34': 'features/admin/salones/SalonesPage.tsx (readOnly curso)',
  'UI-35': 'features/admin/salones/SalonDetallePage.tsx (readOnly)',
};
const escape = value => String(value ?? '—').replaceAll('|', '\\|').replaceAll('\n', ' ');
const lines = [
  '# Fichas E3 · árbol recibido tras E2', '',
  `Generado desde evidencia real del ${baseline.date}; ${baseline.routes.length} rutas/variantes,35 IDs.`,
  'Chromium156.0.8078.79, compilado5189/API3109, fixtures sintéticos. Datos proceden de Nest/PostgreSQL; errores/vacíos/carga retenida están identificados como inyección.', '',
  '**Estado: caracterización de base, no cierre de E3 ni certificación de todas las pantallas.**',
  'La pasada registra datos/carga/error/vacío,13 formularios iniciales, foco/colores y negativos de coordinación. No convierte abrir un formulario en probar válido/guardando/error/éxito. Esos estados se enumeran como controles abiertos; no son no-aplica ni equivalen a verificación.', '',
  '## Contratos transversales', '',
  '- Cabecera: AppHeader/ModuleLayout; sesión HttpOnly, contexto/rol de servidor. La campana conserva transporte propio; no se midió duplicación desde capturas.',
  '- Catálogos/salones/personal: api/services.ts → api/queries.ts → propietarios indicados. Paginación/filtros en URL conservados; write controls solo admin.',
  '- Horarios de lectura: ScheduleView; asignación: WeekGrid editable (excepción conservada). Turnos porID, disponibilidad persistida sin borrar asignaciones.',
  '- Personas: TeacherForm/PersonForm, eliminación lógica y resultados masivos por useRemoval; no se llamó a eliminar en baseline.',
  '- Solicitudes/avisos: useOperations con cuenta/rol/proceso, precondiciones X-Class-Session-Account/Context; decidir distinto de ejecutar o resolver aviso.',
  '- Incidencias: versión/motivo, autoría, DNI y alcance servidor; supervisor nunca antecedentes propios. No se alteró historia para capturas.',
  '- Escrituras: no se confirmaron guardados de negocio en esta pasada; payloads/persistencia se prueban con los recorridos específicos de cada lote y contratos02/03/07 del plan.',
  '- Partes:56 huellas y16 referencias iniciales intactas. UI04/24/27 son conservación, no rediseño; capturas nuevas fuera de propuestas.', '',
];

for (const record of baseline.routes) {
  const data = record.states.find(state => state.state === 'data' && state.width === 1920);
  const form = record.states.find(state => state.state === 'form-initial');
  const load = loading.routes.find(route => route.id === record.id && route.role === record.role);
  const keyboard = [...supplemental.routes, ...access.routes].find(route => route.id === record.id && route.role === record.role);
  lines.push(`## ${record.id} · ${record.role} · \`${record.path}\``, '',
    `- Propietario: \`src/${owners[record.id]}\`. Fixture: \`${record.fixture}\`.`,
    `- Acceso: ${record.role.includes('Coordinator') || record.role === 'coordinator' ? 'solo lectura de su ámbito; pruebas negativas separadas en baseline-scope-chromium.json' : record.role === 'public' ? 'sin sesión; OAuth real fuera del harness' : 'capacidad específica del rol, no una autorización de escritura por estar autenticado'}.`,
    `- Títulos: ${(data?.headings ?? []).map(escape).join(' / ') || 'Sin heading semántico en el estado recibido; no se inventa uno en la ficha'}.`,
    `- Columnas: ${(data?.columns ?? []).map(escape).join(' / ') || 'Sin tabla en esta presentación'}.`,
    `- Campos/filtros iniciales: ${(data?.fields ?? []).map(field => `${escape(field.label || '(sin etiqueta)')} [${field.type},${field.disabled ? 'deshabilitado' : 'habilitado'}]`).join('; ') || 'No hay campos en el DOM inicial'}.`,
    `- Acciones iniciales: ${(data?.actions ?? []).map(action => `${escape(action.name)}${action.disabled ? ' (deshabilitada)' : ''}`).join('; ') || 'No hay botones locales en el DOM inicial'}.`,
    `- Destinos: ${(data?.links ?? []).map(link => `${escape(link.name)} → ${escape(link.href)}`).join('; ') || 'No hay enlaces locales en el DOM inicial'}.`,
    `- HTTP real observado: ${[...new Set((data?.http ?? []).map(request => `${request.method} ${request.path} →${request.status}`))].map(escape).join('; ')}.`,
    `- Estados registrados: ${record.states.map(state => `${state.state}@${state.width}`).join(', ')}${load ? '; carga retenida@1920/390 (baseline-loading-chromium.json)' : '; no hay consulta primaria retenida en esta ruta; controles globales/asistente/Partes requieren su recorrido específico'}.`,
    `- Foco/teclado: ${keyboard ? `${keyboard.focus.length} Tab registrados; ${keyboard.focus.filter(step => step.behindHeader).length} posiciones posiblemente cubiertas por header; datos completos en baseline-access-chromium.json/suplementoUI02` : 'sin medición en este artefacto; no equivale a aprobado'}.`,
    `- Colores: ${keyboard?.contrast.length ?? 0} combinaciones efectivas; ${keyboard?.contrast.filter(pair => !pair.approximation && pair.ratio < pair.required).length ?? 0} por debajo del mínimo aplicable, ${keyboard?.contrast.filter(pair => pair.approximation).length ?? 0} requieren comprobación visual por imagen/opacity. No equivale a certificación integral.`,
    '- Visual antes/después: esta es la base antes de E4; no se han eliminado textos ni trasladado datos en esta pasada. Montserrat/Open Sans y geometría existente conservadas.',
    '- Reflow: capturas1920/390 sin overflow de documento observado; no sustituye zoom200 real (BLQ-02) ni motores/lector (BLQ-01).',
    '- Estado completo y red: [JSON de base](baseline-chromium.json), [carga](baseline-loading-chromium.json), [foco/contraste](baseline-access-chromium.json).', '',
    '| Estado | Ancho | Captura | Error JS | HTTP inyectado |', '|---|---:|---|---:|---|');
  for (const state of record.states) lines.push(`| ${state.state} | ${state.width} | [imagen](${state.screenshot}) | ${state.errors?.length ?? 0} | ${escape(state.injected ?? 'No')} |`);
  if (load) for (const state of load.measurements) lines.push(`| carga retenida | ${state.width} | [imagen](${state.screenshot}) | — | Lectura retenida,${state.intercepted}peticiones |`);
  if (form) {
    lines.push('', '### Formulario inicial observado', '', '| Campo | Tipo | Obligatorio | Estado | Límites HTML | Opciones |', '|---|---|---|---|---|---|');
    for (const field of form.fields) lines.push(`| ${escape(field.label || '(sin etiqueta)')} | ${field.type} | ${field.required ? 'Sí' : 'No'} | ${field.disabled ? 'Deshabilitado' : 'Editable'} | min${escape(field.min)},max${escape(field.max)},longitud${field.maxLength ?? '—'} | ${(field.options ?? []).map(option => escape(option.text)).join(', ')} |`);
    lines.push('', 'Inicial/foco capturados. Control abierto explícito: validar estados inválido/válido/guardando/error/éxito, payload, resultado persistido y cierre de esta variante; no presentarlos como probados por la captura.');
  }
  lines.push('');
}
lines.push('## Puertas abiertas de E3', '',
  '1. Ciclo completo de formularios/overlays y tarea por variante (no solo apertura); estados del generador/importador/acceso y filtros secundarios.',
  '2. Revisión visual individual de todas las capturas, contraste/foco detectados y teclado completo de los overlays.',
  '3. Latencias por ruta/interacción con muestras comparables y grafo de JS/CSS; tamaño baseline del build no sustituye latencia.',
  '4. Zoom200 real, motores adicionales y lector: BLQ-01/02, no aprobados.',
  '5. El estado permanece en08-PROGRESO; esta ficha no autoriza cerrar E3 ni declarar entrega integral.');
writeFileSync(resolve(output, 'E3-FICHAS.md'), lines.join('\n') + '\n');
console.log(`Fichas generadas: ${baseline.routes.length} variantes; ${new Set(baseline.routes.map(record => record.id)).size} IDs; límites explícitos.`);
