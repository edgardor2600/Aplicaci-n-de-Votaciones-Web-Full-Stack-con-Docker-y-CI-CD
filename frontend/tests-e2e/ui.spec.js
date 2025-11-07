const { test, expect } = require('@playwright/test');

test.describe('Phase 1 - UI Visuals and Basic Rendering', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the root page before each test
    await page.goto('/');
  });

  test('should display main elements on the page', async ({ page }) => {
    // 1. Check for the main header
    await expect(page.locator('h1')).toContainText('🐾 Cats vs Dogs');

    // 2. Check for the hero section title
    await expect(page.getByRole('heading', { name: '¿Cuál es tu favorito?' })).toBeVisible();

    // 3. Check that both voting cards are present
    const catsCard = page.locator('.voting-card[data-option="cats"]');
    const dogsCard = page.locator('.voting-card[data-option="dogs"]');
    
    await expect(catsCard).toBeVisible();
    await expect(catsCard.getByRole('heading', { name: 'Gatos' })).toBeVisible();
    await expect(catsCard.getByRole('button', { name: 'Votar por Gatos' })).toBeVisible();

    await expect(dogsCard).toBeVisible();
    await expect(dogsCard.getByRole('heading', { name: 'Perros' })).toBeVisible();
    await expect(dogsCard.getByRole('button', { name: 'Votar por Perros' })).toBeVisible();

    // 4. Check for the results section
    await expect(page.getByRole('heading', { name: 'Resultados en Tiempo Real' })).toBeVisible();
    await expect(page.locator('#cats-count')).toBeVisible();
    await expect(page.locator('#dogs-count')).toBeVisible();
  });

  test('should animate result bars on vote', async ({ page }) => {
    // Stop auto-refresh to have a stable state for testing
    await page.evaluate(() => window.app.stopAutoRefresh());

    const catsBar = page.locator('#cats-bar');
    const initialStyle = await catsBar.getAttribute('style');
    
    // Expect initial width to be something like 'width: 0%;'
    expect(initialStyle).toContain('width:');

    // Vote for cats to trigger the animation
    await page.getByRole('button', { name: /Votar por Gatos/ }).click();

    // Wait for the loading overlay to disappear, indicating the vote is processed and results are updated
    await expect(page.locator('#loading-overlay')).toBeHidden({ timeout: 10000 });

    // Poll the width style attribute until it changes from the initial value,
    // confirming the animation has started.
    await expect.poll(async () => {
      return catsBar.getAttribute('style');
    }, {
      message: 'Result bar did not start animating in time.',
      timeout: 5000
    }).not.toBe(initialStyle);
  });

});
