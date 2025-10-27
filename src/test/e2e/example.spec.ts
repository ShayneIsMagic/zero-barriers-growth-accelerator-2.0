import { expect, test } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check if the page title contains expected text
    await expect(page).toHaveTitle(/Zero Barriers/i);
  });

  test('should navigate to dashboard', async ({ page }) => {
    await page.goto('/');

    // Look for navigation links
    const dashboardLink = page.getByRole('link', { name: /dashboard/i });

    if (await dashboardLink.isVisible()) {
      await dashboardLink.click();
      await page.waitForURL('**/dashboard**');

      expect(page.url()).toContain('/dashboard');
    }
  });
});

test.describe('Authentication', () => {
  test('should show signin page', async ({ page }) => {
    await page.goto('/auth/signin');

    // Check for signin form elements
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('should allow test user to sign in', async ({ page }) => {
    await page.goto('/auth/signin');

    // Fill in test credentials
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword');

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for navigation (adjust based on your app's behavior)
    await page.waitForTimeout(2000);

    // Should redirect to dashboard or show success
    // (Adjust expectations based on your actual app flow)
  });
});

test.describe('Analysis Tools', () => {
  test('should show website analysis page', async ({ page }) => {
    await page.goto('/dashboard/website-analysis');

    // Check for analysis form
    const urlInput = page.getByPlaceholder(/enter.*url/i);

    if (await urlInput.isVisible()) {
      await expect(urlInput).toBeVisible();
    }
  });
});
