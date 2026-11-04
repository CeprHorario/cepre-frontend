async (page, config) => {
  const f = await (await page.request.get(config.api + '/__test/fixtures')).json();
  const results = [];
  const check = (condition, name) => { if (!condition) throw new Error(name); results.push(name); };
  await page.request.get(config.api + '/__test/session?role=courseCoordinator');
  const get = async path => {
    const response = await page.request.get(config.api + '/api/' + path);
    return { status: response.status(), body: await response.json() };
  };
  const teacher = await get('teachers/' + f.finalization.outsideTeacherId);
  const schedule = await get('teachers/' + f.finalization.outsideTeacherId + '/schedules');
  check(teacher.status === 404, 'UI-31 recurso docente ajeno404');
  check(schedule.status === 200 && Array.isArray(schedule.body) && schedule.body.length === 0, 'UI-32 listado ajeno filtrado vacío, sin datos de otro curso');
  const classes = await get('classes');
  check(classes.status === 200 && !classes.body.some(row => row.id === f.finalization.outsideClassId), 'UI-34 catálogo excluye aula de otro curso');
  const foreignClass = await get('classes/' + f.finalization.outsideClassId);
  check(foreignClass.status === 404, 'UI-35 recurso salón ajeno404');
  await page.goto(config.origin + '/coordinador/docentes');
  await page.getByRole('heading', { name: 'Docentes', exact: true }).waitFor();
  check(await page.getByRole('combobox', { name: 'Curso', exact: true }).count() === 0, 'UI-31 no ofrece filtro de curso ajeno');
  check(await page.getByRole('button', { name: /Agregar docente|Exportar Excel|Asignar salones|Editar datos|Eliminar/ }).count() === 0, 'UI-31 no ofrece escritura');
  return { ok: true, suite: 'E3 coordinación general/curso', results, teacher, schedule, foreignClass, date: new Date().toISOString() };
}
