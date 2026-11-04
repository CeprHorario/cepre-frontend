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
    window.__partsStreams = [];
    const Original = window.EventSource;
    window.EventSource = class extends Original {
      constructor(url, options) {
        super(url, options);
        window.__partsStreamMetrics.connections++;
        window.__partsStreams.push(this);
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
  const stream = await page.evaluate(() => window.__partsStreamMetrics);
  await page.route('**/operations/notifications/stream', route => route.abort());
  await page.evaluate(() => { for (const source of window.__partsStreams) { source.close(); source.dispatchEvent(new Event('error')); } });
  const failedAt = Date.now();
  console.error('fallback-start', JSON.stringify(stream));
  await page.waitForTimeout(600000);
  const isRead = request => request.method === 'GET' && (request.path.startsWith('/api/class-session-') || request.path === '/api/operations/notifications');
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
  const result = { ok: true, fallbackSeconds: 600, recoverySeconds: 65, stream, fallbackGets: fallback.length, fallbackLists: lists.length, getsAfterRecovery: afterRecovery.length };
  writeFileSync('/home/joel/git/cepr/frontend/docs/partes-evidence/official-budget-fallback.json', JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result));
  await browser.close();
})().catch(error => { console.error(JSON.stringify({ ok: false, error: error.message })); process.exitCode = 1; });
