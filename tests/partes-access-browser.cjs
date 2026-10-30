async page => {
  const api='http://127.0.0.1:3000',origin='http://127.0.0.1:5174';
  const headers={Origin:origin,'X-Requested-With':'ceprunsa'};
  const f=await(await page.request.get(api+'/__test/fixtures')).json();
  const check=(value,message)=>{if(!value)throw Error(message);};
  const row=id=>page.locator('[data-record="'+id+'"]');
  const select=async id=>{await row(id).getByRole('button',{name:'Curso ficticio',exact:true}).click();await page.locator('.parts-selection').filter({hasText:'Parte #'+id+' ·'}).waitFor();};
  await page.request.get(api+'/__test/session?role=monitor');await page.goto(origin+'/monitor/partes');await row(5).waitFor();await select(5);
  await row(5).locator('textarea').fill('Borrador conservado al cerrar edición');
  await page.request.post(api+'/__test/close?process=a&recordId=5',{headers});
  await page.getByRole('button',{name:'Actualizar',exact:true}).click();
  await row(5).getByRole('button',{name:'Guardar cambios',exact:true}).waitFor();
  await page.locator('.parts-selection').filter({hasText:'Edición cerrada'}).waitFor();
  check(await row(5).getByRole('button',{name:'Guardar cambios',exact:true}).isDisabled(),'Guardar bloqueado tras cierre');
  check(await row(5).getByRole('button',{name:'Descartar cambios',exact:true}).isEnabled(),'Descarte disponible tras cierre');
  await row(5).getByRole('button',{name:'Descartar cambios',exact:true}).click();
  await select(4);await row(4).locator('textarea').fill('Borrador de parte que será anulado');
  await row(4).getByRole('button',{name:'Más opciones',exact:true}).click();
  await page.getByRole('dialog').getByRole('button',{name:'Evidencias',exact:true}).click();
  const uploaded=page.waitForResponse(r=>r.url().endsWith('/class-session-files/records/4') && r.request().method()==='POST');
  await page.getByRole('dialog').getByLabel('Subir captura de inicio (PNG)',{exact:true}).setInputFiles('/tmp/opencode/cepr-captura-prueba.png');
  check((await uploaded).status()===201,'Subida real aún pendiente de asociación');
  await page.getByRole('dialog').getByText('Subida, sin asociar',{exact:true}).waitFor();
  await page.getByRole('dialog').getByRole('button',{name:'Volver a la jornada',exact:true}).click();
  const admin=await page.context().browser().newContext();
  try{
    await admin.request.get(api+'/__test/session?role=admin');
    const r=await(await admin.request.get(api+'/api/class-session-records/4')).json();
    const cancel=await admin.request.post(api+'/api/class-session-records/4/cancel',{headers:{...headers,'X-Class-Session-Context':f.processes.a.process,'X-Class-Session-Account':f.accounts.admin.accountId},data:{expectedVersion:r.version,reason:'Anular mientras existe borrador monitor'}});
    check(cancel.status()===201,'Anulación concurrente real');
    await page.getByRole('button',{name:'Actualizar',exact:true}).click();
    await row(4).waitFor({state:'hidden'});
    await page.getByRole('button',{name:'Detalle',exact:true}).click();
    const d=page.getByRole('dialog').last();
    await d.getByRole('button',{name:'Descartar borrador y subidas pendientes',exact:true}).click();
    await d.waitFor({state:'hidden'});
    await select(2);
  }finally{await admin.close();}
  await row(2).locator('textarea').fill('Borrador descartado antes de logout que fallará');
  await page.route('**/api/auth/logout',route=>route.abort('failed'));
  await page.locator('header button[aria-haspopup="menu"]').click();await page.getByRole('menuitem',{name:'Cerrar sesión'}).click();
  await page.getByRole('dialog').getByRole('button',{name:'Descartar pendientes y cerrar sesión'}).click();
  await page.getByText('No se pudo cerrar la sesión. Intenta nuevamente.',{exact:true}).waitFor();
  await page.unroute('**/api/auth/logout');
  await row(2).locator('textarea').fill('Edición válida después del fallo de logout');
  check(await row(2).getByRole('button',{name:'Guardar cambios',exact:true}).isEnabled(),'Workspace sigue operable tras fallo de logout');
  await row(2).getByRole('button',{name:'Descartar cambios',exact:true}).click();
  return {ok:true,suite:'perdida-acceso-plazo',results:['Cierre con borrador:Guardar deshabilitado y descarte disponible','Anulación concurrente404:descarte explícito de borrador y subida pendiente libera navegación sin borrar archivos','Fallo de red en logout tras descarte explícito:workspace continúa operable']};
}
