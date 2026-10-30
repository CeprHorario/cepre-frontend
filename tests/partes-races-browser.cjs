async page => {
  const api='http://127.0.0.1:3000', origin='http://127.0.0.1:5174', out='/home/joel/git/cepr/frontend/docs/partes-evidence';
  const results=[],errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('dialog',d=>{void d.accept().catch(()=>{});});
  const check=(value,message)=>{if(!value)throw Error(message);};
  const headers={Origin:origin,'X-Requested-With':'ceprunsa'};
  const control=async path=>check((await page.request.post(api+'/__test/'+path,{headers})).ok(),path);
  const login=async role=>{await page.request.get(api+'/__test/session?role='+role);};
  const route=async role=>{await login(role);await page.goto(origin+'/'+role+'/partes');await page.locator('[data-record="5"]').waitFor();};
  const row=id=>page.locator('[data-record="'+id+'"]'); const dialog=()=>page.getByRole('dialog').last();
  const refocus=()=>page.evaluate(()=>{
    Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});window.dispatchEvent(new Event('visibilitychange'));
    delete document.visibilityState;window.dispatchEvent(new Event('visibilitychange'));
  });
  const select=async id=>{await row(id).getByRole('button',{name:'Curso ficticio',exact:true}).click();await page.locator('.parts-selection').filter({hasText:'Parte #'+id+' ·'}).waitFor();};
  await control('maintenance?enabled=false');await control('process?process=a&audience=both');
  await control('release-upload');
  for(const role of ['teacher','coordinator']){
    await login(role);const paths=[];const watch=r=>{if(r.url().includes('/api/class-session-'))paths.push(r.url());};page.on('request',watch);
    await page.goto(origin+'/admin/partes');await page.waitForURL(role==='teacher'?'**/docente':'**/coordinador/docentes');
    check(paths.length===0,'Rol prohibido no consulta partes:'+role);page.off('request',watch);
    const forbidden=await page.request.get(api+'/api/class-session-records/context');check([401,403].includes(forbidden.status()),'Backend prohíbe '+role);
  }
  results.push('Docente/coordinador: rutas no consultan partes; backend rechaza acceso directo (401/403 del guard)');
  await route('monitor');await select(5);await row(5).getByRole('button',{name:'Más opciones',exact:true}).click();
  await dialog().getByRole('button',{name:'Evidencias',exact:true}).click();
  await control('hold-upload?enabled=true');
  await dialog().getByLabel('Subir captura de inicio (PNG)',{exact:true}).setInputFiles('/tmp/opencode/cepr-captura-prueba.png');
  let held;
  for(let attempt=0;attempt<100;attempt++){
    held=await(await page.request.get(api+'/__test/held-upload')).json();
    if(held.held)break;
    await page.waitForTimeout(50);
  }
  check(held?.held && held.status===201,'GCS y Nest terminaron la subida real antes de retener su respuesta');
  await control('maintenance?enabled=true');
  await refocus();
  await page.getByRole('heading',{name:'Estamos mejorando el sistema'}).waitFor({timeout:20000});
  check(await page.evaluate(()=>!window.dispatchEvent(new Event('ceprunsa:before-logout',{cancelable:true}))), 'Operación en curso conserva veto de logout incluso desmontada');
  check(await page.evaluate(()=>{const event=new Event('beforeunload',{cancelable:true});window.dispatchEvent(event);return event.defaultPrevented;}),'InFlight persistido conserva protección de recarga');
  await control('release-upload');
  await control('maintenance?enabled=false');await refocus();
  await row(5).waitFor({timeout:25000});await page.locator('.parts-selection').filter({hasText:'Parte #5'}).waitFor();
  await page.getByRole('button',{name:'Evidencias',exact:true}).click();
  await dialog().getByText('Subida, sin asociar',{exact:true}).waitFor();
  await page.screenshot({path:out+'/subida-recuperada-mantenimiento.png',fullPage:true});
  await dialog().getByRole('button',{name:'Descartar subida pendiente'}).click();
  await dialog().getByRole('button',{name:'Volver a la jornada',exact:true}).click();
  results.push('Respuesta de subida GCS retenida durante mantenimiento:metadata recuperada sin falsa asociación ni subida repetida');
  check(errors.length===0,errors.join('\n'));
  return {ok:true,suite:'roles-carrera-mantenimiento',results,errors};
}
