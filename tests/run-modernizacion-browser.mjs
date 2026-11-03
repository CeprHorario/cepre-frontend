import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const states = process.argv[2] === 'states';
const run = args => execFileSync('playwright-cli', ['-s=cepr-modernizacion-test', ...args], { cwd: root, encoding: 'utf8', timeout: 120000, maxBuffer: 1024 * 1024 });
let result;
try {
  run(['open', 'http://127.0.0.1:5174/']);
  let text = run(['--raw', 'run-code', `--filename=tests/${states ? 'modernizacion-states-browser.cjs' : 'modernizacion-browser.cjs'}`]).trim();
  for (let attempt = 0; attempt < 5 && (!text || text === 'null'); attempt++) {
    text = run(['--raw', 'run-code', "async page => { await page.waitForFunction(() => window.__modernizacionResult || sessionStorage.getItem('__modernizacionResult'), null, {timeout:90000}); return await page.evaluate(() => window.__modernizacionResult ?? JSON.parse(sessionStorage.getItem('__modernizacionResult'))); }"]).trim();
  }
  result = JSON.parse(text);
} finally {
  run(['close']);
}
writeFileSync(new URL(`../docs/modernizacion/evidence/${states ? 'estados' : 'fase1'}.json`, import.meta.url), JSON.stringify(result, null, 2) + '\n');
if (!result?.ok) throw new Error(`${result?.stage}: ${result?.error ?? 'Sin resultado explícito'}`);
console.log(`${result.suite}: ${result.results.length} recorridos verificados`);
