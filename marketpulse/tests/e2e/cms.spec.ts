import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('CMS E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@marketpulse.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Logout')).toBeVisible();

    // Navigate to Admin
    await page.goto('/admin');
  });

  test('Create Draft Post - Complete Flow', async ({ page }) => {
    // Click create post button
    await page.click('text=New Post');
    await expect(page).toHaveURL(/.*admin\/posts\/new/);

    // Fill form
    await page.fill('input[name="title"]', 'My Test Draft Post');
    await page.fill('textarea[name="body"]', 'This is the body of my test post with detailed content.');
    await page.selectOption('select[name="categoryId"]', 'Stocks');
    await page.selectOption('select[name="status"]', 'Draft');

    // Submit
    await page.click('button[type="submit"]');

    // Verify success - redirects back to admin
    await expect(page).toHaveURL(/.*admin/);
    await expect(page.locator('text=My Test Draft Post')).toBeVisible();
    await expect(page.locator('text=Draft')).toBeVisible();
  });

  test('Create Published Post with Featured Image', async ({ page }) => {
    await page.click('text=New Post');

    // Fill form
    await page.fill('input[name="title"]', 'Published Post with Image');
    await page.fill('textarea[name="body"]', 'Content for published post.');
    await page.selectOption('select[name="categoryId"]', 'Investment Market Updates');

    // Upload image
    const filePath = path.join(__dirname, '../fixtures/test-image.jpg');
    // Note: The input is hidden, so we need to use setInputFiles on the hidden input
    await page.setInputFiles('input[type="file"]', filePath);

    // Set status to Published
    await page.selectOption('select[name="status"]', 'Published');

    // Submit
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page).toHaveURL(/.*admin/);
    await expect(page.locator('text=Published Post with Image')).toBeVisible();
  });

  test('Delete Post', async ({ page }) => {
    // Find the post we created in the first test (if it exists) or create one
    // Let's create one specifically for deletion
    await page.click('text=New Post');
    await page.fill('input[name="title"]', 'Post to Delete');
    await page.fill('textarea[name="body"]', 'Delete me');
    await page.click('button[type="submit"]');

    // Find the delete button for this post
    // The posts are in a list, we need to find the one with the title "Post to Delete"
    const postRow = page.locator('div', { hasText: 'Post to Delete' }).last();
    // The delete button uses Trash2 icon (lucide-react), we can target it via class or button index
    // Looking at the code: <Button variant="ghost" size="sm" onClick={() => handleDelete(post._id)}> <Trash2 ... /> </Button>
    // It's the 3rd button in the actions group
    await postRow.locator('button').nth(2).click();

    // Confirm deletion - uses window.confirm, so we need to handle it before clicking
    page.once('dialog', dialog => dialog.accept());
    // Wait for the delete to complete
    await expect(page.locator('text=Post to Delete')).not.toBeVisible();
  });

  test('Form Validation - Missing Required Fields', async ({ page }) => {
    await page.click('text=New Post');

    // Try to submit without filling
    await page.click('button[type="submit"]');

    // Verify validation messages
    await expect(page.locator('text=Title is required')).toBeVisible();
    await expect(page.locator('text=Content is required')).toBeVisible();
  });
});
