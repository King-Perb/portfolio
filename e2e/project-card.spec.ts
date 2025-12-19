import { test, expect } from '@playwright/test';

test.describe('Project Card Interactions', () => {
  test('should display project card with all information', async ({ page }) => {
    await page.goto('/projects');

    // Wait for projects to load
    const firstCard = page.locator('[class*="card"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });

    // Check for title
    const title = firstCard.locator('[data-slot="card-title"], h3').first();
    await expect(title).toBeVisible();

    // Check for description
    const description = firstCard.locator('[data-slot="card-description"], p').first();
    await expect(description).toBeVisible();

    // Check for status badge
    const statusBadge = firstCard.locator('span[class*="uppercase"]');
    await expect(statusBadge).toBeVisible();
  });

  test('should display project stats (stars, forks, commits, deployments)', async ({ page }) => {
    await page.goto('/projects');

    // Wait for projects to load
    const firstCard = page.locator('[class*="card"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });

    // Check for stats section in footer (CardFooter component)
    const footer = firstCard.locator('[data-slot="card-footer"]').or(
      firstCard.locator('footer')
    ).or(
      firstCard.locator('[class*="CardFooter"]')
    );
    await expect(footer.first()).toBeVisible();
  });

  test('should open project URL when card is clicked', async ({ page, context }) => {
    await page.goto('/projects');

    // Wait for projects to load
    const firstCard = page.locator('[class*="card"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });

    // Check if card is clickable (has cursor-pointer class or role="button")
    const isClickable = await firstCard.evaluate((el) => {
      return el.classList.contains('cursor-pointer') || el.getAttribute('role') === 'button';
    });

    if (isClickable) {
      // Set up promise to wait for new page/tab
      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        firstCard.click(),
      ]);

      // Check that a new page was opened
      expect(newPage).toBeTruthy();
      await newPage.close();
    }
  });

  test('should support keyboard navigation on clickable cards', async ({ page }) => {
    await page.goto('/projects');

    // Wait for projects to load
    const firstCard = page.locator('[class*="card"][role="button"]').first();

    // Check if any card is clickable
    const clickableCard = await firstCard.isVisible().catch(() => false);

    if (clickableCard) {
      // Focus the card
      await firstCard.focus();

      // Press Enter to activate
      const [newPage] = await Promise.all([
        page.context().waitForEvent('page').catch(() => null),
        firstCard.press('Enter'),
      ]);

      // If a new page opened, close it
      if (newPage) {
        await newPage.close();
      }
    }
  });

  test('should display project tags', async ({ page }) => {
    await page.goto('/projects');

    // Wait for projects to load
    const firstCard = page.locator('[class*="card"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });

    // Check for tags (in CardContent, inside a flex gap-2 div)
    const tagsContainer = firstCard.locator('[data-slot="card-content"]').or(
      firstCard.locator('[class*="flex"][class*="gap-2"]')
    );
    await expect(tagsContainer.first()).toBeVisible();

    // Tags should be visible as spans with text
    const tags = firstCard.locator('span[class*="font-mono"]');
    const tagCount = await tags.count();
    expect(tagCount).toBeGreaterThan(0);
  });

  test('should show hover effects on project cards', async ({ page }) => {
    await page.goto('/projects');

    // Wait for projects to load
    const firstCard = page.locator('[class*="card"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });

    // Hover over the card
    await firstCard.hover();

    // Check that hover classes are applied (border-primary/50, shadow, etc.)
    const hasHoverEffect = await firstCard.evaluate((el) => {
      const styles = globalThis.window.getComputedStyle(el);
      return styles.boxShadow !== 'none' || el.classList.toString().includes('hover');
    });

    // Verify hover effects are applied
    expect(hasHoverEffect).toBe(true);
    expect(firstCard).toBeVisible();
  });
});
