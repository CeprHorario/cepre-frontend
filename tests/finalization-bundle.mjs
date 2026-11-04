import { readFileSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const dist = resolve(root, 'dist');
const manifest = JSON.parse(readFileSync(resolve(dist, '.vite/manifest.json'), 'utf8'));
const closure = key => {
  const seen = new Set();
  const visit = name => { if (seen.has(name)) return; seen.add(name); for (const dependency of manifest[name]?.imports ?? []) visit(dependency); };
  visit(key);
  const files = [...new Set([...seen].flatMap(name => [manifest[name].file, ...(manifest[name].css ?? [])]))];
  const sizes = files.map(file => { const buffer = readFileSync(resolve(dist, file)); return { file, bytes: buffer.length, gzip: gzipSync(buffer).length }; });
  return { files: sizes, js: sizes.filter(file => file.file.endsWith('.js')).reduce((sum, file) => sum + file.bytes, 0), jsGzip: sizes.filter(file => file.file.endsWith('.js')).reduce((sum, file) => sum + file.gzip, 0), css: sizes.filter(file => file.file.endsWith('.css')).reduce((sum, file) => sum + file.bytes, 0) };
};
const routes = Object.fromEntries(Object.keys(manifest).filter(key => key.startsWith('src/') || key === 'index.html').map(key => [key, closure(key)]));
const result = { date: new Date().toISOString(), baseline: { source: 'frontend-baseline.log, mismo API3109 y fixtures sintéticos', entryJs: 824210, entryGzipApprox: 246720, css: 103020, warning: true }, routes, note: 'Todos los imports transitivos se suman, incluido react-runtime descargado al iniciar. No se cuenta solo el nombre/index. Partes conserva montaje y carga estática.' };
writeFileSync(resolve(root, 'docs/modernizacion/evidence/finalizacion-20261104/bundle-current.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ initial: routes['index.html'], routeCount: Object.keys(routes).length }));
