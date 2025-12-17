import { test, expect } from '@playwright/test';

test.describe('App Loading Screen', () => {
  test('should display loading screen on initial page load', async ({ page }) => {
    await page.goto('/');

    // Check that loading screen appears with role="status"
    const loadingScreen = page.getByRole('status', { name: 'Loading application' });
    await expect(loadingScreen).toBeVisible({ timeout: 2000 });
  });

  test('should display Lottie animation on loading screen', async ({ page }) => {
    await page.goto('/');

    // Wait for loading screen to appear
    const loadingScreen = page.getByRole('status', { name: 'Loading application' });
    await expect(loadingScreen).toBeVisible({ timeout: 2000 });

    // Check that animation container exists (Lottie animation should be inside)
    const animationContainer = loadingScreen.locator('div').filter({ hasText: '' }).first();
    await expect(animationContainer).toBeVisible();
  });

  test('should cover full screen with fixed positioning', async ({ page }) => {
    await page.goto('/');

    const loadingScreen = page.getByRole('status', { name: 'Loading application' });
    await expect(loadingScreen).toBeVisible({ timeout: 2000 });

    // Check that loading screen has fixed positioning and covers full screen
    await expect(loadingScreen).toHaveCSS('position', 'fixed');
    await expect(loadingScreen).toHaveCSS('top', '0px');
    await expect(loadingScreen).toHaveCSS('left', '0px');
    await expect(loadingScreen).toHaveCSS('right', '0px');
    await expect(loadingScreen).toHaveCSS('bottom', '0px');
  });

  test('should fade out and dismiss after minimum display time', async ({ page }) => {
    await page.goto('/');

    const loadingScreen = page.getByRole('status', { name: 'Loading application' });

    // Wait for loading screen to appear
    await expect(loadingScreen).toBeVisible({ timeout: 2000 });

    // Wait for loading screen to fade out (minimum display time + fade duration)
    // Default minimum is 1500ms + 300ms fade = ~1800ms, but add buffer
    await expect(loadingScreen).not.toBeVisible({ timeout: 5000 });
  });

  test('should only appear on initial load, not on SPA navigation', async ({ page, viewport }) => {
    // Initial load - should see loading screen (homepage redirects to /ai-miko)
    await page.goto('/');
    const loadingScreen = page.getByRole('status', { name: 'Loading application' });
    await expect(loadingScreen).toBeVisible({ timeout: 2000 });

    // Wait for it to dismiss
    await expect(loadingScreen).not.toBeVisible({ timeout: 5000 });

    // Wait for redirect to complete (homepage redirects to /ai-miko)
    await expect(page).toHaveURL(/\/ai-miko/, { timeout: 5000 });

    // Wait for page to be fully interactive
    await page.waitForLoadState('networkidle');

    // Navigate to another page within the SPA using actual link click (not page.goto)
    const isMobile = (viewport?.width || 1920) < 768;

    if (isMobile) {
      // On mobile, open navigation first
      const menuButton = page.locator('button[class*="md:hidden"]').first();
      await menuButton.click();
      await expect(page.locator('[role="dialog"][data-state="open"]')).toBeVisible();

      // Get link from inside the nav sheet
      const navSheet = page.locator('[role="dialog"][data-state="open"]');
      await page.waitForTimeout(500); // Give sheet time to fully open
      const projectsLink = navSheet.getByRole('link', { name: /projects/i });
      await projectsLink.click();
    } else {
      // On desktop, get link from sidebar (inside aside element)
      const sidebar = page.locator('aside');
      const projectsLink = sidebar.getByRole('link', { name: /projects/i });
      await expect(projectsLink).toBeVisible();
      await projectsLink.click();
    }

    // Wait for navigation to complete - Projects link now goes to /overview
    await expect(page).toHaveURL(/\/overview/, { timeout: 5000 });

    // Loading screen should NOT appear again on SPA navigation
    // Give it a moment to ensure it doesn't appear
    await page.waitForTimeout(500);
    await expect(loadingScreen).not.toBeVisible({ timeout: 1000 });
  });

  test('should have correct accessibility attributes', async ({ page }) => {
    await page.goto('/');

    const loadingScreen = page.getByRole('status', { name: 'Loading application' });
    await expect(loadingScreen).toBeVisible({ timeout: 2000 });

    // Verify accessibility attributes
    await expect(loadingScreen).toHaveAttribute('role', 'status');
    await expect(loadingScreen).toHaveAttribute('aria-label', 'Loading application');
  });
});
