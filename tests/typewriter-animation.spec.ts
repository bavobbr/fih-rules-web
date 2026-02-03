import { test, expect } from '@playwright/test';
import { mockHealthCheck, mockChatResponse, mockCountries, blockGoogleAnalytics } from './helpers/api-mocks';

test.describe('Typewriter Animation', () => {
  test.beforeEach(async ({ page }) => {
    await mockHealthCheck(page, true);
    await mockCountries(page);
    await blockGoogleAnalytics(page);
  });

  test('should complete typewriter animation when page loses and regains focus', async ({ page }) => {
    const longResponse = 'This is a longer response that should animate character by character using the typewriter effect. It contains multiple sentences to ensure the animation takes some time to complete.';

    await mockChatResponse(page, {
      answer: longResponse,
      standalone_query: 'test question',
      variant: 'outdoor',
      source_docs: [],
    });

    await page.goto('/');

    // Send a message
    await page.fill('textarea[placeholder*="Ask about rules"]', 'Test question');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');

    // Wait for the response to start appearing
    await page.waitForTimeout(200);

    // Simulate page going to background by dispatching visibilitychange event
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: true, writable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Wait while "in background"
    await page.waitForTimeout(500);

    // Simulate page coming back to foreground
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: false, writable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // The full response should eventually appear (animation should catch up)
    await expect(page.getByText(longResponse)).toBeVisible({ timeout: 10000 });
  });

  test('should continue animation after multiple focus/blur cycles', async ({ page }) => {
    const response = 'A response that tests multiple visibility changes during the typewriter animation effect.';

    await mockChatResponse(page, {
      answer: response,
      standalone_query: 'test',
      variant: 'outdoor',
      source_docs: [],
    });

    await page.goto('/');

    await page.fill('textarea[placeholder*="Ask about rules"]', 'Test');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');

    // Multiple visibility toggles
    for (let i = 0; i < 3; i++) {
      await page.waitForTimeout(100);
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { value: true, writable: true });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await page.waitForTimeout(100);
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { value: false, writable: true });
        document.dispatchEvent(new Event('visibilitychange'));
      });
    }

    // Animation should still complete
    await expect(page.getByText(response)).toBeVisible({ timeout: 10000 });
  });

  test('should catch up quickly when returning from background after long delay', async ({ page }) => {
    const response = 'Short response for testing catch-up behavior.';

    await mockChatResponse(page, {
      answer: response,
      standalone_query: 'test',
      variant: 'outdoor',
      source_docs: [],
    });

    await page.goto('/');

    await page.fill('textarea[placeholder*="Ask about rules"]', 'Test');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');

    // Immediately go to background
    await page.waitForTimeout(50);
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: true, writable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Stay in background for a while (simulating user switching tabs)
    await page.waitForTimeout(2000);

    // Come back
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: false, writable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Should catch up and show full text quickly after returning
    await expect(page.getByText(response)).toBeVisible({ timeout: 3000 });
  });

  test('should show typing cursor during animation', async ({ page }) => {
    const response = 'A response that should show a blinking cursor while typing.';

    // Use a delay to capture the typing state
    await page.route('**/chat', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          answer: response,
          standalone_query: 'test',
          variant: 'outdoor',
          source_docs: [],
        }),
      });
    });

    await page.goto('/');

    await page.fill('textarea[placeholder*="Ask about rules"]', 'Test');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');

    // Check for the cursor element while typing (it has a pulse animation)
    const cursor = page.locator('span[class*="animate-[pulse"]');

    // Cursor should be visible during typing
    await expect(cursor).toBeVisible({ timeout: 5000 });

    // Eventually the full text appears and cursor disappears
    await expect(page.getByText(response)).toBeVisible({ timeout: 10000 });
  });

  test('should auto-scroll to keep new text visible during long response animation', async ({ page }) => {
    // Create a very long response that will definitely exceed viewport height
    const longParagraph = 'This is a paragraph of text that will be part of a very long response. ';
    const longResponse = longParagraph.repeat(50); // ~3500 characters

    await mockChatResponse(page, {
      answer: longResponse,
      standalone_query: 'test',
      variant: 'outdoor',
      source_docs: [],
    });

    await page.goto('/');

    // Set a smaller viewport to ensure scrolling is needed
    await page.setViewportSize({ width: 800, height: 400 });

    await page.fill('textarea[placeholder*="Ask about rules"]', 'Give me a long response');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');

    // Wait for animation to start and some content to appear
    await page.waitForTimeout(500);

    // Get the scroll container (the main chat container, not the textarea)
    const scrollContainer = page.locator('div.flex-1.overflow-y-auto');

    // Check that scrolling occurs as animation progresses
    const initialScrollTop = await scrollContainer.evaluate(el => el.scrollTop);

    // Wait for more animation
    await page.waitForTimeout(1000);

    const laterScrollTop = await scrollContainer.evaluate(el => el.scrollTop);

    // Scroll position should have increased as more text appeared
    // (or we're at a scrolled position if content grew)
    expect(laterScrollTop).toBeGreaterThanOrEqual(initialScrollTop);

    // Wait for full response to appear
    await expect(page.getByText(longParagraph.trim())).toBeVisible({ timeout: 15000 });

    // After animation completes, verify we can see content near the bottom
    const finalScrollTop = await scrollContainer.evaluate(el => el.scrollTop);
    const scrollHeight = await scrollContainer.evaluate(el => el.scrollHeight);
    const clientHeight = await scrollContainer.evaluate(el => el.clientHeight);

    // Should be scrolled near the bottom (within 300px)
    expect(scrollHeight - finalScrollTop - clientHeight).toBeLessThan(300);
  });
});
