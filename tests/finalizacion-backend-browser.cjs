async (page, config = {}) => {
  const api = config.api ?? 'http://127.0.0.1:3109';
  const origin = config.origin ?? 'http://127.0.0.1:5189';
  await page.goto('about:blank');
  const headers = { Origin: origin, 'X-Requested-With': 'ceprunsa' };
  const fixture = await (await page.request.get(api + '/__test/fixtures')).json();
  const payload = { classId: fixture.classId, courseId: 1, expectedTeacherId: fixture.ids.teacher, teacherId: fixture.ids.replacementTeacher };
  const results = [];
  const check = (condition, name) => { if (!condition) throw new Error(name); results.push(name); };
  for (const role of ['teacher', 'monitor', 'supervisor', 'coordinator']) {
    await page.request.get(api + '/__test/session?role=' + role);
    const response = await page.request.patch(api + '/api/schedules/reemplazar/profesor', { data: payload, headers });
    check(response.status() === 403, 'BA-08 ' + role + ' prohibido: ' + response.status());
  }
  await page.request.get(api + '/__test/session?role=admin');
  const removed = await page.request.post(api + '/api/schedules/load-with-courses', { data: {}, headers });
  check(removed.status() === 404, 'BE-02 ruta retirada con sesión: ' + removed.status());
  for (const invalid of [{ courseId: 0 }, { teacherId: 'invalid' }, { expectedTeacherId: 'invalid' }, { classId: 'invalid' }]) {
    const response = await page.request.patch(api + '/api/schedules/reemplazar/profesor', { data: { ...payload, ...invalid }, headers });
    check(response.status() === 400, 'BA-03 validación HTTP ' + JSON.stringify(invalid));
  }
  const conflict = await page.request.patch(api + '/api/schedules/reemplazar/profesor', { data: { ...payload, expectedTeacherId: fixture.ids.replacementTeacher, teacherId: fixture.ids.teacher }, headers });
  check(conflict.status() === 409, 'BE-01 conserva 409, no catch genérico: ' + conflict.status());
  await page.request.post(api + '/api/auth/logout', { data: {}, headers });
  const anonymous = await page.request.post(api + '/api/schedules/load-with-courses', { data: {}, headers });
  check([401, 404].includes(anonymous.status()), 'BE-02 no éxito sin sesión');
  return { ok: true, suite: 'BE-01/02 HTTP real', results, date: new Date().toISOString() };
}
