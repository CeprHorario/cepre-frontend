async page => {
  const api = 'http://127.0.0.1:3000', origin = 'http://127.0.0.1:5174';
  const row = id => page.locator(`[data-record="${id}"]`);
  const dialog = () => page.getByRole('dialog').last();
  const openJournal = async () => {
    if (await page.getByRole('heading', { name: 'Partes por fecha', exact: true }).count()) {
      await page.getByRole('button', { name: /^Abrir jornada / }).first().click();
    }
    await row(1).waitFor();
  };
  const route = async role => {
    const response = await page.request.get(`${api}/__test/session?role=${role}`);
    if (!response.ok()) throw new Error('No se pudo preparar la sesión sintética');
    await page.goto(`${origin}/${role === 'admin' ? 'admin' : role}/partes`);
    if (role === 'monitor') {
      await page.getByRole('heading', { name: 'Partes por fecha', exact: true }).waitFor();
      await openJournal();
    } else await row(1).waitFor();
  };
  const select = async id => {
    await row(id).getByRole('button', { name: 'Curso ficticio', exact: true }).click();
    await page.locator('.parts-selection').filter({ hasText: `Parte #${id} ·` }).waitFor();
    await page.locator('main.parts-view[aria-busy="false"]').waitFor();
  };
  const observations = async (id, text, detail = false) => {
    const parent = detail ? dialog() : row(id);
    await parent.getByRole('button', { name: /^Observaciones(?: \(\d+\))?$/ }).click();
    const editor = dialog();
    await editor.getByRole('heading', { name: 'Observaciones del bloque', exact: true }).waitFor();
    while (await editor.getByRole('button', { name: 'Quitar observación', exact: true }).count()) {
      await editor.getByRole('button', { name: 'Quitar observación', exact: true }).first().click();
    }
    if (text) {
      await editor.getByRole('button', { name: 'Agregar observación', exact: true }).click();
      await editor.getByLabel('Descripción de la observación', { exact: true }).fill(text);
    }
    await editor.getByRole('button', { name: 'Aplicar al borrador', exact: true }).click();
  };
  const draftText = async (id, detail = false) => {
    const parent = detail ? dialog() : row(id);
    await parent.getByRole('button', { name: /^Observaciones(?: \(\d+\))?$/ }).click();
    const editor = dialog();
    await editor.getByRole('heading', { name: 'Observaciones del bloque', exact: true }).waitFor();
    const text = await editor.getByLabel('Descripción de la observación', { exact: true }).evaluateAll(inputs => inputs.map(input => input.value));
    await editor.getByRole('button', { name: 'Cancelar', exact: true }).click();
    return text.join('\n');
  };
  return { row, dialog, route, openJournal, select, observations, draftText };
}
