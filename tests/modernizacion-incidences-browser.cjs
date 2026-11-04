async (page, config = {}) => {
  const api = config.api ?? 'http://127.0.0.1:3000', origin = config.origin ?? 'http://127.0.0.1:5174';
  const f = await (await page.request.get(api + '/__test/fixtures')).json();
  const results = [], errors = [], writes = [];
  let stage = 'preparación';
  const check = (value, message) => { if (!value) throw Error(message); };
  const csrf = { Origin: origin, 'X-Requested-With': 'ceprunsa' };
  const headers = (role, process = 'a') => ({ ...csrf, 'X-Class-Session-Context': f.processes[process].process, 'X-Class-Session-Account': f.accounts[role].accountId });
  const control = async path => check((await page.request.post(api + '/__test/' + path, { headers: csrf })).ok(), path);
  const login = async role => check((await page.request.get(api + '/__test/session?role=' + role)).ok(), 'Sesión ' + role);
  const goto = async (role, path) => { await login(role); await page.goto(origin + '/' + (role === 'admin' ? 'admin' : role === 'otherSupervisor' ? 'supervisor' : role) + '/' + path); };
  const dialog = () => page.getByRole('dialog').last();
  const row = id => page.locator(`[data-record="${id}"]`);
  const observe = async text => {
    await config.parts.openEditor(5, 'observations');
    const editor = dialog();
    if (await editor.getByRole('button', { name: 'Editar observación', exact: true }).count()) await editor.getByRole('button', { name: 'Editar observación', exact: true }).first().click();
    else await editor.getByRole('button', { name: 'Añadir observación', exact: true }).click();
    await editor.getByRole('radio', { name: 'Docente', exact: true }).check();
    await editor.getByLabel('Descripción de la observación').fill(text);
    await editor.getByRole('button', { name: 'Confirmar observación en el borrador', exact: true }).click();
    const saved = page.waitForResponse(r => r.url().endsWith('/class-session-records/5') && r.request().method() === 'PATCH');
    await editor.getByRole('button', { name: 'Guardar', exact: true }).click();
    const response = await saved; check(response.ok(), 'Observación: ' + await response.text());
    await page.locator('main.parts-view[aria-busy="false"]').waitFor();
    return response.json();
  };
  const incidences = async (role, dni, process = 'a') => {
    const r = await page.request.get(`${api}/api/incidences${dni ? '?dni=' + dni : ''}`, { headers: headers(role, process) });
    check(r.ok(), 'Consultar antecedentes: ' + r.status()); return r.json();
  };
  const create = async (role, subjectRole, subject, title, process = 'a') => {
    const operationId = await page.evaluate(() => crypto.randomUUID());
    const r = await page.request.post(api + '/api/incidences', { headers: headers(role, process), data: { operationId, subjectAccountId: subject, subjectRole, title, description: 'Descripción sintética: ' + title, occurredAt: new Date(Date.now() - 60000).toISOString() } });
    check(r.ok(), 'Sembrar antecedente con API real: ' + await r.text()); return r.json();
  };
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { if (r.url().includes('/api/') && !['GET', 'OPTIONS'].includes(r.method())) writes.push(r.url()); });
  page.on('dialog', d => void d.accept());
  try {
    await control('process?process=a&audience=both'); await control('replacement-dni?present=false');
    stage = 'R-I01: reemplazante sin DNI conserva observación y avisa';
    await goto('monitor', 'partes');
    await page.locator('.official-parts').waitFor(); await config.parts.openJournal(); await row(5).waitFor();
    const noDni = await observe('Observación del reemplazante sin DNI');
    check(noDni.observationWarning?.includes('DNI'), 'Aviso explícito sin DNI');
    await page.getByText(noDni.observationWarning, { exact: true }).waitFor();
    check(noDni.structuredObservations[0].description.includes('sin DNI'), 'Observación persiste sin DNI');
    await login('admin');
    check(!(await incidences('admin', '91000001')).data.some(i => i.process_schema === f.processes.a.process && i.record_id === 5), 'No atribuir al titular cuando hay reemplazante');
    results.push('R-I01: reemplazante autorizado sin DNI conserva observación, muestra aviso y no crea antecedente del titular');

    stage = 'R-I01: DNI del efectivo, edición auditada y texto original inmutable';
    await login('monitor');
    // La hoja oficial persiste cada editor por separado. Retirar primero la nota
    // sinDNI evita atribuirla retrospectivamente al completar el DNI después.
    await config.parts.openEditor(5, 'observations');
    await dialog().getByRole('button', { name: 'Quitar observación del borrador', exact: true }).click();
    await dialog().getByRole('button', { name: 'Guardar', exact: true }).click();
    await dialog().waitFor({ state: 'hidden' });
    await control('replacement-dni?present=true');
    await config.parts.openEditor(5, 'hours');
    await dialog().getByLabel('Inicio', { exact: true }).fill('00:00');
    await dialog().getByRole('button', { name: 'Guardar', exact: true }).click();
    await dialog().waitFor({ state: 'hidden' });
    await config.parts.openEditor(5, 'state');
    await dialog().getByRole('radio', { name: 'Reemplazo normal RN', exact: true }).check();
    if (await dialog().getByRole('button', { name: 'Guardar', exact: true }).isEnabled()) {
      await dialog().getByRole('button', { name: 'Guardar', exact: true }).click();
      await dialog().waitFor({ state: 'hidden' });
    } else await config.parts.closeEditor(); // RN ya estaba persistido en el fixture.
    await observe('Antecedente original del docente reemplazante');
    const effective = await (await page.request.get(api + '/api/class-session-records/5', { headers: headers('monitor') })).json();
    check(effective.effectiveTeacherId === f.ids.replacementTeacher, 'Servidor establece efectivo autorizado');
    await observe('Corrección auditada del docente reemplazante');
    await login('admin');
    const linked = (await incidences('admin', '91000002')).data.filter(i => i.process_schema === f.processes.a.process && i.record_id === 5);
    check(linked.length === 1 && linked[0].description === 'Antecedente original del docente reemplazante', 'Un solo antecedente, original intacto');
    const history = await page.request.get(`${api}/api/incidences/${linked[0].id}/history`, { headers: headers('admin') });
    check((await history.json()).some(e => e.action === 'OBSERVATIONS_UPDATED' && e.reason.includes('Corrección auditada')), 'Edición en trazabilidad real');
    results.push('R-I01: antecedente por DNI del efectivo reemplazante, sin duplicar ni reescribir original; edición en historial');

    stage = 'R-I01: supervisor limitado a sus monitores y hoy Lima';
    const own = await create('admin', 'supervisor', f.accounts.supervisor.accountId, 'Antecedente propio del supervisor');
    await goto('supervisor', 'incidencias');
    await page.getByRole('button', { name: 'Registrar incidencia', exact: true }).click();
    await dialog().getByLabel('Seleccionar persona').selectOption(f.accounts.monitor.accountId);
    check(await dialog().getByLabel('Persona reportada').locator('option').count() === 1, 'Solo rol monitor disponible');
    await dialog().getByLabel('Título', { exact: true }).fill('Hecho de monitor en día no permitido');
    await dialog().getByLabel('Observaciones', { exact: true }).fill('Prueba sintética de restricción temporal');
    const originalTime = await dialog().getByLabel('Hora en que ocurrió').inputValue();
    const past = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 16);
    await dialog().getByLabel('Hora en que ocurrió').fill(past);
    let response = page.waitForResponse(r => r.url().endsWith('/api/incidences') && r.request().method() === 'POST');
    await dialog().getByRole('button', { name: 'Registrar en el historial' }).click();
    check((await response).status() === 403, 'Rechaza día pasado');
    await dialog().getByRole('alert').filter({ hasText: 'Lima' }).waitFor();
    await dialog().getByLabel('Hora en que ocurrió').fill(originalTime);
    await dialog().getByLabel('Título', { exact: true }).fill('Monitor reportado hoy Lima');
    response = page.waitForResponse(r => r.url().endsWith('/api/incidences') && r.request().method() === 'POST');
    await dialog().getByRole('button', { name: 'Registrar en el historial' }).click();
    const today = await response; check(today.ok(), 'Incidencia de hoy: ' + await today.text());
    const saved = await today.json();
    await page.getByText('Monitor reportado hoy Lima', { exact: true }).waitFor();
    check(!(await incidences('supervisor')).data.some(i => i.id === own.id), 'Antecedente propio no visible');
    await login('otherSupervisor');
    check(!(await incidences('otherSupervisor')).data.some(i => i.id === saved.id), 'Supervisor ajeno no ve antecedente');
    const denied = await page.request.post(api + '/api/incidences', { headers: headers('otherSupervisor'), data: { operationId: await page.evaluate(() => crypto.randomUUID()), subjectRole: 'monitor', subjectAccountId: f.accounts.monitor.accountId, title: 'Ajeno rechazado', description: 'No ampliar alcance', occurredAt: new Date(Date.now() - 60000).toISOString() } });
    check(denied.status() === 404, 'No reporta monitor ajeno');
    for (const path of ['?dni=93000001', '?mine=true', '/' + saved.id + '/history']) {
      check([400, 401, 403].includes((await page.request.get(api + '/api/incidences' + path, { headers: headers('otherSupervisor') })).status()), 'Historial restringido ' + path);
    }
    results.push('R-I01: supervisor registra solo sus monitores/hoy Lima, rechaza día anterior y recursos ajenos; sin antecedentes propios ni historial administrativo');

    stage = 'R-I01: conflicto de versión conserva motivo y resolución no se repite';
    await goto('admin', 'incidencias');
    await page.getByLabel('DNI para historial').fill('92000001'); await page.getByRole('button', { name: 'Buscar historial' }).click();
    const subjectRow = page.locator('tbody tr').filter({ hasText: 'Monitor reportado hoy Lima' }).filter({ hasText: f.processes.a.process });
    await subjectRow.getByRole('button', { name: 'Resolver', exact: true }).click();
    await dialog().getByLabel('Motivo', { exact: true }).fill('Motivo conservado tras conflicto');
    const external = await page.request.patch(`${api}/api/incidences/${saved.id}`, { headers: headers('admin'), data: { expectedVersion: saved.version, status: 'RESOLVED', reason: 'Resolución concurrente sintética' } });
    check(external.ok(), 'Resolución concurrente real');
    response = page.waitForResponse(r => r.url().endsWith('/incidences/' + saved.id) && r.request().method() === 'PATCH');
    await dialog().getByRole('button', { name: 'Confirmar', exact: true }).click();
    check((await response).status() === 409, 'Versión antigua rechazada');
    await dialog().getByRole('alert').filter({ hasText: 'cambió' }).waitFor();
    check(await dialog().getByRole('textbox').inputValue() === 'Motivo conservado tras conflicto', 'Motivo no perdido');
    await page.keyboard.press('Escape');
    results.push('R-I01: conflicto 409 real conserva motivo, no reaplica la resolución ni cambia el texto original');

    stage = 'R-I01: historial entre procesos y avisos en personal/importación';
    await control('process?process=b&audience=both'); await login('admin');
    await create('admin', 'monitor', f.accounts.monitor.accountId, 'Antecedente de otro proceso', 'b');
    await control('process?process=a&audience=both');
    await goto('admin', 'gestionar/monitores');
    const warning = page.getByRole('button', { name: /^DNI 92000001: tiene/ });
    await warning.click();
    await dialog().getByRole('listitem').filter({ hasText: f.processes.a.process }).getByText('Monitor reportado hoy Lima', { exact: true }).waitFor();
    await dialog().getByRole('listitem').filter({ hasText: f.processes.b.process }).getByText('Antecedente de otro proceso', { exact: true }).waitFor();
    await dialog().locator('[data-close]').click();
    await page.goto(origin + '/admin/importar');
    await page.getByRole('button', { name: 'Monitores', exact: true }).click();
    const columns = await (await page.request.get(api + '/api/imports/monitores/columns')).json();
    const classrooms = await (await page.request.get(api + '/api/classes')).json();
    const classroom = classrooms.find(room => room.id === f.classId);
    const values = { correo: f.accounts.monitor.email, dni: '92000001', nombres: 'monitor', apellidos: 'Prueba A', salon: classroom.name, turno: classroom.shift.name };
    const csv = columns.map(c => c.label).join(',') + '\n' + columns.map(c => values[c.key] ?? '').join(',');
    response = page.waitForResponse(r => r.url().endsWith('/imports/monitores/preview'));
    await page.locator('input[type=file]').evaluate((input, csv) => {
      const files = new DataTransfer(); files.items.add(new File([csv], 'monitores-sinteticos.csv', { type: 'text/csv' }));
      input.files = files.files; input.dispatchEvent(new Event('change', { bubbles: true }));
    }, csv);
    const preview = await response; check(preview.ok(), 'Preview real: ' + await preview.text());
    const previewData = await preview.json(); check(previewData.valid === previewData.total && previewData.total === 1, 'Lote válido sintético: ' + JSON.stringify(previewData.rows));
    await warning.click();
    await dialog().getByRole('listitem').filter({ hasText: f.processes.b.process }).getByText('Antecedente de otro proceso', { exact: true }).waitFor();
    await dialog().locator('[data-close]').click();
    check(await page.getByRole('button', { name: 'Confirmar lote', exact: true }).isEnabled(), 'Avisos no bloquean importar');
    check(!writes.some(url => url.endsWith('/imports/monitores/apply')), 'Preview/historial no aplica lote');
    await page.getByRole('button', { name: 'Cancelar', exact: true }).last().click();
    results.push('R-I01: historia DNI A/B y avisos reales en listado de personal y preview CSV, sin aplicar lote ni bloquear confirmación');

    stage = 'R-I01: borrador protege salida y logout';
    await goto('supervisor', 'incidencias');
    await page.getByRole('button', { name: 'Registrar incidencia', exact: true }).click();
    await dialog().getByLabel('Título', { exact: true }).fill('Borrador protegido de incidencias');
    const blockedNavigation = page.waitForEvent('dialog');
    // Despachar el enlace de la SPA sin cerrar/descartar primero el modal.
    await page.locator('a[href="/supervisor"]').first().evaluate(link => link.click());
    check((await blockedNavigation).message().includes('borrador de incidencia') && page.url().endsWith('/supervisor/incidencias'), 'Navegación SPA bloqueada sin perder borrador');
    const protection = await page.evaluate(() => ({ unload: !window.dispatchEvent(new Event('beforeunload', { cancelable: true })), logout: !window.dispatchEvent(new Event('ceprunsa:before-logout', { cancelable: true })) }));
    check(protection.unload && protection.logout, 'Ambas salidas protegidas');
    await page.getByRole('button', { name: 'Conservar borradores', exact: true }).click();
    check(await dialog().getByLabel('Título', { exact: true }).inputValue() === 'Borrador protegido de incidencias', 'Borrador conservado');
    await dialog().getByRole('button', { name: 'Cancelar', exact: true }).click();
    results.push('R-I01: borrador de incidencia bloquea navegación SPA, unload/logout; conservar restaura intención sin escritura');
    check(errors.length === 0, errors.join('\n'));
    const result = { ok: true, suite: 'modernizacion-incidencias', date: new Date().toISOString(), results, errors, limits: ['Harness local con controladores/servicios reales y PostgreSQL; no OAuth productivo', 'Negativos de API ejecutados desde Chromium; no todos son acciones visibles', 'No sustituye línea base H2 ni lector de pantalla'] };
    await page.evaluate(result => { window.__modernizacionResult = result; sessionStorage.setItem('__modernizacionResult', JSON.stringify(result)); }, result); return result;
  } catch (e) {
    const result = { ok: false, stage, error: e.message, results, errors, dialogs: await page.getByRole('dialog').allTextContents(), alerts: await page.getByRole('alert').allTextContents() };
    await page.evaluate(result => { window.__modernizacionResult = result; sessionStorage.setItem('__modernizacionResult', JSON.stringify(result)); }, result); return result;
  } finally { await control('process?process=a&audience=both'); }
}
