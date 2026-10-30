import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = new URL("../docs/partes-evidence/", import.meta.url);
const session = "-s=cepr-final";
const resultFiles = [];
const run = args => execFileSync("playwright-cli", [session, ...args], { cwd: root, encoding: "utf8", timeout: 120000, maxBuffer: 1024 * 1024 });
execFileSync(process.execPath, ["tests/create-partes-png.mjs"], { cwd: root });
try {
  for (const [script, name] of [["partes-browser.cjs", "monitor-supervisor"], ["partes-admin-browser.cjs", "administracion"], ["partes-isolation-browser.cjs", "aislamiento"], ["partes-races-browser.cjs", "carreras"], ["partes-access-browser.cjs", "perdida-acceso"]]) {
    run(["open", "http://127.0.0.1:5174/monitor/partes"]);
    run(["--raw", "eval", "delete window.__partesTestResult"]);
    let text = run(["--raw", "run-code", `--filename=tests/${script}`]).trim();
    // La CLI gestionada puede omitir el retorno tras renovar sesión; recuperar solo el resultado
    // explícito de la suite, sin repetir sus mutaciones ni considerar el silencio un éxito.
    for (let attempt = 0; attempt < 5 && (!text || text === "null"); attempt++) {
      text = run(["--raw", "run-code", "async page => await page.evaluate(() => window.__partesTestResult ?? null)"]).trim();
    }
    const result = JSON.parse(text);
    if (!result?.ok) throw new Error(`No pasó ${script}: ${result?.stage ?? "sin etapa"}: ${result?.error ?? "sin resultado verificado"}`);
    resultFiles.push([name, result]);
    console.log(`${result.suite}: OK (${result.results.length} recorridos)`);
    run(["close"]);
  }
} finally { run(["close"]); }
// Escribir después de cerrar los navegadores: Vite vigila JSON y recargaría la siguiente suite.
for (const [name, result] of resultFiles) writeFileSync(new URL(`${name}.json`, output), JSON.stringify(result, null, 2) + "\n");
