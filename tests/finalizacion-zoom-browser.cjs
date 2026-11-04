async (page, config) => {
  await page.request.get(config.api + '/__test/session?role=admin');
  await page.goto(config.origin + '/admin/gestionar/cursos');
  await page.getByRole('button', { name: 'Agregar curso', exact: true }).waitFor();
  const measure = () => page.evaluate(() => ({ width: innerWidth, ratio: devicePixelRatio, visualScale: visualViewport.scale }));
  const before = await measure();
  for (let index = 0; index < 6; index++) await page.keyboard.press('Control+Equal');
  const afterKeys = await measure();
  if (afterKeys.ratio === before.ratio) {
    await page.keyboard.down('Control');
    for (let index = 0; index < 6; index++) await page.mouse.wheel(0, -100);
    await page.keyboard.up('Control');
  }
  const after = await measure();
  config.writeArtifact('zoom-native-attempt.json', { before, afterKeys, after, method: 'Ctrl+Equal seis veces; alternativa Ctrl+rueda. Sin CSS zoom ni reflow simulado', date: new Date().toISOString() });
  if (after.ratio / before.ratio < 1.95 || after.ratio / before.ratio > 2.05)
    throw new Error('El envío gestionado de teclado no acredita zoom real200%; no se cuenta viewport reducido como sustituto');
  await page.getByRole('button', { name: 'Agregar curso', exact: true }).click();
  await page.screenshot({ path: config.output + '/cursos-zoom200.png' });
  return { ok: true, suite: 'Zoom real200%', results: ['Zoom nativo200% medido', 'Modal Cursos a200%'], before, after, date: new Date().toISOString() };
}
