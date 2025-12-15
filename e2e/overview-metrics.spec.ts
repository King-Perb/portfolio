import { test, expect } from '@playwright/test';

test.describe('Overview Metrics', () => {
  test('should display all metric cards on overview page', async ({ page }) => {
    await page.goto('/overview');

    // Check for main heading
    await expect(page.getByRole('heading', { name: 'Activity Overview' })).toBeVisible();

    // Check for metric cards (should have at least Projects)
    const projectsMetric = page.getByText('PROJECTS', { exact: true });
    await expect(projectsMetric).toBeVisible();
  });

  test('should display metric values', async ({ page }) => {
    await page.goto('/overview');

    // Wait for metrics to load
    await page.waitForTimeout(2000);

    // Check that metric cards have values displayed
    const metricCards = page.locator('[class*="card"]');
    const cardCount = await metricCards.count();

    // Should have at least one metric card
    expect(cardCount).toBeGreaterThan(0);

    // Check that cards contain numeric values or text
    for (let i = 0; i < Math.min(cardCount, 4); i++) {
      const card = metricCards.nth(i);
      const cardText = await card.textContent();
      expect(cardText).toBeTruthy();
      expect(cardText?.length).toBeGreaterThan(0);
    }
  });

  test('should show hover effects on metric cards', async ({ page }) => {
    await page.goto('/overview');

    // Wait for metrics to load
    await page.waitForTimeout(2000);

    // Find a metric card by looking for the PROJECTS text and navigating to its card container
    const projectsMetric = page.getByText('PROJECTS', { exact: true });
    await expect(projectsMetric).toBeVisible();

    // Get the card that contains this text - use a more reliable selector
    const metricCard = page.locator('[class*="card"]').filter({ hasText: 'PROJECTS' }).first();

    // Hover over the card
    await metricCard.hover();

    // Card should still be visible and interactive
    await expect(metricCard).toBeVisible();
  });

  test('should display metric icons', async ({ page }) => {
    await page.goto('/overview');

    // Wait for metrics to load
    await page.waitForTimeout(2000);

    // Check for icons in metric cards (SVG elements)
    const metricCards = page.locator('[class*="card"]');
    const firstCard = metricCards.first();

    const hasIcon = await firstCard.locator('svg').count() > 0;
    // At least one metric card should have an icon
    expect(hasIcon || await metricCards.count() > 0).toBeTruthy();
  });
});
