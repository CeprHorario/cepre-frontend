import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { provenance } from './finalization-provenance.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(process.env.FINALIZATION_OUTPUT ?? resolve(root, 'docs/modernizacion/evidence/finalizacion-20261104'));
const managed = process.env.PLAYWRIGHT_CORE_PATH ?? resolve(homedir(), '.local/share/opencode-dotfiles-v2/tools/playwright-cli-0.1.21/node_modules/playwright-core');
if (!existsSync(managed)) throw new Error('Falta playwright-core gestionado; establece PLAYWRIGHT_CORE_PATH, sin instalar otro');
const { chromium, firefox, webkit } = createRequire(import.meta.url)(managed);
const engine = process.env.FINALIZATION_ENGINE ?? 'chromium';
const browserType = { chromium, firefox, webkit }[engine];
if (!browserType) throw new Error('Motor desconocido');
const config = { api: process.env.FINALIZATION_API ?? 'http://127.0.0.1:3109', origin: process.env.FINALIZATION_ORIGIN ?? 'http://127.0.0.1:5189', output };
config.mode = process.env.FINALIZATION_MODE ?? 'after';
config.seed = count => execFileSync('docker', ['compose', '-p', process.env.FINALIZATION_COMPOSE ?? 'cepr-finalizacion-local', '-f', 'compose.records.yaml', 'exec', '-T', 'backend', 'node', 'test/finalization-seed.cjs', String(count)], { cwd: resolve(root, '../backend'), encoding: 'utf8', timeout: 30000 });
config.inspect = () => JSON.parse(config.seed('inspect'));
if (process.env.FINALIZATION_RESUME === '1' && existsSync(resolve(output, 'baseline-live.json')))
  config.baselineResume = JSON.parse(readFileSync(resolve(output, 'baseline-live.json'), 'utf8')).routes;
config.writeArtifact = (name, value) => {
  if (!/^[a-z0-9-]+\.json$/.test(name)) throw new Error('Nombre de artefacto inválido');
  writeFileSync(resolve(output, name), JSON.stringify(value, null, 2) + '\n');
};
config.readArtifact = name => {
  if (!/^[a-z0-9-]+\.json$/.test(name)) throw new Error('Nombre de artefacto inválido');
  return existsSync(resolve(output, name)) ? JSON.parse(readFileSync(resolve(output, name), 'utf8')) : undefined;
};
config.resume = process.env.FINALIZATION_RESUME === '1';
for (const target of [config.api, config.origin]) {
  const url = new URL(target);
  if (url.hostname !== '127.0.0.1' || url.protocol !== 'http:') throw new Error('Solo orígenes sintéticos loopback');
}
const suite = process.argv[2] ?? 'backend';
const partsSuites = { 'parts-monitor': 'partes-browser.cjs', 'parts-admin': 'partes-admin-browser.cjs', 'parts-proposal': 'partes-proposal-browser.cjs', 'parts-isolation': 'partes-isolation-browser.cjs', 'parts-races': 'partes-races-browser.cjs', 'parts-access': 'partes-access-browser.cjs' };
if (partsSuites[suite]) execFileSync(process.execPath, ['tests/create-partes-png.mjs'], { cwd: root });
if (suite === 'baseline-requests') execFileSync(process.execPath, ['tests/create-partes-png.mjs'], { cwd: root });
const selectedIds = process.env.FINALIZATION_IDS?.split(',');
if (selectedIds?.some(id => !/^UI-\d{2}$/.test(id))) throw new Error('IDs de pantalla inválidos');
const evidenceName = selectedIds ? `${suite}-${selectedIds.join('-')}` : suite === 'header' ? `${suite}-${config.mode}` : suite;
if (suite.startsWith('baseline-') && existsSync(resolve(output, 'baseline-chromium.json')))
  config.baselineData = JSON.parse(readFileSync(resolve(output, 'baseline-chromium.json'), 'utf8')).routes;
if (selectedIds && config.baselineData) config.baselineData = config.baselineData.filter(record => selectedIds.includes(record.id));
if (!/^[a-z-]+$/.test(suite)) throw new Error('Suite inválida');
mkdirSync(output, { recursive: true });
let browser;
let page;
let argument = config;
try {
  browser = await browserType.launch(engine === 'chromium' ? { executablePath: '/usr/bin/chromium', headless: process.env.FINALIZATION_HEADED !== '1' } : { headless: process.env.FINALIZATION_HEADED !== '1' });
  page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const tree = provenance(root);
  const legacy = { 'legacy-states': 'modernizacion-states-browser.cjs', 'legacy-incidences': 'modernizacion-incidences-browser.cjs', 'legacy-transports': 'modernizacion-transports-browser.cjs', 'legacy-functional': 'modernizacion-browser.cjs' };
  let source = readFileSync(resolve(root, 'tests', legacy[suite] ?? partsSuites[suite] ?? `finalizacion-${suite}-browser.cjs`), 'utf8');
  if (partsSuites[suite]) source = source.split('\n').map((line, index) => /^\s*await /.test(line) ? `h.stage = 'línea original ${index + 1}';\n${line}` : line).join('\n');
  const callback = new Function(`return (${source});`)();
  if (['legacy-functional', 'legacy-incidences'].includes(suite)) {
    const helperSource = readFileSync(resolve(root, 'tests/partes-browser-helpers.cjs'), 'utf8');
    config.parts = await new Function(`return (${helperSource});`)()(page, config);
  }
  if (partsSuites[suite]) {
    // Conservar los callbacks congelados; redirigir solo artefactos y contratoHDR.
    const screenshot = page.screenshot.bind(page);
    page.screenshot = options => screenshot({ ...options, path: options?.path ? resolve(output, String(options.path).split('/').at(-1)) : undefined });
    const locator = page.locator.bind(page);
    page.locator = (selector, options) => {
      if (selector === 'header button[aria-haspopup="menu"]') return page.getByRole('button', { name: /^Cuenta de / });
      const target = locator(selector, options);
      if (suite === 'parts-isolation' && selector === '[data-record="5"]') {
        const waitFor = target.waitFor.bind(target);
        // La renovación sintética solo cambia la cookie, no envía el callbackOAuth
        // que invalida `me`. Su sondeo existente es60s; conservar todas las
        // aserciones y permitir ese ciclo sin cambiar producción ni testcongelado.
        target.waitFor = options => waitFor(options?.timeout === 35000 ? { ...options, timeout: 75000 } : options);
      }
      return target;
    };
    const byRole = page.getByRole.bind(page);
    page.getByRole = (role, options) => byRole(role === 'menuitem' && options?.name === 'Cerrar sesión' ? 'button' : role, options);
    const helperSource = readFileSync(resolve(root, 'tests/partes-browser-helpers.cjs'), 'utf8');
    argument = await new Function(`return (${helperSource});`)()(page, config);
    if (suite === 'parts-isolation') {
      const refresh = argument.refresh;
      argument.refresh = async () => {
        try { await refresh(); }
        catch (error) {
          // Si la identidad cambió, SessionGate ya desmontó la hoja y su diálogo.
          // No intentar cerrar controles de la cuenta anterior en el panel nuevo.
          if (new URL(page.url()).pathname !== '/monitor' || await page.getByRole('dialog').count()) throw error;
        }
      };
    }
    const fixture = await (await page.request.get(config.api + '/__test/fixtures')).json();
    argument.route = async role => {
      const login = await page.request.get(`${config.api}/__test/session?role=${role}`);
      if (!login.ok()) throw new Error('Sesión sintética no disponible');
      await page.goto(`${config.origin}/${role}/partes`);
      await page.locator('.official-parts').waitFor();
      const classroom = page.locator('select').filter({ has: page.locator(`option[value="${fixture.classId}"]`) }).first();
      if (await classroom.count()) await classroom.selectOption(fixture.classId);
      await argument.openJournal();
    };
  }
  const result = await callback(page, argument);
  if (!result?.ok) {
    if (result) writeFileSync(resolve(output, `${evidenceName}-${engine}-callback-failure.json`), JSON.stringify(result, null, 2) + '\n');
    throw new Error(`${result?.stage ?? 'callback'}: ${result?.error ?? 'Sin resultado explícito'}`);
  }
  result.engine = engine;
  result.browserVersion = browser.version();
  result.provenance = tree;
  if (suite === 'parts-isolation') result.harnessAdaptations = ['Selector HDR autorizado', 'Espera renovación sintética75s para sondeo me60s', 'No cerrar diálogo desmontado tras redirección de identidad a /monitor; aserciones y callback congelado intactos'];
  writeFileSync(resolve(output, `${evidenceName}-${engine}.json`), JSON.stringify(result, null, 2) + '\n');
  console.log(`${suite}: OK (${result.results?.length ?? result.routes?.length ?? 0} controles) ${engine} ${browser.version()}`);
} catch (error) {
  // Los errores Playwright pueden incluir headers/cookies. Nunca conservar ese log crudo.
  const message = `${argument.stage ?? config.stage ?? suite}: ${String(error.message).split('Call log:')[0].replace(/cepr-session=[^\s]+/g, '[sesión omitida]')}`;
  const stack = String(error.stack ?? '').split('Call log:')[0].replace(/cepr-session=[^\s]+/g, '[sesión omitida]');
  writeFileSync(resolve(output, `${evidenceName}-${engine}-failure.json`), JSON.stringify({ ok: false, error: message, stack, date: new Date().toISOString() }, null, 2) + '\n');
  await page?.screenshot({ path: resolve(output, `${evidenceName}-${engine}-failure.png`) }).catch(() => {});
  console.error(message);
  process.exitCode = 1;
} finally { await browser?.close(); }
