async (page, config) => {
  const routes = [
    ['public', '/'], ['admin', '/admin'], ['admin', '/admin/gestionar/docentes'], ['admin', '/admin/gestionar/cursos'], ['monitor', '/monitor'], ['monitor', '/monitor/partes'],
  ];
  const samples = [];
  for (const [role, path] of routes) {
    for (let sample = 0; sample < 3; sample++) {
      config.stage = 'Medir ' + role + path + '/' + sample;
      const context = await page.context().browser().newContext({ viewport: { width: 1920, height: 1080 } });
      const tab = await context.newPage();
      try {
        if (role !== 'public') await tab.request.get(config.api + '/__test/session?role=' + role);
        const start = Date.now();
        await tab.goto(config.origin + path);
        await tab.locator('main:visible,h1:visible,h2:visible').first().waitFor();
        if (path.endsWith('/partes')) await tab.locator('tr[data-record]').first().waitFor();
        else if (path.endsWith('/cursos')) await tab.getByRole('button', { name: 'Agregar curso', exact: true }).waitFor();
        else if (path.endsWith('/docentes')) await tab.locator('tbody tr').first().waitFor();
        const readyMs = Date.now() - start;
        const resources = await tab.evaluate(() => performance.getEntriesByType('resource').filter(entry => /\.(js|css)(\?|$)/.test(entry.name)).map(entry => ({ path: new URL(entry.name).pathname, duration: entry.duration, transfer: entry.transferSize, encoded: entry.encodedBodySize, decoded: entry.decodedBodySize })));
        let interactionMs = null;
        if (path.endsWith('/cursos')) {
          const began = Date.now(); await tab.getByRole('button', { name: 'Agregar curso', exact: true }).click(); await tab.getByRole('dialog').waitFor(); interactionMs = Date.now() - began;
        }
        samples.push({ role, path, sample, readyMs, interactionMs, resources });
      } finally { await context.close(); }
    }
  }
  const summary = routes.map(([role, path]) => {
    const values = samples.filter(sample => sample.role === role && sample.path === path).map(sample => sample.readyMs).sort((a, b) => a - b);
    return { role, path, min: values[0], median: values[1], max: values[2] };
  });
  return { ok: true, suite: 'Latencias y recursos,3muestras por ruta', results: summary.map(item => item.role + item.path), samples, summary, date: new Date().toISOString(), limits: ['Entorno local sin throttling; no son latencias productivas.', 'No hay latencias preE2 equivalentes: no se afirma mejora temporal frente a una base que no se midió; sí grafo de bytes comparable.'] };
}
