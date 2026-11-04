async (page, h) => {
  const {api,origin}=h; const out='/home/joel/git/cepr/frontend/docs/partes-evidence';
  const results=[],errors=[],uploads=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('dialog',d=>{void d.accept().catch(()=>{});});
  page.on('response',response=>{if(response.url().includes('/class-session-files/records/5'))uploads.push({method:response.request().method(),path:new URL(response.url()).pathname,status:response.status()});});
  const check=(value,message)=>{if(!value)throw Error(message);};
  const headers={Origin:origin,'X-Requested-With':'ceprunsa'};
  const control=async path=>check((await page.request.post(api+'/__test/'+path,{headers})).ok(),path);
  const login=async role=>{await page.request.get(api+'/__test/session?role='+role);};
  const route=h.route;
  const row=id=>page.locator('[data-record="'+id+'"]'); const dialog=()=>page.getByRole('dialog').last();
  const refocus=()=>page.evaluate(()=>{
    Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});document.dispatchEvent(new Event('visibilitychange'));
    delete document.visibilityState;document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('focus'));
  });
  await control('maintenance?enabled=false');await control('process?process=a&audience=both');
  await control('release-upload');
  for(const role of ['teacher','coordinator']){
    await login(role);const paths=[];const watch=r=>{if(r.url().includes('/api/class-session-'))paths.push(r.url());};page.on('request',watch);
    await page.goto(origin+'/admin/partes');await page.waitForURL(role==='teacher'?'**/docente':'**/coordinador/docentes');
    check(paths.length===0,'Rol prohibido no consulta partes:'+role);page.off('request',watch);
    const forbidden=await page.request.get(api+'/api/class-session-records/context');check([401,403].includes(forbidden.status()),'Backend prohíbe '+role);
  }
  results.push('Docente/coordinador: rutas no consultan partes; backend rechaza acceso directo (401/403 del guard)');
  await route('monitor');await h.openEditor(5,'initial');
  // Retraso de red en el navegador: la subida real termina mientras la asociación se aborta.
  await page.route('**/class-session-files/records/5',async route=>{await new Promise(resolve=>setTimeout(resolve,800));await route.continue();});
  await page.route('**/class-session-files/records/5/captures/initial',route=>route.abort());
  await dialog().getByLabel('Seleccionar captura PNG',{exact:true}).setInputFiles('/tmp/opencode/cepr-captura-prueba.png');
  await dialog().getByText('Preparada, sin asociar',{exact:true}).waitFor();await dialog().getByRole('button',{name:'Guardar',exact:true}).click();
  await page.waitForTimeout(2000);
  await page.unroute('**/class-session-files/records/5/captures/initial');
  await page.unroute('**/class-session-files/records/5');
  const captureText=await dialog().innerText();
  if(!captureText.includes('Subida, sin asociar'))throw Error('Captura no recuperada: '+captureText.replaceAll('\n',' | ')+' '+JSON.stringify(uploads));
  check(uploads.filter(item=>item.method==='POST'&&item.path==='/api/class-session-files/records/5').length===1,'Sin subida duplicada');
  await page.screenshot({path:out+'/subida-recuperada.png',fullPage:true});
  await dialog().getByRole('button',{name:'Descartar',exact:true}).click();
  results.push('Retraso de red en la subida: metadata recuperada sin falsa asociación ni subida repetida');
  check(errors.length===0,errors.join('\n'));
  return {ok:true,suite:'roles-carrera-mantenimiento',results,errors};
}
