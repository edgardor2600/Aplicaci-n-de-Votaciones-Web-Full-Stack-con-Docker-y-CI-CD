const { test, expect } = require('@playwright/test');

test.describe('Phase 1 - UI Visuals and Basic Rendering', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navega a la página principal antes de cada test
    await page.goto('/');
  });

  test('should display main elements on the page', async ({ page }) => {
    // 1. Header principal
    await expect(page.locator('h1')).toContainText('🐾 Cats vs Dogs');

    // 2. Título de la sección principal
    await expect(
      page.getByRole('heading', { name: '¿Cuál es tu favorito?' })
    ).toBeVisible();

    // 3. Ambas tarjetas de votación
    const catsCard = page.locator('.voting-card[data-option="cats"]');
    const dogsCard = page.locator('.voting-card[data-option="dogs"]');
    
    await expect(catsCard).toBeVisible();
    await expect(
      catsCard.getByRole('heading', { name: 'Gatos' })
    ).toBeVisible();
    await expect(
      catsCard.getByRole('button', { name: 'Votar por Gatos' })
    ).toBeVisible();

    await expect(dogsCard).toBeVisible();
    await expect(
      dogsCard.getByRole('heading', { name: 'Perros' })
    ).toBeVisible();
    await expect(
      dogsCard.getByRole('button', { name: 'Votar por Perros' })
    ).toBeVisible();

    // 4. Sección de resultados
    await expect(
      page.getByRole('heading', { name: 'Resultados en Tiempo Real' })
    ).toBeVisible();
    await expect(page.locator('#cats-count')).toBeVisible();
    await expect(page.locator('#dogs-count')).toBeVisible();
  });

  test('should animate result bars on vote', async ({ page }) => {
    // Detener auto-refresh para tener un estado estable en el test
    await page.evaluate(() => window.app.stopAutoRefresh());

    const catsBar = page.locator('#cats-bar');

    // Estilo inicial (normalmente width: 0%)
    const initialStyle = await catsBar.getAttribute('style');
    expect(initialStyle).toContain('width:');

    // Hacer un voto por gatos para disparar la animación
    await page.getByRole('button', { name: /Votar por Gatos/ }).click();

    // Esperar a que desaparezca el overlay de carga,
    // señal de que el voto se procesó y los resultados se actualizaron
    await expect(
      page.locator('#loading-overlay')
    ).toBeHidden({ timeout: 10000 });

    // Hacer polling del estilo hasta que la width sea > 0,
    // confirmando que la barra tiene ancho (y por tanto se animó)
    await expect.poll(async () => {
      const style = await catsBar.getAttribute('style');
      if (!style) return false;

      const match = style.match(/width:\s*([\d.]+)%/);
      if (!match) return false;

      const width = parseFloat(match[1]);
      return width > 0;
    }, {
      message: 'Result bar did not animate or width is not greater than 0.',
      timeout: 5000
    }).toBe(true);
  });

});
