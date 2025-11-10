const { test, expect } = require('@playwright/test');

test.describe('Main Page: Structure and Voting', () => {
  // La navegación y configuración ahora se manejan en cada test
  // para permitir el mocking de rutas ANTES de que la página cargue.

  test('should have the correct title', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2500); // Mantenido para consistencia con la lógica original
    await page.evaluate(() => window.app.stopAutoRefresh());
    await expect(page).toHaveTitle('Cats vs Dogs - Votación');
  });

  test('should display the main header', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2500);
    await page.evaluate(() => window.app.stopAutoRefresh());
    // The old classes '.header' and '.logo' were removed during the redesign.
    // We now locate the main heading by its accessible role and name, which is more robust.
    const header = page.getByRole('heading', { name: '🐾 Cats vs Dogs' });
    await expect(header).toBeVisible();
  });

  test('should display both voting cards', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2500);
    await page.evaluate(() => window.app.stopAutoRefresh());
    const catsCard = page.locator('div.voting-card[data-option="cats"]');
    const dogsCard = page.locator('div.voting-card[data-option="dogs"]');

    await expect(catsCard).toBeVisible();
    await expect(dogsCard).toBeVisible();

    // The old '.card-title' class was removed.
    // We now locate the heading within each card by its role and name.
    await expect(catsCard.getByRole('heading', { name: 'Gatos' })).toBeVisible();
    await expect(dogsCard.getByRole('heading', { name: 'Perros' })).toBeVisible();
  });

  test('should show loading indicator and results after voting', async ({ page }) => {
    // 1. Navegar a la página
    await page.goto('/');

    // Esperar a que los elementos principales estén visibles (más confiable que esperar toast)
    await page.waitForSelector('#cats-count');
    await page.waitForSelector('#dogs-count');
    await page.evaluate(() => window.app.stopAutoRefresh());

    // 2. Obtener los conteos iniciales (pueden ser > 0 por votos previos)
    const initialCats = parseInt(await page.locator('#cats-count').textContent());
    const initialDogs = parseInt(await page.locator('#dogs-count').textContent());

    // 3. Simular el voto del usuario y esperar respuesta exitosa
    const voteResponse = page.waitForResponse((resp) => resp.url().includes('/api/vote') && resp.status() === 201);
    await page.locator('button[data-option="cats"]').click();
    await voteResponse; // Verifica que el backend recibió el voto

    // 4. Esperar a que el overlay de carga desaparezca
    await expect(page.locator('#loading-overlay')).toBeHidden({ timeout: 10000 });

    // 5. Verificar que el contador de gatos se incrementó en 1
    await expect(page.locator('#cats-count')).toHaveText((initialCats + 1).toString());

    // 6. Verificar que el contador de perros no cambió
    await expect(page.locator('#dogs-count')).toHaveText(initialDogs.toString());

    // 7. Verificar que la notificación de éxito del voto es visible
    const successToast = page.locator('#toast-container .toast.toast--success').last();
    await expect(successToast).toBeVisible();
    await expect(successToast).toContainText(/gracias/i);
  });
});
