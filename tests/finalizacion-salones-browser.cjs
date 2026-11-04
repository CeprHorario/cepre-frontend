async (page, config) => {
  const { api, origin, output } = config;
  const f = await (await page.request.get(api + '/__test/fixtures')).json();
  const path = '/admin/gestionar/salones/' + f.classId;
  const results = [];
  const writes = [];
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => {
    if (request.url().includes('/api/schedules/') && request.method() === 'PATCH') writes.push({ path: new URL(request.url()).pathname, body: request.postDataJSON() });
  });
  const check = (condition, name) => { if (!condition) throw new Error(name); results.push(name); };
  const login = async (role = 'admin') => {
    const response = await page.request.get(api + '/__test/session?role=' + role);
    if (!response.ok()) throw new Error('Sesión sintética no disponible');
  };
  const open = async () => {
    await page.goto(origin + path);
    await page.getByRole('button', { name: 'Cambiar', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Cambiar', exact: true }).click();
    await page.getByText('Página 1', { exact: true }).waitFor();
    await page.getByRole('status').filter({ hasText: 'Cargando docentes de la página' }).waitFor({ state: 'hidden' });
  };
  const candidates = () => page.getByRole('button', { name: /^Asignar a / });
  const get = async path => {
    const response = await page.request.get(api + '/api' + path);
    if (!response.ok()) throw new Error('Lectura real rechazada ' + path + ' ' + response.status());
    return response.json();
  };
  for (const count of [0, 8, 9, 20, 21, 50, 61]) {
    await page.goto('about:blank');
    config.seed(count);
    await login();
    await open();
    let total = 0;
    let pageNumber = 1;
    do {
      const visible = await candidates().count();
      check(visible === Math.min(20, Math.max(0, count - total)), `FE-02 ${count}: página ${pageNumber} completa (${visible})`);
      total += visible;
      if (count === 9 || (count === 61 && pageNumber === 3)) {
        const index = count === 9 ? 8 : 10;
        const start = writes.length;
        const responsePromise = page.waitForResponse(response => response.url().includes('/schedules/reemplazar/profesor') && response.request().method() === 'PATCH');
        await candidates().nth(index).click();
        const response = await responsePromise;
        check(response.status() === 200, `BA-09 asignación posterior a posición ${count === 9 ? 8 : 50}`);
        const result = await response.json();
        await page.getByRole('button', { name: 'Cambiar', exact: true }).waitFor();
        check(writes.length === start + 1 && writes[start].path.endsWith('/reemplazar/profesor'), 'FE-01 una escritura, sin desasignación previa');
        const teachers = await get('/classes/' + f.classId + '/teachers');
        check(teachers.some(row => row.teacherId === result.teacherId), 'BA-09 titular nuevo persistido');
        const loads = config.inspect().teachers;
        const oldTeacher = loads.find(row => row.id === f.ids.teacher);
        const newTeacher = loads.find(row => row.id === result.teacherId);
        check(oldTeacher.scheduledHours === 0 && newTeacher.scheduledHours === result.updatedSchedules && loads.every(row => row.actual === row.scheduledHours), 'BA-09 cargas PostgreSQL persistidas exactas');
        break;
      }
      const next = page.getByRole('button', { name: 'Siguiente', exact: true });
      if (await next.isDisabled()) break;
      const responsePromise = page.waitForResponse(response => response.url().includes('/teachers/available') && new URL(response.url()).searchParams.get('page') === String(pageNumber + 1));
      await next.click();
      await responsePromise;
      pageNumber++;
      await page.getByRole('status').filter({ hasText: 'Cargando docentes de la página' }).waitFor({ state: 'hidden' });
    } while (pageNumber < 10);
    if (count === 20) {
      check(pageNumber === 2 && total === 20, 'FE-02 lote exacto: página siguiente vacía válida');
      await page.getByText('No hay más docentes.', { exact: true }).waitFor();
      await page.getByRole('button', { name: 'Anterior', exact: true }).click();
      await candidates().first().waitFor();
      check(await candidates().count() === 20, 'FE-02 anterior conserva contexto');
    }
  }

  // Fallo de escritura explícito: la API real conserva el titular; no retry automático.
  await page.goto('about:blank'); config.seed(21); await login(); await open();
  const before = await get('/classes/' + f.classId + '/teachers');
  const start = writes.length;
  await page.route('**/api/schedules/reemplazar/profesor', route => route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ message: 'La asignación cambió. Actualiza el salón.' }) }));
  await candidates().first().click();
  await page.getByRole('alert').filter({ hasText: 'La asignación cambió' }).waitFor();
  check(JSON.stringify(await get('/classes/' + f.classId + '/teachers')) === JSON.stringify(before), 'X-02 fallo conserva docente persistido');
  check(writes.length === start + 1, 'FE-01 fallo no reenvía escritura');
  await page.unroute('**/api/schedules/reemplazar/profesor');

  // Carga de página fallida y recuperación, sin mostrar candidatos caducados.
  await page.route('**/api/teachers/available?page=2&limit=20', route => route.fulfill({ status: 500, contentType: 'application/json', body: '{}' }));
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  await page.getByRole('button', { name: 'Reintentar candidatos', exact: true }).waitFor({ timeout: 20000 });
  check(await candidates().count() === 0, 'FE-02 fallo de página no ofrece candidatos anteriores');
  await page.unroute('**/api/teachers/available?page=2&limit=20');
  await page.getByRole('button', { name: 'Reintentar candidatos', exact: true }).click();
  await candidates().first().waitFor();
  check(await candidates().count() === 1, 'FE-02 reintento recupera página2 real');

  for (const [endpoint, label] of [['classes', 'salón'], ['classes/' + f.classId + '/schedules', 'horario'], ['classes/' + f.classId + '/teachers', 'docentes'], ['courses', 'cursos'], ['hour-sessions', 'periodos']]) {
    await page.goto('about:blank');
    const pattern = api + '/api/' + endpoint;
    await page.route(pattern, route => route.fulfill({ status: 500, contentType: 'application/json', body: '{}' }));
    await page.goto(origin + path);
    await page.getByRole('button', { name: 'Reintentar ' + label, exact: true }).waitFor({ timeout: 20000 });
    check(await page.getByText('Salón no encontrado', { exact: true }).count() === 0, 'FE-03 fallo ' + label + ' no es inexistencia');
    if (label === 'docentes') check(await page.getByText(/Sin docente|Faltan \d+ docentes/).count() === 0, 'FE-03 docentes desconocidos no son faltantes');
    if (label !== 'salón') check(await page.getByRole('button', { name: 'Editar Google Meet', exact: true }).count() === 1, 'FE-03 ' + label + ' conserva sección independiente de enlaces');
    await page.unroute(pattern);
    await page.getByRole('button', { name: 'Reintentar ' + label, exact: true }).click();
    await page.getByRole('button', { name: 'Cambiar', exact: true }).waitFor();
    check(await page.getByRole('button', { name: 'Reintentar ' + label, exact: true }).count() === 0, 'FE-03 recuperación real ' + label);
  }

  await page.setViewportSize({ width: 320, height: 740 });
  await page.screenshot({ path: output + '/salon-320.png' });
  check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'FE-03 sin desbordamiento a320');
  await login('coordinator');
  await page.goto(origin + '/coordinador/salones/' + f.classId);
  await page.getByRole('heading', { name: 'Docentes por curso', exact: true }).waitFor();
  check(await page.getByRole('button', { name: /^(Cambiar|Asignar|Eliminar)$/ }).count() === 0, 'FE-01 coordinación solo lectura');
  check(errors.length === 0, 'Sin errores JavaScript');
  return { ok: true, suite: 'E2 salón integrado', results, writes, date: new Date().toISOString(), limits: ['Fallos UI inyectados se declaran; lecturas y persistencia contra Nest/PostgreSQL reales.'] };
}
