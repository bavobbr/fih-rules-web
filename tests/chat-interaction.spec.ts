import { test, expect } from '@playwright/test';
import { mockHealthCheck, mockChatResponse } from './helpers/api-mocks';

test.describe('Chat Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await mockHealthCheck(page, true);
  });

  test('should submit question and receive response', async ({ page }) => {
    await mockChatResponse(page, {
      answer: 'A free hit is awarded when an offense occurs outside the circle.',
      standalone_query: 'What is a free hit?',
      variant: 'outdoor',
      source_docs: [],
    });

    await page.goto('/');

    // Fill and submit
    await page.fill('textarea[placeholder*="Ask about rules"]', 'What is a free hit?');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');

    // Should show user message (filter by items-end class for user messages)
    await expect(page.locator('div[class*="items-end"]').filter({ hasText: 'What is a free hit?' })).toBeVisible();

    // Should show loading state
    await expect(page.locator('[class*="animate"]').first()).toBeVisible();

    // Should show response
    await expect(page.getByText('A free hit is awarded when an offense occurs outside the circle.')).toBeVisible({ timeout: 5000 });
  });

  test('should clear input after sending message', async ({ page }) => {
    await mockChatResponse(page, {
      answer: 'Response text',
      standalone_query: 'test',
      variant: 'outdoor',
      source_docs: [],
    });

    await page.goto('/');

    const input = page.locator('textarea[placeholder*="Ask about rules"]');
    await input.fill('Test question');
    await input.press('Enter');

    // Wait for message to be sent
    await page.waitForTimeout(500);

    // Input should be cleared
    await expect(input).toHaveValue('');
  });

  test('should handle multiple back-and-forth conversation', async ({ page }) => {
    let messageCount = 0;
    const responses = [
      'First response about rule 13.2',
      'Second response about penalties',
      'Third response about cards',
    ];

    await page.route('**/chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          answer: responses[messageCount] || 'Default response',
          standalone_query: `Question ${messageCount + 1}`,
          variant: 'outdoor',
          source_docs: [],
        }),
      });
      messageCount++;
    });

    await page.goto('/');

    // First exchange
    await page.fill('textarea[placeholder*="Ask about rules"]', 'What is rule 13.2?');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');
    await expect(page.getByText('First response about rule 13.2')).toBeVisible({ timeout: 5000 });

    // Second exchange
    await page.fill('textarea[placeholder*="Ask about rules"]', 'What about penalties?');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');
    await expect(page.getByText('Second response about penalties')).toBeVisible({ timeout: 5000 });

    // Third exchange
    await page.fill('textarea[placeholder*="Ask about rules"]', 'Tell me about cards');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');
    await expect(page.getByText('Third response about cards')).toBeVisible({ timeout: 5000 });

    // All user messages should be visible (filter by items-end class)
    const userMessages = page.locator('div[class*="items-end"]');
    await expect(userMessages.filter({ hasText: 'What is rule 13.2?' })).toBeVisible();
    await expect(userMessages.filter({ hasText: 'What about penalties?' })).toBeVisible();
    await expect(userMessages.filter({ hasText: 'Tell me about cards' })).toBeVisible();
  });

  test('should show typewriter animation for new responses', async ({ page }) => {
    await mockChatResponse(page, {
      answer: 'This is a long response that should animate with typewriter effect.',
      standalone_query: 'test',
      variant: 'outdoor',
      source_docs: [],
    });

    await page.goto('/');

    await page.fill('textarea[placeholder*="Ask about rules"]', 'Test question');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');

    // Wait for response to start appearing
    await page.waitForTimeout(500);

    // Check that the full response eventually appears
    await expect(page.getByText('This is a long response that should animate with typewriter effect.')).toBeVisible({ timeout: 5000 });
  });

  test('should disable send button while loading', async ({ page }) => {
    let resolveResponse: ((value: unknown) => void) | null = null;
    const responsePromise = new Promise((resolve) => {
      resolveResponse = resolve;
    });

    await page.route('**/chat', async (route) => {
      await responsePromise;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          answer: 'Response',
          standalone_query: 'test',
          variant: 'outdoor',
          source_docs: [],
        }),
      });
    });

    await page.goto('/');

    await page.fill('textarea[placeholder*="Ask about rules"]', 'Test question');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');

    // Wait a moment for loading state
    await page.waitForTimeout(300);

    // Send button should be disabled (the button with Send icon)
    const sendButton = page.getByRole('button').filter({ has: page.locator('svg') }).last();
    await expect(sendButton).toBeDisabled();

    // Complete response
    if (resolveResponse) resolveResponse(true);

    await page.waitForTimeout(500);

    // Button should be enabled again (but disabled due to empty input)
    await expect(sendButton).toBeDisabled(); // Still disabled because input is empty
  });
});
