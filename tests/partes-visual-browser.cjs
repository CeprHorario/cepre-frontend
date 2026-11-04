async page=>{
  const api='http://127.0.0.1:3108',origin='http://127.0.0.1:5188',out='/home/joel/git/cepr/frontend/docs/partes-evidence';
  const fixture=await(await page.request.get(api+'/__test/fixtures')).json();
  if(!fixture.visual)throw Error('Iniciar harness con RECORDS_BROWSER_VISUAL=1');
  const reference=await page.context().newPage();
  await reference.goto('file:///home/joel/git/cepr/frontend/docs/modernizacion/propuestas/monitor.html');
  // Only omit the laboratory strip in the live comparison DOM; never edit the reference file/goldens.
  const laboratory=await reference.evaluate(()=>{const lab=document.querySelector('.lab');const height=lab.getBoundingClientRect().height;lab.remove();return height;});
  const results=[];
  const geometry=async(p,product)=>p.evaluate(product=>{
    const rect=element=>{const r=element.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
    return {board:rect(document.querySelector(product?'.part-board':'.board')),heading:rect(document.querySelector('h1')),rows:[...document.querySelectorAll(product?'tr[data-record]':'tbody tr')].map(rect),overflow:document.documentElement.scrollWidth>innerWidth};
  },product);
  for(const role of ['monitor','supervisor','admin']){
    await page.request.get(api+'/__test/session?role='+role);
    await page.goto(origin+'/'+role+'/partes');
    await page.getByLabel('Aula de la jornada').selectOption(fixture.visual.classId);
    await page.waitForFunction(()=>document.querySelectorAll('tr[data-record]').length===7);
    for(const [width,height] of [[1920,1080],[1366,768],[1440,900],[1024,900],[768,900],[390,844],[320,844]]){
      await page.setViewportSize({width,height});await reference.setViewportSize({width,height});
      await page.locator('.part-thumb img').first().waitFor();
      const actual=await geometry(page,true),expected=await geometry(reference,false);
      if(actual.overflow)throw Error(`Overflow ${role} ${width}`);
      if(actual.rows.length!==7)throw Error('La comparación necesita siete bloques');
      const rowDelta=Math.max(...actual.rows.map((r,i)=>Math.abs(r.y-expected.rows[i].y)));
      results.push({role,width,height,actual,expected,rowDelta});
      await page.screenshot({path:`${out}/official-${role}-${width}.png`});
      if(role==='monitor')await reference.screenshot({path:`${out}/reference-region-${width}.png`});
    }
  }
  await page.request.get(api+'/__test/session?role=monitor');await page.goto(origin+'/monitor/partes');await page.getByLabel('Aula de la jornada').selectOption(fixture.visual.classId);
  await page.setViewportSize({width:1366,height:768});
  for(const [kind,label,id] of [['hours','hora real',116],['state','estado',116],['observations','observaciones',116],['initial','captura de inicio',116]]){
    await page.getByRole('button',{name:`Editar ${label} del parte #${id}`,exact:true}).click();
    const dialog=page.getByRole('dialog').last();
    await dialog.waitFor();await page.keyboard.press('Tab');
    if(!await page.evaluate(()=>!!document.activeElement?.closest('dialog')))throw Error('Foco fuera del editor');
    await page.screenshot({path:`${out}/official-editor-${kind}.png`});
    await page.keyboard.press('Escape');
    if(await page.getByRole('dialog').count())throw Error('Escape no cierra editor');
  }
  await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});await page.screenshot({path:`${out}/official-forced-colors.png`});
  await page.emulateMedia({reducedMotion:'no-preference',forcedColors:'none'});
  await reference.close();
  return {ok:true,engine:'Chromium',laboratoryHeightOmitted:laboratory,results};
}
