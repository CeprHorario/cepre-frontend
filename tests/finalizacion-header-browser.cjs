async (page, config) => {
  const results = [];
  const geometry = [];
  const check = (condition, name) => { if (!condition) throw new Error(name); results.push(name); };
  const f = await (await page.request.get(config.api + '/__test/fixtures')).json();
  for (const role of ['monitor', 'supervisor', 'admin']) {
    await page.goto('about:blank');
    await page.request.get(config.api + '/__test/session?role=' + role);
    await page.goto(config.origin + '/' + role + '/partes');
    await page.locator('.official-parts').waitFor();
    const classroom = page.locator('select').filter({ has: page.locator(`option[value="${f.classId}"]`) }).first();
    if (await classroom.count()) await classroom.selectOption(f.classId);
    await page.locator('tr[data-record]').first().waitFor();
    for (const width of [1920, 1440, 1366, 1024, 768, 390, 320]) {
      for (const height of [1080, 844, 768]) {
        await page.setViewportSize({ width, height });
        await page.screenshot({ path: `${config.output}/header-${config.mode}-${role}-${width}x${height}.png` });
        const measured = await page.evaluate(({ role, width, height }) => {
          const sheet = document.querySelector('.official-parts');
          const header = document.querySelector('.app-header');
          const top = sheet.getBoundingClientRect().top;
          const elements = [...sheet.querySelectorAll('.part-heading,.part-context-bar,.part-board,thead th,tbody tr:first-child td')];
          return { role, width, height, header: { height: header.getBoundingClientRect().height, background: getComputedStyle(header).backgroundColor, font: getComputedStyle(header).fontFamily }, sheet: sheet.getBoundingClientRect().toJSON(), body: elements.map(node => ({ tag: node.tagName, class: node.className, rect: { ...node.getBoundingClientRect().toJSON(), y: node.getBoundingClientRect().y - top, top: node.getBoundingClientRect().top - top, bottom: node.getBoundingClientRect().bottom - top }, font: getComputedStyle(node).fontFamily, size: getComputedStyle(node).fontSize })), overflow: document.documentElement.scrollWidth > innerWidth };
        }, { role, width, height });
        geometry.push(measured);
        check(!measured.overflow, `Header ${role}/${width}/${height}: sin overflow`);
        if (config.mode === 'after') check(measured.header.height === 64, `HDR01 ${role}/${width}/${height}:64px`);
      }
    }
    if (config.mode === 'after') {
      const trigger = page.getByRole('button', { name: /^Cuenta de / });
      await trigger.focus(); await trigger.press('Enter');
      const panel = page.getByRole('region', { name: 'Cuenta de usuario', exact: true });
      await panel.waitFor();
      await page.keyboard.press('Tab');
      await page.keyboard.press('Escape');
      await panel.waitFor({ state: 'hidden' });
      check(await trigger.evaluate(node => node === document.activeElement), 'HDR02 Escape retorna foco ' + role);
      check(await page.getByRole('button', { name: /^Notificaciones:/ }).isVisible(), 'HDR02 campana alcanzable ' + role);
    }
  }
  if (config.mode === 'after') {
    const before = config.readArtifact('header-before-chromium.json');
    if (!before) throw new Error('Falta baseline del cuerpo anterior a header');
    const comparisons = geometry.map(after => {
      const initial = before.geometry.find(row => row.role === after.role && row.width === after.width && row.height === after.height);
      if (!initial) throw new Error('No existe caso comparable header');
      const delta = 64 - initial.header.height;
      check(Math.abs(after.sheet.top - initial.sheet.top - delta) < 1, `HDR01 traslación exacta ${after.role}/${after.width}/${after.height}`);
      check(after.body.length === initial.body.length && after.body.every((row, index) => row.font === initial.body[index].font && row.size === initial.body[index].size && Math.abs(row.rect.width - initial.body[index].rect.width) < 1), `P03 fuentes/anchos del cuerpo conservados ${after.role}/${after.width}/${after.height}`);
      return { role: after.role, width: after.width, height: after.height, expectedDelta: delta, measuredDelta: after.sheet.top - initial.sheet.top };
    });
    config.writeArtifact('header-body-comparison.json', { comparisons, date: new Date().toISOString() });
  }
  return { ok: true, suite: 'HDR01/02 cuerpo y cabecera', results, geometry, date: new Date().toISOString(), limits: ['Geometría relativa/fuentes; no sustituye funcionales de borradores/logout ni presupuesto SSE posterior.'] };
}
