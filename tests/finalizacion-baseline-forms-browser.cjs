async (page, config) => {
  const definitions = [
    ['UI-11', 'docentes', 'Agregar docente', 'Crear docente', 'teachers'],
    ['UI-14', 'monitores', 'Agregar monitor', 'Crear monitor y salón', 'classes', 'monitors'],
    ['UI-15', 'supervisores', 'Agregar supervisor', 'Crear supervisor', 'supervisors'],
    ['UI-17', 'coordinadores', 'Agregar coordinador', 'Crear coordinador', 'coordinators'],
    ['UI-18', 'salones', 'Agregar salones', 'Crear 1 salón', 'classes/bulk', 'classes'],
    ['UI-20', 'cursos', 'Agregar curso', 'Guardar', 'courses'],
  ];
  const prior = config.resume ? config.readArtifact('baseline-forms-live.json') : undefined;
  const results = [...(prior?.results ?? [])];
  const forms = [...(prior?.forms ?? [])];
  const check = (condition, name) => { if (!condition) throw new Error(name); results.push(name); };
  const f = await (await page.request.get(config.api + '/__test/fixtures')).json();
  const json = async path => {
    const response = await page.request.get(config.api + '/api/' + path);
    if (!response.ok()) throw new Error('Lectura de persistencia ' + path + ' ' + response.status());
    return response.json();
  };
  for (const [id, path, triggerName, saveName, endpoint, readEndpoint] of definitions) {
    if (forms.some(form => form.id === id && form.phase === 'success-confirmed')) continue;
    config.stage = id + ' ciclo de formulario';
    await page.goto('about:blank');
    await page.request.get(config.api + '/__test/session?role=admin');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(config.origin + '/admin/gestionar/' + path);
    await page.getByRole('button', { name: triggerName, exact: true }).click();
    const dialog = page.getByRole('dialog').last();
    await dialog.waitFor();
    const save = dialog.getByRole('button', { name: saveName, exact: true });
    const beforeReads = await json((readEndpoint ?? endpoint) + (['teachers', 'monitors', 'supervisors', 'coordinators'].includes(readEndpoint ?? endpoint) ? '?page=1&limit=500' : ''));
    const intent = { id, fixture: f.processes.a.process, email: `e3-${id.toLowerCase()}-${Date.now()}@test.invalid`, name: `Curso sintético ${Date.now()}`, phase: 'initial' };
    let calls = 0;
    let release;
    let arrived;
    const requestArrived = new Promise(resolve => { arrived = resolve; });
    const pending = new Promise(resolve => { release = resolve; });
    await page.route(config.api + '/api/' + endpoint, async route => {
      if (route.request().method() !== 'POST') return route.continue();
      calls++;
      intent.payload = route.request().postDataJSON();
      intent.phase = 'saving-intercepted';
      config.writeArtifact('baseline-form-intent-' + id.toLowerCase() + '.json', intent);
      arrived(); await pending;
      await route.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"Fallo sintético E3 de formulario"}' }).catch(() => {});
    });
    if (await save.isEnabled()) await save.click();
    await page.waitForTimeout(100);
    check(calls === 0, id + ': inválido no escribe');
    await page.screenshot({ path: `${config.output}/${id}-form-invalid.png` });
    const fill = async (label, value) => {
      const input = dialog.getByLabel(label);
      if (await input.count() && await input.first().isEnabled()) await input.first().fill(value);
    };
    await fill(/^Correo de acceso/, intent.email);
    await fill(/^DNI/, '98' + String(Date.now()).slice(-6));
    await fill(/^Nombres/, 'Persona');
    await fill(/^Apellidos/, 'Sintetica');
    await fill(/^Celular/, '999999991');
    await fill(/^Correo personal/, 'personal-' + intent.email);
    await fill(/^Nombre del curso/, intent.name);
    await fill(/^Color$/, '#661124');
    for (const select of await dialog.locator('select').all()) {
      if (await select.isDisabled()) continue;
      const label = await select.evaluate(node => [...(node.labels ?? [])].map(label => label.textContent).join(' '));
      if (/Alcance/.test(label)) continue; // General sigue siendo una opción válida.
      if (!(await select.inputValue())) {
        const first = await select.locator('option').evaluateAll(options => options.find(option => option.value && !option.disabled)?.value);
        if (first) await select.selectOption(first);
      }
    }
    if (id === 'UI-14' || id === 'UI-18') {
      await dialog.getByLabel(/^Área/).selectOption('2');
      await dialog.getByLabel(/^Turno/).selectOption('2');
    }
    check(await save.isEnabled(), id + ': válido conserva habilitación');
    await page.screenshot({ path: `${config.output}/${id}-form-valid.png` });
    await save.click();
    await Promise.race([requestArrived, page.waitForTimeout(10000).then(() => { throw new Error(id + ': formulario no envió tras validación'); })]);
    await page.waitForFunction(node => node.disabled, await save.elementHandle(), { timeout: 2000 });
    check(calls === 1 && await save.isDisabled(), id + ': guardando excluye doble envío');
    const valuesBeforeResize = await dialog.locator('input,select').evaluateAll(nodes => nodes.map(node => [node.type, node.value]));
    for (const width of [1920, 390]) {
      await page.setViewportSize({ width, height: width === 1920 ? 1080 : 844 });
      await page.screenshot({ path: `${config.output}/${id}-form-saving-${width}.png` });
    }
    const valuesAfterResize = await dialog.locator('input,select').evaluateAll(nodes => nodes.map(node => [node.type, node.value]));
    check(JSON.stringify(valuesBeforeResize) === JSON.stringify(valuesAfterResize), id + ': breakpoint conserva valores sin remount');
    const failed = page.waitForResponse(response => response.url() === config.api + '/api/' + endpoint && response.request().method() === 'POST');
    release(); await failed;
    await dialog.getByRole('alert').filter({ hasText: 'Fallo sintético E3 de formulario' }).waitFor();
    await page.screenshot({ path: `${config.output}/${id}-form-error.png` });
    check(await dialog.isVisible(), id + ': fallo conserva formulario');
    await page.unrouteAll({ behavior: 'wait' });
    intent.phase = 'before-real-save';
    config.writeArtifact('baseline-form-intent-' + id.toLowerCase() + '.json', intent);
    const successful = page.waitForResponse(response => response.url() === config.api + '/api/' + endpoint && response.request().method() === 'POST');
    await save.click();
    const response = await successful;
    intent.status = response.status();
    intent.response = await response.json();
    config.writeArtifact('baseline-form-intent-' + id.toLowerCase() + '.json', intent);
    check(response.ok(), id + ': guardado real ' + response.status());
    await dialog.waitFor({ state: 'hidden' });
    const afterReads = await json((readEndpoint ?? endpoint) + (['teachers', 'monitors', 'supervisors', 'coordinators'].includes(readEndpoint ?? endpoint) ? '?page=1&limit=500' : ''));
    const rows = Array.isArray(afterReads) ? afterReads : afterReads.data;
    const oldRows = Array.isArray(beforeReads) ? beforeReads : beforeReads.data;
    if (id === 'UI-18') check(rows.some(row => !oldRows.some(old => old.id === row.id)), id + ': salón creado persistido');
    else if (id === 'UI-20') check(rows.some(row => row.name === intent.name && row.color === '#661124'), id + ': nombre/color persistidos');
    else check(rows.some(row => row.email === intent.email), id + ': persona persistida por correo sintético');
    await page.screenshot({ path: `${config.output}/${id}-form-success.png` });
    intent.phase = 'success-confirmed';
    config.writeArtifact('baseline-form-intent-' + id.toLowerCase() + '.json', intent);
    forms.push(intent);
    config.writeArtifact('baseline-forms-live.json', { forms, results });
  }
  return { ok: true, suite: 'E3 formularios de personas/catálogos', results, forms, date: new Date().toISOString(), limits: ['500 inyectado en primer guardado; éxito posterior usa API/PostgreSQL reales.', 'No prueba ediciones/eliminaciones ni el ciclo de solicitudes/importación; controles separados.'] };
}
