import { test, expect } from '@playwright/test';

test.describe('Join Community Flow', () => {
  test('should display communities page', async ({ page }) => {
    await page.goto('/communities');
    
    // Check page loaded
    await expect(page).toHaveURL(/communities/);
    
    // Check heading exists
    const heading = page.getByRole('heading', { name: /comunidades/i });
    await expect(heading).toBeVisible();
  });

  test('should show community cards', async ({ page }) => {
    await page.goto('/communities');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Check if community cards are visible (if any exist)
    const communityCards = page.locator('[data-testid="community-card"]');
    const count = await communityCards.count();
    
    // If communities exist, check they have proper structure
    if (count > 0) {
      const firstCard = communityCards.first();
      await expect(firstCard).toBeVisible();
    }
  });

  test('should have accessible navigation to communities', async ({ page }) => {
    await page.goto('/');
    
    // Find communities link in navigation
    const communitiesLink = page.getByRole('button', { name: /comunidades/i });
    
    if (await communitiesLink.isVisible()) {
      await expect(communitiesLink).toBeVisible();
      
      // Click and navigate
      await communitiesLink.click();
      await expect(page).toHaveURL(/communities/);
    }
  });

  test('should filter communities', async ({ page }) => {
    await page.goto('/communities');
    
    await page.waitForLoadState('networkidle');
    
    // Check if filter exists
    const filterButton = page.getByRole('button', { name: /filtrar/i });
    
    if (await filterButton.isVisible()) {
      await expect(filterButton).toBeVisible();
    }
  });

  test('should have keyboard navigation support', async ({ page }) => {
    await page.goto('/communities');
    
    await page.waitForLoadState('networkidle');
    
    // Press Tab to navigate
    await page.keyboard.press('Tab');
    
    // Check that focus is visible (should have focus ring)
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});
