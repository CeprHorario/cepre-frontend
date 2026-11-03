async page => {
  const api = 'http://127.0.0.1:3000', origin = 'http://127.0.0.1:5174';
  const f = await (await page.request.get(api + '/__test/fixtures')).json();
  const results = [], errors = [], mutations = [], notificationReads = [];
  let stage = 'preparación';
  const check = (value, message) => { if (!value) throw Error(message); };
  const csrf = { Origin: origin, 'X-Requested-With': 'ceprunsa' };
  const headers = role => ({ ...csrf, 'X-Class-Session-Context': f.processes.a.process, 'X-Class-Session-Account': f.accounts[role].accountId });
  const control = async path => check((await page.request.post(api + '/__test/' + path, { headers: csrf })).ok(), path);
  const login = async role => check((await page.request.get(api + '/__test/session?role=' + role)).ok(), 'Sesión');
  const refocus = () => page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' }); window.dispatchEvent(new Event('visibilitychange'));
    delete document.visibilityState; window.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('focus'));
  });
  const bell = () => page.getByRole('button', { name: /^Notificaciones:/ });
  const dialog = () => page.getByRole('dialog').last();
  const openBell = async () => { if (await bell().getAttribute('aria-expanded') !== 'true') await bell().click(); };
  const resolve = async role => {
    const list = await (await page.request.get(api + '/api/operations/notifications', { headers: headers(role) })).json();
    const own = list.data.find(n => !n.resolved_at); check(own, 'Aviso sintético pendiente');
    check((await page.request.post(`${api}/api/operations/notifications/${own.id}/resolve`, { headers: headers(role), data: {} })).ok(), 'Resolver aviso con HTTP real');
  };
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => {
    if (r.url().includes('/api/') && !['GET', 'OPTIONS'].includes(r.method())) mutations.push(r.url());
    if (r.url().includes('/operations/notifications?')) notificationReads.push({ account: r.headers()['x-class-session-account'], process: r.headers()['x-class-session-context'] });
  });
  page.on('dialog', d => void d.accept());
  await page.addInitScript(() => {
    window.__streams = [];
    const Native = window.EventSource;
    window.EventSource = class extends Native {
      constructor(...args) {
        super(...args); const state = { source: this, messages: 0, closed: false, errors: 0 }; window.__streams.push(state);
        this.addEventListener('notifications', () => state.messages++);
        this.addEventListener('error', () => state.errors++);
        const close = this.close.bind(this); this.close = () => { state.closed = true; close(); };
      }
    };
  });
  try {
    await control('process?process=a&audience=both');
    stage = 'R-N01: SSE real invalida GET autorizado, no decide solicitudes';
    await login('monitor'); await page.goto(origin + '/monitor/solicitudes');
    await page.waitForFunction(() => window.__streams.some(s => s.messages > 0));
    await openBell(); await page.getByRole('region', { name: 'Notificaciones', exact: true }).getByText('Aviso sintético monitor A', { exact: true }).waitFor();
    await resolve('monitor');
    await page.getByRole('button', { name: 'Notificaciones: 0 pendientes', exact: true }).waitFor({ timeout: 30000 });
    check(await page.evaluate(() => window.__streams.some(s => s.messages >= 2)), 'Actualización llegó por evento SSE antes del sondeo de 60s');
    check(notificationReads.every(r => r.account === f.accounts.monitor.accountId && r.process === f.processes.a.process), 'Cada GET usa precondiciones de cuenta/proceso');
    check(!mutations.some(url => /operations\/requests/.test(url)), 'Resolver aviso no decide solicitud');
    results.push('R-N01: EventSource nativo recibe SSE real; cambio persistido invalida GET con precondiciones antes del sondeo, sin decisión de solicitud');

    stage = 'R-N01: cuenta cambia en la misma vista, respuesta HTTP y evento SSE tardíos';
    let release, heldReady;
    const held = new Promise(resolve => { heldReady = resolve; });
    let hold = true;
    await page.route('**/api/operations/notifications?**', async route => {
      if (!hold) return route.continue(); hold = false;
      const response = await route.fetch(); heldReady();
      await new Promise(resolve => { release = resolve; });
      await route.fulfill({ response }).catch(() => {});
    });
    await page.reload(); await held;
    await page.getByRole('button', { name: 'Solicitar reemplazo', exact: true }).click();
    await dialog().getByLabel('Motivo documentado').fill('Intención de cuenta A no transferible');
    await page.evaluate(() => window.__sameDocument = true);
    await login('otherMonitor'); await refocus();
    await openBell();
    await page.getByRole('region', { name: 'Notificaciones', exact: true }).getByText('Aviso sintético otherMonitor A', { exact: true }).waitFor({ timeout: 40000 });
    release();
    await page.evaluate(() => {
      for (const s of window.__streams.filter(s => s.closed)) s.source.dispatchEvent(new MessageEvent('notifications', { data: JSON.stringify({ data: [{ title: 'EVENTO ANTIGUO NO AUTORIZADO' }] }) }));
    });
    await page.waitForFunction(() => window.__streams.some(s => s.closed) && window.__streams.some(s => !s.closed && s.messages > 0));
    check(await page.evaluate(() => window.__sameDocument === true), 'Sin recargar ni navegar para cambiar cuenta');
    check(await page.getByRole('dialog', { name: 'Solicitar reemplazo', exact: true }).count() === 0, 'Formulario de cuenta A no transferido');
    check(await page.getByText('Aviso sintético monitor A', { exact: true }).count() === 0 && await page.getByText('EVENTO ANTIGUO NO AUTORIZADO', { exact: true }).count() === 0, 'No reaparece respuesta/evento de cuenta anterior');
    await page.unroute('**/api/operations/notifications?**');
    results.push('R-N01: cambio de cookie/cuenta en la misma vista cierra SSE antiguo y aísla formulario; respuesta HTTP real retenida y evento tardío no contaminan la nueva cuenta');

    stage = 'R-N01: SSE caído, recuperación por sondeo HTTP real';
    await page.route('**/api/operations/notifications/stream', route => route.abort('failed'));
    await login('supervisor'); await page.goto(origin + '/supervisor/solicitudes');
    await page.waitForFunction(() => window.__streams.some(s => s.errors > 0));
    await page.getByRole('button', { name: 'Notificaciones: 1 pendientes', exact: true }).waitFor();
    await resolve('supervisor');
    await page.getByRole('button', { name: 'Notificaciones: 0 pendientes', exact: true }).waitFor({ timeout: 75000 });
    check(await page.evaluate(() => window.__streams.every(s => s.messages === 0)), 'No se recibió SSE');
    results.push('R-N01: fallo de transporte SSE inyectado; sondeo de 60s recupera estado persistido mediante GET real, sin payload simulado');
    await page.unroute('**/api/operations/notifications/stream');

    stage = 'R-N01: Excel se aísla por proceso aun con preview tardío';
    await login('teacher'); await page.goto(origin + '/docente');
    await page.getByRole('button', { name: 'Disponibilidad en Excel', exact: true }).click();
    const template = await page.request.get(api + '/api/operations/availability/me/template', { headers: headers('teacher') });
    check(template.ok(), 'Plantilla Excel real');
    let previewReady, releasePreview;
    const previewHeld = new Promise(resolve => { previewReady = resolve; });
    await page.route('**/api/operations/availability/me/preview', async route => {
      const response = await route.fetch(); check(response.ok(), 'Previsualización Excel real'); previewReady();
      await new Promise(resolve => { releasePreview = resolve; }); await route.fulfill({ response }).catch(() => {});
    });
    await dialog().locator('input[type=file]').setInputFiles({ name: 'disponibilidad-sintetica.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: await template.body() });
    await previewHeld;
    await control('process?process=b&audience=both'); await login('teacher'); await refocus();
    await page.getByRole('dialog', { name: 'Disponibilidad del docente', exact: true }).waitFor({ state: 'hidden', timeout: 40000 });
    releasePreview(); await page.unroute('**/api/operations/availability/me/preview');
    await page.getByRole('button', { name: 'Disponibilidad en Excel', exact: true }).click();
    check(await dialog().getByText('disponibilidad-sintetica.xlsx', { exact: true }).count() === 0 && await dialog().getByRole('button', { name: 'Guardar disponibilidad' }).count() === 0, 'Archivo/preview anterior no reaparece');
    check(!mutations.some(url => /availability\/me$/.test(url)), 'Preview no guarda disponibilidad');
    await page.keyboard.press('Escape');
    results.push('R-N01: plantilla y preview Excel reales; cambio A→B remonta editor y no traslada archivo/respuesta tardía ni ejecuta PUT');

    stage = 'R-N01: incidencia rápida no traslada intención al nuevo proceso';
    await control('process?process=a&audience=both'); await login('admin'); await page.goto(origin + '/admin/gestionar/monitores');
    await page.getByRole('button', { name: 'Registrar incidencia', exact: true }).first().click();
    await dialog().getByLabel('Título', { exact: true }).fill('Incidencia rápida del proceso A');
    await dialog().getByLabel('Observación documentada', { exact: true }).fill('No trasladar a B');
    await control('process?process=b&audience=both'); await refocus();
    await page.getByRole('dialog', { name: 'Registrar incidencia', exact: true }).waitFor({ state: 'hidden', timeout: 40000 });
    await page.getByRole('button', { name: 'Registrar incidencia', exact: true }).first().click();
    check(await dialog().getByLabel('Título', { exact: true }).inputValue() === '' && await dialog().getByLabel('Observación documentada', { exact: true }).inputValue() === '', 'Editor B vacío');
    check(!mutations.some(url => url.endsWith('/api/incidences')), 'No se reenvía incidencia con identidad nueva');
    await page.keyboard.press('Escape');
    results.push('R-N01: formulario de incidencia rápida se reinicia por proceso y no registra ni reintenta intención anterior');
    check(errors.length === 0, errors.join('\n'));
    const result = { ok: true, suite: 'modernizacion-transportes', date: new Date().toISOString(), results, errors, limits: ['SSE/HTTP/Excel reales del harness aislado; fallo SSE y retención de respuestas inyectados explícitamente', 'El cambio de cuenta usa cookie local sintética, no OAuth externo', 'No línea base visual H2'] };
    await page.evaluate(result => { window.__modernizacionResult = result; sessionStorage.setItem('__modernizacionResult', JSON.stringify(result)); }, result); return result;
  } catch (e) {
    const result = { ok: false, stage, error: e.message, results, errors, alerts: await page.getByRole('alert').allTextContents() };
    await page.evaluate(result => { window.__modernizacionResult = result; sessionStorage.setItem('__modernizacionResult', JSON.stringify(result)); }, result); return result;
  } finally { await control('process?process=a&audience=both'); }
}
