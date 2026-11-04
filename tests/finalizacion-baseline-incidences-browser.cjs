async (page, config) => {
  const results = [];
  const saved = [];
  const check = (condition, name) => { if (!condition) throw new Error(name); results.push(name); };
  const f = await (await page.request.get(config.api + '/__test/fixtures')).json();
  for (const role of ['admin', 'supervisor']) {
    config.stage = 'E3 incidencia ' + role;
    const id = role === 'admin' ? 'UI-06' : 'UI-29';
    await page.goto('about:blank');
    await page.request.get(config.api + '/__test/session?role=' + role);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(config.origin + '/' + role + '/incidencias');
    await page.getByRole('button', { name: 'Registrar incidencia', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Registrar incidencia', exact: true });
    const save = dialog.getByRole('button', { name: 'Registrar en el historial', exact: true });
    check(await save.isDisabled(), id + ': inválido no guarda');
    if (role === 'admin') await dialog.getByLabel(/^Persona reportada/).selectOption('monitor');
    const person = dialog.getByLabel(/^Seleccionar persona/);
    await person.locator(`option[value="${f.accounts.monitor.accountId}"]`).waitFor({ state: 'attached' });
    await person.selectOption(f.accounts.monitor.accountId);
    const title = 'E3 incidencia ' + role + ' ' + Date.now();
    await dialog.getByLabel('Título', { exact: true }).fill(title);
    await dialog.getByLabel(/^Observaciones/).fill('Hecho íntegramente sintético para caracterización del formulario');
    check(await save.isEnabled(), id + ': persona/DNI,fecha,título y descripción válidos habilitan');
    await page.screenshot({ path: config.output + '/' + id + '-form-valid.png' });
    let arrived;
    let release;
    const started = new Promise(resolve => { arrived = resolve; });
    const held = new Promise(resolve => { release = resolve; });
    let payload;
    await page.route(config.api + '/api/incidences', async route => {
      if (route.request().method() !== 'POST') return route.continue();
      payload = route.request().postDataJSON(); arrived(); await held;
      await route.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"Fallo sintético E3 incidencia"}' }).catch(() => {});
    });
    await save.click(); await started;
    await page.waitForFunction(node => node.disabled, await save.elementHandle());
    check(await save.isDisabled(), id + ': guardando bloquea doble envío');
    for (const width of [1920, 390]) {
      await page.setViewportSize({ width, height: width === 1920 ? 1080 : 844 });
      await page.screenshot({ path: `${config.output}/${id}-form-saving-${width}.png` });
    }
    release();
    await dialog.getByRole('alert').getByText('Fallo sintético E3 incidencia', { exact: true }).waitFor();
    await page.waitForTimeout(6000);
    check(await dialog.getByRole('alert').isVisible() && await dialog.getByLabel('Título', { exact: true }).inputValue() === title, id + ': error persiste y conserva borrador');
    await page.screenshot({ path: `${config.output}/${id}-form-error.png` });
    await page.unrouteAll({ behavior: 'wait' });
    config.writeArtifact('baseline-incidence-intent-' + role + '.json', { payload, fixture: f.processes.a.process, phase: 'before-real-save' });
    const responsePromise = page.waitForResponse(response => response.url() === config.api + '/api/incidences' && response.request().method() === 'POST');
    await save.click();
    const response = await responsePromise;
    check(response.status() === 201, id + ': persistencia HTTP real');
    const incidence = await response.json();
    await dialog.waitFor({ state: 'hidden' });
    const headers = { 'X-Class-Session-Account': f.accounts[role].accountId, 'X-Class-Session-Context': f.processes.a.process };
    const list = await (await page.request.get(config.api + '/api/incidences?page=1&limit=100', { headers })).json();
    check(list.data.some(row => row.id === incidence.id && row.subject_dni === '92000001' && row.title === title), id + ': lectura autorizada conserva hecho/DNI y autor');
    check(incidence.actor_id === f.accounts[role].accountId && incidence.subject_account_id === f.accounts.monitor.accountId, id + ': actor y persona no se confunden');
    saved.push({ id, role, incidence, payload });
    config.writeArtifact('baseline-incidence-intent-' + role + '.json', { payload, incidence, fixture: f.processes.a.process, phase: 'success-confirmed' });
    await page.screenshot({ path: `${config.output}/${id}-form-success.png` });
    if (role === 'admin') {
      const row = page.locator('tbody tr').filter({ hasText: title });
      await row.getByRole('button', { name: 'Resolver', exact: true }).click();
      const resolution = page.getByRole('dialog', { name: 'Resolución administrativa', exact: true });
      check(await resolution.getByRole('button', { name: 'Confirmar', exact: true }).isDisabled(), 'UI-06 resolver exige motivo');
      await resolution.getByLabel('Motivo', { exact: true }).fill('Resolución sintética auditada de baseline');
      await resolution.getByRole('button', { name: 'Confirmar', exact: true }).click();
      await row.getByRole('button', { name: 'Reabrir', exact: true }).waitFor();
      await row.getByRole('button', { name: 'Reabrir', exact: true }).click();
      await resolution.getByLabel('Motivo', { exact: true }).fill('Reapertura sintética auditada de baseline');
      await resolution.getByRole('button', { name: 'Confirmar', exact: true }).click();
      await row.getByRole('button', { name: 'Resolver', exact: true }).waitFor();
      await row.getByRole('button', { name: 'Historial', exact: true }).click();
      const history = page.getByRole('dialog', { name: 'Trazabilidad de la incidencia', exact: true });
      await history.getByText('RESOLVED', { exact: true }).waitFor();
      await history.getByText('OPEN', { exact: true }).waitFor();
      check(true, 'UI-06 resolver/reabrir/historial reales sin cambiar texto original');
      await page.keyboard.press('Escape');
    }
  }
  return { ok: true, suite: 'E3 incidencias A/S y resolución', results, saved, date: new Date().toISOString(), limits: ['Primer500 inyectado; guardado/lista/resolución/historial son reales.', 'Observaciones de Partes siguen congeladas; se prueban por sus suites, no se editan aquí.'] };
}
