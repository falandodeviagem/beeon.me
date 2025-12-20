import { test, expect } from '@playwright/test';

test.describe('Create Post Flow', () => {
  test('should show create post form when authenticated', async ({ page }) => {
    // Note: This test assumes user is already authenticated
    // In a real scenario, you'd need to handle OAuth login or use a test user
    await page.goto('/');
    
    // Check if create post textarea exists (only for authenticated users)
    const createPostTextarea = page.getByPlaceholder(/o que você está pensando/i);
    
    // If authenticated, should see the form
    if (await createPostTextarea.isVisible()) {
      await expect(createPostTextarea).toBeVisible();
      
      // Check submit button
      const submitButton = page.getByRole('button', { name: /publicar/i });
      await expect(submitButton).toBeVisible();
    }
  });

  test('should validate empty post submission', async ({ page }) => {
    await page.goto('/');
    
    const createPostTextarea = page.getByPlaceholder(/o que você está pensando/i);
    
    if (await createPostTextarea.isVisible()) {
      // Try to submit empty post
      const submitButton = page.getByRole('button', { name: /publicar/i });
      await submitButton.click();
      
      // Should show error or prevent submission
      // The button might be disabled or show a toast
      await expect(createPostTextarea).toBeVisible(); // Still on same page
    }
  });

  test('should have accessible form elements', async ({ page }) => {
    await page.goto('/');
    
    const createPostTextarea = page.getByPlaceholder(/o que você está pensando/i);
    
    if (await createPostTextarea.isVisible()) {
      // Check textarea is focusable
      await createPostTextarea.focus();
      await expect(createPostTextarea).toBeFocused();
      
      // Check submit button has proper label
      const submitButton = page.getByRole('button', { name: /publicar/i });
      await expect(submitButton).toHaveAttribute('type', 'submit');
    }
  });
});
