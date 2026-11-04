async (page, config) => {
  const { api, origin, output } = config;
  const f = await (await page.request.get(api + '/__test/fixtures')).json();
  if (!f.finalization) throw new Error('Falta fixture opt-in de coordinación por curso');
  const routes = [
    ['UI-01', 'public', '/', 'auth/user-info', null, null],
    ['UI-02', 'admin', '/admin/ruta-inexistente', null, null, null],
    ['UI-03', 'admin', '/admin', 'classes', [], null],
    ['UI-04', 'admin', '/admin/partes', null, null, null],
    ['UI-05', 'admin', '/admin/solicitudes', 'operations/requests*', { data: [], total: 0, page: 1, limit: 25 }, null],
    ['UI-06', 'admin', '/admin/incidencias', 'incidences?*', { data: [], total: 0, page: 1, limit: 25 }, 'Registrar incidencia'],
    ['UI-07', 'admin', '/admin/reportes', 'operations/reports?*', { data: [], hasNext: false }, null],
    ['UI-08', 'admin', '/admin/generar', null, null, null],
    ['UI-09', 'admin', '/admin/importar', 'imports/docentes/columns', [], null],
    ['UI-10', 'admin', '/admin/configuracion', 'system/runtime-config', null, null],
    ['UI-11', 'admin', '/admin/gestionar/docentes', 'teachers?*', { data: [], total: 0, page: 1, limit: 10 }, 'Agregar docente'],
    ['UI-12', 'admin', `/admin/gestionar/docentes/${f.ids.teacher}/asignar`, `teachers/${f.ids.teacher}/schedules`, [], null],
    ['UI-13', 'admin', `/admin/gestionar/docentes/${f.ids.teacher}/horario`, `teachers/${f.ids.teacher}/schedules`, [], null],
    ['UI-14', 'admin', '/admin/gestionar/monitores', 'monitors?*', { data: [], total: 0, page: 1, limit: 10 }, 'Agregar monitor'],
    ['UI-15', 'admin', '/admin/gestionar/supervisores', 'supervisors?*', { data: [], total: 0, page: 1, limit: 10 }, 'Agregar supervisor'],
    ['UI-16', 'admin', `/admin/gestionar/supervisores/${f.supervisorId}/monitores`, 'supervisors/*/monitors*', { data: [], total: 0, page: 1, limit: 10 }, null],
    ['UI-17', 'admin', '/admin/gestionar/coordinadores', 'coordinators?*', { data: [], total: 0, page: 1, limit: 10 }, 'Agregar coordinador'],
    ['UI-18', 'admin', '/admin/gestionar/salones', 'classes', [], 'Agregar salones'],
    ['UI-19', 'admin', `/admin/gestionar/salones/${f.classId}`, `classes/${f.classId}/schedules`, [], null],
    ['UI-20', 'admin', '/admin/gestionar/cursos', 'courses', [], 'Agregar curso'],
    ['UI-21', 'teacher', '/docente', 'classes/getClassOfTeacher', [], 'Disponibilidad en Excel'],
    ['UI-22', 'teacher', '/docente/solicitudes', 'operations/requests*', { data: [], total: 0, page: 1, limit: 25 }, 'Solicitar reemplazo'],
    ['UI-23', 'monitor', '/monitor', 'monitors/cargar/horario', [], 'Enlaces'],
    ['UI-24', 'monitor', '/monitor/partes', null, null, null],
    ['UI-25', 'monitor', '/monitor/solicitudes', 'operations/requests*', { data: [], total: 0, page: 1, limit: 25 }, 'Solicitar reemplazo'],
    ['UI-26', 'supervisor', '/supervisor', 'supervisors/getMonitors*', [], null],
    ['UI-27', 'supervisor', '/supervisor/partes', null, null, null],
    ['UI-28', 'supervisor', '/supervisor/solicitudes', 'operations/requests*', { data: [], total: 0, page: 1, limit: 25 }, 'Solicitar reemplazo'],
    ['UI-29', 'supervisor', '/supervisor/incidencias', 'incidences?*', { data: [], total: 0, page: 1, limit: 25 }, 'Registrar incidencia'],
    ['UI-30', 'coordinator', '/coordinador/docentes', 'teachers?*', { data: [], total: 0, page: 1, limit: 10 }, null],
    ['UI-31', 'courseCoordinator', '/coordinador/docentes', 'teachers?*', { data: [], total: 0, page: 1, limit: 10 }, null],
    ['UI-32', 'coordinator', `/coordinador/docentes/${f.ids.teacher}/horario`, `teachers/${f.ids.teacher}/schedules`, [], null],
    ['UI-32', 'courseCoordinator', `/coordinador/docentes/${f.ids.teacher}/horario`, `teachers/${f.ids.teacher}/schedules`, [], null],
    ['UI-33', 'coordinator', '/coordinador/salones', 'classes', [], null],
    ['UI-34', 'courseCoordinator', '/coordinador/salones', 'classes', [], null],
    ['UI-35', 'coordinator', `/coordinador/salones/${f.classId}`, `classes/${f.classId}/schedules`, [], null],
    ['UI-35', 'courseCoordinator', `/coordinador/salones/${f.classId}`, `classes/${f.classId}/schedules`, [], null],
  ];
  if (config.baselineResume) config.writeArtifact('baseline-received-after-restart.json', { routes: config.baselineResume, date: new Date().toISOString() });
  const captured = (config.baselineResume ?? []).filter(record => record.fixture === f.processes.a.process && routes.some(route => route[0] === record.id && route[1] === record.role && route[2] === record.path && route[3] === record.endpoint));
  const current = { http: [], errors: [] };
  page.on('pageerror', error => current.errors.push(error.message));
  page.on('response', response => {
    if (response.url().startsWith(api + '/api/')) current.http.push({ method: response.request().method(), path: response.url().slice(api.length), status: response.status() });
  });
  const inspect = () => page.evaluate(() => {
    const text = node => (node.getAttribute('aria-label') || node.innerText || '').trim();
    return {
      headings: [...document.querySelectorAll('h1,h2,h3')].map(node => node.textContent.trim()),
      columns: [...document.querySelectorAll('th')].map(node => node.textContent.trim()),
      fields: [...document.querySelectorAll('input,select,textarea')].map(node => ({ label: node.getAttribute('aria-label') || [...(node.labels ?? [])].map(label => label.innerText).join(' '), type: node.type, required: node.required, disabled: node.disabled, value: node.value, maxLength: node.maxLength, min: node.min, max: node.max, options: node.options ? [...node.options].map(option => ({ text: option.text, value: option.value })) : undefined })),
      actions: [...document.querySelectorAll('main button,section button,[role=dialog] button,dialog button')].map(node => ({ name: text(node), disabled: node.disabled, expanded: node.getAttribute('aria-expanded') })),
      links: [...document.querySelectorAll('main a,section a')].map(node => ({ name: text(node), href: node.getAttribute('href') })),
      alerts: [...document.querySelectorAll('[role=alert]')].map(node => node.textContent.trim()),
      rows: document.querySelectorAll('tbody tr').length,
      overflow: document.documentElement.scrollWidth > innerWidth,
      focused: document.activeElement ? { role: document.activeElement.getAttribute('role'), tag: document.activeElement.tagName, name: text(document.activeElement), rect: document.activeElement.getBoundingClientRect().toJSON(), outline: getComputedStyle(document.activeElement).outlineStyle } : null,
    };
  });
  const visit = async (role, path) => {
    await page.goto('about:blank');
    if (role === 'public') await page.context().clearCookies();
    else if (!(await page.request.get(api + '/__test/session?role=' + role)).ok()) throw new Error('No se pudo iniciar ' + role);
    await page.goto(origin + path);
    if (path === '/admin/ruta-inexistente') await page.getByText('No encontramos esta página', { exact: true }).waitFor();
    else await page.locator('main:visible,h1:visible,h2:visible,h3:visible').first().waitFor();
    await page.waitForTimeout(500);
    if (path.endsWith('/partes')) {
      const classroom = page.locator('select').filter({ has: page.locator(`option[value="${f.classId}"]`) }).first();
      if (await classroom.count()) await classroom.selectOption(f.classId);
      await page.locator('tr[data-record]').first().waitFor();
    }
  };
  for (const [id, role, path, endpoint, empty, form] of routes) {
    if (captured.some(record => record.id === id && record.role === role)) continue;
    config.stage = id + ' ' + role;
    const record = { id, role, path, fixture: f.processes.a.process, endpoint, states: [] };
    for (const width of [1920, 390]) {
      await page.setViewportSize({ width, height: width === 1920 ? 1080 : 844 });
      current.http = []; current.errors = [];
      await visit(role, path);
      const screenshot = `${id}-${role}-${width}-data.png`;
      await page.screenshot({ path: output + '/' + screenshot });
      await page.keyboard.press('Tab');
      const forward = await inspect();
      await page.keyboard.press('Shift+Tab');
      const backward = await inspect();
      record.states.push({ state: 'data', width, screenshot, ...forward, keyboardBack: backward.focused, http: [...current.http], errors: [...current.errors] });
      if (form && width === 1920) {
        const trigger = page.getByRole('button', { name: form, exact: true });
        if (await trigger.count() && await trigger.first().isEnabled()) {
          await trigger.first().click();
          await page.waitForTimeout(300);
          const overlay = page.getByRole('dialog').last();
          if (await overlay.count()) {
            const shot = `${id}-${role}-form.png`;
            await page.screenshot({ path: output + '/' + shot });
            record.states.push({ state: 'form-initial', width, screenshot: shot, ...await inspect(), http: [...current.http], errors: [...current.errors] });
            await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
            const close = overlay.getByRole('button', { name: 'Cerrar', exact: true });
            if (await close.count()) await close.click();
            else await page.keyboard.press('Escape');
          } else record.form = 'El control no abrió diálogo; revisar tarea específica, no se cuenta como overlay probado';
        } else record.form = 'Control no disponible en estado recibido: ' + form;
      }
    }
    if (endpoint && !path.endsWith('/partes') && role !== 'public') {
      for (const state of ['error', ...(empty === null ? [] : ['empty'])]) {
        const pattern = api + '/api/' + endpoint;
        for (const width of [1920, 390]) {
          await page.setViewportSize({ width, height: width === 1920 ? 1080 : 844 });
          let injectedRequests = 0;
          await page.route(pattern, route => { injectedRequests++; return route.fulfill({ status: state === 'error' ? 500 : 200, contentType: 'application/json', body: JSON.stringify(state === 'error' ? { message: 'Fallo sintético de línea base' } : empty) }); });
          current.http = []; current.errors = [];
          await visit(role, path);
          if (state === 'error') await page.waitForTimeout(8000);
          const screenshot = `${id}-${role}-${width}-${state}.png`;
          await page.screenshot({ path: output + '/' + screenshot });
          if (!injectedRequests) throw new Error('No se ejercitó el endpoint de estado ' + pattern);
          record.states.push({ state, width, screenshot, injected: pattern, injectedRequests, ...await inspect(), http: [...current.http], errors: [...current.errors] });
          await page.unroute(pattern);
        }
      }
    } else record.networkStateExclusion = path.endsWith('/partes') ? 'Núcleo congelado: conservación se prueba en E9 con suites propias, sin forzar contratos nuevos' : 'Estado global o asistente sin lectura primaria; requiere recorrido específico de acceso/generación';
    captured.push(record);
    config.writeArtifact?.('baseline-live.json', { routes: captured, date: new Date().toISOString() });
  }
  // Negativos reales por curso, sin simular autorización de servidor.
  await page.request.get(api + '/__test/session?role=courseCoordinator');
  const foreignTeacher = await page.request.get(api + '/api/teachers/' + f.finalization.outsideTeacherId);
  const foreignSchedule = await page.request.get(api + '/api/teachers/' + f.finalization.outsideTeacherId + '/schedules');
  return { ok: true, suite: 'E3 baseline recibida, no aceptación visual final', routes: captured, negatives: { foreignTeacher: foreignTeacher.status(), foreignSchedule: foreignSchedule.status() }, date: new Date().toISOString(), limits: ['Capturas y DOM constituyen baseline, no prueban formularios válidos/guardado/persistencia ni certificación accesible.', 'Estados de red declarados inyectados; estado data usa API real.', 'Zoom real/lectura de pantalla/motores adicionales se registran aparte, no se cuentan como aprobados.'] };
}
