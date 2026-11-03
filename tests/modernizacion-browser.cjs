async page => {
  const origin = 'http://127.0.0.1:5174', api = 'http://127.0.0.1:3000';
  const results = [], errors = [];
  let stage = 'preparación';
  const check = (value, message) => { if (!value) throw new Error(message); };
  const fixture = await (await page.request.get(api + '/__test/fixtures')).json();
  const csrf = { Origin: origin, 'X-Requested-With': 'ceprunsa' };
  const headers = (role, process = 'a') => ({ ...csrf, 'X-Class-Session-Context': fixture.processes[process].process, 'X-Class-Session-Account': fixture.accounts[role].accountId });
  const control = async path => check((await page.request.post(api + '/__test/' + path, { headers: csrf })).ok(), path);
  const login = async role => check((await page.request.get(api + '/__test/session?role=' + role)).ok(), 'Sesión ' + role);
  const home = role => role === 'admin' ? 'admin' : role === 'teacher' ? 'docente' : role === 'otherMonitor' ? 'monitor' : role;
  const goto = async (role, path = 'solicitudes') => { await login(role); await page.goto(`${origin}/${home(role)}/${path}`); };
  const read = async id => { const response = await page.request.get(`${api}/api/class-session-records/${id}`, { headers: headers('monitor') }); check(response.ok(), 'Leer parte'); return response.json(); };
  const row = id => page.locator(`[data-record="${id}"]`);
  const dialog = () => page.getByRole('dialog').last();
  const openJournal = async () => { await page.getByRole('button', { name: /^Abrir jornada / }).first().click(); await row(1).waitFor(); };
  const save = async id => {
    const response = page.waitForResponse(r => r.url().endsWith(`/class-session-records/${id}`) && r.request().method() === 'PATCH');
    await row(id).getByRole('button', { name: 'Guardar cambios', exact: true }).click();
    const saved = await response; check(saved.status() === 200, 'Guardar observaciones ' + await saved.text());
    await page.getByText('Cambios guardados.', { exact: true }).waitFor();
    await page.locator('main.parts-view[aria-busy="false"]').waitFor(); return saved.json();
  };
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => void dialog.accept());
  try {
    await control('maintenance?enabled=false'); await control('process?process=a&audience=both');
    await page.setViewportSize({ width: 1920, height: 1080 });
    stage = 'R-N01: contexto frío por rol, avisos y SSE reales';
    for (const role of ['monitor', 'teacher', 'supervisor', 'admin']) {
      const contextResponse = page.waitForResponse(r => r.url().endsWith('/operations/context') && r.status() === 200);
      const noticesResponse = page.waitForResponse(r => r.url().includes('/operations/notifications?') && r.status() === 200);
      await goto(role);
      const context = await (await contextResponse).json();
      check(context.accountId === fixture.accounts[role].accountId && context.process === fixture.processes.a.process, 'Contexto aislado ' + role);
      const notices = await (await noticesResponse).json();
      check(notices.data.length === 1 && notices.data[0].title === `Aviso sintético ${role} A`, 'Destinatario exclusivo ' + role);
      await page.getByRole('button', { name: /^Notificaciones:/ }).click();
      await page.getByRole('region', { name: 'Notificaciones', exact: true }).getByText(`Aviso sintético ${role} A`, { exact: true }).waitFor();
      check(await page.locator('a a, button a, a button').count() === 0, 'Sin interactividad anidada');
    }
    results.push('R-N01: caché fría de monitor/docente/supervisor/admin sin sesión admin previa, HTTP y avisos exclusivos');

    stage = 'R-N01: resolución ajena rechazada y cambio de proceso';
    await goto('monitor');
    const ownResponse = await page.request.get(api + '/api/operations/notifications', { headers: headers('monitor') });
    const own = (await ownResponse.json()).data[0];
    await login('otherMonitor');
    const foreign = await page.request.post(`${api}/api/operations/notifications/${own.id}/resolve`, { headers: headers('otherMonitor'), data: {} });
    check([403, 404].includes(foreign.status()), 'No resolver aviso ajeno');
    await login('monitor');
    const resolveResponse = page.waitForResponse(r => r.url().endsWith(`/notifications/${own.id}/resolve`) && r.request().method() === 'POST');
    await page.reload(); await page.getByRole('button', { name: /^Notificaciones:/ }).click();
    await page.getByRole('button', { name: 'Resolver notificación', exact: true }).click();
    check((await resolveResponse).ok(), 'Resolver aviso propio');
    const persisted = await (await page.request.get(api + '/api/operations/notifications', { headers: headers('monitor') })).json();
    check(persisted.data[0].resolved_at && persisted.pending === 0, 'Resolución persistida');
    await page.getByRole('button', { name: 'Solicitar reemplazo', exact: true }).click();
    await page.getByRole('dialog', { name: 'Solicitar reemplazo', exact: true }).getByLabel('Motivo documentado').fill('Borrador del proceso anterior');
    await control('process?process=b&audience=both'); await login('monitor');
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await page.locator('main').getByText(`${fixture.processes.b.process} · Las aprobaciones cubren únicamente los bloques solicitados.`, { exact: true }).waitFor({ timeout: 40000 });
    const bell = page.getByRole('button', { name: /^Notificaciones:/ });
    if (await bell.getAttribute('aria-expanded') === 'false') await bell.click();
    await page.getByRole('region', { name: 'Notificaciones', exact: true }).getByText('Aviso sintético monitor B', { exact: true }).waitFor({ timeout: 40000 });
    check(await page.getByText('Aviso sintético monitor A', { exact: true }).count() === 0, 'Cambio proceso no mezcla respuestas');
    check(await page.getByRole('dialog', { name: 'Solicitar reemplazo', exact: true }).count() === 0, 'Formulario anterior no se traslada al proceso nuevo');
    results.push('R-N01: rechazo de resolver aviso ajeno, resolución persistida y cambio de proceso en la misma página');
    await control('process?process=a&audience=both');

    stage = 'R-P02: catálogo de salones independiente de filas y filtro servidor';
    await goto('admin', 'partes'); await row(1).waitFor();
    await page.locator('details.parts-filters summary').click();
    const adminFrom = await page.locator('details.parts-filters').getByLabel('Desde', { exact: true }).inputValue();
    await page.locator('details.parts-filters').getByLabel('Desde', { exact: true }).fill(fixture.processes.a.historical.date);
    await page.getByRole('navigation', { name: 'Partes diarios', exact: true }).getByRole('button', { name: 'Siguiente', exact: true }).click();
    await page.getByRole('navigation', { name: 'Partes diarios', exact: true }).getByText('Página 2', { exact: true }).waitFor();
    const classroom = page.locator('details.parts-filters').getByLabel('Aula', { exact: true });
    await classroom.locator(`option[value="${fixture.ids.emptyClass}"]`).waitFor({ state: 'attached' });
    const filteredResponse = page.waitForResponse(r => r.url().includes('/class-session-records?') && r.url().includes('classId=' + fixture.ids.emptyClass));
    await classroom.selectOption(fixture.ids.emptyClass);
    const filtered = await filteredResponse;
    check(filtered.ok() && /[?&]page=1(?:&|$)/.test(filtered.url()), 'Filtrado en servidor reinicia página 1');
    await page.getByText('No hay partes para estos filtros.', { exact: true }).waitFor();
    check(await classroom.inputValue() === fixture.ids.emptyClass, 'Vacío conserva selección');
    await classroom.selectOption(''); await page.locator('[data-record]').first().waitFor();
    await page.locator('details.parts-filters').getByLabel('Desde', { exact: true }).fill(adminFrom); await row(1).waitFor();
    results.push('R-P02: catálogo autorizado incluye salón sin filas, filtro HTTP desde página 2 reinicia en 1, vacío conserva selección y Todos recupera datos');

    stage = 'R-P01: listado fechado, hoja completa y retorno';
    await goto('monitor', 'partes');
    await page.getByRole('heading', { name: 'Partes por fecha' }).waitFor();
    const originalFrom = await page.getByLabel('Desde', { exact: true }).inputValue();
    await openJournal();
    check(await page.locator('[data-record]').count() === 6, 'Todos los bloques de jornada');
    await row(1).getByRole('button', { name: 'Curso ficticio', exact: true }).click();
    await row(1).getByRole('button', { name: 'Observaciones', exact: true }).waitFor();
    check(await row(1).locator('input[type=time]').first().inputValue() === '', 'Horas reales no copiadas');
    await row(1).getByRole('button', { name: 'Observaciones', exact: true }).click();
    await dialog().getByRole('button', { name: 'Agregar observación' }).click();
    await dialog().getByLabel('Descripción de la observación').fill('Borrador sintético de aula');
    await dialog().getByRole('button', { name: 'Aplicar al borrador' }).click();
    await page.getByRole('button', { name: 'Volver al listado de jornadas' }).click();
    check(await row(1).count() === 1 && await page.getByRole('alert').filter({ hasText: 'pendiente' }).count() > 0, 'Retorno bloqueado por borrador');
    await row(1).getByRole('button', { name: 'Descartar cambios' }).click();
    await page.getByRole('button', { name: 'Volver al listado de jornadas' }).click();
    await page.getByRole('heading', { name: 'Partes por fecha' }).waitFor();
    check(await page.getByLabel('Desde', { exact: true }).inputValue() === originalFrom, 'Rango conservado');
    const historical = fixture.processes.a.historical;
    const secondPage = page.waitForResponse(r => r.url().includes('/class-session-records?') && /[?&]page=2(?:&|$)/.test(r.url()));
    await page.getByRole('button', { name: new RegExp('^Abrir jornada ' + historical.date) }).click();
    check((await secondPage).ok(), 'Segunda página de bloques realmente consultada');
    await row(historical.firstId + historical.blocks - 1).waitFor();
    check(await page.locator('[data-record]').count() === 105, 'Jornada histórica muestra sus 105 bloques completos');
    await page.getByRole('button', { name: 'Volver al listado de jornadas' }).click();
    results.push('R-P01: seis bloques actuales y 105 históricos íntegros (dos páginas HTTP), sin reconstrucción; retorno conserva rango y respeta borrador');

    stage = 'R-I01: observaciones clasificadas y antecedente persistido';
    await openJournal(); await row(1).getByRole('button', { name: 'Curso ficticio', exact: true }).click();
    await row(1).getByRole('button', { name: 'Observaciones', exact: true }).click();
    for (const type of ['TEACHER', 'STUDENT', 'CLASSROOM']) {
      await dialog().getByRole('button', { name: 'Agregar observación' }).click();
      const entry = dialog().locator('fieldset').last();
      await entry.getByLabel('Tipo de observación').selectOption(type);
      if (type === 'STUDENT') { await entry.getByLabel('Nombres del alumno').fill('Alumno'); await entry.getByLabel('Apellidos del alumno').fill('Sintético'); }
      await entry.getByLabel('Descripción de la observación').fill('Hecho sintético ' + type);
    }
    await dialog().getByRole('button', { name: 'Aplicar al borrador' }).click();
    const saved = await save(1);
    check(saved.structuredObservations.length === 3 && (await read(1)).structuredObservations.length === 3, 'Observaciones persistidas');
    await goto('admin', 'incidencias');
    await page.getByLabel('DNI para historial').fill('91000001');
    await page.getByRole('button', { name: 'Buscar historial' }).click();
    const incidenceRow = page.locator('tbody tr').filter({ hasText: fixture.processes.a.process }).filter({ hasText: 'Hecho sintético TEACHER' });
    await incidenceRow.getByText('Hecho sintético TEACHER', { exact: true }).waitFor();
    check(await page.getByText('Hecho sintético STUDENT', { exact: true }).count() === 0 && await page.getByText('Hecho sintético CLASSROOM', { exact: true }).count() === 0, 'Solo docente genera antecedente DNI');
    await incidenceRow.getByRole('button', { name: 'Resolver', exact: true }).click();
    await dialog().getByLabel('Motivo', { exact: true }).fill('Resolución sintética verificada');
    const resolvedResponse = page.waitForResponse(r => r.url().includes('/api/incidences/') && r.request().method() === 'PATCH');
    await dialog().getByRole('button', { name: 'Confirmar', exact: true }).click();
    const resolved = await (await resolvedResponse).json();
    check(resolved.status === 'RESOLVED' || resolved.data?.status === 'RESOLVED', 'Resolución persistida');
    await incidenceRow.getByRole('button', { name: 'Reabrir', exact: true }).click();
    await dialog().getByLabel('Motivo', { exact: true }).fill('Reapertura sintética verificada');
    await dialog().getByRole('button', { name: 'Confirmar', exact: true }).click();
    await incidenceRow.getByRole('button', { name: 'Resolver', exact: true }).waitFor();
    await incidenceRow.getByRole('button', { name: 'Historial', exact: true }).click();
    await dialog().getByText('OPEN', { exact: true }).waitFor();
    await page.keyboard.press('Escape');
    results.push('R-I01 parcial: docente/alumno/aula persistidos, solo docente crea antecedente DNI; resolver/reabrir e historial reales');

    stage = 'R-I01: retirar observación no borra antecedente';
    await goto('monitor', 'partes'); await openJournal();
    await row(1).getByRole('button', { name: 'Curso ficticio', exact: true }).click();
    await row(1).getByRole('button', { name: /^Observaciones/ }).click();
    await dialog().locator('fieldset').first().getByRole('button', { name: 'Quitar observación' }).click();
    await dialog().getByRole('button', { name: 'Aplicar al borrador' }).click(); await save(1);
    await goto('admin', 'incidencias'); await page.getByLabel('DNI para historial').fill('91000001'); await page.getByRole('button', { name: 'Buscar historial' }).click();
    await page.locator('tbody tr').filter({ hasText: fixture.processes.a.process }).getByText('Hecho sintético TEACHER', { exact: true }).waitFor();
    results.push('R-I01 parcial: retirada de observación preserva antecedente inmutable');

    stage = 'responsive y consola';
    await goto('monitor', 'partes'); await page.getByRole('heading', { name: 'Partes por fecha' }).waitFor();
    for (const width of [1920, 1440, 1366, 2560, 3440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1080 });
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Overflow listado ' + width);
    }
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ path: 'docs/modernizacion/evidence/monitor-jornadas-1920.png' });
    check(errors.length === 0, errors.join('\n'));
    const result = { ok: true, suite: 'modernizacion-fase1', date: new Date().toISOString(), results, errors, limits: ['Suite parcial de R-I01 complementada por modernizacion-incidencias', 'No verifica lector de pantalla, Firefox ni WebKit', 'No es línea base visual H2'] };
    await page.evaluate(result => { window.__modernizacionResult = result; sessionStorage.setItem('__modernizacionResult', JSON.stringify(result)); }, result);
    return result;
  } catch (error) {
    const result = { ok: false, stage, error: error.message, results, errors };
    await page.evaluate(result => { window.__modernizacionResult = result; sessionStorage.setItem('__modernizacionResult', JSON.stringify(result)); }, result);
    return result;
  } finally {
    await control('maintenance?enabled=false'); await control('process?process=a&audience=both');
  }
}
