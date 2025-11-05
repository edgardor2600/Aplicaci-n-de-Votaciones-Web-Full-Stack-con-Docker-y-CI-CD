const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost';

test.describe('Main Page: Structure and Voting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Esperar a que la aplicación esté lista y el toast inicial desaparezca
    await page.waitForTimeout(2500);
  });

  test('should have the correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Cats vs Dogs - Votación');
  });

  test('should display the main header', async ({ page }) => {
    const header = page.locator('.header .logo');
    await expect(header).toBeVisible();
    await expect(header).toHaveText('🐾 Cats vs Dogs');
  });

  test('should display both voting cards', async ({ page }) => {
    const catsCard = page.locator('div.voting-card[data-option="cats"]');
    const dogsCard = page.locator('div.voting-card[data-option="dogs"]');

    await expect(catsCard).toBeVisible();
    await expect(dogsCard).toBeVisible();

    await expect(catsCard.locator('.card-title')).toHaveText('Gatos');
    await expect(dogsCard.locator('.card-title')).toHaveText('Perros');
  });

  test('should show loading indicator and results after voting', async ({ page }) => {
    // Intercepta TODAS las rutas del API del frontend
    await page.route('**/api/**', async route => {
      const req = route.request();

      if (req.url().includes('/vote') && req.method() === 'POST') {
        // pequeña latencia para que el overlay sea visible y el flujo sea realista
        await new Promise(r => setTimeout(r, 120));
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true, voted: 'cats' }),
        });
      }

      if (req.url().includes('/results') && req.method() === 'GET') {
        // leve retraso también aquí, simulando consulta real
        await new Promise(r => setTimeout(r, 80));
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ cats: 1, dogs: 0 }),
        });
      }

      if (req.url().includes('/health')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'ok' }),
        });
      }

      return route.continue();
    });

    // 1. Hacer clic en el botón de votar
    await page.locator('button[data-option="cats"]').click();

    // 2. Esperar a que el resultado final sea visible (enfoque robusto)
    const results = page.locator('#results');
    await expect(results).toBeVisible({ timeout: 15000 });

    // 3. Verificar que el contenido de los resultados es correcto
    const catsCount = page.locator('#cats-count');
    await expect(catsCount).toHaveText('1');

    // 4. (Opcional pero recomendado) Asegurarse de que el overlay ya no está
    await expect(page.locator('#loading-overlay')).toBeHidden();

    // 5. Verificar que aparece la notificación de éxito del voto (más específica)
    // Usar .last() para obtener el toast más reciente (el del voto)
    const successToast = page.locator('#toast-container .toast.toast--success').last();
    await expect(successToast).toBeVisible();
    await expect(successToast).toContainText(/gracias/i);
  });
});