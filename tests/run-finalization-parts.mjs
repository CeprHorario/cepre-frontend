import { execFileSync, spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const backend = resolve(root, '../backend');
const project = process.env.FINALIZATION_COMPOSE ?? 'cepr-finalizacion-local';
const override = process.env.FINALIZATION_OVERRIDE ?? '/tmp/opencode/cepr-finalizacion-20261104/compose.browser.yaml';
if (!/^cepr-finalizacion-[a-z0-9-]+$/.test(project)) throw new Error('Solo instancia propia de finalización');
const docker = ['compose', '-p', project, '-f', 'compose.records.yaml', '-f', override];
const suites = process.argv.slice(2);
const selected = suites.length ? suites : ['parts-admin', 'parts-isolation', 'parts-races', 'parts-access', 'parts-proposal'];
if (selected.some(suite => !/^parts-(admin|monitor|isolation|races|access|proposal)$/.test(suite))) throw new Error('Suite desconocida');
let failed = false;
for (const suite of selected) {
  // Cada callback usa fixtures mutantes: no comparte estado de otra suite.
  execFileSync('docker', [...docker, 'restart', 'backend'], { cwd: backend, stdio: 'inherit' });
  execFileSync('docker', [...docker, 'up', '-d', '--wait', 'backend'], { cwd: backend, stdio: 'inherit' });
  const result = spawnSync(process.execPath, ['tests/run-finalization.mjs', suite], { cwd: root, stdio: 'inherit', timeout: 300000, env: process.env });
  if (result.status !== 0) failed = true;
}
if (failed) process.exitCode = 1;
