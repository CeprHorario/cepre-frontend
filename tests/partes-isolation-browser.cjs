async (page, h) => {
 try {
  const {api,origin}=h;const out='/home/joel/git/cepr/frontend/docs/partes-evidence';
  const results=[],errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('dialog',d=>{void d.accept().catch(()=>{});});
  const check=(value,message)=>{if(!value)throw Error(message);};
  const stage=value=>page.evaluate(value=>window.__partesTestStage=value,value);
  const f=await(await page.request.get(api+'/__test/fixtures')).json();
  const headers={Origin:origin,'X-Requested-With':'ceprunsa'};
  const control=async path=>check((await page.request.post(api+'/__test/'+path,{headers})).ok(),path);
  const login=async role=>{await page.request.get(api+'/__test/session?role='+role);};
   const route=h.route;
  const row=id=>page.locator('[data-record="'+id+'"]'); const dialog=()=>page.getByRole('dialog').last();
  const refocus=()=>page.evaluate(()=>{
    Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});document.dispatchEvent(new Event('visibilitychange'));
    delete document.visibilityState;document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('focus'));
  });
  const select=h.select;
  await control('process?process=a&audience=both');await control('maintenance?enabled=false');await route('admin');
  await select(5);await h.observations(5,'BORRADOR AISLADO DEL PROCESO A');
  await h.openEditor(5,'observations');await dialog().getByLabel('Motivo de esta operación').fill('Comprobar precondición de proceso');await h.closeEditor();
  const bBefore=await page.request.get(api+'/api/class-session-records/5',{headers:{'X-Class-Session-Context':f.processes.a.process,'X-Class-Session-Account':f.accounts.admin.accountId}});
  const base=await bBefore.json();
  await control('process?process=b&audience=admin');
  await stage('cambiar proceso B');
  await refocus();
  const guard=await page.request.post(api+'/api/class-session-records/5/corrections',{headers:{...headers,'X-Class-Session-Context':f.processes.a.process,'X-Class-Session-Account':f.accounts.admin.accountId},data:{expectedVersion:base.version,reason:'No ejecutar sobre proceso distinto',incidents:'NO DEBE GUARDARSE'}});
  check(guard.status()===409 && (await guard.json()).code==='CLASS_SESSION_CONTEXT_CHANGED','Precondición proceso409');
   await page.locator('.part-context-item.room').filter({hasText:'Aula ficticia B'}).waitFor({timeout:35000});
  check(await page.getByText('BORRADOR AISLADO DEL PROCESO A',{exact:true}).count()===0,'No trasladar borrador aB');
  check((await page.locator('.part-context-bar').textContent()).includes('Aula ficticia B'),'Sin datos cacheados deA con mismosIDs');
  await page.screenshot({path:out+'/aislamiento-proceso-b.png',fullPage:true});
  await control('process?process=a&audience=admin');
  await stage('volver proceso A');
  await refocus();
   await page.locator('.part-context-item.room').filter({hasText:'Aula ficticia A'}).waitFor({timeout:35000});
   check(await h.draftText(5)==='BORRADOR AISLADO DEL PROCESO A','Recuperar borrador solo al volveraA');
  await h.discard(5);
  results.push('Proceso administrativo cambia sin renovar JWTcore; precondición409, mismosIDs aislados y borrador cuarentenado recuperable');

  await select(5);await h.observations(5,'BORRADOR DE CUENTA ADMIN NO TRANSFERIBLE');
  await login('monitor');
  await stage('cambiar cuenta monitor');
  const accountGuard=await page.request.get(api+'/api/class-session-records/5',{headers:{'X-Class-Session-Context':f.processes.a.process,'X-Class-Session-Account':f.accounts.admin.accountId}});
  check(accountGuard.status()===409,'Cuenta distinta mismo proceso409');
  await h.refresh();
  await page.waitForURL('**/monitor');
   await page.goto(origin+'/monitor/partes');await h.openJournal();
  check(await page.getByText('BORRADOR DE CUENTA ADMIN NO TRANSFERIBLE',{exact:true}).count()===0,'No filtrar borradoradminamonitor');
  results.push('Cambio de cuenta en otra pestaña: bloqueo409, autenticación actualizada, sin mezclar roles ni borradores');

   await select(5);await h.observations(5,'BORRADOR CON SESIÓN VENCIDA');
  await stage('revocar sesión');
  const logout=await page.request.post(api+'/api/auth/logout',{headers});check(logout.ok(),'Revocar sesión real');
  await h.openEditor(5,'observations');await dialog().getByRole('button',{name:'Guardar',exact:true}).click({noWaitAfter:true});
  await page.getByRole('button',{name:'Continuar con Google',exact:true}).waitFor({timeout:10000});
  await login('monitor');await refocus();
  await stage('renovar sesión misma cuenta');
   await row(5).waitFor({timeout:35000});
   check(await h.draftText(5)==='BORRADOR CON SESIÓN VENCIDA','Borrador de misma cuenta tras renovación');
  await h.discard(5);
  results.push('401 y revocación reales: login sin exponer datos; borrador de misma cuenta conservado en memoria');

  check(errors.length===0,errors.join('\n'));
  const result={ok:true,suite:'aislamiento-sesion',results,errors};
  await page.evaluate(result=>{window.__partesTestResult=result;window.__partesTestStage='verificado';},result);
  return result;
 } catch (error) {
   const result={ok:false,suite:'aislamiento-sesion',error:String(error.message),stage:await page.evaluate(()=>window.__partesTestStage)};
   await page.evaluate(result=>window.__partesTestResult=result,result);
   return result;
 }
}
