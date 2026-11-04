async (page, config) => {
  const { api, origin } = config;
  const requests = [];
  const results = [];
  const check = (value, name) => { if (!value) throw new Error(name); results.push(name); };
  await page.addInitScript(() => {
    const Native = window.EventSource;
    window.__finalStreams = [];
    window.__finalStreamMetrics = { snapshots: 0, heartbeats: 0, connections: 0 };
    window.EventSource = class extends Native {
      constructor(...args) {
        super(...args);
        window.__finalStreams.push(this);
        window.__finalStreamMetrics.connections++;
        this.addEventListener('notifications', () => window.__finalStreamMetrics.snapshots++);
        this.addEventListener('heartbeat', () => window.__finalStreamMetrics.heartbeats++);
      }
    };
  });
  page.on('request', request => {
    if (request.url().startsWith(api + '/api/')) requests.push({ at: Date.now(), method: request.method(), path: new URL(request.url()).pathname });
  });
  const f = await (await page.request.get(api + '/__test/fixtures')).json();
  await page.request.get(api + '/__test/session?role=monitor');
  await page.goto(origin + '/monitor/partes');
  const classroom = page.locator('select').filter({ has: page.locator(`option[value="${f.classId}"]`) }).first();
  if (await classroom.count()) await classroom.selectOption(f.classId);
  await page.locator('tr[data-record]').first().waitFor();
  await page.locator('.part-thumb img').first().waitFor();
  await page.waitForFunction(() => window.__finalStreamMetrics.snapshots > 0);
  const loaded = Date.now();
  const cold = requests.filter(request => request.at <= loaded);
  const dataRead = request => request.method === 'GET' && (request.path.startsWith('/api/class-session-') || request.path === '/api/operations/notifications');
  check(cold.filter(request => request.path === '/api/class-session-records/workspace').length === 1, 'V-06 frío: un workspace');
  check(cold.filter(request => /^\/api\/class-session-records\/\d+$/.test(request.path)).length === 0, 'V-06 frío: cero detalles por fila');
  config.stage = 'SSE sano600s';
  await page.waitForTimeout(600000);
  const healthy = requests.filter(request => request.at > loaded && dataRead(request));
  const stream = await page.evaluate(() => window.__finalStreamMetrics);
  check(healthy.length === 0, 'V-06 diez minutos SSE: cero GET por temporizador');
  check(stream.heartbeats >= 19, 'V-06 diez minutos con heartbeats reales');
  config.writeArtifact('budget-healthy-intermediate.json', { ok: true, healthySeconds: 600, cold, stream, healthyGets: healthy.length, date: new Date().toISOString() });
  // Inyección explícita: abortar reconexiones y cerrar la conexión existente.
  // route.abort por sí solo no corta un EventSource ya establecido.
  await page.route('**/operations/notifications/stream', route => route.abort());
  await page.evaluate(() => { for (const source of window.__finalStreams) { source.close(); source.dispatchEvent(new Event('error')); } });
  const failedAt = Date.now();
  config.stage = 'fallback600s';
  await page.waitForTimeout(600000);
  const fallback = requests.filter(request => request.at > failedAt && dataRead(request));
  const lists = fallback.filter(request => request.path === '/api/operations/notifications');
  check(lists.length > 0 && lists.length <= 10, 'V-06 diez minutos fallback: sondeo presente y acotado');
  await page.unroute('**/operations/notifications/stream');
  await page.waitForFunction(previous => window.__finalStreamMetrics.snapshots > previous, stream.snapshots, { timeout: 120000 });
  const recovered = Date.now();
  config.stage = 'recuperación65s';
  await page.waitForTimeout(65000);
  const afterRecovery = requests.filter(request => request.at > recovered && dataRead(request));
  check(afterRecovery.length === 0, 'V-06 recuperación real: cesa sondeo');
  return { ok: true, suite: 'Presupuesto frío/SSE/fallback', results, cold, stream, healthySeconds: 600, healthyGets: healthy.length, fallbackSeconds: 600, fallback, recoverySeconds: 65, afterRecovery, date: new Date().toISOString(), limits: ['Corte de red inyectado explícitamente; SSE y GET reales. Sin cambios a hook/transporte protegido.'] };
}
