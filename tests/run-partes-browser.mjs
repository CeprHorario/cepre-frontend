import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = new URL("../docs/partes-evidence/", import.meta.url);
const config = { api: process.env.PARTS_TEST_API ?? "http://127.0.0.1:3000", origin: process.env.PARTS_TEST_ORIGIN ?? "http://127.0.0.1:5174" };
const session = "-s=cepr-final";
const run = args => execFileSync("playwright-cli", [session, ...args], { cwd: root, encoding: "utf8", timeout: 600000, maxBuffer: 1024 * 1024 });
const temporary = mkdtempSync('/tmp/opencode/cepr-partes-browser-');
const helpers = readFileSync(new URL('./partes-browser-helpers.cjs', import.meta.url), 'utf8');
const suites = [["partes-browser.cjs", "monitor-supervisor"], ["partes-admin-browser.cjs", "administracion"], ["partes-proposal-browser.cjs", "propuesta"], ["partes-isolation-browser.cjs", "aislamiento"], ["partes-races-browser.cjs", "carreras"], ["partes-access-browser.cjs", "perdida-acceso"]];
const selected = process.argv[2];
if (selected && !suites.some(([, name]) => name === selected)) throw new Error('Suite de partes desconocida');
execFileSync(process.execPath, ["tests/create-partes-png.mjs"], { cwd: root });
const resultFiles = [];

/** The managed CLI may drop the return value when it renews its session; the page reports the result itself. */
function collect() {
  let resolve;
  const received = new Promise(r => { resolve = r; });
  const server = createServer((request, response) => {
    if (request.method !== 'POST' || request.url !== '/result') { response.writeHead(404).end(); return; }
    let body = '';
    request.on('data', chunk => { body += chunk; if (body.length > 4 * 1024 * 1024) request.destroy(); });
    request.on('end', () => { response.writeHead(204).end(); try { resolve(JSON.parse(body)); } catch { resolve({ ok: false, error: 'Resultado no JSON' }); } });
  });
  const ready = new Promise(r => server.listen(5192, '127.0.0.1', r));
  return { ready, received, close: () => server.close() };
}

let failure;
try {
  for (const [script, name] of suites.filter(([, name]) => !selected || name === selected)) {
    run(["open", `${config.origin}/monitor/partes`]);
    const source = readFileSync(new URL(`./${script}`, import.meta.url), 'utf8');
    const filename = `${temporary}/${script}`;
    writeFileSync(filename, `async page => {
      let result;
      try { const helpers = await (${helpers})(page,${JSON.stringify(config)}); result = await (${source})(page, helpers); }
      catch (error) { result = {ok:false,suite:${JSON.stringify(name)},error:error.message,stack:error.stack,stage:await page.evaluate(()=>window.__partesTestStage ?? 'recorrido')}; await page.screenshot({path:${JSON.stringify(fileURLToPath(output))}+${JSON.stringify(name+'-failure.png')}}); }
      await page.evaluate(result=>{window.__partesTestResult=result;sessionStorage.setItem('__partesTestResult',JSON.stringify(result));},result);
      await page.request.post('http://127.0.0.1:5192/result',{data:result}).catch(()=>{});
      return result;
    }`);
    const collector = collect();
    try {
      await collector.ready;
      try { run(["--raw", "run-code", `--filename=${filename}`]); } catch { /* The callback is authoritative. */ }
      let timer;
      const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`No pasó ${script}: sin resultado del navegador`)), 240000); });
      const result = await Promise.race([collector.received, timeout]);
      clearTimeout(timer);
      resultFiles.push([name, result]);
      if (!result?.ok) throw new Error(`No pasó ${script}: ${result?.stage ?? "sin etapa"}: ${result?.error ?? "sin resultado verificado"}`);
      console.log(`${result.suite}: OK (${result.results.length} recorridos)`);
    } finally { collector.close(); run(["close"]); }
  }
} catch (error) { failure = error; } finally { try { run(["close"]); } catch {} }
// Escribir después de cerrar los navegadores: Vite vigila JSON y recargaría la siguiente suite.
for (const [name, result] of resultFiles) writeFileSync(new URL(`${name}.json`, output), JSON.stringify(result, null, 2) + "\n");
if (failure) throw failure;
