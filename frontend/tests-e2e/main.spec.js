const { test, expect } = require('@playwright/test');

// URL base que se cargará antes de cada test
const BASE_URL = 'http://localhost:8080';

// Suite de tests para la página principal
test.describe('Main Page: Structure and Voting', () => {

  // Navegar a la página antes de cada test
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('should have the correct title', async ({ page }) => {
    // Verificar que el título de la página es el esperado
    await expect(page).toHaveTitle('Cats vs Dogs - Votación');
  });

  test('should display the main header', async ({ page }) => {
    // Verificar que el header y el logo son visibles
    const header = page.locator('.header .logo');
    await expect(header).toBeVisible();
    await expect(header).toHaveText('🐾 Cats vs Dogs');
  });

  test('should display both voting cards', async ({ page }) => {
    // Localizar las tarjetas de votación por su atributo data-option
    const catsCard = page.locator('div[data-option="cats"]');
    const dogsCard = page.locator('div[data-option="dogs"]');

    // Verificar que ambas tarjetas son visibles
    await expect(catsCard).toBeVisible();
    await expect(dogsCard).toBeVisible();

    // Verificar que contienen los títulos correctos
    await expect(catsCard.locator('.card-title')).toHaveText('Gatos');
    await expect(dogsCard.locator('.card-title')).toHaveText('Perros');
  });

  test('should show loading indicator and results after voting', async ({ page }) => {
    // Mock de la respuesta de la API para no depender del backend real
    await page.route('**/vote/cats', route => {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, voted: 'cats' }),
      });
    });

    await page.route('**/results', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ cats: 1, dogs: 0 }),
      });
    });

    // Simular clic en el botón de votar por gatos
    await page.locator('button[data-option="cats"]').click();

    // Verificar que el indicador de carga aparece
    const loadingOverlay = page.locator('#loading-overlay');
    await expect(loadingOverlay).toBeVisible();

    // Verificar que el toast de notificación aparece con el mensaje correcto
    const toast = page.locator('.toast.is-success');
    await toast.waitFor({ state: 'visible' });
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('¡Gracias por tu voto!');

    // Verificar que la sección de resultados se actualiza
    const catsResult = page.locator('#cats-count');
    await expect(catsResult).toHaveText('1');
  });
});
