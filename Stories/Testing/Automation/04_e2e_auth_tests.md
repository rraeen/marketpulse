# E2E Test - Authentication Flow

## Test File: `tests/e2e/auth.spec.ts`

## Test Objective
End-to-end tests for complete authentication user journeys using Playwright.

## Test Implementation

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('User Registration Flow - Success', async ({ page }) => {
    // Navigate to registration
    await page.click('text=Register');
    await expect(page).toHaveURL(/.*register/);

    // Fill registration form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'Test@1234');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('text=registered successfully')).toBeVisible();
    await expect(page).toHaveURL(/.*dashboard|home/);
  });

  test('User Registration - Invalid Email', async ({ page }) => {
    await page.click('text=Register');

    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'notanemail');
    await page.fill('input[name="password"]', 'Test@1234');

    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('text=Invalid email format')).toBeVisible();
    await expect(page).toHaveURL(/.*register/);
  });

  test('User Login Flow - Success', async ({ page }) => {
    // Navigate to login
    await page.click('text=Login');
    await expect(page).toHaveURL(/.*login/);

    // Fill login form
    await page.fill('input[name="email"]', 'admin@marketpulse.com');
    await page.fill('input[name="password"]', 'admin123');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('text=admin@marketpulse.com')).toBeVisible();
    await expect(page).not.toHaveURL(/.*login/);
  });

  test('User Login - Invalid Credentials', async ({ page }) => {
    await page.click('text=Login');

    await page.fill('input[name="email"]', 'admin@marketpulse.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
    await expect(page).toHaveURL(/.*login/);
  });

  test('Logout Flow', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@marketpulse.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Wait for successful login
    await expect(page.locator('text=admin@marketpulse.com')).toBeVisible();

    // Logout
    await page.click('text=Logout');

    // Verify logged out
    await expect(page.locator('text=Login')).toBeVisible();
    await expect(page.locator('text=admin@marketpulse.com')).not.toBeVisible();
  });

  test('Session Persistence', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@marketpulse.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Wait for login
    await expect(page.locator('text=admin@marketpulse.com')).toBeVisible();

    // Refresh page
    await page.reload();

    // Verify still logged in
    await expect(page.locator('text=admin@marketpulse.com')).toBeVisible();
  });

  test('Protected Route Access - Unauthenticated', async ({ page }) => {
    // Try to access CMS without login
    await page.goto('/admin/cms');

    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
  });

  test('Protected Route Access - Authenticated', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@marketpulse.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Navigate to CMS
    await page.goto('/admin/cms');

    // Should have access
    await expect(page).toHaveURL(/.*admin.*cms/);
    await expect(page.locator('text=Create Post')).toBeVisible();
  });

  test('Password Visibility Toggle', async ({ page }) => {
    await page.goto('/login');

    const passwordInput = page.locator('input[name="password"]');

    // Initially hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Toggle to show
    await page.click('[aria-label="Show password"]');
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Toggle to hide
    await page.click('[aria-label="Hide password"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('Form Validation - Empty Fields', async ({ page }) => {
    await page.goto('/login');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Verify validation messages
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });
});

test.describe('Authentication - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('Mobile Login Flow', async ({ page }) => {
    await page.goto('/login');

    // Verify mobile responsive design
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();

    // Fill and submit
    await page.fill('input[name="email"]', 'admin@marketpulse.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('text=admin@marketpulse.com')).toBeVisible();
  });
});
```

## Coverage Requirements
- All authentication flows tested
- Success and error states verified
- Mobile responsive testing
- Session management validated

## Execution
```bash
npm run test:e2e -- tests/e2e/auth.spec.ts
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project="Mobile Chrome"
```

## Visual Testing
Add screenshot comparison for critical pages:
```typescript
await expect(page).toHaveScreenshot('login-page.png');
```
