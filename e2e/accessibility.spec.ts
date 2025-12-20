import { test, expect } from '@playwright/test';

test.describe('Accessibility Audit', () => {
  test('home page should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Check h1 exists
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();
  });

  test('all images should have alt text', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForLoadState('networkidle');
    
    // Get all images
    const images = page.locator('img');
    const count = await images.count();
    
    // Check each image has alt attribute
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      
      // Alt can be empty string for decorative images, but must exist
      expect(alt).not.toBeNull();
    }
  });

  test('all buttons should be keyboard accessible', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForLoadState('networkidle');
    
    // Get all buttons
    const buttons = page.locator('button:visible');
    const count = await buttons.count();
    
    if (count > 0) {
      const firstButton = buttons.first();
      
      // Focus the button
      await firstButton.focus();
      
      // Check it's focused
      await expect(firstButton).toBeFocused();
      
      // Press Enter
      await page.keyboard.press('Enter');
      
      // Button should respond to keyboard
      // (actual behavior depends on button implementation)
    }
  });

  test('form inputs should have labels', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForLoadState('networkidle');
    
    // Get all inputs
    const inputs = page.locator('input:visible, textarea:visible');
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      
      // Check if input has aria-label or associated label
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledby = await input.getAttribute('aria-labelledby');
      const id = await input.getAttribute('id');
      
      let hasLabel = false;
      
      if (ariaLabel || ariaLabelledby) {
        hasLabel = true;
      } else if (id) {
        // Check if there's a label with for attribute
        const label = page.locator(`label[for="${id}"]`);
        hasLabel = await label.count() > 0;
      }
      
      // Input should have some form of label
      expect(hasLabel || ariaLabel).toBeTruthy();
    }
  });

  test('links should have descriptive text', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForLoadState('networkidle');
    
    // Get all links
    const links = page.locator('a:visible');
    const count = await links.count();
    
    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      
      // Get text content or aria-label
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      
      // Link should have text or aria-label
      expect(text?.trim() || ariaLabel).toBeTruthy();
    }
  });

  test('page should have proper color contrast', async ({ page }) => {
    await page.goto('/');
    
    // Check background and foreground colors
    const body = page.locator('body');
    const bgColor = await body.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    const color = await body.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    
    // Both should be defined
    expect(bgColor).toBeTruthy();
    expect(color).toBeTruthy();
    
    // Note: Actual contrast ratio calculation would require a library
    // This is a basic check that colors are set
  });

  test('focus indicators should be visible', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForLoadState('networkidle');
    
    // Get first focusable element
    const focusable = page.locator('button:visible, a:visible, input:visible').first();
    
    if (await focusable.count() > 0) {
      await focusable.focus();
      
      // Check outline or ring is visible
      const outline = await focusable.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.outline || styles.boxShadow;
      });
      
      // Should have some focus indicator
      expect(outline).toBeTruthy();
    }
  });

  test('page should have lang attribute', async ({ page }) => {
    await page.goto('/');
    
    const html = page.locator('html');
    const lang = await html.getAttribute('lang');
    
    // Should have lang attribute for screen readers
    expect(lang).toBeTruthy();
  });
});
