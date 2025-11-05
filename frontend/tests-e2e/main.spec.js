// frontend/tests-e2e/main.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Main Page: Structure and Voting (API real)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Espera breve a que la app termine su primer refresco
    await page.waitForTimeout(2500);

    // Detener el auto-refresh si existe (evita carreras con asserts)
    await page.evaluate(() => {
      if (window.app && typeof window.app.stopAutoRefresh === 'function') {
        window.app.stopAutoRefresh();
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
    // 1) Espera explícita a la respuesta del POST real
    const postRespP = page.waitForResponse(r =>
      r.url().endsWith('/api/vote/cats') && r.request().method() === 'POST'
    );

    // Click en votar gatos
    await page.locator('button[data-option="cats"], [data-option="cats"] button').first().click();

    // 2) El POST debe ser 201 (si no, verás exactamente el status que devuelve el backend en CI)
    const postResp = await postRespP;
    await expect(postResp.status(), 'status POST /api/vote/cats').toBe(201);

    // 3) Espera al GET /api/results que la app dispara tras votar
    const resultsResp = await page.waitForResponse(r =>
      r.url().endsWith('/api/results') && r.request().method() === 'GET'
    );
    const resultsJson = await resultsResp.json();
    console.log('CI debug /api/results (real) =>', resultsJson);

    // 4) Overlay oculto
    const overlay = page.locator('#loading-overlay');
    if (await overlay.count()) {
      await expect(overlay).toBeHidden();
    }

    // 5) Conteo correcto
    await expect(page.locator('#cats-count')).toHaveText('1');

    // 6) Toast de éxito (si existe)
    const successToast = page.locator('#toast-container .toast.toast--success').last();
    if (await successToast.count()) {
      await expect(successToast).toBeVisible();
    }
  });
});
