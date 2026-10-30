async page => {
 try {
  const api='http://127.0.0.1:3000', origin='http://127.0.0.1:5174', out='/home/joel/git/cepr/frontend/docs/partes-evidence';
  const results=[],errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('dialog',d=>{void d.accept().catch(()=>{});});
  const check=(value,message)=>{if(!value)throw Error(message);};
  const stage=value=>page.evaluate(value=>window.__partesTestStage=value,value);
  const f=await(await page.request.get(api+'/__test/fixtures')).json();
  const headers={Origin:origin,'X-Requested-With':'ceprunsa'};
  const control=async path=>check((await page.request.post(api+'/__test/'+path,{headers})).ok(),path);
  const login=async role=>{await page.request.get(api+'/__test/session?role='+role);};
  const route=async role=>{await login(role);await page.goto(origin+'/'+(role==='admin'?'admin':role)+'/partes');await page.locator('[data-record="5"]').waitFor();};
  const row=id=>page.locator('[data-record="'+id+'"]'); const dialog=()=>page.getByRole('dialog').last();
  const refocus=()=>page.evaluate(()=>{
    Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});window.dispatchEvent(new Event('visibilitychange'));
    delete document.visibilityState;window.dispatchEvent(new Event('visibilitychange'));
  });
  const select=async id=>{await row(id).getByRole('button',{name:'Curso ficticio',exact:true}).click();await page.locator('.parts-selection').filter({hasText:'Parte #'+id+' ·'}).waitFor();};
  await control('process?process=a&audience=both');await control('maintenance?enabled=false');await route('admin');
  await select(5);await row(5).getByRole('button',{name:'Más opciones',exact:true}).click();
  await dialog().getByLabel('Observaciones',{exact:true}).fill('BORRADOR AISLADO DEL PROCESO A');
  await dialog().getByLabel('Motivo de la corrección administrativa').fill('Comprobar precondición de proceso');
  await dialog().getByRole('button',{name:'Volver a la jornada',exact:true}).click();
  const bBefore=await page.request.get(api+'/api/class-session-records/5',{headers:{'X-Class-Session-Context':f.processes.a.process,'X-Class-Session-Account':f.accounts.admin.accountId}});
  const base=await bBefore.json();
  await control('process?process=b&audience=admin');
  await stage('cambiar proceso B');
  await refocus();
  const guard=await page.request.post(api+'/api/class-session-records/5/corrections',{headers:{...headers,'X-Class-Session-Context':f.processes.a.process,'X-Class-Session-Account':f.accounts.admin.accountId},data:{expectedVersion:base.version,reason:'No ejecutar sobre proceso distinto',incidents:'NO DEBE GUARDARSE'}});
  check(guard.status()===409 && (await guard.json()).code==='CLASS_SESSION_CONTEXT_CHANGED','Precondición proceso409');
  await page.locator('.parts-heading').filter({hasText:f.processes.b.process}).waitFor({timeout:25000});
  check(await page.getByText('BORRADOR AISLADO DEL PROCESO A',{exact:true}).count()===0,'No trasladar borrador aB');
  check((await row(5).textContent()).includes('Aula ficticia B'),'Sin datos cacheados deA con mismosIDs');
  await page.screenshot({path:out+'/aislamiento-proceso-b.png',fullPage:true});
  await control('process?process=a&audience=admin');
  await stage('volver proceso A');
  await refocus();
  await page.locator('.parts-heading').filter({hasText:f.processes.a.process}).waitFor({timeout:25000});
  check(await row(5).locator('textarea').inputValue()==='BORRADOR AISLADO DEL PROCESO A','Recuperar borrador solo al volveraA');
  await row(5).getByRole('button',{name:'Descartar cambios',exact:true}).click();
  results.push('Proceso administrativo cambia sin renovar JWTcore; precondición409, mismosIDs aislados y borrador cuarentenado recuperable');

  await select(5);await row(5).getByRole('button',{name:'Más opciones',exact:true}).click();
  await dialog().getByLabel('Observaciones',{exact:true}).fill('BORRADOR DE CUENTA ADMIN NO TRANSFERIBLE');
  await dialog().getByLabel('Motivo de la corrección administrativa').fill('Aislar cuenta ante cambio en otra pestaña');
  await dialog().getByRole('button',{name:'Volver a la jornada',exact:true}).click();
  await login('monitor');
  await stage('cambiar cuenta monitor');
  const accountGuard=await page.request.get(api+'/api/class-session-records/5',{headers:{'X-Class-Session-Context':f.processes.a.process,'X-Class-Session-Account':f.accounts.admin.accountId}});
  check(accountGuard.status()===409,'Cuenta distinta mismo proceso409');
  await page.getByRole('button',{name:'Actualizar',exact:true}).click();
  await page.waitForURL('**/monitor');
  await page.goto(origin+'/monitor/partes'); await row(5).waitFor();
  check(await page.getByText('BORRADOR DE CUENTA ADMIN NO TRANSFERIBLE',{exact:true}).count()===0,'No filtrar borradoradminamonitor');
  results.push('Cambio de cuenta en otra pestaña: bloqueo409, autenticación actualizada, sin mezclar roles ni borradores');

  await select(5);await row(5).locator('textarea').fill('BORRADOR CON SESIÓN VENCIDA');
  await stage('revocar sesión');
  const logout=await page.request.post(api+'/api/auth/logout',{headers});check(logout.ok(),'Revocar sesión real');
  await row(5).getByRole('button',{name:'Guardar cambios',exact:true}).click({noWaitAfter:true});
  await page.getByRole('button',{name:'Continuar con Google',exact:true}).waitFor({timeout:10000});
  await login('monitor');await refocus();
  await stage('renovar sesión misma cuenta');
  await row(5).locator('textarea').waitFor({timeout:10000});
  check(await row(5).locator('textarea').inputValue()==='BORRADOR CON SESIÓN VENCIDA','Borrador de misma cuenta tras renovación');
  await row(5).getByRole('button',{name:'Descartar cambios',exact:true}).click();
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
