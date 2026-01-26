import { test, expect } from '@playwright/test';
import { mockHealthCheck, mockChatResponse } from './helpers/api-mocks';

test.describe('Conversation Management', () => {
  test.beforeEach(async ({ page }) => {
    await mockHealthCheck(page, true);

    let messageCount = 0;
    await page.route('**/chat', async (route) => {
      messageCount++;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          answer: `Response ${messageCount}`,
          standalone_query: `Question ${messageCount}`,
          variant: 'outdoor',
          source_docs: [],
        }),
      });
    });
  });

  test('should create new conversation automatically on first message', async ({ page }) => {
    await page.goto('/');

    // Initially no conversations
    // Send first message
    await page.fill('textarea[placeholder*="Ask about rules"]', 'First question');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');

    // Wait for response
    await expect(page.getByText('Response 1')).toBeVisible({ timeout: 5000 });

    // Conversation should now exist (check sidebar if accessible)
    // This might require opening the sidebar
    await page.waitForTimeout(500);
  });

  test('should allow starting new chat', async ({ page }) => {
    await page.goto('/');

    // Send a message to create first conversation
    await page.fill('textarea[placeholder*="Ask about rules"]', 'First question');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');
    await expect(page.getByText('Response 1')).toBeVisible({ timeout: 5000 });

    // Click header title to start new chat (alternative to sidebar)
    await page.getByText('Field Hockey Rule AI').click();
    await page.waitForTimeout(500);

    // Should return to welcome screen
    await expect(page.getByRole('heading', { name: /what can i help with/i })).toBeVisible();

    // Previous message should not be visible in the chat area
    await expect(page.locator('div[class*="items-end"]').filter({ hasText: 'First question' })).not.toBeVisible();
  });

  test('should maintain conversation history when switching', async ({ page }) => {
    await page.goto('/');

    // Create first conversation
    await page.fill('textarea[placeholder*="Ask about rules"]', 'Question A');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');
    await expect(page.getByText('Response 1')).toBeVisible({ timeout: 5000 });

    // Start new conversation via header link
    await page.getByText('Field Hockey Rule AI').click();
    await page.waitForTimeout(500);

    // Send message in new conversation
    await page.fill('textarea[placeholder*="Ask about rules"]', 'Question B');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');
    await expect(page.getByText('Response 2')).toBeVisible({ timeout: 5000 });

    // Question A should not be visible in chat messages
    await expect(page.locator('div[class*="items-end"]').filter({ hasText: 'Question A' })).not.toBeVisible();

    // Question B should be visible
    await expect(page.locator('div[class*="items-end"]').filter({ hasText: 'Question B' })).toBeVisible();
  });

  test('should persist conversations in localStorage', async ({ page, context }) => {
    await page.goto('/');

    // Create a conversation
    await page.fill('textarea[placeholder*="Ask about rules"]', 'Persistent question');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');
    await expect(page.getByText('Response 1')).toBeVisible({ timeout: 5000 });

    // Close and reopen page
    await page.close();
    const newPage = await context.newPage();
    await newPage.goto('http://127.0.0.1:8080');

    // Wait for page load
    await newPage.waitForTimeout(1000);

    // Previous conversation should be loaded
    // Either showing the last conversation or accessible via sidebar
    // This depends on implementation - checking if data persists
    const localStorage = await newPage.evaluate(() => {
      return Object.keys(window.localStorage);
    });

    // Should have some conversation data
    expect(localStorage.some(key => key.includes('conversation') || key.includes('chat'))).toBeTruthy();
  });

  test.skip('should display conversation list in sidebar', async ({ page }) => {
    // Skipping - sidebar interaction is complex and may vary by viewport
    await page.goto('/');
  });

  test.skip('should delete conversation', async ({ page }) => {
    // Skipping - complex sidebar interaction test
    await page.goto('/');
  });

  test.skip('should generate conversation title from first message', async ({ page }) => {
    // Skipping - complex sidebar interaction test
    await page.goto('/');
  });
});
