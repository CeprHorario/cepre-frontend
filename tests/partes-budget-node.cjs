const { chromium } = require('playwright-core');
const { writeFileSync } = require('node:fs');

(async () => {
  const api = 'http://127.0.0.1:3107', origin = 'http://127.0.0.1:5187';
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext();
  const page = await context.newPage();
  const requests = [];
  page.on('request', request => { if (request.url().startsWith(api + '/api/')) requests.push({ at: Date.now(), method: request.method(), path: new URL(request.url()).pathname }); });
  await page.addInitScript(() => {
    window.__partsStreamMetrics = { snapshots: 0, heartbeats: 0, connections: 0 };
    const Original = window.EventSource;
    window.EventSource = class extends Original {
      constructor(url, options) {
        super(url, options);
        window.__partsStreamMetrics.connections++;
        this.addEventListener('notifications', () => window.__partsStreamMetrics.snapshots++);
        this.addEventListener('heartbeat', () => window.__partsStreamMetrics.heartbeats++);
      }
    };
  });
  const session = await page.request.get(api + '/__test/session?role=monitor');
  if (!session.ok()) throw new Error('Sesión de presupuesto no disponible');
  await page.goto(origin + '/monitor/partes');
  await page.locator('tr[data-record]').first().waitFor();
  await page.waitForFunction(() => window.__partsStreamMetrics.snapshots > 0);
  await page.locator('.part-thumb img').first().waitFor();
  const loaded = Date.now();
  const cold = requests.filter(request => request.at <= loaded);
  const isRead = request => request.method === 'GET' && (request.path.startsWith('/api/class-session-') || request.path === '/api/operations/notifications');
  console.error('healthy-start');
  await page.waitForTimeout(600000);
  const healthy = requests.filter(request => request.at > loaded && isRead(request));
  const stream = await page.evaluate(() => window.__partsStreamMetrics);
  if (healthy.length) throw new Error('GET repetidos con SSE sano: ' + JSON.stringify(healthy));
  if (stream.heartbeats < 19) throw new Error('No se acreditan diez minutos de heartbeats: ' + stream.heartbeats);
  console.error('fallback-start', JSON.stringify(stream));
  await page.route('**/operations/notifications/stream', route => route.abort());
  const failedAt = Date.now();
  await page.waitForTimeout(600000);
  const fallback = requests.filter(request => request.at > failedAt && isRead(request));
  const lists = fallback.filter(request => request.path === '/api/operations/notifications');
  if (!lists.length || lists.length > 10) throw new Error('Fallback ausente o redundante: ' + lists.length);
  console.error('recovery-start', fallback.length, lists.length);
  await page.unroute('**/operations/notifications/stream');
  await page.waitForFunction(previous => window.__partsStreamMetrics.snapshots > previous, stream.snapshots, { timeout: 120000 });
  const recoveredAt = Date.now();
  await page.waitForTimeout(65000);
  const afterRecovery = requests.filter(request => request.at > recoveredAt && isRead(request));
  if (afterRecovery.length) throw new Error('Sondeo no cancelado tras recuperar SSE');
  const result = { ok: true, healthySeconds: 600, fallbackSeconds: 600, recoverySeconds: 65, cold, healthyGets: healthy.length, stream, fallback, getsAfterRecovery: afterRecovery.length };
  writeFileSync('/home/joel/git/cepr/frontend/docs/partes-evidence/official-budget.json', JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result));
  await browser.close();
})().catch(async error => {
  console.error(JSON.stringify({ ok: false, error: error.message }));
  process.exitCode = 1;
});
