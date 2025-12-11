import { test, expect } from '@playwright/test';

test.describe('Mobile Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
  });

  test('should open and close mobile navigation', async ({ page }) => {
    // Find menu button (button with Menu icon, visible on mobile)
    const menuButton = page.locator('button[class*="md:hidden"]').first();

    // Open navigation
    await menuButton.click();

    // Check that navigation sheet/drawer is visible
    const navSheet = page.locator('[role="dialog"][data-state="open"]');
    await expect(navSheet).toBeVisible();

    // Close navigation by pressing Escape key
    await page.keyboard.press('Escape');

    // Navigation should be closed
    await expect(navSheet).not.toBeVisible({ timeout: 3000 });
  });

  test('should navigate when clicking mobile nav link', async ({ page }) => {
    // Open navigation
    const menuButton = page.locator('button[class*="md:hidden"]').first();
    await menuButton.click();

    // Wait for navigation to be visible
    const navSheet = page.locator('[role="dialog"][data-state="open"]');
    await expect(navSheet).toBeVisible();

    // Wait for sheet to fully open
    await page.waitForTimeout(500);

    // Click on Projects link inside the mobile nav sheet
    const projectsLink = navSheet.getByRole('link', { name: /projects/i });
    await projectsLink.click();

    // Should navigate to projects page
    await expect(page).toHaveURL(/\/projects/);

    // Navigation should close after clicking
    await expect(navSheet).not.toBeVisible({ timeout: 2000 });
  });
});
