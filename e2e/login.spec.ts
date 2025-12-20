import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should display login page correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Check page title
    await expect(page).toHaveTitle(/BeeOn.me/);
    
    // Check login button exists
    const loginButton = page.getByRole('button', { name: /entrar/i });
    await expect(loginButton).toBeVisible();
  });

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check skip link for accessibility
    const skipLink = page.getByRole('link', { name: /pular para o conteúdo principal/i });
    await expect(skipLink).toHaveCount(1);
    
    // Check main landmark
    const main = page.locator('main#main-content');
    await expect(main).toBeVisible();
  });

  test('should navigate to login from home', async ({ page }) => {
    await page.goto('/');
    
    // Find and click login button
    const loginLink = page.getByRole('button', { name: /entrar/i }).first();
    
    if (await loginLink.isVisible()) {
      await loginLink.click();
      
      // Should navigate to login or OAuth
      await expect(page).toHaveURL(/login|oauth/);
    }
  });
});
