async (page,h)=>{
  const {api}=h;
  const check=(value,message)=>{if(!value)throw Error(message);};
  const dialog=()=>page.getByRole('dialog').last();
  const read=async id=>await(await page.request.get(api+'/api/class-session-records/'+id)).json();
  const observed=[];
  page.on('response',response=>{if(['POST','PATCH'].includes(response.request().method()))observed.push(response);});
  const waitResponse=async(path,method,action)=>{
    const from=observed.length;await action();
    const deadline=Date.now()+30000;let found;
    while(Date.now()<deadline){found=observed.slice(from).find(r=>r.url().split('?')[0]===api+'/api/'+path&&r.request().method()===method);if(found)break;await page.waitForTimeout(50);}
    check(found,path+' sin respuesta observada');return found;
  };
  await page.request.get(api+'/__test/maintenance?enabled=false');
  await page.request.post(api+'/__test/process?process=a&audience=both',{headers:{Origin:h.origin,'X-Requested-With':'ceprunsa'}});
  await h.route('monitor');
  await h.select(1);
  const before=await read(1);
  await h.openEditor(1,'state');
  await dialog().getByRole('radio',{name:'Reemplazo normal RN',exact:true}).check();
  await dialog().getByLabel('Correo del docente reemplazante').fill('reemplazante@browser.invalid');
  const proposal=await waitResponse('class-session-records/1','PATCH',()=>dialog().getByRole('button',{name:'Guardar',exact:true}).click());
  check(proposal.status()===200,'Propuesta HTTP '+proposal.status()+' '+await proposal.text());
  const pending=await read(1);
  check(pending.version===before.version+1,'Propuesta versionada');
  check(pending.effectiveTeacherId===null,'Proponer no asigna efectivo');
  check(pending.classState!=='RN'&&pending.classState!=='RE','Proponer no declara el reemplazo como estado ejecutado');
  check(pending.coverages.some(c=>c.kind==='TEACHER'&&c.status==='PENDING'),'Cobertura pendiente persistida');
  check(pending.teachingStatus===before.teachingStatus,'Proponer no confirma dictado');
  // El mismo payload con otra clave/hash no debe duplicar la propuesta; el servidor responde conflicto.
  await page.getByRole('button',{name:'Más opciones de Partes',exact:true}).click();
  await dialog().getByRole('button',{name:'Volver a la jornada',exact:true}).click();
  await h.route('admin');await h.select(1);
  await page.getByRole('button',{name:'Más opciones de Partes',exact:true}).click();
  const section=page.locator('details').filter({has:page.locator('summary').filter({hasText:/^Operaciones administrativas$/})});
  if(await section.getAttribute('open')===null)await section.locator('summary').click();
  await section.getByRole('button',{name:'Resolver cobertura',exact:true}).click();
  await dialog().getByRole('heading',{name:'Resolver cobertura',exact:true}).waitFor();
  const coverage=pending.coverages.find(c=>c.kind==='TEACHER'&&c.status==='PENDING');
  await dialog().getByLabel('Cobertura a resolver').selectOption(String(coverage.id));
  await dialog().getByLabel('Resolución').selectOption('AUTHORIZED');
  await dialog().getByLabel('Motivo de la operación').fill('Autorizar propuesta interna sin acreditar ejecución');
  const resolved=await waitResponse('class-session-records/replacements/'+coverage.id+'/resolve','POST',()=>dialog().getByRole('button',{name:'Confirmar operación',exact:true}).click());
  check(resolved.status()===201,'Resolver HTTP '+resolved.status()+' '+await resolved.text());
  const authorized=await read(1);
  check(authorized.effectiveTeacherId===null&&authorized.teachingStatus===pending.teachingStatus,'Autorizar no asigna ni ejecuta');
  check(authorized.classState==='RN','Cobertura autorizada declara RN separada de ejecución');
  check(authorized.coverages.some(c=>c.kind==='TEACHER'&&c.status==='AUTHORIZED'),'Autorización persistida');
  await page.screenshot({path:'/home/joel/git/cepr/frontend/docs/partes-evidence/propuesta-autorizada.png'});
  return {ok:true,suite:'propuesta-reemplazo',results:['Monitor propone RN por correo con operación propia','Sin estado/efectivo/dictado anticipados','Administración autoriza sin ejecutar; cobertura y estado separados']};
}
