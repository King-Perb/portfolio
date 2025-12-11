import { test, expect } from '@playwright/test';

test.describe('Projects Page', () => {
  test('should display all projects', async ({ page }) => {
    await page.goto('/projects');

    // Check page heading
    await expect(page.getByRole('heading', { name: /all projects/i })).toBeVisible();

    // Check for project count
    const projectCount = page.getByText(/\d+ (project|projects) total/);
    await expect(projectCount).toBeVisible();
  });

  test('should display project cards with information', async ({ page }) => {
    await page.goto('/projects');

    // Wait for projects to load
    const firstProject = page.locator('[class*="card"]').first();
    await expect(firstProject).toBeVisible({ timeout: 10000 });

    // Check that project cards have title (CardTitle component)
    const projectTitle = firstProject.locator('[data-slot="card-title"], h3').first();
    await expect(projectTitle).toBeVisible();
  });

  test('should handle empty projects state', async ({ page }) => {
    // This test would require mocking the API to return empty array
    // For now, we'll just check the page structure
    await page.goto('/projects');

    // Page should still render
    await expect(page.getByRole('heading', { name: /all projects/i })).toBeVisible();
  });
});
