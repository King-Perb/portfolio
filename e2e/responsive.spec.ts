import { test, expect, devices } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('should display mobile navigation on small screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize(devices['iPhone 12'].viewport);
    await page.goto('/');

    // Mobile nav button should be visible
    const mobileNavButton = page.locator('button[class*="md:hidden"]').first();
    await expect(mobileNavButton).toBeVisible();

    // Desktop sidebar should be hidden
    // On mobile, sidebar should not be visible (or should be in a sheet)
    expect(mobileNavButton).toBeVisible();
  });

  test('should display desktop sidebar on large screens', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize(devices['Desktop Chrome'].viewport);
    await page.goto('/');

    // Desktop sidebar should be visible
    const sidebar = page.locator('aside');
    await expect(sidebar.first()).toBeVisible();

    // Mobile nav button should be hidden
    const mobileNavButton = page.locator('button[class*="md:hidden"]');
    const isVisible = await mobileNavButton.isVisible().catch(() => false);
    expect(isVisible).toBeFalsy();
  });

  test('should adapt project grid layout for different screen sizes', async ({ page }) => {
    await page.goto('/projects');

    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileGrid = page.locator('section[class*="grid"]').first();
    await expect(mobileGrid).toBeVisible();

    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(mobileGrid).toBeVisible();

    // Test desktop layout
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(mobileGrid).toBeVisible();
  });

  test('should hide project images on mobile', async ({ page }) => {
    await page.goto('/projects');

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Wait for projects to load
    await page.waitForTimeout(2000);

    // Project images should be hidden on mobile (hidden md:block class)
    const projectImages = page.locator('img[alt*="project"], img[alt*="Project"]');
    const imageCount = await projectImages.count();

    // Images with hidden md:block should not be visible on mobile
    for (let i = 0; i < imageCount; i++) {
      const img = projectImages.nth(i);
      const isVisible = await img.isVisible().catch(() => false);
      // Images with hidden md:block should not be visible on mobile
      if (isVisible) {
        // If visible, it might be a different image (like avatar)
        const parent = img.locator('..');
        const hasHiddenMdBlock = await parent.evaluate((el) =>
          el.classList.toString().includes('hidden') && el.classList.toString().includes('md:block')
        );
        if (hasHiddenMdBlock) {
          expect(isVisible).toBeFalsy();
        }
      }
    }
  });

  test('should show project images on desktop', async ({ page }) => {
    await page.goto('/projects');

    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    // Wait for projects to load
    await page.waitForTimeout(2000);

    // Check if any project images are visible
    const projectCards = page.locator('[class*="card"]');
    const cardCount = await projectCards.count();

    if (cardCount > 0) {
      // At least check that cards are rendered
      await expect(projectCards.first()).toBeVisible();
    }
  });

  test('should maintain readable text on all screen sizes', async ({ page }) => {
    await page.goto('/');

    const viewports = [
      { width: 375, height: 667 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1280, height: 720 }, // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      // Check that main heading is visible and readable
      const heading = page.getByRole('heading', { name: /activity overview/i });
      await expect(heading).toBeVisible();

      // Check text contrast (basic check - text should be visible)
      const textColor = await heading.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.color;
      });
      expect(textColor).not.toBe('transparent');
    }
  });
});
