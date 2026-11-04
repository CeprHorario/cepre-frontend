async (page, config) => {
  const results = [];
  const requests = [];
  config.seed('requests');
  const check = (condition, name) => { if (!condition) throw new Error(name); results.push(name); };
  const f = await (await page.request.get(config.api + '/__test/fixtures')).json();
  const date = new Date(f.date + 'T12:00:00Z');
  date.setUTCDate(date.getUTCDate() + ((1 - date.getUTCDay() + 7) % 7 || 7));
  const monday = date.toISOString().slice(0, 10);
  for (const role of ['teacher', 'monitor', 'supervisor']) {
    const id = { teacher: 'UI-22', monitor: 'UI-25', supervisor: 'UI-28' }[role];
    config.stage = id + ' solicitud real';
    await page.goto('about:blank');
    await page.request.get(config.api + '/__test/session?role=' + role);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(config.origin + '/' + (role === 'teacher' ? 'docente' : role) + '/solicitudes');
    await page.getByRole('button', { name: 'Solicitar reemplazo', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Solicitar reemplazo', exact: true });
    check(await dialog.getByRole('button', { name: 'Enviar solicitud', exact: true }).isDisabled(), id + ': inválido no envía');
    await dialog.getByLabel('Fecha de trabajo', { exact: false }).fill(monday);
    if (role !== 'teacher') await dialog.getByLabel('Tipo de solicitud', { exact: false }).selectOption('EMERGENCY');
    await dialog.getByLabel('Salón', { exact: true }).locator(`option[value="${f.classId}"]`).waitFor({ state: 'attached' });
    await dialog.getByLabel('Salón', { exact: true }).selectOption(f.classId);
    const blocks = dialog.getByRole('group', { name: 'Bloques consecutivos que necesitas cubrir', exact: true });
    await blocks.locator('input[type=checkbox]').first().waitFor();
    await blocks.locator('input[type=checkbox]').first().check();
    const candidate = dialog.getByRole('combobox', { name: 'Reemplazante propuesto', exact: true });
    const replacement = candidate.locator('option').filter({ hasText: 'e3-request-candidate@test.invalid' });
    await replacement.waitFor({ state: 'attached' });
    await candidate.selectOption(await replacement.getAttribute('value'));
    const reason = 'Solicitud sintética E3 ' + role + ' ' + Date.now();
    await dialog.getByLabel('Motivo documentado', { exact: false }).fill(reason);
    await dialog.locator('input[type=file]').setInputFiles('/tmp/opencode/cepr-captura-prueba.png');
    const send = dialog.getByRole('button', { name: 'Enviar solicitud', exact: true });
    check(await send.isEnabled(), id + ': bloques/candidato/motivo/evidencia válidos');
    await page.screenshot({ path: `${config.output}/${id}-form-valid.png` });
    let arrived;
    let release;
    const started = new Promise(resolve => { arrived = resolve; });
    const held = new Promise(resolve => { release = resolve; });
    await page.route(config.api + '/api/operations/requests', async route => {
      if (route.request().method() !== 'POST') return route.continue();
      arrived(); await held;
      await route.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"Fallo sintético E3 solicitud"}' }).catch(() => {});
    });
    await send.click(); await started;
    await dialog.getByRole('button', { name: 'Generando solicitud…', exact: true }).waitFor();
    check(await dialog.getByRole('button', { name: 'Generando solicitud…', exact: true }).isDisabled(), id + ': generar/enviar excluye doble operación');
    for (const width of [1920, 390]) {
      await page.setViewportSize({ width, height: width === 1920 ? 1080 : 844 });
      await page.screenshot({ path: `${config.output}/${id}-form-saving-${width}.png` });
    }
    release();
    await dialog.getByRole('alert').filter({ hasText: 'Fallo sintético E3 solicitud' }).waitFor();
    check(await dialog.getByLabel('Motivo documentado', { exact: false }).inputValue() === reason, id + ': fallo conserva motivo/selección/evidencia');
    await page.screenshot({ path: `${config.output}/${id}-form-error.png` });
    await page.unrouteAll({ behavior: 'wait' });
    config.writeArtifact('baseline-request-intent-' + role + '.json', { role, date: monday, reason, fixture: f.processes.a.process, phase: 'before-real-save' });
    const responsePromise = page.waitForResponse(response => response.url() === config.api + '/api/operations/requests' && response.request().method() === 'POST');
    await dialog.getByRole('button', { name: 'Enviar solicitud', exact: true }).click();
    const response = await responsePromise;
    const request = await response.json();
    config.writeArtifact('baseline-request-intent-' + role + '.json', { role, date: monday, reason, request, status: response.status(), fixture: f.processes.a.process, phase: response.ok() ? 'success-confirmed' : 'failed' });
    check(response.status() === 201, id + ': creación HTTP real ' + response.status() + ' ' + (request.message ?? ''));
    await dialog.waitFor({ state: 'hidden' });
    const headers = { 'X-Class-Session-Account': f.accounts[role].accountId, 'X-Class-Session-Context': f.processes.a.process };
    const list = await (await page.request.get(config.api + '/api/operations/requests?page=1&limit=100', { headers })).json();
    check(list.data.some(row => row.id === request.id && row.status === 'PENDING' && row.reason === reason), id + ': solicitud pendiente persistida, no autoaprobada');
    const pdf = await page.request.get(config.api + '/api/operations/requests/' + request.id + '/pdf', { headers });
    const bytes = await pdf.body();
    check(pdf.ok() && bytes.subarray(0, 5).toString() === '%PDF-' && bytes.length <= 2 * 1024 * 1024, id + ': PDF privado real con evidencia y límite');
    requests.push({ id, role, requestId: request.id, date: monday, subjectRole: request.subject_role, status: request.status, pdfBytes: bytes.length });
    await page.screenshot({ path: `${config.output}/${id}-form-success.png` });
    config.writeArtifact('baseline-requests-live.json', { requests, results });
  }
  return { ok: true, suite: 'E3 solicitudes D/M/S con PDF real', results, requests, date: new Date().toISOString(), limits: ['Primer500 inyectado; solicitud/lista/PDF finales usan API/PostgreSQL/GCS reales.', 'Monitor/supervisor ejercitan emergencia de aula; otras variantes/decisiones se mantienen en E8, no se presentan como probadas por este caso.'] };
}
