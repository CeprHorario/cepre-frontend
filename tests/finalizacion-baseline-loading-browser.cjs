async (page, config) => {
  const results = [];
  const routes = [];
  for (const record of config.baselineData ?? []) {
    if (!record.endpoint || record.role === 'public') continue;
    config.stage = record.id + ' ' + record.role + ' carga';
    const measurements = [];
    for (const width of [1920, 390]) {
      await page.goto('about:blank');
      await page.request.get(config.api + '/__test/session?role=' + record.role);
      await page.setViewportSize({ width, height: width === 1920 ? 1080 : 844 });
      let release;
      let started;
      const arrived = new Promise(resolve => { started = resolve; });
      const delayed = new Promise(resolve => { release = resolve; });
      const pattern = config.api + '/api/' + record.endpoint;
      let intercepted = 0;
      await page.route(pattern, async route => {
        intercepted++; started(); await delayed;
        await route.continue().catch(() => {});
      });
      await page.goto(config.origin + record.path);
      await Promise.race([arrived, page.waitForTimeout(15000).then(() => { throw new Error('Sin petición de carga para ' + pattern); })]);
      const shot = `${record.id}-${record.role}-${width}-loading.png`;
      await page.screenshot({ path: config.output + '/' + shot });
      const state = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        status: [...document.querySelectorAll('[role=status],[aria-busy=true]')].map(node => node.textContent.trim()),
        alerts: [...document.querySelectorAll('[role=alert]')].map(node => node.textContent.trim()),
        text: document.querySelector('main')?.innerText ?? document.body.innerText,
      }));
      release();
      await page.unrouteAll({ behavior: 'wait' });
      measurements.push({ width, screenshot: shot, intercepted, ...state });
    }
    results.push(`${record.id}/${record.role}: carga real retenida en1920/390`);
    routes.push({ id: record.id, role: record.role, measurements });
    config.writeArtifact('baseline-loading-live.json', { routes });
  }
  return { ok: true, suite: 'E3 carga por consulta primaria', results, routes, date: new Date().toISOString(), limits: ['Retención de lecturas identificada; no es demora artificial del producto ni aprobación de estados falsos preexistentes.'] };
}
