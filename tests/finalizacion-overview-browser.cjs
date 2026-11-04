async (page, config) => {
  const f = await (await page.request.get(config.api + '/__test/fixtures')).json();
  const baseline = config.readArtifact('baseline-chromium.json');
  const results = [];
  const routes = [];
  const errors = [];
  let http = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.url().startsWith(config.api + '/api/') && response.status() >= 400) http.push({ path: new URL(response.url()).pathname, status: response.status() }); });
  const check = (condition, name) => { if (!condition) throw new Error(name); results.push(name); };
  for (const route of baseline.routes) {
    let path = route.path;
    if (['UI-12', 'UI-13', 'UI-32'].includes(route.id)) path = path.replace(/[0-9a-f]{8}-[0-9a-f-]{27}/, f.ids.teacher);
    if (['UI-19', 'UI-35'].includes(route.id)) path = path.replace(/[0-9a-f]{8}-[0-9a-f-]{27}/, f.classId);
    if (route.id === 'UI-16') path = path.replace(/[0-9a-f]{8}-[0-9a-f-]{27}/, f.supervisorId);
    for (const width of [1920, 390, 320]) {
      config.stage = route.id + '/' + route.role + '/' + width;
      await page.goto('about:blank');
      await page.setViewportSize({ width, height: width === 1920 ? 1080 : 844 });
      if (route.role === 'public') await page.context().clearCookies();
      else await page.request.get(config.api + '/__test/session?role=' + route.role);
      http = [];
      await page.goto(config.origin + path);
      if (route.id === 'UI-02') await page.getByText('No encontramos esta página', { exact: true }).waitFor();
      else await page.locator('main:visible,h1:visible,h2:visible').first().waitFor();
      if (path.endsWith('/partes')) {
        await page.locator('.official-parts').waitFor();
        const classroom = page.locator('select').filter({ has: page.locator(`option[value="${f.classId}"]`) }).first();
        if (await classroom.count()) await classroom.selectOption(f.classId);
        await page.locator('tr[data-record]').first().waitFor();
      }
      await page.waitForTimeout(300);
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route.id}/${route.role}/${width}:sin overflow`);
      check(http.every(row => route.role === 'public' && row.path === '/api/auth/user-info' && row.status === 401), `${route.id}/${route.role}/${width}:sin HTTP inesperados`);
      const shot = `current-${route.id}-${route.role}-${width}.png`;
      await page.screenshot({ path: config.output + '/' + shot });
      routes.push({ id: route.id, role: route.role, path, width, screenshot: shot, http: [...http] });
      config.writeArtifact('current-overview-live.json', { routes, results, errors, fixture: f.processes.a.process });
    }
  }
  check(errors.length === 0, 'Sin errores JavaScript en37variantes');
  return { ok: true, suite: 'Recorrido actual de35IDs/37variantes', results, routes, errors, fixture: f.processes.a.process, date: new Date().toISOString(), limits: ['Recorrido de datos y responsive actual; no equivale a cerrar todos los estados de cada fase.'] };
}
