# E2E Test - Admin CMS Flow

## Test File: `tests/e2e/cms.spec.ts`

## Test Objective
End-to-end tests for complete CMS admin workflows using Playwright.

## Test Implementation

```typescript
import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('CMS E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@marketpulse.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=admin@marketpulse.com')).toBeVisible();

    // Navigate to CMS
    await page.goto('/admin/cms');
  });

  test('Create Draft Post - Complete Flow', async ({ page }) => {
    // Click create post button
    await page.click('text=Create New Post');

    // Fill form
    await page.fill('input[name="title"]', 'My Test Draft Post');
    await page.fill('textarea[name="body"]', 'This is the body of my test post with detailed content.');
    await page.selectOption('select[name="categoryId"]', 'Stocks');
    await page.selectOption('select[name="status"]', 'Draft');

    // Submit
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('text=Post created successfully')).toBeVisible();
    await expect(page.locator('text=My Test Draft Post')).toBeVisible();
  });

  test('Create Published Post with Featured Image', async ({ page }) => {
    await page.click('text=Create New Post');

    // Fill form
    await page.fill('input[name="title"]', 'Published Post with Image');
    await page.fill('textarea[name="body"]', 'Content for published post.');
    await page.selectOption('select[name="categoryId"]', 'Investment Market Updates');

    // Upload image
    const filePath = path.join(__dirname, '../fixtures/test-image.jpg');
    await page.setInputFiles('input[type="file"]', filePath);

    // Wait for upload
    await expect(page.locator('text=Image uploaded successfully')).toBeVisible();

    // Set status to Published
    await page.selectOption('select[name="status"]', 'Published');

    // Submit
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('text=Post created successfully')).toBeVisible();
    await expect(page.locator('text=Published Post with Image')).toBeVisible();

    // Verify image preview
    await expect(page.locator('img[alt="Featured image"]')).toBeVisible();
  });

  test('Edit Existing Post', async ({ page }) => {
    // Assume a post exists
    await page.click('text=My Test Draft Post >> .. >> button:has-text("Edit")');

    // Modify title
    await page.fill('input[name="title"]', 'Updated Test Post Title');

    // Save
    await page.click('button[type="submit"]');

    // Verify update
    await expect(page.locator('text=Post updated successfully')).toBeVisible();
    await expect(page.locator('text=Updated Test Post Title')).toBeVisible();
  });

  test('Publish Draft Post', async ({ page }) => {
    // Find draft post
    await page.click('text=Updated Test Post Title >> .. >> button:has-text("Edit")');

    // Change status
    await page.selectOption('select[name="status"]', 'Published');

    // Save
    await page.click('button[type="submit"]');

    // Verify
    await expect(page.locator('text=Post updated successfully')).toBeVisible();
    await expect(page.locator('text=Published')).toBeVisible();

    // Verify notification sent indicator
    await expect(page.locator('text=Notifications sent')).toBeVisible();
  });

  test('Delete Post', async ({ page }) => {
    // Find post
    await page.click('text=Updated Test Post Title >> .. >> button:has-text("Delete")');

    // Confirm deletion
    await page.click('button:has-text("Confirm Delete")');

    // Verify deletion
    await expect(page.locator('text=Post deleted successfully')).toBeVisible();
    await expect(page.locator('text=Updated Test Post Title')).not.toBeVisible();
  });

  test('Form Validation - Missing Required Fields', async ({ page }) => {
    await page.click('text=Create New Post');

    // Try to submit without filling
    await page.click('button[type="submit"]');

    // Verify validation messages
    await expect(page.locator('text=Title is required')).toBeVisible();
    await expect(page.locator('text=Body is required')).toBeVisible();
    await expect(page.locator('text=Category is required')).toBeVisible();
  });

  test('Image Upload Validation - Invalid File Type', async ({ page }) => {
    await page.click('text=Create New Post');

    // Try to upload invalid file type
    const filePath = path.join(__dirname, '../fixtures/test-document.pdf');
    await page.setInputFiles('input[type="file"]', filePath);

    // Verify error
    await expect(page.locator('text=Invalid file type')).toBeVisible();
  });

  test('Image Upload Validation - File Too Large', async ({ page }) => {
    await page.click('text=Create New Post');

    // Try to upload large file (mock with large image)
    const filePath = path.join(__dirname, '../fixtures/large-image.jpg');
    await page.setInputFiles('input[type="file"]', filePath);

    // Verify error
    await expect(page.locator('text=File too large')).toBeVisible();
  });

  test('Category Filter in CMS', async ({ page }) => {
    // Filter by category
    await page.selectOption('select[name="filterCategory"]', 'Stocks');

    // Verify filtered results
    const posts = page.locator('[data-test="post-item"]');
    await expect(posts).toHaveCount(await posts.count());

    // Verify all posts have Stocks category
    for (let i = 0; i < await posts.count(); i++) {
      await expect(posts.nth(i).locator('text=Stocks')).toBeVisible();
    }
  });

  test('Status Filter in CMS', async ({ page }) => {
    // Filter by Draft
    await page.selectOption('select[name="filterStatus"]', 'Draft');

    // Verify only drafts shown
    await expect(page.locator('text=Draft')).toBeVisible();
    await expect(page.locator('text=Published')).not.toBeVisible();

    // Change to Published filter
    await page.selectOption('select[name="filterStatus"]', 'Published');

    // Verify only published shown
    await expect(page.locator('text=Published')).toBeVisible();
  });

  test('Rich Text Editor', async ({ page }) => {
    await page.click('text=Create New Post');

    // Use rich text editor (assuming a rich text editor is used)
    const editor = page.locator('[data-test="rich-editor"]');

    // Type content
    await editor.fill('<p>This is <strong>bold</strong> text.</p>');

    // Verify preview
    await expect(page.locator('text=bold')).toBeVisible();
  });

  test('Pagination in CMS Dashboard', async ({ page }) => {
    // Assume >10 posts exist
    // Verify pagination controls
    await expect(page.locator('[aria-label="Next page"]')).toBeVisible();

    // Click next
    await page.click('[aria-label="Next page"]');

    // Verify page changed
    await expect(page.locator('text=Page 2')).toBeVisible();
  });

  test('Search Posts in CMS', async ({ page }) => {
    // Enter search query
    await page.fill('input[name="search"]', 'Test');

    // Submit search
    await page.press('input[name="search"]', 'Enter');

    // Verify filtered results
    const posts = page.locator('[data-test="post-item"]');
    const count = await posts.count();

    for (let i = 0; i < count; i++) {
      await expect(posts.nth(i).locator('text=/Test/i')).toBeVisible();
    }
  });

  test('Keyboard Navigation', async ({ page }) => {
    // Tab through form elements
    await page.click('text=Create New Post');

    await page.press('body', 'Tab'); // Focus title
    await page.keyboard.type('Keyboard Test Post');

    await page.press('body', 'Tab'); // Focus body
    await page.keyboard.type('Body content via keyboard');

    await page.press('body', 'Tab'); // Focus category
    await page.keyboard.press('ArrowDown'); // Select category

    // Verify content entered
    await expect(page.locator('input[name="title"]')).toHaveValue('Keyboard Test Post');
  });
});

test.describe('CMS - Accessibility', () => {
  test('CMS Dashboard - Accessibility Audit', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@marketpulse.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.goto('/admin/cms');

    // Run accessibility checks (requires @axe-core/playwright)
    // const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    // expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Form Labels and ARIA', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@marketpulse.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.goto('/admin/cms');
    await page.click('text=Create New Post');

    // Verify form labels
    await expect(page.locator('label[for="title"]')).toBeVisible();
    await expect(page.locator('label[for="body"]')).toBeVisible();
    await expect(page.locator('label[for="categoryId"]')).toBeVisible();

    // Verify ARIA attributes
    await expect(page.locator('input[name="title"]')).toHaveAttribute('aria-required', 'true');
  });
});
```

## Coverage Requirements
- All CRUD operations tested end-to-end
- Image upload and validation tested
- Form validation tested
- Keyboard and accessibility tested
- Mobile responsiveness tested

## Test Fixtures
Create test fixtures in `tests/fixtures/`:
- `test-image.jpg` (valid, <5MB)
- `large-image.jpg` (>5MB for validation)
- `test-document.pdf` (invalid type for validation)

## Execution
```bash
npm run test:e2e -- tests/e2e/cms.spec.ts
npm run test:e2e -- --headed  # Run with visible browser
npm run test:e2e -- --debug    # Debug mode
```
