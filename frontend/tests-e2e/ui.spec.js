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

});
