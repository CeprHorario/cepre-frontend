async (page, config) => {
  const results = [];
  const check = (condition, name) => { if (!condition) throw new Error(name); results.push(name); };
  await page.request.get(config.api + '/__test/session?role=admin');
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto(config.origin + '/admin/gestionar/docentes');
  const trigger = page.getByRole('button', { name: 'Abrir menú', exact: true });
  await trigger.waitFor(); await trigger.focus(); await trigger.press('Enter');
  const menu = page.getByRole('dialog', { name: 'Gestionar datos', exact: true });
  await menu.waitFor();
  for (let index = 0; index < 25; index++) {
    await page.keyboard.press('Tab');
    check(await menu.evaluate(node => node.contains(document.activeElement) || (node.matches(':modal') && document.activeElement === document.body)), 'Navegación móvil sin foco en fondo interactivo ' + index);
  }
  await page.keyboard.press('Escape'); await menu.waitFor({ state: 'hidden' });
  check(await trigger.evaluate(node => node === document.activeElement), 'Navegación móvil retorno de foco');
  await page.getByRole('button', { name: 'Agregar docente', exact: true }).click();
  const form = page.getByRole('dialog').last();
  await form.waitFor();
  check(await page.evaluate(() => document.getElementById('root').inert), 'Drawer personas fondo inerte');
  for (let index = 0; index < 30; index++) {
    await page.keyboard.press('Tab');
    check(await form.evaluate(node => node.contains(document.activeElement)), 'Drawer personas foco contenido ' + index);
  }
  await form.getByRole('button', { name: 'Cancelar', exact: true }).click();
  check(!await page.evaluate(() => document.getElementById('root').inert), 'Drawer personas restaura fondo');
  await page.request.get(config.api + '/__test/session?role=monitor');
  await page.goto(config.origin + '/monitor');
  const week = page.getByRole('radio', { name: 'Semana', exact: true });
  await week.waitFor(); await week.focus(); await page.keyboard.press('ArrowRight');
  check(await page.getByRole('radio', { name: 'Por día', exact: true }).getAttribute('aria-checked') === 'true', 'Selector semana/día con flechas');
  const day = page.getByRole('radiogroup', { name: 'Día', exact: true });
  await day.getByRole('radio', { checked: true }).focus(); await page.keyboard.press('Home');
  check(await day.getByRole('radio').first().getAttribute('aria-checked') === 'true', 'Selector de día Home y estado nativoARIA');
  return { ok: true, suite: 'E5/6/7 teclado y navegación', results, date: new Date().toISOString() };
}
