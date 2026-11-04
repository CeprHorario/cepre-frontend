async (page, config) => {
  const routes = [];
  const results = [];
  for (const record of config.baselineData ?? []) {
    config.stage = record.id + '/' + record.role + ' contraste/foco';
    await page.goto('about:blank');
    if (record.role === 'public') await page.context().clearCookies();
    else await page.request.get(config.api + '/__test/session?role=' + record.role);
    await page.goto(config.origin + record.path);
    if (record.id === 'UI-02') await page.getByText('No encontramos esta página', { exact: true }).waitFor();
    else await page.locator('main:visible,h1:visible,h2:visible,h3:visible').first().waitFor();
    await page.waitForTimeout(400);
    const contrast = await page.evaluate(() => {
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      const rgba = color => { context.clearRect(0, 0, 1, 1); context.fillStyle = color; context.fillRect(0, 0, 1, 1); return [...context.getImageData(0, 0, 1, 1).data].map((value, index) => index === 3 ? value / 255 : value); };
      const mix = (color, base) => [0, 1, 2].map(index => color[index] * color[3] + base[index] * (1 - color[3]));
      const luminance = color => color.map(value => value / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
      const pairs = new Map();
      for (const element of document.querySelectorAll('body *')) {
        if (!element.getClientRects().length || ![...element.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim()) || element.closest('[disabled],[aria-disabled=true],.sr-only,script,style')) continue;
        const style = getComputedStyle(element);
        if (style.visibility !== 'visible' || Number(style.opacity) === 0) continue;
        const parents = []; let node = element;
        while (node) { parents.unshift(node); node = node.parentElement; }
        let background = [255, 255, 255];
        let approximation = false;
        for (const parent of parents) {
          const css = getComputedStyle(parent);
          if (css.backgroundImage !== 'none' || Number(css.opacity) !== 1) approximation = true;
          background = mix(rgba(css.backgroundColor), background);
        }
        const foreground = mix(rgba(style.color), background);
        const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
        const ratio = (values[0] + 0.05) / (values[1] + 0.05);
        const large = parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.66 && parseInt(style.fontWeight, 10) >= 700);
        const required = large ? 3 : 4.5;
        const key = JSON.stringify([style.color, background, required, approximation]);
        const pair = pairs.get(key) ?? { foreground: style.color, background, ratio, required, approximation, count: 0, example: element.textContent.trim().slice(0, 100) };
        pair.count++; pairs.set(key, pair);
      }
      return [...pairs.values()];
    });
    const focus = [];
    for (let index = 0; index < 20; index++) {
      await page.keyboard.press('Tab');
      focus.push(await page.evaluate(() => {
        const node = document.activeElement;
        const box = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        const header = document.querySelector('.app-header')?.getBoundingClientRect();
        return { tag: node.tagName, name: node.getAttribute('aria-label') || node.textContent.trim().slice(0, 80), top: box.top, bottom: box.bottom, outline: style.outlineStyle, outlineColor: style.outlineColor, boxShadow: style.boxShadow, behindHeader: !node.closest('.app-header') && header && box.top < header.bottom && box.bottom > 0 };
      }));
    }
    routes.push({ id: record.id, role: record.role, path: record.path, contrast, focus });
    results.push(`${record.id}/${record.role}: colores efectivos y20 pasos Tab registrados`);
    config.writeArtifact('baseline-access-live.json', { routes });
  }
  return { ok: true, suite: 'E3 medición accesible de base, no certificación', results, routes, date: new Date().toISOString(), limits: ['Fondos con imagen/opacity marcados approximation requieren revisión visual; no se cuentan como contraste AA verificado.', 'No sustituye lector de pantalla, zoom real, contraste no textual ni pruebas completas de interacción de cada overlay.'] };
}
