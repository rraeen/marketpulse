import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('User Registration Flow - Success', async ({ page }) => {
    // Navigate to registration
    await page.click('text=Get Started');
    await expect(page).toHaveURL(/.*register/);

    // Fill registration form
    await page.fill('input[name="name"]', 'Test User');
    const email = `test${Date.now()}@example.com`;
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'Test@1234');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify success - redirects to login
    await expect(page.locator('text=Account created!')).toBeVisible();
    await expect(page).toHaveURL(/.*login/);
  });

  test('User Registration - Invalid Email', async ({ page }) => {
    await page.click('text=Get Started');

    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'notanemail');
    await page.fill('input[name="password"]', 'Test@1234');

    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
  });

  test('User Login Flow - Success', async ({ page }) => {
    // Navigate to login
    await page.click('text=Sign In');
    await expect(page).toHaveURL(/.*login/);

    // Use seed admin if available, or register first
    // For now, let's assume we can use the admin from seed
    await page.fill('input[name="email"]', 'admin@marketpulse.com');
    await page.fill('input[name="password"]', 'admin123');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify success - redirected to dashboard or home
    await expect(page.locator('text=Logout')).toBeVisible();
  });

  test('User Login - Invalid Credentials', async ({ page }) => {
    await page.click('text=Sign In');

    await page.fill('input[name="email"]', 'admin@marketpulse.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('text=Login failed')).toBeVisible();
  });

  test('Logout Flow', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@marketpulse.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Wait for successful login
    await expect(page.locator('text=Logout')).toBeVisible();

    // Logout
    await page.click('text=Logout');

    // Verify logged out
    await expect(page.locator('text=Sign In')).toBeVisible();
  });

  test('Protected Route Access - Unauthenticated', async ({ page }) => {
    // Try to access Admin without login
    await page.goto('/admin');

    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
  });
});
