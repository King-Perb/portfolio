import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should redirect to ai-miko page', async ({ page }) => {
    await page.goto('/');

    // Homepage redirects to /ai-miko
    await expect(page).toHaveURL(/\/ai-miko/);
  });

  test('should display activity overview metrics on overview page', async ({ page }) => {
    await page.goto('/overview');

    // Check for main heading
    await expect(page.getByRole('heading', { name: 'Activity Overview' })).toBeVisible();
    await expect(page.getByText('Tracking contributions and status updates.')).toBeVisible();

    // Check for metrics cards (at least Projects should be visible)
    // Use more specific selector to avoid multiple matches
    await expect(page.getByText('PROJECTS', { exact: true })).toBeVisible();
  });

  test('should display featured projects section on overview page', async ({ page }) => {
    await page.goto('/overview');

    // Check for featured projects heading
    await expect(page.getByRole('heading', { name: 'Featured Projects' })).toBeVisible();

    // Check that project cards are rendered (at least one should exist)
    const projectCards = page.locator('[data-testid="project-card"], [class*="card"]').first();
    await expect(projectCards).toBeVisible({ timeout: 10000 });
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/overview');

    // Check that mobile navigation button is visible (has Menu icon)
    const mobileNav = page.locator('button:has(svg)').filter({ hasText: /toggle menu/i }).or(
      page.locator('button[class*="md:hidden"]')
    ).first();
    await expect(mobileNav).toBeVisible();
  });
});
