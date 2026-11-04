async (page, config = {}) => {
  const api = config.api ?? 'http://127.0.0.1:3000', origin = config.origin ?? 'http://127.0.0.1:5174';
  const row = id => page.locator(`[data-record="${id}"]`);
  const dialog = () => page.getByRole('dialog').last();
  const openJournal = async () => {
    if (await page.getByRole('heading', { name: 'Partes por fecha', exact: true }).count()) await page.getByRole('button', { name: /^Abrir jornada / }).first().click();
    await row(1).waitFor();
  };
  const route = async role => {
    const response = await page.request.get(`${api}/__test/session?role=${role}`);
    if (!response.ok()) throw new Error('No se pudo preparar la sesión sintética');
    await page.goto(`${origin}/${role === 'admin' ? 'admin' : role}/partes`);
    await openJournal();
  };
  const closeEditor = async () => { await dialog().getByRole('button', {name:'Cerrar',exact:true}).click(); };
  const openEditor = async (id, editor = 'hours') => {
    const label = {hours:'hora real',state:'estado',observations:'observaciones',initial:'captura de inicio',final:'captura de fin'}[editor];
    await row(id).getByRole('button', {name:`Editar ${label} del parte #${id}`,exact:true}).click();
    await dialog().waitFor();
    return dialog();
  };
  const select = async id => { await openEditor(id); await closeEditor(); };
  const tools = async () => {
    if (!await page.getByRole('dialog',{name:'Opciones de Partes',exact:true}).count()) await page.getByRole('button',{name:'Más opciones de Partes',exact:true}).click();
    return dialog();
  };
  const refresh = async () => {
    await tools();const response=page.waitForResponse(r=>r.url().includes('/class-session-records/workspace')&&r.request().method()==='GET');
    await dialog().getByRole('button',{name:'Actualizar jornada',exact:true}).click();
    if((await response).status()===503) {await page.getByRole('heading',{name:'Estamos mejorando el sistema'}).waitFor();return;}
    if(await page.getByRole('dialog',{name:'Opciones de Partes',exact:true}).count()) await closeEditor();
  };
  const observations = async (id, text) => {
    const editor = await openEditor(id, 'observations');
    while (await editor.getByRole('button', { name: 'Quitar observación del borrador', exact: true }).count()) await editor.getByRole('button', { name: 'Quitar observación del borrador', exact: true }).first().click();
    if (text) {
      await editor.getByRole('button', { name: 'Añadir observación', exact: true }).click();
      await editor.getByLabel('Descripción de la observación', { exact: true }).fill(text);
      await editor.getByRole('button',{name:'Confirmar observación en el borrador',exact:true}).click();
    }
    await closeEditor();
  };
  const draftText = async id => {
    const editor = await openEditor(id,'observations');
    const text = await editor.locator('.part-note-copy p').allTextContents();
    await closeEditor(); return text.join('\n');
  };
  const discard = async (id, editor='observations') => { await openEditor(id,editor); await dialog().getByRole('button',{name:'Descartar',exact:true}).click(); };
  const save = async (id, editor='observations',reason) => {
    await openEditor(id,editor);
    if(reason) await dialog().getByLabel('Motivo de esta operación',{exact:true}).fill(reason);
    await dialog().getByRole('button',{name:'Guardar',exact:true}).click();
    await page.locator('main.parts-view[aria-busy="false"]').waitFor();
  };
  return {api,origin,row,dialog,route,openJournal,select,observations,draftText,openEditor,closeEditor,tools,refresh,discard,save};
}
