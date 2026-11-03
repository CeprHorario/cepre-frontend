import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const suites = { states: ['modernizacion-states-browser.cjs', 'estados'], incidencias: ['modernizacion-incidences-browser.cjs', 'incidencias'], transportes: ['modernizacion-transports-browser.cjs', 'transportes'], fase1: ['modernizacion-browser.cjs', 'fase1'] };
const suite = suites[process.argv[2] ?? 'fase1'];
if (!suite) throw new Error('Suite de modernización desconocida');
const run = args => execFileSync('playwright-cli', ['-s=cepr-modernizacion-test', ...args], { cwd: root, encoding: 'utf8', timeout: 240000, maxBuffer: 1024 * 1024 });
let result;
try {
  run(['open', 'http://127.0.0.1:5174/']);
  let text = run(['--raw', 'run-code', `--filename=tests/${suite[0]}`]).trim();
  for (let attempt = 0; attempt < 5 && (!text || text === 'null'); attempt++) {
    text = run(['--raw', 'run-code', "async page => { await page.waitForFunction(() => window.__modernizacionResult || sessionStorage.getItem('__modernizacionResult'), null, {timeout:90000}); return await page.evaluate(() => window.__modernizacionResult ?? JSON.parse(sessionStorage.getItem('__modernizacionResult'))); }"]).trim();
  }
  result = JSON.parse(text);
} finally {
  run(['close']);
}
writeFileSync(new URL(`../docs/modernizacion/evidence/${suite[1]}.json`, import.meta.url), JSON.stringify(result, null, 2) + '\n');
if (!result?.ok) throw new Error(`${result?.stage}: ${result?.error ?? 'Sin resultado explícito'}`);
console.log(`${result.suite}: ${result.results.length} recorridos verificados`);
