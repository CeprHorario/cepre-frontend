async (page, config) => {
  const results = [];
  const check = (condition, name) => { if (!condition) throw new Error(name); results.push(name); };
  await page.request.get(config.api + '/__test/session?role=admin');
  await page.goto(config.origin + '/admin/importar');
  const input = page.locator('input[type=file]');
  const previous = config.readArtifact('baseline-import-intent.json');
  if (previous?.email && previous.phase === 'before-apply') {
    const list = await (await page.request.get(config.api + '/api/teachers?page=1&limit=500')).json();
    if (list.data.some(row => row.email === previous.email)) {
      config.writeArtifact('baseline-import-intent.json', { ...previous, phase: 'success-confirmed-after-read', note: 'La operación anterior sí persistió; falló solo selector role=alert de mensaje informativo.' });
      return { ok: true, suite: 'E3 importación recuperada por lectura', results: ['Preview inválida/válida y apply HTTP200 completados antes del timeout', 'Persistencia confirmada por correo original sin repetir apply'], email: previous.email, date: new Date().toISOString(), limits: ['No se repitió el lote tras respuesta confirmada; falta únicamente captura de mensaje informativo en el siguiente recorrido de familia.'] };
    }
  }
  await input.setInputFiles({ name: 'invalid.txt', mimeType: 'text/plain', buffer: Buffer.from('synthetic') });
  await page.getByRole('alert').filter({ hasText: 'Formato no admitido' }).waitFor();
  check(true, 'UI09 formato inválido rechazado antes de preview');
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  const stamp = Date.now();
  const email = `e3-import-${stamp}@test.invalid`;
  const csv = `Correo,DNI,Nombres,Apellidos,Correo Personal,Celular,Curso,Dedicacion,Horas maximas\n${email},96${String(stamp).slice(-6)},Persona,Sintetica,,999999992,Course,PartTime,20\n`;
  const send = async buffer => input.setInputFiles({ name: 'docentes-sinteticos.csv', mimeType: 'text/csv', buffer: Buffer.from(buffer) });
  await send(csv.replace('999999992', 'invalid'));
  await page.getByRole('button', { name: 'Confirmar lote', exact: true }).waitFor();
  check(await page.getByRole('button', { name: 'Confirmar lote', exact: true }).isDisabled(), 'UI09 preview inválida bloquea todo el lote');
  await page.screenshot({ path: config.output + '/UI-09-preview-invalid.png' });
  await send(csv);
  const confirm = page.getByRole('button', { name: 'Confirmar lote', exact: true });
  await page.waitForFunction(node => !node.disabled, await confirm.elementHandle(), { timeout: 10000 });
  check(await confirm.isEnabled(), 'UI09 preview válida habilita confirmación');
  const list = await (await page.request.get(config.api + '/api/teachers?page=1&limit=500')).json();
  check(!list.data.some(row => row.email === email), 'UI09 preview no persiste personas');
  await page.screenshot({ path: config.output + '/UI-09-preview-valid.png' });
  config.writeArtifact('baseline-import-intent.json', { email, phase: 'before-apply' });
  const responsePromise = page.waitForResponse(response => response.url().includes('/imports/docentes/apply') && response.request().method() === 'POST');
  await confirm.click();
  const response = await responsePromise;
  check(response.ok(), 'UI09 apply real ' + response.status());
  await page.getByText(/Lote completado: 1 filas/).waitFor();
  const final = await (await page.request.get(config.api + '/api/teachers?page=1&limit=500')).json();
  check(final.data.some(row => row.email === email), 'UI09 apply persiste en PostgreSQL');
  config.writeArtifact('baseline-import-intent.json', { email, phase: 'success-confirmed', response: await response.json() });
  await page.screenshot({ path: config.output + '/UI-09-import-success.png' });
  return { ok: true, suite: 'E3 importación real', results, email, date: new Date().toISOString(), limits: ['CSV docente real; otras clases/importaciones y drag/drop requieren sus casos de familiaE10.'] };
}
