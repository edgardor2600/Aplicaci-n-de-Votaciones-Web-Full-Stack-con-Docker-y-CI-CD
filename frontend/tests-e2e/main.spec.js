// frontend/tests-e2e/main.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Main Page: Structure and Voting (API real)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Espera a que la app haga su primer refresco
    await page.waitForTimeout(2500);

    // Detén el auto-refresh si existe (evita carreras)
    await page.evaluate(() => {
      if (window.app && typeof window.app.stopAutoRefresh === 'function') {
        window.app.stopAutoRefresh();
      }
    });

    // Asegúrate de que el overlay no esté visible antes de interactuar
    const overlay = page.locator('#loading-overlay');
    if (await overlay.count()) {
      await expect(overlay).toBeHidden();
    }

    // (Debug útil en CI) Loguea cualquier request hacia /api/vote o /api/results
    page.on('request', req => {
      const u = req.url();
      if (u.includes('/api/vote') || u.includes('/api/results')) {
        console.log('CI debug request =>', req.method(), u);
      }
    });
    page.on('response', async res => {
      const u = res.url();
      if (u.includes('/api/vote') || u.includes('/api/results')) {
        console.log('CI debug response =>', res.status(), u);
      }
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
    // Localiza el botón de votar "Gatos" con selectores flexibles y asegúrate de que es clickeable
    const voteCatsButton = page.locator(
      'button[data-option="cats"], [data-option="cats"] button, .voting-card[data-option="cats"] button'
    ).first();

    await voteCatsButton.scrollIntoViewIfNeeded();
    await expect(voteCatsButton).toBeVisible();

    // Prepara esperas tolerantes al formato de URL (barra final / querystring)
    const postVotePromise = page.waitForResponse(res => {
      return res.request().method() === 'POST' && res.url().includes('/api/vote/cats');
    });

    // 🔹 Ejecuta el click que debe disparar el POST
    await voteCatsButton.click();

    // Verifica que el POST ocurrió y fue 201 (si falla, sabrás exactamente el status)
    const postVoteResp = await postVotePromise;
    await expect(postVoteResp.status(), 'status POST /api/vote/cats').toBe(201);

    // Espera al /api/results que la app hace tras votar y loguéalo
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
