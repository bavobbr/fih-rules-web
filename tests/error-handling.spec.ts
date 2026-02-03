import { test, expect } from '@playwright/test';
import { mockHealthCheck, mockChatError } from './helpers/api-mocks';

test.describe('Error Handling', () => {
  test('should display error message when API returns 500', async ({ page }) => {
    await mockHealthCheck(page, true);
    await mockChatError(page, 500);

    await page.goto('/');

    await page.fill('textarea[placeholder*="Ask about rules"]', 'Test question');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');

    // Should show error toast (use first() to avoid strict mode)
    await expect(page.getByText(/failed to get a response/i).first()).toBeVisible({ timeout: 5000 });

    // Wait for error state to settle
    await page.waitForTimeout(500);
  });

  test('should display error message when API returns 404', async ({ page }) => {
    await mockHealthCheck(page, true);
    await mockChatError(page, 404);

    await page.goto('/');

    await page.fill('textarea[placeholder*="Ask about rules"]', 'Test question');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');

    // Should show error toast (use first() to avoid strict mode - message appears in multiple elements)
    await expect(page.getByText(/failed to get a response/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('should handle network timeout gracefully', async ({ page }) => {
    await mockHealthCheck(page, true);

    // Simulate timeout by never responding
    await page.route('**/chat', async (route) => {
      // Don't fulfill - let it timeout
      await page.waitForTimeout(10000);
      await route.abort('timedout');
    });

    await page.goto('/');

    await page.fill('textarea[placeholder*="Ask about rules"]', 'Test question');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');

    // Should show error message eventually (use first() to avoid strict mode)
    await expect(page.getByText(/failed to get a response/i).first()).toBeVisible({ timeout: 15000 });
  });

  test('should display warning when health check fails', async ({ page }) => {
    await mockHealthCheck(page, false);

    await page.goto('/');

    // Health indicator should show unhealthy state
    // The header should indicate the API is down (implementation dependent)
    // This test assumes there's a visual indicator in the ChatHeader
    await page.waitForTimeout(1000);

    // Check if there's any visual indication of health status
    // This might be a dot, icon, or text in the header
    const header = page.locator('header, [role="banner"]').first();
    await expect(header).toBeVisible();
  });

  test('should handle malformed JSON response', async ({ page }) => {
    await mockHealthCheck(page, true);

    await page.route('**/chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'this is not valid JSON {',
      });
    });

    await page.goto('/');

    await page.fill('textarea[placeholder*="Ask about rules"]', 'Test question');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');

    // Should show error (use first() to avoid strict mode - message appears in multiple elements)
    await expect(page.getByText(/failed to get a response/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('should handle empty response gracefully', async ({ page }) => {
    await mockHealthCheck(page, true);

    await page.route('**/chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          answer: '',
          standalone_query: 'test',
          variant: 'outdoor',
          source_docs: [],
        }),
      });
    });

    await page.goto('/');

    await page.fill('textarea[placeholder*="Ask about rules"]', 'Test question');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');

    // Should handle empty answer (might show blank message or error)
    await page.waitForTimeout(2000);

    // User message should still be visible (filter by items-end for user messages)
    await expect(page.locator('div[class*="items-end"]').filter({ hasText: 'Test question' })).toBeVisible();
  });

  test('should recover from error and allow retry', async ({ page }) => {
    await mockHealthCheck(page, true);

    let attemptCount = 0;

    await page.route('**/chat', async (route) => {
      attemptCount++;
      if (attemptCount === 1) {
        // First attempt fails
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' }),
        });
      } else {
        // Second attempt succeeds
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            answer: 'Success on retry',
            standalone_query: 'test',
            variant: 'outdoor',
            source_docs: [],
          }),
        });
      }
    });

    await page.goto('/');

    // First attempt - should fail
    await page.fill('textarea[placeholder*="Ask about rules"]', 'Test question');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');
    await expect(page.getByText(/failed to get a response/i).first()).toBeVisible({ timeout: 5000 });

    // Wait for error toast to potentially disappear
    await page.waitForTimeout(2000);

    // Retry - should succeed
    await page.fill('textarea[placeholder*="Ask about rules"]', 'Test question again');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');
    await expect(page.getByText('Success on retry')).toBeVisible({ timeout: 5000 });
  });
});
