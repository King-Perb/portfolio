import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to all main pages', async ({ page, viewport }) => {
    await page.goto('/');

    // Home page should load
    await expect(page.getByRole('heading', { name: 'Activity Overview' })).toBeVisible();

    // On mobile, open navigation first
    const isMobile = (viewport?.width || 1920) < 768;
    if (isMobile) {
      const menuButton = page.locator('button[class*="md:hidden"]').first();
      await menuButton.click();
      await expect(page.locator('[role="dialog"][data-state="open"]')).toBeVisible();
    }

    // Navigate to Projects
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
    
    // Wait for navigation to complete
    await expect(page).toHaveURL(/\/projects/, { timeout: 5000 });
    await expect(page.getByRole('heading', { name: /all projects/i })).toBeVisible();

    // On mobile, open navigation again
    if (isMobile) {
      const menuButton = page.locator('button[class*="md:hidden"]').first();
      await menuButton.click();
      await expect(page.locator('[role="dialog"][data-state="open"]')).toBeVisible();
    }

    // Navigate to Stack
    const stackLink = page.getByRole('link', { name: /stack/i }).first();
    await stackLink.click();
    await expect(page).toHaveURL(/\/stack/);
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

    // Navigate back to Home (Overview link)
    const overviewLink = page.getByRole('link', { name: /overview/i }).first();
    await overviewLink.click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Activity Overview' })).toBeVisible();
  });

  test('should highlight active navigation link', async ({ page, viewport }) => {
    await page.goto('/projects');

    // On mobile, open navigation first
    const isMobile = (viewport?.width || 1920) < 768;
    if (isMobile) {
      const menuButton = page.locator('button[class*="md:hidden"]').first();
      await menuButton.click();
      await expect(page.locator('[role="dialog"][data-state="open"]')).toBeVisible();
    }

    // Projects link should be active (button inside the link has active classes)
    const projectsLink = page.getByRole('link', { name: /projects/i }).first();
    await expect(projectsLink).toBeVisible();
    
    // Check that the button inside has active styling
    const projectsButton = projectsLink.getByRole('button');
    await expect(projectsButton).toHaveClass(/bg-primary\/10|text-primary/);
  });
});

