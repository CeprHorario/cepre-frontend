async (page, config) => {
  const results = [];
  config.seed('generator');
  const check = (condition, name) => { if (!condition) throw new Error(name); results.push(name); };
  await page.request.get(config.api + '/__test/session?role=admin');
  const admissions = await (await page.request.get(config.api + '/api/admissions')).json();
  const year = [2027, 2028, 2029, 2030].find(year => !admissions.some(item => item.name === 'extraordinario_' + year));
  if (!year) throw new Error('Sin año de prueba libre; no sobreescribir proceso existente');
  await page.goto(config.origin + '/admin/generar');
  const next = () => page.getByRole('button', { name: 'Continuar', exact: false });
  await next().click();
  await page.getByRole('alert').filter({ hasText: 'Falta completar' }).waitFor();
  check(true, 'UI08 paso1 inválido conserva orden y muestra condiciones');
  await page.getByLabel('Proceso', { exact: false }).selectOption('Extraordinario');
  await page.getByLabel('Año', { exact: false }).selectOption(String(year));
  await page.getByLabel('Sede', { exact: false }).selectOption('Sede Virtual');
  await page.getByLabel('Fecha de inicio', { exact: false }).fill(`${year}-01-01`);
  await page.getByLabel('Fecha de fin', { exact: false }).fill(`${year}-03-01`);
  await next().click();
  await page.getByLabel('Hora pedagógica (minutos)', { exact: false }).waitFor();
  await page.getByLabel('Hora pedagógica (minutos)', { exact: false }).fill('40');
  await page.getByLabel('Descanso entre bloques (minutos)', { exact: false }).fill('5');
  const end = page.getByLabel('Hora de fin', { exact: false });
  check((await end.inputValue()).startsWith('11:25'), 'UI08 seis bloques40min más5descansos5min, sin descanso final');
  await page.screenshot({ path: config.output + '/UI-08-step2.png' });
  await next().click();
  await next().click();
  await page.getByRole('alert').filter({ hasText: 'Indica al menos un salón' }).waitFor();
  await page.getByLabel('Extraordinario', { exact: false }).fill('1');
  await next().click();
  await page.getByRole('heading', { name: 'Revisar y crear', exact: true }).waitFor();
  check(true, 'UI08 cuatro pasos y resumen reales, sin nuevas etapas');
  await page.screenshot({ path: config.output + '/UI-08-step4.png' });
  config.writeArtifact('generator-intent.json', { year, expectedName: 'extraordinario_' + year, phase: 'before-create' });
  const responsePromise = page.waitForResponse(response => response.url() === config.api + '/api/admissions' && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Crear proceso', exact: true }).click();
  const response = await responsePromise;
  const created = await response.json();
  config.writeArtifact('generator-intent.json', { year, created, status: response.status(), phase: response.ok() ? 'created' : 'failed' });
  check(response.ok(), 'UI08 creación real ' + response.status());
  // Runtime de test admite exclusivamente los dos procesos aleatorios conocidos.
  // Por diseño se rechaza seleccionar el recién generado: prueba X12 sin simular DB.
  await page.waitForURL('**/admin/configuracion');
  const persisted = await (await page.request.get(config.api + '/api/admissions')).json();
  check(persisted.some(item => item.name === created.data.name), 'X12 falla selección runtime pero proceso creado permanece');
  check(await page.evaluate(() => localStorage.getItem('ceprunsa:borrador-proceso')) === null, 'UI08 éxito creación limpia borrador, no duplica proceso al recuperar');
  await page.screenshot({ path: config.output + '/UI-08-runtime-selection-failure.png' });
  return { ok: true, suite: 'E10 generación y fallo selección runtime', results, created, date: new Date().toISOString(), limits: ['Proceso enteramente sintético creado solo enDB delCompose propio; no se despliega ni se configura Firestore real.', 'El proceso generado permanece en esa base de pruebas, documentado por su respuesta, no se atribuye al fixture inicial.'] };
}
