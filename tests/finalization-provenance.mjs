import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const digest = buffer => createHash('sha256').update(buffer).digest('hex');

/** Identifica el árbol fuente recibido, sin registrar .env, auth ni contenido privado. */
export function provenance(frontendRoot) {
  const repositories = {};
  for (const name of ['frontend', 'backend']) {
    const root = resolve(frontendRoot, '..', name);
    const files = execFileSync('git', ['ls-files', '-co', '--exclude-standard', '-z'], { cwd: root, encoding: 'utf8' }).split('\0');
    const hashes = {};
    for (const file of [...new Set(files)].sort()) {
      if (!file || file.startsWith('.env') || !/^(src\/|test[s]?\/|package\.json$|[^/]+\.(?:json|ts|yaml)$)/.test(file) || file.includes('node_modules/') || file.includes('lock') || file.startsWith('src/generated/')) continue;
      const path = resolve(root, file);
      if (existsSync(path) && statSync(path).isFile()) hashes[file] = digest(readFileSync(path));
    }
    repositories[name] = { commits: execFileSync('git', ['log', '-5', '--oneline'], { cwd: root, encoding: 'utf8' }).trim().split('\n'), treeSha256: digest(JSON.stringify(hashes)), files: hashes };
  }
  const dist = resolve(process.env.FINALIZATION_DIST ?? resolve(frontendRoot, 'dist'));
  const build = {};
  for (const file of existsSync(resolve(dist, 'assets')) ? readdirSync(resolve(dist, 'assets')) : []) {
    const path = resolve(dist, 'assets', file);
    if (/\.(?:js|css)$/.test(file)) build[file] = { sha256: digest(readFileSync(path)), bytes: statSync(path).size };
  }
  return { node: process.version, repositories, build, date: new Date().toISOString() };
}
