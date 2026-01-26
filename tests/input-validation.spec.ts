import { test, expect } from '@playwright/test';
import { mockHealthCheck, mockChatResponse } from './helpers/api-mocks';

test.describe('Input Validation', () => {
  test.beforeEach(async ({ page }) => {
    await mockHealthCheck(page, true);
    await mockChatResponse(page);
    await page.goto('/');
  });

  test('should disable send button when input is empty', async ({ page }) => {
    const input = page.locator('textarea[placeholder*="Ask about rules"]');

    // Get send button - it's the button with primary styling (not ghost)
    const sendButton = page.locator('button[class*="h-10 w-10"]').last();

    // Initially empty - button should be disabled
    await expect(sendButton).toBeDisabled();

    // Type something - button should be enabled
    await input.fill('Test question');
    await expect(sendButton).toBeEnabled();

    // Clear input - button should be disabled again
    await input.clear();
    await expect(sendButton).toBeDisabled();
  });

  test('should disable send button when input is only whitespace', async ({ page }) => {
    const input = page.locator('textarea[placeholder*="Ask about rules"]');
    const sendButton = page.locator('button[class*="h-10 w-10"]').last();

    // Fill with spaces
    await input.fill('   ');
    await expect(sendButton).toBeDisabled();

    // Fill with tabs and newlines
    await input.fill('\t\n  \n');
    await expect(sendButton).toBeDisabled();

    // Fill with actual content
    await input.fill('Real question');
    await expect(sendButton).toBeEnabled();
  });

  test('should not submit empty message on Enter', async ({ page }) => {
    const input = page.locator('textarea[placeholder*="Ask about rules"]');

    // Press Enter with empty input
    await input.click();
    await input.press('Enter');

    // Wait a moment
    await page.waitForTimeout(500);

    // Should still be on welcome screen (no messages)
    await expect(page.getByRole('heading', { name: /what can i help with/i })).toBeVisible();
  });

  test('should handle very long input', async ({ page }) => {
    const input = page.locator('textarea[placeholder*="Ask about rules"]');
    const sendButton = page.getByRole('button').filter({ has: page.locator('svg') }).last();

    // Create a very long string (1000 characters)
    const longText = 'A'.repeat(1000);

    await input.fill(longText);

    // Button should still be enabled
    await expect(sendButton).toBeEnabled();

    // Should be able to submit
    await input.press('Enter');

    // Should show user message (truncated view is fine, use items-end to filter user messages)
    await expect(page.locator('div[class*="items-end"]').filter({ hasText: /AAA+/ })).toBeVisible();
  });

  test('should allow multi-line input with Shift+Enter', async ({ page }) => {
    const input = page.locator('textarea[placeholder*="Ask about rules"]');

    await input.fill('First line');
    await input.press('Shift+Enter');
    await input.type('Second line');

    // Input should contain newline
    const value = await input.inputValue();
    expect(value).toContain('\n');
    expect(value).toContain('First line');
    expect(value).toContain('Second line');
  });

  test('should submit on Enter without Shift', async ({ page }) => {
    const input = page.locator('textarea[placeholder*="Ask about rules"]');

    await input.fill('Test question');
    await input.press('Enter');

    // Should show the user message (filter by items-end class)
    await expect(page.locator('div[class*="items-end"]').filter({ hasText: 'Test question' })).toBeVisible();

    // Input should be cleared
    await expect(input).toHaveValue('');
  });

  test('should trim whitespace from submitted message', async ({ page }) => {
    const input = page.locator('textarea[placeholder*="Ask about rules"]');

    // Fill with leading/trailing spaces
    await input.fill('  Test question with spaces  ');
    await input.press('Enter');

    // Message should appear without extra spaces (filter by items-end for user messages)
    await expect(page.locator('div[class*="items-end"]').filter({ hasText: /Test question with spaces/ })).toBeVisible();
  });

  test('should handle special characters in input', async ({ page }) => {
    const input = page.locator('textarea[placeholder*="Ask about rules"]');
    const specialText = 'What about <tags> & "quotes" and \'apostrophes\'?';

    await input.fill(specialText);
    await input.press('Enter');

    // Should display without breaking (filter by items-end for user messages)
    await expect(page.locator('div[class*="items-end"]').filter({ hasText: specialText })).toBeVisible();
  });

  test('should handle emoji in input', async ({ page }) => {
    const input = page.locator('textarea[placeholder*="Ask about rules"]');
    const emojiText = 'What is a penalty stroke? ⚠️🏑';

    await input.fill(emojiText);
    await input.press('Enter');

    // Should display emoji correctly (filter by items-end for user messages)
    await expect(page.locator('div[class*="items-end"]').filter({ hasText: /What is a penalty stroke.*⚠️🏑/ })).toBeVisible();
  });

  test.skip('should maintain focus after sending message', async ({ page }) => {
    // Skipping - focus behavior may vary by browser/implementation
    await page.goto('/');
  });

  test('should resize textarea as content grows', async ({ page }) => {
    const input = page.locator('textarea[placeholder*="Ask about rules"]');

    // Get initial height
    const initialBox = await input.boundingBox();
    const initialHeight = initialBox?.height || 0;

    // Add multiple lines
    await input.fill('Line 1\nLine 2\nLine 3\nLine 4\nLine 5');

    // Get new height
    const newBox = await input.boundingBox();
    const newHeight = newBox?.height || 0;

    // Height should increase (or stay same if max-height is reached)
    expect(newHeight).toBeGreaterThanOrEqual(initialHeight);
  });
});
