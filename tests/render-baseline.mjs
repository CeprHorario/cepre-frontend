import { readFileSync, writeFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../docs/modernizacion/evidence/baseline.json', import.meta.url)));
const rows = data.routes ?? [];
const md = [
  '# Línea base H2 — rutas y estados capturados',
  '',
  `Generado: ${data.date}. Fixtures sintéticos del harness. Chromium a 1920×1080,`,
  'compilado servido en 127.0.0.1:5174. Una captura no acredita por sí sola todos',
  'los estados ni accesibilidad; completa el inventario, no lo sustituye.',
  '',
  `Rutas capturadas: **${rows.length}**. Resultado: ${data.ok ? 'correcto' : 'con fallo'}.`,
  'Errores HTTP inesperados: ' + (rows.filter(r => r.httpErrors.some(e => e.status !== 401)).length) + '.',
  '',
  '## Fichas resumidas',
  '',
];
for (const r of rows) {
  md.push(
    `### ${r.id} · ${r.role} · \`${r.path}\` — ${r.label}`,
    '',
    `![Captura](${r.screenshot.replace('docs/modernizacion/', '')})`,
    '',
    `- Título: ${(r.h1 ?? []).join(' / ') || 'sin h1'}`,
    `- Secciones: ${(r.h2 ?? []).join(' · ') || '—'}`,
    `- Campos: ${r.fields}; filas: ${r.rows}; desbordamiento horizontal: ${r.overflowX ? 'sí' : 'no'}.`,
    `- Móvil 390 px: ${r.mobile ? (r.mobile.overflowX ? 'desborda' : 'sin desbordamiento') : 'no comprobado'}.`,
    `- Acciones: ${(r.buttons ?? []).slice(0, 14).join(' · ') || '—'}`,
    `- Enlaces: ${(r.links ?? []).slice(0, 12).join(' · ') || '—'}`,
    `- Columnas: ${(r.headers ?? []).join(' · ') || '—'}`,
    r.alerts?.length ? `- Avisos: ${r.alerts.join(' | ')}` : '',
    r.errors?.length ? `- Errores JS: ${r.errors.join(' | ')}` : '',
    r.httpErrors?.length ? `- HTTP: ${r.httpErrors.map(e => `${e.status} ${e.path}`).join(' · ')}` : '',
    '',
  );
}
md.push(
  '## Cobertura que aún falta en H2',
  '',
  '- Variantes de coordinación restringida por curso: no hay fixture con `coordinador-<curso>`.',
  '- Estados vacío/error/carga por pantalla: solo se capturó el estado con datos del fixture;',
  '  los errores ya probados en `estados.json` cubren Supervisor/Configuración, no todas.',
  '- Teclado, foco visible, zoom 200 %, reflow por resolución, lector de pantalla y',
  '  Firefox/WebKit: no ejecutados aquí; corresponden a la matriz H2/H10.',
  '- Formularios de alta/edición y overlays: se capturan al migrar cada módulo, con',
  '  contrato de payload/omisiones; esta pasada no abre formularios para no escribir.',
  '- UI-02 (error de ruta/no encontrada) y login en sus estados de fallo no se forzaron.',
  '- Los catálogos de fixture son mínimos: 2 docentes, 2 monitores, 2 salones; no',
  '  representan volumen de producción. Los presupuestos se fijan tras H2 con datos mayores.',
  '',
);
writeFileSync(new URL('../docs/modernizacion/BASELINE_H2.md', import.meta.url), md.filter(Boolean).join('\n') + '\n');
console.log(`BASELINE_H2.md: ${rows.length} rutas`);
