async (page, h) => {
  const {origin,api} = h;
  const out = '/home/joel/git/cepr/frontend/docs/partes-evidence';
  const results = [], errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => { void d.accept().catch(() => {}); });
  const check = (value, message) => { if (!value) throw Error(message); };
  const fixture = await (await page.request.get(api + '/__test/fixtures')).json();
  const headers = { Origin: origin, 'X-Requested-With': 'ceprunsa' };
  const control = async path => check((await page.request.post(api + '/__test/' + path, {headers})).ok(), 'Control ' + path);
  const route = h.route;
  const row = id => page.locator('[data-record="' + id + '"]');
  const dialog = () => page.getByRole('dialog').last();
  const sheet = async () => {if(await page.getByRole('dialog',{name:'Opciones de Partes',exact:true}).count()) await h.closeEditor();};
  const select = async id => {await sheet();await h.select(id);};
  const details = async id => { await sheet();await row(id).getByRole('button',{name:'Opciones del parte #'+id,exact:true}).click(); await dialog().getByRole('heading',{name:'Detalle del parte #' + id}).waitFor(); };
  const close = () => dialog().getByRole('button',{name:'Volver a la jornada',exact:true}).click();
  const read = async (id, process = 'a', role = 'admin') => {
    const response = await page.request.get(api + '/api/class-session-records/' + id, {headers:{'X-Class-Session-Context':fixture.processes[process].process,'X-Class-Session-Account':fixture.accounts[role].accountId}});
    check(response.ok(), 'Leer parte ' + response.status()); return response.json();
  };
  const observed = [];
  page.on('response', response => { if (['POST','PATCH','PUT'].includes(response.request().method())) observed.push(response); });
  const write = async (path, action, expected = 201, method = 'POST') => {
    const target = api + '/api/class-session-records/' + path, from = observed.length;
    await action();
    const deadline = Date.now() + 30000; let response;
    while (Date.now() < deadline) {
      response = observed.slice(from).find(r => r.url().split('?')[0] === target && r.request().method() === method);
      if (response) break;
      await page.waitForTimeout(50);
    }
    check(response, path + ': sin respuesta observada'); check(response.status() === expected, path + ':HTTP' + response.status() + ' ' + await response.text());
    await page.locator('main.parts-view[aria-busy="false"]').waitFor(); return response.json();
  };
  const ops = async () => { await h.tools(); const section = page.locator('details').filter({has:page.locator('summary').filter({hasText:/^Operaciones administrativas$/})}); if (await section.getAttribute('open') === null) await section.locator('summary').click(); return section; };
  const operation = async name => { const section = await ops(); await section.getByRole('button',{name,exact:true}).click(); await dialog().getByRole('heading',{name,exact:true}).waitFor(); };
  const reason = value => dialog().getByLabel('Motivo de la operación').fill(value);
  const confirm = () => dialog().getByRole('button',{name:'Confirmar operación',exact:true}).click();
  const shot = async name => { await page.evaluate(()=>window.scrollTo(0,0)); await page.screenshot({path:out + '/' + name + '.png',fullPage:false}); };
  const target = id => page.getByRole('checkbox',{name:new RegExp('^Parte #'+id+' ·')});
  const choose = async id => {await h.tools();await target(id).check();};
  await control('maintenance?enabled=false'); await control('process?process=a&audience=both');
  await route('admin'); await page.setViewportSize({width:1440,height:1000});
  await select(1); const original = await read(1);
  await h.observations(1, 'Corrección administrativa extraordinaria comprobada');
  const corrected = await write('1/corrections', () => h.save(1,'observations','Corregir registro cerrado con trazabilidad'));
  check(corrected.editDeadline === original.editDeadline && corrected.version === original.version + 1, 'Corrección no reabre');
  await h.openEditor(1,'state'); await dialog().getByRole('radio',{name:'Tardanza T',exact:true}).check();
  await dialog().getByLabel('Motivo de esta operación').fill('Declarar tardanza administrativa sin sanción');
  const stated = await write('1/corrections',()=>dialog().getByRole('button',{name:'Guardar',exact:true}).click());
  check(stated.classState==='T'&&stated.editDeadline===original.editDeadline,'Estado administrativo separado sin reabrir');
  await h.openEditor(1,'final'); await dialog().getByLabel('Motivo de esta operación').fill('Asociar captura extraordinaria motivada');
  const uploadResponse = page.waitForResponse(r => r.url().endsWith('/records/1/corrections/upload') && r.request().method() === 'POST');
  await dialog().getByLabel('Seleccionar captura PNG',{exact:true}).setInputFiles('/tmp/opencode/cepr-captura-prueba.png');
  await dialog().getByText('Preparada, sin asociar',{exact:true}).waitFor();
  const association = page.waitForResponse(r => r.url().endsWith('/records/1/corrections/captures/final') && r.request().method() === 'POST');
  await dialog().getByRole('button',{name:'Guardar',exact:true}).click();
  check((await uploadResponse).status() === 201, 'Subida extraordinaria');
  check((await association).status() === 201, 'Asociación extraordinaria');
  await page.locator('main.parts-view[aria-busy="false"]').waitFor();
  check((await read(1)).finalFileId !== null, 'Captura extraordinaria registrada');
  await shot('administracion-correccion-captura');
  results.push('Corrección y captura extraordinarias motivadas sin alterar cierre');

  await select(3); const beforeGrant = await read(3);
  const grantResponse = await page.request.post(api + '/api/class-session-records/3/grants', {headers:{...headers,'X-Class-Session-Context':fixture.processes.a.process,'X-Class-Session-Account':fixture.accounts.admin.accountId},data:{expectedVersion:beforeGrant.version,accountId:fixture.accounts.monitor.accountId,expiresAt:new Date(Date.now()+30*60000).toISOString(),reason:'Habilitación excepcional sin mover el cierre original'}});
  check(grantResponse.status()===201,'P-03: habilitación posterior al cierre');
  check((await read(3)).version===beforeGrant.version && (await read(3)).editDeadline===beforeGrant.editDeadline,'Habilitación conserva versión y cierre original');
  await route('monitor'); await select(3);
  await h.openEditor(3);const closedSave = dialog().getByRole('button',{name:'Guardar',exact:true});
  check(await closedSave.count()===1,'Habilitación muestra Guardar al monitor');
  check(await closedSave.isDisabled(),'Sin cambios no se habilita Guardar');
  check(await dialog().getByLabel('Motivo de esta operación').count()===1,'Habilitación exige motivo por operación');await h.closeEditor();
  await route('admin'); results.push('P-03: habilitación posterior al cierre con motivo, sin mover el cierre; motivo por cambio se prueba en backend');

  await select(4); const pendingRecord = await read(4); const pendingCoverage = pendingRecord.coverages.find(c=>c.kind==='TEACHER' && c.status==='PENDING');
  await operation('Resolver cobertura'); await dialog().getByLabel('Cobertura a resolver').selectOption(String(pendingCoverage.id));
  await dialog().getByLabel('Resolución').selectOption('AUTHORIZED'); await reason('Autorizar cobertura pendiente sin acreditar ejecución');
  await write('replacements/' + pendingCoverage.id + '/resolve',confirm);
  check((await read(4)).effectiveTeacherId === null,'Autorizar no asigna efectivo');
  // Minutos después del inicio programado: no simular una ejecución que se solape con el bloque anterior.
  const limaStart = new Intl.DateTimeFormat('en-GB',{timeZone:'America/Lima',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(Date.parse(pendingRecord.scheduledStart)+120000));
  check((await read(4)).classState==='RE','La cobertura autorizada no asigna efectivo pero declara el estado del bloque');
  await sheet();await h.openEditor(4);await dialog().getByLabel('Inicio',{exact:true}).fill(limaStart);await dialog().getByLabel('Motivo de esta operación').fill('Declarar inicio real independientemente');
  await write('4/corrections',()=>dialog().getByRole('button',{name:'Guardar',exact:true}).click());
  await details(4);await dialog().getByLabel('Docente efectivo',{exact:true}).selectOption(fixture.ids.replacementTeacher);
  await dialog().getByLabel('Motivo de la corrección administrativa').fill('Declarar persona efectiva explícitamente');
  await write('4/corrections',()=>dialog().getByRole('button',{name:'Guardar cambios',exact:true}).click());await close();
  await operation('Resolver cobertura'); await dialog().getByLabel('Cobertura a resolver').selectOption(String(pendingCoverage.id));
  await dialog().getByLabel('Resolución').selectOption('REVOKED'); await reason('Revocar autorización conservando trabajo declarado');
  await write('replacements/' + pendingCoverage.id + '/resolve',confirm);
  const revoked = await read(4); check(revoked.effectiveTeacherId === fixture.ids.replacementTeacher && revoked.titularOutcome === 'ABSENT','Revocación conserva ejecución y ausencia');
  results.push('Resolver y revocar cobertura separadas de ejecución y resultado titular');

  await choose(3); await choose(6); await operation('Registrar reemplazo / emergencia');
  await dialog().getByLabel('Persona reemplazante',{exact:true}).selectOption(fixture.ids.replacementTeacher);
  await dialog().getByLabel('Modalidad').selectOption('PLANNED'); await reason('Cobertura masiva para dos bloques explícitos');
  await dialog().getByRole('button',{name:'Cerrar y conservar borrador'}).click();
  check(await target(2).isDisabled(),'Destinos congelados con borrador');
  await page.getByRole('button',{name:'Continuar operación'}).click();
  const bulk = await write('replacements',confirm); check(bulk.data.length===2 && bulk.data.every(c=>c.status==='AUTHORIZED'),'Cobertura masiva real');
  results.push('Reemplazos masivos y destinos congelados al conservar operación');
  await page.getByRole('button',{name:'Cerrar selección',exact:true}).click();

  await choose(2); await choose(5); await operation('Anular partes'); await reason('Anulación masiva con conflicto parcial comprobado');
  await dialog().getByRole('button',{name:'Cerrar y conservar borrador'}).click();
  await control('concurrent?process=a&recordId=5');
  await page.getByRole('button',{name:'Continuar operación'}).click();
  const failed = page.waitForResponse(r=>r.url().endsWith('/5/cancel') && r.request().method()==='POST');
  await confirm(); check((await failed).status()===409,'Conflicto real en segundo destino');
  check((await read(2)).deletedAt !== null && (await read(5)).deletedAt === null,'Resultado parcial honesto');
  await dialog().getByRole('button',{name:'Cerrar y conservar borrador'}).click();
  await shot('administracion-lote-parcial');
  await page.getByRole('button',{name:'Cargar servidor y descartar borrador',exact:true}).first().click();
  check(await target(5).isChecked() === false,'Descartar conflicto limpia selección obsoleta');
  const filters = page.locator('details.parts-filters'); await filters.locator('summary').click(); await filters.getByLabel('Incluir anulados').check();
  await target(2).waitFor(); await choose(2); await operation('Restaurar partes'); await reason('Restaurar parte sin modificar cierre original');
  await write('2/restore',confirm); check((await read(2)).deletedAt===null,'Restauración lógica');
  results.push('Anulación/restauración sin abrir fila; lote parcial detiene sin reintentar, selección vieja descartada');

  await select(1); await operation('Crear recuperación');
  const sunday = new Date(fixture.date + 'T12:00:00Z'); do { sunday.setUTCDate(sunday.getUTCDate()+1); } while(sunday.getUTCDay()!==0);
  await dialog().getByLabel('Fecha de recuperación').fill(sunday.toISOString().slice(0,10));
  await dialog().getByLabel('Aula',{exact:false}).selectOption(fixture.classId);
  await dialog().getByLabel('Período',{exact:false}).selectOption('1'); await reason('Recuperación excepcional fechada en domingo');
  const recovery = await write('recoveries',confirm);
  check(recovery.origin==='RECOVERY' && recovery.originalRecordId===1 && recovery.date.startsWith(sunday.toISOString().slice(0,10)),'Recuperación domingo sin horario semanal');
  results.push('Recuperación fechada en domingo con catálogos administrativos autorizados');

  await sheet();await h.observations(1, 'BORRADOR NO DEBE PERDERSE CON CONFIGURACIÓN');
  const section = await ops(); await section.getByRole('button',{name:'Configuración operativa',exact:true}).click();
  check(await page.getByRole('alert').filter({hasText:'Guarda o descarta'}).count()>0,'Configuración no descarta borrador');
  await sheet(); check(await h.draftText(1)==='BORRADOR NO DEBE PERDERSE CON CONFIGURACIÓN','Borrador intacto');
  await h.discard(1);
  await operation('Configuración operativa');
  await dialog().getByLabel('Tolerancia de tardanza (minutos)').fill('');
  await dialog().getByLabel('Espera de reemplazo (minutos)').fill('');
  await dialog().getByLabel('Umbral de alerta (minutos)').fill('0');
  await dialog().getByLabel('Separación de continuidad (minutos)').fill(''); await reason('Política explícita sin parámetros predeterminados');
  const config = await write('configuration',confirm,200,'PATCH');
  check(config.latenessToleranceMinutes===null && config.replacementWaitMinutes===null && config.alertThresholdMinutes===0,'Nulos no cinco minutos');
  await shot('administracion-configuracion');
  results.push('Configuración operativa versionada, parámetros nulos y borrador protegido');

  await page.getByRole('button',{name:'Ver reporte',exact:true}).click();
  await dialog().getByRole('table').locator('tbody tr').first().waitFor();
  await dialog().getByText('Resumen del servidor',{exact:true}).click();
  await shot('administracion-reportes');
  check((await dialog().innerText()).includes('Bloques con reemplazo autorizado'),'Resumen servidor visible');
  await dialog().getByRole('button',{name:'Cerrar reporte',exact:true}).click();
  await sheet();await details(1);await page.getByRole('button',{name:'Historial',exact:true}).click();
  await dialog().locator('.parts-history li').first().waitFor(); await shot('administracion-historial'); await close();
  for (const width of [1440,1280,768,390,320]) { await page.setViewportSize({width,height:900}); check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Overflow admin'+width); }
  await page.setViewportSize({width:390,height:844}); await operation('Configuración operativa'); await shot('administracion-movil'); await dialog().getByRole('button',{name:'Descartar operación'}).click();
  results.push('Reportes y resumen del servidor, historial auditable y móvil');
  check(errors.length===0,errors.join('\n'));
  return {ok:true,suite:'administracion',results,errors};
}
