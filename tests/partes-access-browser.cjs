async (page, h) => {
  const {api,origin}=h;
  const headers={Origin:origin,'X-Requested-With':'ceprunsa'};
  const f=await(await page.request.get(api+'/__test/fixtures')).json();
  const check=(value,message)=>{if(!value)throw Error(message);};
  const row=id=>page.locator('[data-record="'+id+'"]');
  const select=h.select;
  await h.route('monitor');await select(5);
  await h.observations(5,'Borrador conservado al cerrar edición');
  await page.request.post(api+'/__test/close?process=a&recordId=5',{headers});
  await h.refresh();await h.openEditor(5,'observations');
  check(await h.dialog().getByRole('button',{name:'Guardar',exact:true}).isDisabled(),'Guardar no se habilita tras cierre');
  check(await h.dialog().getByRole('button',{name:'Descartar',exact:true}).isEnabled(),'Descarte disponible tras cierre');
  await h.dialog().getByRole('button',{name:'Descartar',exact:true}).click();
  await select(4);await h.observations(4,'Borrador de parte que será anulado');
  await h.openEditor(4,'initial');await h.dialog().getByLabel('Seleccionar captura PNG',{exact:true}).setInputFiles('/tmp/opencode/cepr-captura-prueba.png');
  await h.dialog().getByText('Preparada, sin asociar',{exact:true}).waitFor();await h.closeEditor();
  const admin=await page.context().browser().newContext();
  try{
    await admin.request.get(api+'/__test/session?role=admin');
    const r=await(await admin.request.get(api+'/api/class-session-records/4')).json();
    const cancel=await admin.request.post(api+'/api/class-session-records/4/cancel',{headers:{...headers,'X-Class-Session-Context':f.processes.a.process,'X-Class-Session-Account':f.accounts.admin.accountId},data:{expectedVersion:r.version,reason:'Anular mientras existe borrador monitor'}});
    check(cancel.status()===201,'Anulación concurrente real');
    await h.refresh();
    await row(4).waitFor({state:'hidden'});
    await h.tools();await page.getByRole('button',{name:'Detalle',exact:true}).click();
    const d=page.getByRole('dialog').filter({has:page.getByRole('heading',{name:/^Detalle del parte/})});
    await d.getByRole('button',{name:'Descartar borrador y subidas pendientes',exact:true}).click();
    await d.waitFor({state:'hidden'});
    const tools=page.getByRole('dialog',{name:'Opciones de Partes',exact:true});
    if(await tools.count())await tools.getByRole('button',{name:'Volver a la jornada',exact:true}).click();
    await select(2);
  }finally{await admin.close();}
  await h.observations(2,'Borrador descartado antes de logout que fallará');
  await page.route('**/api/auth/logout',route=>route.abort('failed'));
  await page.locator('header button[aria-haspopup="menu"]').click();await page.getByRole('menuitem',{name:'Cerrar sesión'}).click();
  await page.getByRole('dialog').getByRole('button',{name:'Descartar pendientes y cerrar sesión'}).click();
  await page.getByText('No se pudo cerrar la sesión. Intenta nuevamente.',{exact:true}).waitFor();
  await page.unroute('**/api/auth/logout');
   await h.observations(2,'Edición válida después del fallo de logout');await h.openEditor(2,'observations');
   check(await h.dialog().getByRole('button',{name:'Guardar',exact:true}).isEnabled(),'Workspace sigue operable tras fallo de logout');
   await h.dialog().getByRole('button',{name:'Descartar',exact:true}).click();
  return {ok:true,suite:'perdida-acceso-plazo',results:['Cierre con borrador:Guardar ausente y descarte disponible','Anulación concurrente404:descarte explícito de borrador y subida pendiente libera navegación sin borrar archivos','Fallo de red en logout tras descarte explícito:workspace continúa operable']};
}
