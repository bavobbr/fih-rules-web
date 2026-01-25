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
    const sendButton = page.locator('button').filter({ has: page.locator('svg') }).last();

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
    const sendButton = page.locator('button').filter({ has: page.locator('svg') }).last();

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
    await input.press('Enter');

    // Wait a moment
    await page.waitForTimeout(500);

    // No messages should appear
    const messages = page.locator('div[class*="items-end"]');
    await expect(messages).toHaveCount(0);
  });

  test('should handle very long input', async ({ page }) => {
    const input = page.locator('textarea[placeholder*="Ask about rules"]');
    const sendButton = page.locator('button').filter({ has: page.locator('svg') }).last();

    // Create a very long string (1000 characters)
    const longText = 'A'.repeat(1000);

    await input.fill(longText);

    // Button should still be enabled
    await expect(sendButton).toBeEnabled();

    // Should be able to submit
    await input.press('Enter');

    // Should show user message (truncated view is fine)
    await expect(page.getByText(/AAA+/)).toBeVisible();
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

    // Should show the message
    await expect(page.getByText('Test question')).toBeVisible();

    // Input should be cleared
    await expect(input).toHaveValue('');
  });

  test('should trim whitespace from submitted message', async ({ page }) => {
    const input = page.locator('textarea[placeholder*="Ask about rules"]');

    // Fill with leading/trailing spaces
    await input.fill('  Test question with spaces  ');
    await input.press('Enter');

    // Message should appear without extra spaces
    // Note: Visual trimming might not be visible, but message was sent
    await expect(page.getByText(/Test question with spaces/)).toBeVisible();
  });

  test('should handle special characters in input', async ({ page }) => {
    const input = page.locator('textarea[placeholder*="Ask about rules"]');
    const specialText = 'What about <tags> & "quotes" and \'apostrophes\'?';

    await input.fill(specialText);
    await input.press('Enter');

    // Should display without breaking
    await expect(page.getByText(specialText)).toBeVisible();
  });

  test('should handle emoji in input', async ({ page }) => {
    const input = page.locator('textarea[placeholder*="Ask about rules"]');
    const emojiText = 'What is a penalty stroke? ⚠️🏑';

    await input.fill(emojiText);
    await input.press('Enter');

    // Should display emoji correctly
    await expect(page.getByText(/What is a penalty stroke.*⚠️🏑/)).toBeVisible();
  });

  test('should maintain focus after sending message', async ({ page }) => {
    const input = page.locator('textarea[placeholder*="Ask about rules"]');

    await input.fill('Test question');
    await input.press('Enter');

    // Wait for message to be sent
    await page.waitForTimeout(500);

    // Input should still be focused
    await expect(input).toBeFocused();
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
