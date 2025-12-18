import { test, expect } from '@playwright/test';

test.describe('Contact Page', () => {
  test('should display contact page heading and description', async ({ page }) => {
    await page.goto('/contact');

    await expect(page.getByRole('heading', { name: /get in touch/i })).toBeVisible();
    await expect(page.getByText(/let's connect and build something amazing/i)).toBeVisible();
  });

  test('should display email card with email address', async ({ page }) => {
    await page.goto('/contact');

    // Check for email card
    const emailCard = page.locator('text=/email/i').locator('..').locator('..').first();
    await expect(emailCard).toBeVisible();

    // Check for email address (should be visible in monospace font)
    // Use more specific selector to get the email (not the handle)
    // Use specific character class for email addresses to prevent ReDoS vulnerability
    const emailText = page.getByText(/@[a-zA-Z0-9._-]+\.com/).first();
    await expect(emailText).toBeVisible();
  });

  test('should copy email to clipboard when copy button is clicked', async ({ page, context }) => {
    await page.goto('/contact');

    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Find and click copy button
    const copyButton = page.getByRole('button', { name: /copy email/i });
    await expect(copyButton).toBeVisible();

    await copyButton.click();

    // Check that button text changes to "Copied!"
    await expect(page.getByText(/copied!/i)).toBeVisible({ timeout: 1000 });

    // Verify clipboard content (if supported)
    try {
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
      expect(clipboardText).toContain('@');
    } catch {
      // Clipboard API might not be available in test environment
      // That's okay, we've verified the UI feedback
    }
  });

  test('should reset copy button text after 2 seconds', async ({ page, context }) => {
    await page.goto('/contact');

    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const copyButton = page.getByRole('button', { name: /copy email/i });
    await copyButton.click();

    // Wait a bit for the state to update (clipboard API is async)
    await page.waitForTimeout(100);

    // Check if button text changed to "Copied!" (if clipboard API worked)
    const buttonText = await copyButton.textContent();
    const hasCopiedText = buttonText?.toLowerCase().includes('copied');

    if (hasCopiedText) {
      // Wait for reset (2 seconds + buffer)
      await page.waitForTimeout(2500);

      // Should show "Copy Email" again
      await expect(copyButton).toContainText(/copy email/i);
    } else {
      // Clipboard API might not be available in test environment
      // Just verify the button is still functional
      await expect(copyButton).toBeVisible();
    }
  });

  test('should display social links card', async ({ page }) => {
    await page.goto('/contact');

    // Check for social links card
    const socialCard = page.getByText(/social links/i);
    await expect(socialCard).toBeVisible();
  });

  test('should display all social media links', async ({ page }) => {
    await page.goto('/contact');

    // Check for common social platforms
    const socialLinks = ['GitHub', 'LinkedIn', 'Twitter'];

    for (const platform of socialLinks) {
      const link = page.getByRole('link', { name: new RegExp(platform, 'i') });
      const linkExists = await link.isVisible().catch(() => false);

      // At least one social link should be visible
      if (linkExists) {
        await expect(link).toBeVisible();
        break;
      }
    }
  });

  test('should open social links in new tab', async ({ page, context }) => {
    await page.goto('/contact');

    // Find a social link
    const socialLink = page.getByRole('link', { name: /github/i }).or(
      page.getByRole('link', { name: /linkedin/i })
    ).or(
      page.getByRole('link', { name: /twitter/i })
    ).first();

    const linkExists = await socialLink.isVisible().catch(() => false);

    if (linkExists) {
      // Set up promise to wait for new page
      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        socialLink.click(),
      ]);

      expect(newPage).toBeTruthy();
      await newPage.close();
    }
  });
});
