// frontend/tests-e2e/main.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Main Page: Structure and Voting (API real)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Espera breve a que la app haga su primer fetch inicial
    await page.waitForTimeout(2500);

    // Detén auto-refresh si existe (evita carreras)
    await page.evaluate(() => {
      if (window.app && typeof window.app.stopAutoRefresh === 'function') {
        window.app.stopAutoRefresh();
      }
    });

    // Si hay overlay de carga, debe estar oculto antes de interactuar
    const overlay = page.locator('#loading-overlay');
    if (await overlay.count()) {
      await expect(overlay).toBeHidden();
    }

    // Logs de red útiles en CI
    page.on('request', req => {
      const u = req.url();
      if (u.includes('/api/')) {
        console.log('CI request =>', req.method(), u);
      }
    });
    page.on('response', async res => {
      const u = res.url();
      if (u.includes('/api/')) {
        console.log('CI response =>', res.status(), u);
      }
    });
    page.on('console', msg => {
      // Para ver cualquier error JS en la página
      if (msg.type() === 'error') console.log('CI page error =>', msg.text());
    });
  });

  test('should have the correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Cats vs Dogs/i);
  });

  test('should display both voting cards', async ({ page }) => {
    await expect(page.locator('div.voting-card[data-option="cats"]')).toBeVisible();
    await expect(page.locator('div.voting-card[data-option="dogs"]')).toBeVisible();
  });

  test('should show loading indicator and results after voting (real API)', async ({ page }) => {
    // Botón robusto (varias variantes de selector)
    const voteCatsButton = page
      .locator('button[data-option="cats"], [data-option="cats"] button, .voting-card[data-option="cats"] button')
      .first();

    await voteCatsButton.scrollIntoViewIfNeeded();
    await expect(voteCatsButton, 'vote button should be visible').toBeVisible();

    // Verifica que el botón es clickeable (sin disparar el click real)
    const canClick = await voteCatsButton.click({ trial: true }).then(() => true).catch(() => false);
    expect(canClick, 'vote button should be clickable').toBeTruthy();

    // Matcher flexible: acepta /api/vote o /api/vote/cats (y con posible slash final o query)
    const isVoteEndpoint = (url) =>
      url.includes('/api/vote/cats') ||
      url.includes('/api/vote?') ||
      url.endsWith('/api/vote') ||
      url.endsWith('/api/vote/');

    const postVotePromise = page.waitForResponse(res => {
      if (res.request().method() !== 'POST') return false;
      const u = res.url();
      return isVoteEndpoint(u);
    });

    // Ejecuta el click real
    await voteCatsButton.click();

    // Si no llega nunca el POST, haremos dump de contexto útil
    let postVoteResp;
    try {
      postVoteResp = await postVotePromise;
    } catch (e) {
      // Dump de diagnóstico
      const btnText = await voteCatsButton.innerText().catch(() => '(no innerText)');
      const catsCardHtml = await page
        .locator('.voting-card[data-option="cats"]')
        .first()
        .evaluate(el => el.outerHTML)
        .catch(() => '(no cats card)');
      console.log('CI DEBUG >> vote button text:', btnText);
      console.log('CI DEBUG >> cats card HTML:', catsCardHtml);
      throw e; // vuelve a lanzar para que el test muera con el timeout original
    }

    // Status esperado 201 (si no, verás en el log el status real)
    await expect(postVoteResp.status(), 'status POST /api/vote(cats)').toBe(201);

    // Ahora esperamos el /api/results que la app hace tras votar
    const resultsResp = await page.waitForResponse(res => {
      return res.request().method() === 'GET' && res.url().includes('/api/results');
    });
    const resultsJson = await resultsResp.json();
    console.log('CI debug /api/results (real) =>', resultsJson);

    // Overlay fuera al finalizar
    const overlay = page.locator('#loading-overlay');
    if (await overlay.count()) {
      await expect(overlay).toBeHidden();
    }

    // Conteo correcto
    await expect(page.locator('#cats-count')).toHaveText('1');

    // Toast de éxito (si existe)
    const successToast = page.locator('#toast-container .toast.toast--success').last();
    if (await successToast.count()) {
      await expect(successToast).toBeVisible();
    }
  });
});
