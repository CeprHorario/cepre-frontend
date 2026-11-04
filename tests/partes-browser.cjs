async (page, h) => {
  const {origin,api} = h;
  const out = '/home/joel/git/cepr/frontend/docs/partes-evidence';
  const results = [];
  const errors = [];
  const requests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (request.url().startsWith(api + '/api/')) requests.push({ method: request.method(), path: request.url().slice(api.length).split('?')[0] }); });
  page.on('dialog', dialog => { void dialog.accept().catch(() => {}); });
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  const fixture = await (await page.request.get(api + '/__test/fixtures')).json();
  const headers = { Origin: origin, 'X-Requested-With': 'ceprunsa' };
  const control = async path => { const r = await page.request.post(api + '/__test/' + path, { headers }); check(r.ok(), 'Control falló: ' + path); };
  const route = async role => {
    await h.route(role);
  };
  const row = id => page.locator('[data-record="' + id + '"]');
  const select = h.select;
  const dialog = () => page.getByRole('dialog').last();
  const details = async id => { await row(id).getByRole('button', { name: 'Opciones del parte #' + id,exact:true }).click(); await dialog().getByRole('heading', { name: 'Detalle del parte #' + id }).waitFor(); };
  const close = async () => { await dialog().getByRole('button', { name: 'Volver a la jornada', exact: true }).click(); };
  const record = async (id, role = 'monitor', process = 'a') => {
    const r = await page.request.get(api + '/api/class-session-records/' + id, { headers: { 'X-Class-Session-Context': fixture.processes[process].process, 'X-Class-Session-Account': fixture.accounts[role].accountId } });
    check(r.ok(), 'Lectura ' + id + ': ' + r.status()); return r.json();
  };
  const screenshot = async name => { await page.evaluate(()=>{window.scrollTo(0,0);document.querySelectorAll('.parts-scroll').forEach(el=>el.scrollLeft=0);}); await page.screenshot({ path: out + '/' + name + '.png', fullPage: false }); };
  const observed = [];
  page.on('response', response => { if (['POST','PATCH','PUT'].includes(response.request().method())) observed.push(response); });
  const waitWrite = async (path, action, method = 'POST', expected = 201) => {
    const target = api + '/api/' + path, from = observed.length;
    await action();
    const deadline = Date.now() + 30000; let r;
    while (Date.now() < deadline) {
      r = observed.slice(from).find(response => response.url().split('?')[0] === target && response.request().method() === method);
      if (r) break;
      await page.waitForTimeout(50);
    }
    check(r, path + ' sin respuesta observada'); check(r.status() === expected, path + ' HTTP ' + r.status() + ' ' + await r.text());
    await page.locator('main.parts-view[aria-busy="false"]').waitFor(); return r.json();
  };
  const png = '/tmp/opencode/cepr-captura-prueba.png';

  await control('maintenance?enabled=false'); await control('process?process=a&audience=both');
  await route('monitor'); await page.setViewportSize({ width: 1440, height: 1000 });
  await screenshot('monitor-escritorio');
  await select(1);
  await h.openEditor(1);
  check(await dialog().getByLabel('Inicio',{exact:true}).inputValue() === '', 'No copiar hora programada');
  check(await dialog().getByLabel('Fin',{exact:true}).inputValue() === '', 'No copiar fin programado');
  await h.closeEditor();
  const initial = await record(1);
  await h.observations(1, 'Borrador protegido de integración');
  await row(2).getByRole('button', {name:'Editar hora real del parte #2',exact:true}).click();
  check(await h.draftText(1) === 'Borrador protegido de integración', 'Borrador sobrevive selección bloqueada');
  await page.getByRole('link', {name:'Panel del monitor',exact:true}).click();
  check(page.url().endsWith('/monitor/partes'), 'Navegación con borrador bloqueada');
  await page.locator('header button[aria-haspopup="menu"]').click();
  await page.getByRole('menuitem', {name:'Cerrar sesión'}).click();
  check(page.url().endsWith('/monitor/partes'), 'Logout con borrador bloqueado');
  await page.getByRole('dialog').getByRole('button',{name:'Conservar borradores'}).click();
  await page.locator('header button[aria-haspopup="menu"]').click();
  await h.discard(1);
  results.push('Borrador: selección, navegación y logout protegidos; descarte explícito');

  await h.openEditor(1);
  // Hechos sintéticos del día académico, no copia del horario (que puede cruzar medianoche).
  await dialog().getByLabel('Inicio', {exact:true}).fill('00:00');
  await dialog().getByLabel('Fin', {exact:true}).fill('00:00');
  await waitWrite('class-session-records/1',()=>dialog().getByRole('button',{name:'Guardar',exact:true}).click(),'PATCH',200);
  await h.openEditor(1,'state'); await dialog().getByRole('radio',{name:'Normal N',exact:true}).check();
  check(await dialog().getByLabel('Docente efectivo', {exact:true}).count() === 0, 'Monitor no cambia efectivos');
  await waitWrite('class-session-records/1',()=>dialog().getByRole('button',{name:'Guardar',exact:true}).click(),'PATCH',200);
  await h.observations(1, 'Clase registrada explícitamente en prueba real');
  const saved = await waitWrite('class-session-records/1', () => h.save(1), 'PATCH', 200);
  check(saved.version === initial.version + 3 && saved.teachingStatus === 'TAUGHT', 'Guardados independientes y expectedVersion');
  check(saved.titularOutcome === 'PRESENT' && saved.effectiveTeacherId === fixture.ids.teacher && saved.effectiveMonitorId === fixture.ids.monitor, 'Estado N y efectivos validados por servidor, no editados por monitor');
  check(saved.editDeadline === initial.editDeadline, 'Cierre original preservado');
  results.push('Registro explícito: horas de minuto, dictado, titular y efectivos, versión y cierre');

  await h.openEditor(1,'initial');
  await dialog().getByLabel('Seleccionar captura PNG',{exact:true}).setInputFiles(png);
  await dialog().getByText('Preparada, sin asociar', {exact:true}).waitFor();
  check((await record(1)).initialFileId === null, 'Preparar no sube ni asocia');
  await screenshot('subida-sin-asociar');
  await h.closeEditor(); await h.tools();
  await dialog().getByRole('button', {name:'Histórico de jornadas',exact:true}).click();
  check(await page.getByRole('heading',{name:'Partes por fecha',exact:true}).count()===0,'Subida pendiente protege retorno al listado');
  await h.openEditor(1,'initial');
  const uploadedResponse=page.waitForResponse(r=>r.url().endsWith('/class-session-files/records/1')&&r.request().method()==='POST');
  const associated = await waitWrite('class-session-files/records/1/captures/initial', () => dialog().getByRole('button',{name:'Guardar',exact:true}).click());
  const uploaded=await(await uploadedResponse).json(); check(uploaded.status==='AVAILABLE','PNG disponible');
  check(associated.initialFileId === uploaded.id && associated.version === saved.version + 1, 'Asociación separada');
  check(Date.parse(associated.initialAssociatedAt) >= Date.parse(uploaded.uploadedAt), 'Instantes distintos');
  await h.openEditor(1,'initial'); await dialog().getByRole('button', {name:'Ampliar captura',exact:true}).click();
  await dialog().locator('img').waitFor(); await dialog().getByRole('button', {name:'Zoom 100 %'}).click();
  check(await dialog().locator('img').evaluate(img => img.naturalWidth === 1280), 'Imagen íntegra1280');
  await screenshot('imagen-completa');
  await page.keyboard.press('Escape'); check(await page.getByRole('dialog').count() === 1, 'Escape solo ampliación');
  check(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')) === 'Ampliar captura', 'Retorno de foco');
  await h.closeEditor();
  results.push('GCS real: subida, asociación, imagen íntegra, zoom y foco anidado');

  await h.observations(1, 'BORRADOR CONCURRENTE CONSERVADO');
  const beforeConflict = await record(1); await control('concurrent?process=a&recordId=1');
  const conflictResponse = page.waitForResponse(r => r.request().method() === 'PATCH' && r.url().endsWith('/class-session-records/1'));
  await h.save(1);
  check((await conflictResponse).status() === 409, 'Conflicto409');
  await h.closeEditor(); await h.tools(); await page.getByRole('heading',{name:'El parte cambió en el servidor'}).waitFor();
  check((await page.locator('.parts-conflict').innerText()).includes('BORRADOR CONCURRENTE CONSERVADO'), 'Borrador preservado409');
  check((await page.locator('.parts-conflict').innerText()).includes('Estado del parte') && (await page.locator('.parts-conflict').innerText()).includes('N · Normal'), 'Conflicto incluye estado clasificado legible');
  await dialog().getByRole('button',{name:'Histórico de jornadas',exact:true}).click(); await h.tools();
  check((await page.locator('.parts-conflict').innerText()).includes('BORRADOR CONCURRENTE CONSERVADO'),'Conflicto protege retorno al listado');
  check((await record(1)).version === beforeConflict.version + 1, 'No reintento automático');
  await screenshot('conflicto-real');
  await page.getByRole('button',{name:'Cargar servidor y descartar borrador',exact:true}).first().click();
  await h.closeEditor();
  results.push('Concurrencia:409 real, comparación y borrador conservado sin reintento');

  await h.openEditor(1,'final'); await dialog().getByLabel('Seleccionar captura PNG',{exact:true}).setInputFiles(png);
  await dialog().getByText('Preparada, sin asociar',{exact:true}).waitFor();
  await page.route('**/class-session-files/records/1/captures/final',async route=>{await control('close?process=a&recordId=1');await route.continue();});
  const lateResponse = page.waitForResponse(r => r.url().endsWith('/captures/final') && r.request().method() === 'POST');
  await dialog().getByRole('button',{name:'Guardar',exact:true}).click(); check((await lateResponse).status() === 403, 'Cierre entre subida y asociación403');
  await page.unroute('**/class-session-files/records/1/captures/final');
  check((await record(1)).finalFileId === null, 'Sin evidencia falsa tras cierre');
  await dialog().getByText('Subida, sin asociar',{exact:true}).waitFor();
  await screenshot('cierre-durante-asociacion');
  await dialog().getByRole('button',{name:'Descartar',exact:true}).click();
  await h.openEditor(3); check(await dialog().getByLabel('Inicio',{exact:true}).isDisabled(), 'Cerrado no editable');await h.closeEditor();
  await h.openEditor(6); check(await dialog().getByLabel('Inicio',{exact:true}).isDisabled(), 'Futuro no editable');await h.closeEditor();
  results.push('Cierre:entre subida/asociación, cerrado y bloque futuro');

  await select(4); await details(4);
  check(await dialog().getByRole('link',{name:'Solicitudes y reemplazos',exact:true}).getAttribute('href') === '/monitor/solicitudes', 'Solicitud conserva su módulo autorizado');
  const denied = await page.request.post(api + '/api/class-session-records/replacements', {headers:{...headers,'X-Class-Session-Context':fixture.processes.a.process,'X-Class-Session-Account':fixture.accounts.monitor.accountId},data:{targets:[{recordId:4,expectedVersion:(await record(4)).version}],kind:'MONITOR',personId:fixture.ids.otherMonitor,mode:'EMERGENCY',reason:'No recuperar la ruta retirada'}});
  check([401,403].includes(denied.status()), 'Ruta directa retirada rechazada');
  check((await record(4)).effectiveTeacherId === null, 'Consultar o intentar solicitud no es ejecución');
  await close();
  results.push('Monitor:enlace al módulo de solicitudes y rechazo de cobertura directa retirada, sin inferir ejecución');

  await select(5); await h.observations(5, 'BORRADOR MANTENIMIENTO');
  await control('maintenance?enabled=true'); await h.refresh();
  await page.getByRole('heading',{name:'Estamos mejorando el sistema'}).waitFor();
  await screenshot('mantenimiento');
  await control('maintenance?enabled=false');
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await row(5).waitFor({timeout:70000});
  check(await h.draftText(5) === 'BORRADOR MANTENIMIENTO', 'Borrador tras mantenimiento');
  await h.discard(5);
  results.push('Mantenimiento real503:pausa y borrador recuperado');

  for (const width of [1440,1280,768,390,320]) {
    await page.setViewportSize({width,height:900});
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Overflow página ' + width);
  }
  await page.setViewportSize({width:390,height:844}); await details(5); await screenshot('monitor-editor-movil');
  check(await dialog().evaluate(el => el.getBoundingClientRect().width <= innerWidth), 'Diálogo móvil cabe');
  await page.keyboard.press('Tab'); check(await page.evaluate(() => document.activeElement.closest('dialog') !== null), 'Foco modal');
  await close(); await screenshot('monitor-movil');
  results.push('Responsive1440/1280/768/390/320 y teclado modal');

  await page.setViewportSize({width:1440,height:1000});
  await route('supervisor'); await select(3);
  await details(3);
  check(await dialog().getByLabel('Inicio real (Lima)',{exact:true}).count() === 0, 'Detalle no duplica el editor de horas; cerrado sigue solo lectura');
  await dialog().getByLabel('Resultado').selectOption('OBSERVED');
  await dialog().getByLabel('Comentario de revisión (opcional)',{exact:true}).fill('Revisión explícita del parte cerrado');
  await close(); await details(3);
  check(await dialog().getByLabel('Comentario de revisión (opcional)',{exact:true}).inputValue() === 'Revisión explícita del parte cerrado', 'Revisión pendiente conservada');
  await dialog().getByRole('checkbox').check();
  await waitWrite('class-session-records/3/reviews', () => dialog().getByRole('button',{name:'Enviar revisión',exact:true}).click());
  await screenshot('supervisor-revision-cerrado'); await close();
  const reviewed = await record(3,'supervisor'); check(reviewed.reviewStatus === 'OBSERVED', 'Supervisor revisión de cerrado');
  await control('concurrent?process=a&recordId=3'); await h.refresh();
  await page.locator('main.parts-view[aria-busy="false"]').waitFor();
  check((await record(3,'supervisor')).reviewStatus === 'PENDING', 'Revisión vieja no cubre versión nueva');
  await h.tools(); await page.getByText('Alertas de seguimiento',{exact:true}).click();
  const ack = page.getByRole('button',{name:'Acusar recibo',exact:true}).first(); await ack.waitFor();
  const ackResponse = page.waitForResponse(r => r.url().includes('/acknowledge') && r.request().method() === 'POST');
  await ack.click(); check((await ackResponse).status() === 201, 'Acuse de alerta');
  await screenshot('supervisor-alertas');
  for (const width of [1440,1280,768,390,320]) {
    await page.setViewportSize({width,height:900});
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Overflow supervisor'+width);
  }
  await page.setViewportSize({width:390,height:844}); await screenshot('supervisor-movil');
  results.push('Supervisor:revisión explícita incluso cerrado, versión histórica, alertas, acuse separado y cinco tamaños');

  check(!requests.some(r => /\/api\/(teachers|monitors|supervisors|classes|admissions|courses|system\/config)/.test(r.path)), 'Monitor/supervisor sin catálogos generales prohibidos');
  check(errors.length === 0, errors.join('\n'));
  return {ok:true, suite:'monitor-supervisor', results, errors, requests: requests.length};
}
