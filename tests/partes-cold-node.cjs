const { chromium } = require('playwright-core');
const { writeFileSync } = require('node:fs');
(async () => {
  const api = 'http://127.0.0.1:3107', origin = 'http://127.0.0.1:5187';
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext();
  const page = await context.newPage();
  const requests = [];
  page.on('request', request => { if (request.url().startsWith(api + '/api/')) requests.push({ path: new URL(request.url()).pathname, method: request.method() }); });
  await page.request.get(api + '/__test/session?role=monitor');
  await page.goto(origin + '/monitor/partes');
  await page.locator('tr[data-record]').first().waitFor();
  await page.locator('.part-thumb img').first().waitFor();
  const reads = requests.filter(request => request.method === 'GET');
  const count = pattern => reads.filter(request => pattern.test(request.path)).length;
  const result = {
    ok: true,
    rows: await page.locator('tr[data-record]').count(),
    workspace: count(/^\/api\/class-session-records\/workspace$/),
    thumbnails: count(/^\/api\/class-session-files\/thumbnails$/),
    detail: count(/^\/api\/class-session-records\/\d+$/),
    notifications: count(/^\/api\/operations\/notifications$/),
    auth: count(/^\/api\/auth\//),
    status: count(/^\/api\/system\/status$/),
    requests: reads.map(request => request.path),
  };
  writeFileSync('/home/joel/git/cepr/frontend/docs/partes-evidence/official-cold.json', JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result));
  await browser.close();
})().catch(error => { console.error(JSON.stringify({ ok: false, error: error.message })); process.exitCode = 1; });
