async (page, config) => {
  const results = [];
  const check = (condition, name) => { if (!condition) throw new Error(name); results.push(name); };
  const headers = { Origin: config.origin, 'X-Requested-With': 'ceprunsa' };
  const capture = async name => {
    for (const width of [1920, 390]) {
      await page.setViewportSize({ width, height: width === 1920 ? 1080 : 844 });
      await page.screenshot({ path: `${config.output}/UI-01-${name}-${width}.png` });
    }
  };
  config.stage = 'UI01 popup bloqueado';
  await page.context().clearCookies();
  await page.addInitScript(() => { window.open = () => null; });
  await page.goto(config.origin);
  await page.getByRole('button', { name: 'Continuar con Google', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'El navegador bloqueó la ventana' }).waitFor();
  await capture('popup-blocked');
  check(true, 'UI01 popup bloqueado muestra recuperación explícita');
  // Cambiar solo esta página de test, sin OAuth real ni credenciales externas.
  await page.evaluate(() => {
    window.__syntheticPopup = { closed: false };
    window.open = () => window.__syntheticPopup;
  });
  await page.getByRole('button', { name: 'Continuar con Google', exact: true }).click();
  await page.evaluate(origin => {
    window.dispatchEvent(new MessageEvent('message', { origin, source: window, data: { error: 'synthetic' } }));
  }, config.api);
  // Un objeto noWindow no puede fingir event.source: verificar que no se acepte.
  check(await page.getByText('Tu cuenta no está registrada en el sistema o no tiene un rol asignado.', { exact: true }).count() === 0, 'UI01 no acepta una fuente de popup falsificada');
  await page.evaluate(() => { window.__syntheticPopup.closed = true; });
  await page.waitForTimeout(900);
  check(await page.getByRole('button', { name: 'Continuar con Google', exact: true }).isEnabled(), 'UI01 popup cerrado restablece acción');
  await capture('popup-closed');

  config.stage = 'UI01 rol desconocido';
  await page.route(config.api + '/api/auth/user-info', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ id: '00000000-0000-4000-8000-000000000001', email: 'unknown@test.invalid', role: 'unknown', rawRole: 'unknown', coordinatorCourseId: null }) }));
  await page.goto(config.origin);
  await page.getByRole('alert').filter({ hasText: 'Tu cuenta no tiene un rol válido' }).waitFor();
  check(true, 'UI01 rol desconocido no recibe panel ni acceso ampliado');
  await capture('unknown-role');
  await page.unrouteAll({ behavior: 'wait' });

  config.stage = 'UI01 mantenimiento real';
  await page.request.post(config.api + '/__test/maintenance?enabled=true', { headers });
  try {
    await page.request.get(config.api + '/__test/session?role=monitor');
    await page.goto(config.origin + '/monitor');
    await page.getByRole('heading', { name: 'Estamos mejorando el sistema', exact: true }).waitFor();
    check(true, 'UI01 mantenimiento bloquea rol noadmin');
    await capture('maintenance');
    await page.request.get(config.api + '/__test/session?role=admin');
    await page.goto(config.origin + '/admin');
    await page.getByRole('link', { name: /Generar proceso/ }).waitFor();
    check(true, 'UI01 mantenimiento conserva entrada administrativa');
  } finally { await page.request.post(config.api + '/__test/maintenance?enabled=false', { headers }); }
  config.stage = 'UI02 retorno desde no encontrada';
  await page.goto(config.origin + '/admin/recurso-inexistente');
  await page.getByText('No encontramos esta página', { exact: true }).waitFor();
  await page.getByRole('link', { name: 'Ir al inicio', exact: true }).click();
  await page.getByRole('link', { name: /Generar proceso/ }).waitFor();
  check(new URL(page.url()).pathname === '/admin', 'UI02 retorno a home del rol');
  return { ok: true, suite: 'E3 acceso/estado global', results, date: new Date().toISOString(), limits: ['Popup blocked/closed y rol desconocido inyectados; mantenimiento/roles/sessiongate reales.', 'No valida OAuth Google real ni RouteError por fallo de render; controles adicionales abiertos.'] };
}
