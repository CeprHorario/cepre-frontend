import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../../', import.meta.url));
const manifest = JSON.parse(readFileSync(resolve(root, 'backend/docs/partes-congelacion.json'), 'utf8'));
const baseline = '/tmp/opencode/cepr-finalizacion-20261104/received';
const allowed = ['frontend/src/components/layout/AppHeader.tsx', 'frontend/src/components/layout/ModuleLayout.tsx', 'frontend/src/features/partes/official-parts.css'];
const files = {};
for (const [file, before] of Object.entries(manifest.files)) {
  const after = createHash('sha256').update(readFileSync(resolve(root, file))).digest('hex');
  if (after !== before && !allowed.includes(file)) throw new Error('Cambio protegido fuera de excepción: ' + file);
  files[file] = { before, after, changed: after !== before, requirement: after !== before ? 'HDR-01/02,P-03' : 'P-02 igualdad byte a byte' };
  if (after !== before) {
    const diff = spawnSync('diff', ['-u', resolve(baseline, file), resolve(root, file)], { encoding: 'utf8' });
    if (diff.status !== 1) throw new Error('No se pudo obtener diff del recibido: ' + file);
    writeFileSync(resolve(root, 'frontend/docs/modernizacion/evidence/finalizacion-20261104/' + file.split('/').at(-1) + '.hdr.patch'), diff.stdout);
  }
}
const amendment = { date: new Date().toISOString(), originalManifest: 'backend/docs/partes-congelacion.json', requirements: ['HDR-01', 'HDR-02', 'P-03'], allowedFiles: allowed, changed: Object.entries(files).filter(([, value]) => value.changed).map(([name]) => name), files, evidence: ['header-before-chromium.json', 'header-after-chromium.json', 'header-body-comparison.json'], hunkPolicy: { AppHeader: 'Aspecto común64px, navegación/cuenta accesibles; mismo hook de avisos y logout', ModuleLayout: 'Solo navegación móvil y composición elegible, no remountPartes', css: 'Solo selectores de barra global y descuentos64px; resto exacto' }, verification: 'Los hashes detectan cambios, no aprueban automáticamente hunks ni regresión funcional.' };
writeFileSync(resolve(root, 'frontend/docs/modernizacion/evidence/finalizacion-20261104/partes-header-amendment.json'), JSON.stringify(amendment, null, 2) + '\n');
console.log(`Partes: ${Object.values(files).filter(file => !file.changed).length} idénticos; ${amendment.changed.length} excepciones que requieren revisión de hunk.`);
