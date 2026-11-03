async page => {
  const api = 'http://127.0.0.1:3000', origin = 'http://127.0.0.1:5174';
  const fixture = await (await page.request.get(api + '/__test/fixtures')).json();
  const results = [], errors = [];
  let stage = 'preparación';
  const check = (value, message) => { if (!value) throw new Error(message); };
  const login = async role => check((await page.request.get(api + '/__test/session?role=' + role)).ok(), 'Sesión');
  const json = (route, data) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
  const noNested = async () => check(await page.locator('a a, button a, a button, button button').count() === 0, 'Controles interactivos anidados');
  page.on('pageerror', error => errors.push(error.message));
  try {
    stage = 'D-03: error y vacío en supervisor (fallo inyectado)';
    let failed = true;
    await page.route('**/api/supervisors/getMonitors', route => failed ? route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Fallo sintético al consultar salones' }) }) : json(route, []));
    await login('supervisor'); await page.goto(origin + '/supervisor');
    await page.getByRole('alert').getByText('No se pudieron cargar tus salones', { exact: true }).waitFor();
    check(await page.getByText('Aún no tienes salones a cargo', { exact: true }).count() === 0, 'Error no se presenta como vacío');
    failed = false; await page.getByRole('button', { name: 'Reintentar', exact: true }).click();
    await page.getByText('Aún no tienes salones a cargo', { exact: true }).waitFor();
    results.push('D-03: supervisor distingue error de vacío y recupera con Reintentar (HTTP inyectado, no integración)');

    stage = 'D-03: error inicial de configuración y recuperación';
    failed = true;
    await page.route('**/api/system/runtime-config', route => failed ? route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Fallo sintético de configuración' }) }) : route.continue());
    await login('admin'); await page.goto(origin + '/admin/configuracion');
    await page.getByRole('alert').getByText('No se pudo cargar la configuración', { exact: true }).waitFor();
    failed = false; await page.getByRole('button', { name: 'Reintentar', exact: true }).click();
    await page.getByRole('heading', { name: 'Configurar sistema', exact: true }).waitFor();
    results.push('D-03: fallo inicial no deja carga infinita; reintento carga configuración real del harness');
    await page.unroute('**/api/system/runtime-config');

    stage = 'D-04: selección del supervisor y enlaces independientes';
    await page.unroute('**/api/supervisors/getMonitors');
    await page.route('**/api/supervisors/getMonitors', route => json(route, [{
      user_id: fixture.accounts.monitor.accountId, email: 'monitor@test.invalid',
      classes: { name: 'Aula sintética', urlMeet: 'https://meet.google.com/abc-defg-hij', urlClassroom: 'https://classroom.google.com/c/123' },
      profile: { firstName: 'Monitor', lastName: 'Sintético' },
    }]));
    await login('supervisor'); await page.goto(origin + '/supervisor');
    await page.getByRole('button', { name: /Aula/ }).waitFor();
    await noNested();
    check(await page.getByRole('link', { name: 'Abrir Google Meet', exact: true }).first().getAttribute('href') === 'https://meet.google.com/abc-defg-hij', 'Destino Meet conservado');
    check(await page.getByRole('link', { name: 'Abrir Google Classroom', exact: true }).first().getAttribute('href') === 'https://classroom.google.com/c/123', 'Destino Classroom conservado');
    results.push('D-04: selección del supervisor sin enlaces dentro de botón; destinos Meet/Classroom conservados (datos UI sintéticos)');

    stage = 'D-04: tarjetas de salón y hub administrativo';
    await page.route('**/api/classes', async route => {
      const response = await route.fetch();
      const rooms = await response.json();
      await json(route, rooms.map(room => ({ ...room, urlMeet: 'https://meet.google.com/abc-defg-hij', urlClassroom: 'https://classroom.google.com/c/123' })));
    });
    await page.route('**/api/shifts', route => json(route, [{ id: 1, name: 'Turno ficticio', startTime: '1970-01-01T08:00:00.000Z', endTime: '1970-01-01T12:00:00.000Z' }]));
    await page.route('**/api/areas', route => json(route, [{ id: 1, name: 'Área ficticia' }]));
    await login('admin'); await page.goto(origin + '/admin/gestionar/salones');
    const roomLink = page.locator(`a[href="/admin/gestionar/salones/${fixture.classId}"]`);
    await roomLink.waitFor(); await noNested();
    check(await page.getByRole('link', { name: 'Abrir Google Meet', exact: true }).count() > 0, 'Enlaces externos siguen accesibles en tarjetas');
    await roomLink.focus(); check(await roomLink.evaluate(link => link === document.activeElement), 'Detalle accesible por teclado');
    await page.goto(origin + '/admin'); await page.getByRole('link', { name: /Generar proceso/ }).waitFor();
    await noNested();
    for (const path of ['/admin/generar', '/admin/importar', '/admin/configuracion', '/admin/gestionar/docentes', '/admin/gestionar/monitores', '/admin/gestionar/supervisores']) {
      check(await page.locator(`a[href="${path}"]`).count() > 0, 'Destino conservado ' + path);
    }
    results.push('D-04: tarjetas salón y módulos del hub sin enlaces anidados, destinos conservados y foco de teclado (catálogos UI parciales)');
    check(errors.length === 0, errors.join('\n'));
    const result = { ok: true, suite: 'modernizacion-estados', date: new Date().toISOString(), results, errors, limits: ['Fallos/parte de los catálogos inyectados; no es una validación integral de esas pantallas', 'Sin auditoría visual H2 ni lector de pantalla'] };
    await page.evaluate(result => { window.__modernizacionResult = result; sessionStorage.setItem('__modernizacionResult', JSON.stringify(result)); }, result);
    return result;
  } catch (error) {
    const result = { ok: false, stage, error: error.message, results, errors };
    await page.evaluate(result => { window.__modernizacionResult = result; sessionStorage.setItem('__modernizacionResult', JSON.stringify(result)); }, result);
    return result;
  }
}
