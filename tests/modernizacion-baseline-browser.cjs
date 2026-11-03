async page => {
  const api = 'http://127.0.0.1:3000', origin = 'http://127.0.0.1:5174';
  const f = await (await page.request.get(api + '/__test/fixtures')).json();
  const limits = { errors: [], http: [], results: [] };
  const shots = 'docs/modernizacion/baseline';
  const visited = [];
  const current = { errors: [], http: [] };
  page.on('pageerror', e => { limits.errors.push(e.message); current.errors.push(e.message); });
  page.on('response', r => {
    if (r.url().startsWith(api + '/api/') && r.status() >= 400) current.http.push({ status: r.status(), path: r.url().slice(api.length).split('?')[0] });
  });
  page.on('dialog', d => void d.accept());
  const login = async role => {
    const r = await page.request.get(`${api}/__test/session?role=${role}`);
    if (!r.ok()) throw Error('Sesión sintética ' + role);
  };
  const routes = [
    ['UI-01', 'public', '/', 'Inicio de sesión'],
    ['UI-03', 'admin', '/admin', 'Panel administrativo'],
    ['UI-04', 'admin', '/admin/partes', 'Partes administrativo'],
    ['UI-05', 'admin', '/admin/solicitudes', 'Solicitudes administrativo'],
    ['UI-06', 'admin', '/admin/incidencias', 'Incidencias administrativo'],
    ['UI-07', 'admin', '/admin/reportes', 'Reportes'],
    ['UI-08', 'admin', '/admin/generar', 'Generar proceso'],
    ['UI-09', 'admin', '/admin/importar', 'Importar'],
    ['UI-10', 'admin', '/admin/configuracion', 'Configuración'],
    ['UI-11', 'admin', '/admin/gestionar/docentes', 'Docentes'],
    ['UI-12', 'admin', `/admin/gestionar/docentes/${f.ids.teacher}/asignar`, 'Asignar salones'],
    ['UI-13', 'admin', `/admin/gestionar/docentes/${f.ids.teacher}/horario`, 'Horario docente'],
    ['UI-14', 'admin', '/admin/gestionar/monitores', 'Monitores'],
    ['UI-15', 'admin', '/admin/gestionar/supervisores', 'Supervisores'],
    ['UI-16', 'admin', `/admin/gestionar/supervisores/${f.supervisorId}/monitores`, 'Monitores del supervisor'],
    ['UI-17', 'admin', '/admin/gestionar/coordinadores', 'Coordinadores'],
    ['UI-18', 'admin', '/admin/gestionar/salones', 'Salones'],
    ['UI-19', 'admin', `/admin/gestionar/salones/${f.classId}`, 'Detalle del salón'],
    ['UI-20', 'admin', '/admin/gestionar/cursos', 'Cursos'],
    ['UI-21', 'teacher', '/docente', 'Panel docente'],
    ['UI-22', 'teacher', '/docente/solicitudes', 'Solicitudes docente'],
    ['UI-23', 'monitor', '/monitor', 'Panel monitor'],
    ['UI-24', 'monitor', '/monitor/partes', 'Partes por fecha'],
    ['UI-25', 'monitor', '/monitor/solicitudes', 'Solicitudes monitor'],
    ['UI-26', 'supervisor', '/supervisor', 'Panel supervisor'],
    ['UI-27', 'supervisor', '/supervisor/partes', 'Partes supervisor'],
    ['UI-28', 'supervisor', '/supervisor/solicitudes', 'Solicitudes supervisor'],
    ['UI-29', 'supervisor', '/supervisor/incidencias', 'Incidencias supervisor'],
    ['UI-30', 'coordinator', '/coordinador/docentes', 'Docentes coordinación'],
    ['UI-32', 'coordinator', `/coordinador/docentes/${f.ids.teacher}/horario`, 'Horario coordinación'],
    ['UI-33', 'coordinator', '/coordinador/salones', 'Salones coordinación'],
    ['UI-35', 'coordinator', `/coordinador/salones/${f.classId}`, 'Detalle salón coordinación'],
  ];
  const home = role => role === 'admin' ? 'admin' : role === 'teacher' ? 'docente' : role;
  void home;
  try {
    await page.request.post(api + '/__test/maintenance?enabled=false', { headers: { Origin: origin, 'X-Requested-With': 'ceprunsa' } });
    await page.request.post(api + '/__test/process?process=a&audience=both', { headers: { Origin: origin, 'X-Requested-With': 'ceprunsa' } });
    await page.setViewportSize({ width: 1920, height: 1080 });
    for (const [id, role, path, label] of routes) {
      current.errors.length = 0; current.http.length = 0;
      if (role === 'public') {
        await page.context().clearCookies();
        await page.goto(origin + '/');
      } else {
        await login(role); await page.goto(origin + path);
      }
      await page.locator('main, h1').first().waitFor({ timeout: 20000 }).catch(() => {});
      await page.waitForTimeout(700);
      if (role === 'monitor' && path === '/monitor/partes') {
        await page.getByRole('button', { name: /^Abrir jornada / }).first().click().catch(() => {});
        await page.locator('[data-record]').first().waitFor({ timeout: 10000 }).catch(() => {});
      }
      const shot = `${shots}/${id}-${role}.png`;
      await page.screenshot({ path: shot, fullPage: false });
      const data = await page.evaluate(() => ({
        title: document.title,
        h1: [...document.querySelectorAll('h1')].map(n => n.textContent?.trim()).filter(Boolean),
        h2: [...document.querySelectorAll('h2')].map(n => n.textContent?.trim()).filter(Boolean).slice(0, 12),
        buttons: [...document.querySelectorAll('button')].map(n => (n.getAttribute('aria-label') || n.textContent || '').trim()).filter(Boolean).slice(0, 40),
        links: [...document.querySelectorAll('a')].map(n => (n.getAttribute('aria-label') || n.textContent || '').trim()).filter(Boolean).slice(0, 40),
        headers: [...document.querySelectorAll('th')].map(n => n.textContent?.trim()).filter(Boolean).slice(0, 30),
        rows: document.querySelectorAll('tbody tr').length,
        alerts: [...document.querySelectorAll('[role=alert]')].map(n => n.textContent?.trim()).slice(0, 5),
        fields: [...document.querySelectorAll('input,select,textarea')].length,
        busy: Boolean(document.querySelector('[aria-busy=true]')),
        overflowX: document.documentElement.scrollWidth > innerWidth,
      }));
      visited.push({ id, role, path, label, screenshot: shot, ...data, errors: [...current.errors], httpErrors: [...current.http] });
      if (current.http.length) limits.http.push({ id, role, path, http: [...current.http] });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of visited) {
      if (route.role === 'public') { await page.context().clearCookies(); await page.goto(origin + route.path); }
      else { await login(route.role); await page.goto(origin + route.path); }
      await page.locator('main, h1').first().waitFor({ timeout: 20000 }).catch(() => {});
      await page.waitForTimeout(400);
      if (route.role === 'monitor' && route.path === '/monitor/partes') {
        await page.getByRole('button', { name: /^Abrir jornada / }).first().click().catch(() => {});
        await page.locator('[data-record]').first().waitFor({ timeout: 10000 }).catch(() => {});
      }
      route.mobile = await page.evaluate(() => ({ overflowX: document.documentElement.scrollWidth > innerWidth, width: innerWidth }));
      if (['UI-11', 'UI-23', 'UI-24'].includes(route.id)) {
        route.mobileScreenshot = `${shots}/${route.id}-${route.role}-390.png`;
        await page.screenshot({ path: route.mobileScreenshot });
      }
    }
    await page.setViewportSize({ width: 1920, height: 1080 });
    const result = { ok: true, suite: 'modernizacion-baseline', date: new Date().toISOString(), version: 'h2-2026-11-03', routes: visited, limits: ['Captura funcional de Chromium a 1920×1080 y 390×844 con datos sintéticos', 'Algunas pantallas requieren datos que el harness no compone; se registran HTTP fallidos', 'No sustituye teclado, zoom, Firefox/WebKit ni lector de pantalla'] };
    await page.evaluate(result => { window.__modernizacionResult = result; sessionStorage.setItem('__modernizacionResult', JSON.stringify(result)); }, result);
    return result;
  } catch (e) {
    const result = { ok: false, suite: 'modernizacion-baseline', date: new Date().toISOString(), error: e.message, routes: visited, errors: limits.errors, limits: [] };
    await page.evaluate(result => { window.__modernizacionResult = result; sessionStorage.setItem('__modernizacionResult', JSON.stringify(result)); }, result);
    return result;
  }
}
