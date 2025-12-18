import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to all main pages', async ({ page, viewport }) => {
    // Start from overview page (homepage redirects to /ai-miko)
    await page.goto('/overview');

    // Overview page should load
    await expect(page.getByRole('heading', { name: 'Activity Overview' })).toBeVisible();

    // On mobile, open navigation first
    const isMobile = (viewport?.width || 1920) < 768;
    if (isMobile) {
      const menuButton = page.locator('button[class*="md:hidden"]').first();
      await menuButton.click();
      await expect(page.locator('[role="dialog"][data-state="open"]')).toBeVisible();
    }

    // Navigate to Projects (which now goes to /overview)
    // On mobile, get link from inside the nav sheet; on desktop, get from sidebar
    let projectsLink;
    if (isMobile) {
      const navSheet = page.locator('[role="dialog"][data-state="open"]');
      await page.waitForTimeout(500); // Give sheet time to fully open
      projectsLink = navSheet.getByRole('link', { name: /projects/i });
    } else {
      projectsLink = page.getByRole('link', { name: /projects/i }).first();
    }

    await projectsLink.click();

    // Wait for navigation to complete - Projects link now goes to /overview
    await expect(page).toHaveURL(/\/overview/, { timeout: 5000 });
    await expect(page.getByRole('heading', { name: 'Activity Overview' })).toBeVisible();

    // On mobile, open navigation again
    if (isMobile) {
      const menuButton = page.locator('button[class*="md:hidden"]').first();
      await menuButton.click();
      await expect(page.locator('[role="dialog"][data-state="open"]')).toBeVisible();
      await page.waitForTimeout(500); // Give sheet time to fully open
    }

    // Navigate to Stack
    // On mobile, get link from inside the nav sheet; on desktop, get from sidebar
    let stackLink;
    if (isMobile) {
      const navSheet = page.locator('[role="dialog"][data-state="open"]');
      stackLink = navSheet.getByRole('link', { name: /stack/i });
    } else {
      stackLink = page.getByRole('link', { name: /stack/i }).first();
    }

    await expect(stackLink).toBeVisible();

    // Click and wait for navigation (animation-based navigation may take longer)
    await stackLink.click();

    // Wait for URL change and page to fully load
    await Promise.all([
      page.waitForURL(/\/stack/, { timeout: 10000 }),
      page.waitForLoadState('networkidle'), // Wait for page to fully load
    ]);

    await expect(page).toHaveURL(/\/stack/, { timeout: 5000 });
    await expect(page.getByRole('heading', { name: /tech stack/i })).toBeVisible();

    // On mobile, open navigation again
    if (isMobile) {
      const menuButton = page.locator('button[class*="md:hidden"]').first();
      await menuButton.click();
      await expect(page.locator('[role="dialog"][data-state="open"]')).toBeVisible();
    }

    // Navigate to Contact
    const contactLink = page.getByRole('link', { name: /contact/i }).first();
    await contactLink.click();
    await expect(page).toHaveURL(/\/contact/);
    await expect(page.getByRole('heading', { name: /get in touch/i })).toBeVisible();

    // On mobile, open navigation again
    if (isMobile) {
      const menuButton = page.locator('button[class*="md:hidden"]').first();
      await menuButton.click();
      await expect(page.locator('[role="dialog"][data-state="open"]')).toBeVisible();
    }

    // Navigate back to Projects (which goes to /overview)
    let projectsLinkBack;
    if (isMobile) {
      const navSheet = page.locator('[role="dialog"][data-state="open"]');
      await page.waitForTimeout(500); // Give sheet time to fully open
      projectsLinkBack = navSheet.getByRole('link', { name: /projects/i });
    } else {
      projectsLinkBack = page.getByRole('link', { name: /projects/i }).first();
    }
    await projectsLinkBack.click();
    await expect(page).toHaveURL('/overview');
    await expect(page.getByRole('heading', { name: 'Activity Overview' })).toBeVisible();
  });

  test('should highlight active navigation link', async ({ page, viewport }) => {
    await page.goto('/overview');

    // On mobile, open navigation first
    const isMobile = (viewport?.width || 1920) < 768;
    if (isMobile) {
      const menuButton = page.locator('button[class*="md:hidden"]').first();
      await menuButton.click();
      await expect(page.locator('[role="dialog"][data-state="open"]')).toBeVisible();
    }

    // Projects link should be active when on /overview (button inside the link has active classes)
    const projectsLink = page.getByRole('link', { name: /projects/i }).first();
    await expect(projectsLink).toBeVisible();

    // Check that the button inside has active styling
    const projectsButton = projectsLink.getByRole('button');
    await expect(projectsButton).toHaveClass(/bg-primary\/10|text-primary/);
  });
});
