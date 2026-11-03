import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = new URL("../docs/partes-evidence/", import.meta.url);
const session = "-s=cepr-final";
const resultFiles = [];
const run = args => execFileSync("playwright-cli", [session, ...args], { cwd: root, encoding: "utf8", timeout: 240000, maxBuffer: 1024 * 1024 });
const temporary = mkdtempSync('/tmp/opencode/cepr-partes-browser-');
const helpers = readFileSync(new URL('./partes-browser-helpers.cjs', import.meta.url), 'utf8');
const suites = [["partes-browser.cjs", "monitor-supervisor"], ["partes-admin-browser.cjs", "administracion"], ["partes-isolation-browser.cjs", "aislamiento"], ["partes-races-browser.cjs", "carreras"], ["partes-access-browser.cjs", "perdida-acceso"]];
const selected = process.argv[2];
if (selected && !suites.some(([, name]) => name === selected)) throw new Error('Suite de partes desconocida');
execFileSync(process.execPath, ["tests/create-partes-png.mjs"], { cwd: root });
let failure;
try {
  for (const [script, name] of suites.filter(([, name]) => !selected || name === selected)) {
    run(["open", "http://127.0.0.1:5174/monitor/partes"]);
    const source = readFileSync(new URL(`./${script}`, import.meta.url), 'utf8');
    const filename = `${temporary}/${script}`;
    writeFileSync(filename, `async page => {
      let result;
      try { const helpers = await (${helpers})(page); result = await (${source})(page, helpers); }
      catch (error) { result = {ok:false,suite:${JSON.stringify(name)},error:error.message,stage:await page.evaluate(()=>window.__partesTestStage ?? 'recorrido')}; }
      await page.evaluate(result=>{window.__partesTestResult=result;sessionStorage.setItem('__partesTestResult',JSON.stringify(result));},result);
      return result;
    }`);
    let text = run(["--raw", "run-code", `--filename=${filename}`]).trim();
    // La CLI gestionada puede omitir el retorno tras renovar sesión; recuperar solo el resultado
    // explícito de la suite, sin repetir sus mutaciones ni considerar el silencio un éxito.
    for (let attempt = 0; attempt < 5 && (!text || text === "null"); attempt++) {
      text = run(["--raw", "run-code", "async page => {await page.waitForFunction(()=>window.__partesTestResult||sessionStorage.getItem('__partesTestResult'),null,{timeout:180000});return await page.evaluate(()=>window.__partesTestResult??JSON.parse(sessionStorage.getItem('__partesTestResult')));}"]).trim();
    }
    const result = JSON.parse(text);
    resultFiles.push([name, result]);
    if (!result?.ok) throw new Error(`No pasó ${script}: ${result?.stage ?? "sin etapa"}: ${result?.error ?? "sin resultado verificado"}`);
    console.log(`${result.suite}: OK (${result.results.length} recorridos)`);
    run(["close"]);
  }
} catch (error) { failure = error; } finally { run(["close"]); }
// Escribir después de cerrar los navegadores: Vite vigila JSON y recargaría la siguiente suite.
for (const [name, result] of resultFiles) writeFileSync(new URL(`${name}.json`, output), JSON.stringify(result, null, 2) + "\n");
if (failure) throw failure;
