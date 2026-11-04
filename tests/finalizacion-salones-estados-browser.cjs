async (page, config) => {
  const { api, origin, output } = config;
  const f = await (await page.request.get(api + '/__test/fixtures')).json();
  const path = '/admin/gestionar/salones/' + f.classId;
  const results = [];
  config.stage = 'carga inicial';
  const check = (condition, name) => { if (!condition) throw new Error(name); results.push(name); };
  config.seed(21);
  await page.request.get(api + '/__test/session?role=admin');
  let release;
  let started;
  const arrived = new Promise(resolve => { started = resolve; });
  const delayed = new Promise(resolve => { release = resolve; });
  await page.route(api + '/api/classes', async route => { started(); await delayed; await route.continue(); });
  await page.goto(origin + path);
  await arrived;
  check(await page.getByText('Salón no encontrado', { exact: true }).count() === 0, 'FE-03 carga inicial no es inexistencia');
  await page.screenshot({ path: output + '/salon-loading.png' });
  release();
  await page.getByRole('button', { name: 'Cambiar', exact: true }).waitFor();
  await page.unroute(api + '/api/classes');
  await page.goto(origin + '/admin/gestionar/salones/00000000-0000-4000-8000-000000000001');
  config.stage = 'no encontrado';
  await page.getByText('Salón no encontrado', { exact: true }).waitFor();
  check(await page.getByRole('button', { name: 'Volver a salones', exact: true }).count() === 1, 'FE-03 consulta correcta sin ID tiene retorno');

  await page.goto('about:blank');
  config.stage = 'vacío';
  await page.route(api + '/api/classes/' + f.classId + '/schedules', route => route.fulfill({ contentType: 'application/json', body: '[]' }));
  await page.goto(origin + path);
  await page.getByText('No hay cursos programados en este salón.', { exact: true }).waitFor();
  check(await page.getByText('Sin horario', { exact: true }).count() === 1, 'FE-03 vacío correcto de horario');
  await page.unroute(api + '/api/classes/' + f.classId + '/schedules');

  await page.goto('about:blank');
  config.stage = 'slots incompletos';
  await page.route(api + '/api/hour-sessions', route => route.fulfill({ contentType: 'application/json', body: '[]' }));
  await page.goto(origin + path);
  const change = page.getByRole('button', { name: 'Cambiar', exact: true });
  await change.waitFor();
  check(await change.isDisabled(), 'FE-03 slots incompletos no abren asignación');
  await page.unroute(api + '/api/hour-sessions');

  await page.goto('about:blank');
  config.stage = 'revalidación fallida';
  await page.goto(origin + path);
  await change.waitFor(); await change.click();
  await page.getByRole('button', { name: /^Asignar a / }).first().waitFor();
  const prior = await page.getByText('Prueba A, teacher', { exact: true }).count();
  await page.route('**/api/schedules/reemplazar/profesor', route => route.fulfill({ status: 409, contentType: 'application/json', body: '{"message":"Asignación obsoleta sintética"}' }));
  await page.route(api + '/api/classes/' + f.classId + '/teachers', route => route.fulfill({ status: 500, contentType: 'application/json', body: '{}' }));
  await page.getByRole('button', { name: /^Asignar a / }).first().click();
  await page.getByRole('button', { name: 'Reintentar docentes', exact: true }).waitFor({ timeout: 20000 });
  check(prior > 0 && await page.getByText('Prueba A, teacher', { exact: true }).count() > 0, 'FE-03 revalidación fallida conserva titular previo');
  check(await page.getByRole('button', { name: /^Asignar a / }).count() === 0, 'FE-03 revalidación fallida no ofrece candidatos caducados');
  await page.screenshot({ path: output + '/salon-stale-error.png' });
  await page.unroute('**/api/schedules/reemplazar/profesor');
  await page.unroute(api + '/api/classes/' + f.classId + '/teachers');
  await page.getByRole('button', { name: 'Reintentar docentes', exact: true }).click();
  config.stage = 'recuperar revalidación';
  await page.getByRole('button', { name: /^Asignar a / }).first().waitFor();
  check(true, 'FE-03 reintentar lectura restaura acciones sin escritura');

  // Respuesta retenida de candidatos de otro salón: no se vuelve seleccionable.
  await page.goto('about:blank');
  config.stage = 'respuesta tardía de candidatos';
  let releaseCandidates;
  let releaseNext;
  let nextStarted;
  let seen = 0;
  let candidateStarted;
  const candidateArrived = new Promise(resolve => { candidateStarted = resolve; });
  const candidateDelay = new Promise(resolve => { releaseCandidates = resolve; });
  const nextDelay = new Promise(resolve => { releaseNext = resolve; });
  const nextArrived = new Promise(resolve => { nextStarted = resolve; });
  const pattern = '**/api/teachers/available*';
  await page.route(pattern, async route => {
    const index = ++seen;
    const response = await route.fetch();
    if (index === 1) { candidateStarted(); await candidateDelay; }
    else { nextStarted(); await nextDelay; }
    await route.fulfill({ response }).catch(() => {}); // La consulta anterior puede estar cancelada legítimamente.
  });
  await page.goto(origin + path); await change.waitFor(); await change.click(); await candidateArrived;
  await page.evaluate(path => { history.pushState({}, '', path); dispatchEvent(new PopStateEvent('popstate')); }, '/admin/gestionar/salones/' + f.ids.emptyClass);
  await Promise.race([nextArrived, page.waitForTimeout(15000).then(() => { throw new Error('No llegó la consulta del nuevo recurso'); })]);
  releaseCandidates();
  check(await page.getByRole('button', { name: /^Asignar a / }).count() === 0, 'FE-02 respuesta tardía de otro recurso no es seleccionable');
  releaseNext();
  await page.getByRole('button', { name: /^Asignar a / }).first().waitFor();
  await page.unroute(pattern);
  return { ok: true, suite: 'E2 carga/vacío/parcial/tardía', results, date: new Date().toISOString(), limits: ['Estados de red inyectados; recuperación contra API real.'] };
}
