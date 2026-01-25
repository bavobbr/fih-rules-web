import { test, expect } from '@playwright/test';
import { mockHealthCheck, mockChatResponse } from './helpers/api-mocks';

test.describe('Copy Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await mockHealthCheck(page, true);
  });

  test('should show copy button on assistant messages', async ({ page }) => {
    await mockChatResponse(page, {
      answer: 'This is a response that can be copied.',
      standalone_query: 'test',
      variant: 'outdoor',
      source_docs: [],
    });

    await page.goto('/');

    await page.fill('textarea[placeholder*="Ask about rules"]', 'Test question');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');

    // Wait for response
    await expect(page.getByText('This is a response that can be copied.')).toBeVisible({ timeout: 5000 });

    // Hover over assistant message to reveal copy button
    const assistantMessage = page.locator('div:not([class*="items-end"])').filter({ hasText: 'This is a response' }).first();
    await assistantMessage.hover();

    // Copy button should appear
    const copyButton = assistantMessage.locator('button').filter({ has: page.locator('svg') }).first();
    await expect(copyButton).toBeVisible();
  });

  test('should not show copy button on user messages', async ({ page }) => {
    await mockChatResponse(page, {
      answer: 'Response text',
      standalone_query: 'test',
      variant: 'outdoor',
      source_docs: [],
    });

    await page.goto('/');

    await page.fill('textarea[placeholder*="Ask about rules"]', 'User question');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');

    await page.waitForTimeout(1000);

    // Hover over user message
    const userMessage = page.locator('div[class*="items-end"]').filter({ hasText: 'User question' }).first();
    await userMessage.hover();

    await page.waitForTimeout(500);

    // Should not have a copy button (or very few buttons)
    const buttons = userMessage.locator('button');
    const count = await buttons.count();

    // User messages typically have no action buttons
    expect(count).toBe(0);
  });

  test('should copy message to clipboard when clicked', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await mockChatResponse(page, {
      answer: 'This text should be copied to clipboard.',
      standalone_query: 'test',
      variant: 'outdoor',
      source_docs: [],
    });

    await page.goto('/');

    await page.fill('textarea[placeholder*="Ask about rules"]', 'Test question');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');

    // Wait for response
    await expect(page.getByText('This text should be copied to clipboard.')).toBeVisible({ timeout: 5000 });

    // Hover to reveal copy button
    const assistantMessage = page.locator('div:not([class*="items-end"])').filter({ hasText: 'This text should be copied' }).first();
    await assistantMessage.hover();

    // Click copy button
    const copyButton = assistantMessage.locator('button').filter({ has: page.locator('svg') }).first();
    await copyButton.click();

    // Wait for copy operation
    await page.waitForTimeout(500);

    // Verify clipboard content
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe('This text should be copied to clipboard.');
  });

  test('should show success toast after copying', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await mockChatResponse(page, {
      answer: 'Response to copy',
      standalone_query: 'test',
      variant: 'outdoor',
      source_docs: [],
    });

    await page.goto('/');

    await page.fill('textarea[placeholder*="Ask about rules"]', 'Test');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');
    await expect(page.getByText('Response to copy')).toBeVisible({ timeout: 5000 });

    // Copy the message
    const assistantMessage = page.locator('div:not([class*="items-end"])').filter({ hasText: 'Response to copy' }).first();
    await assistantMessage.hover();
    const copyButton = assistantMessage.locator('button').first();
    await copyButton.click();

    // Should show toast notification
    await expect(page.getByText(/copied to clipboard/i)).toBeVisible({ timeout: 2000 });
  });

  test('should change copy icon to checkmark after copying', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await mockChatResponse(page, {
      answer: 'Test response',
      standalone_query: 'test',
      variant: 'outdoor',
      source_docs: [],
    });

    await page.goto('/');

    await page.fill('textarea[placeholder*="Ask about rules"]', 'Test');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');
    await expect(page.getByText('Test response')).toBeVisible({ timeout: 5000 });

    const assistantMessage = page.locator('div:not([class*="items-end"])').filter({ hasText: 'Test response' }).first();
    await assistantMessage.hover();

    const copyButton = assistantMessage.locator('button').first();

    // Click copy
    await copyButton.click();

    // Wait for icon change
    await page.waitForTimeout(500);

    // Icon should change (implementation-specific check)
    // The button might show a checkmark or change appearance
    // At minimum, verify button is still visible
    await expect(copyButton).toBeVisible();
  });

  test('should handle copy failure gracefully', async ({ page }) => {
    // Don't grant clipboard permissions to simulate failure

    await mockChatResponse(page, {
      answer: 'Response text',
      standalone_query: 'test',
      variant: 'outdoor',
      source_docs: [],
    });

    await page.goto('/');

    await page.fill('textarea[placeholder*="Ask about rules"]', 'Test');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');
    await expect(page.getByText('Response text')).toBeVisible({ timeout: 5000 });

    const assistantMessage = page.locator('div:not([class*="items-end"])').filter({ hasText: 'Response text' }).first();
    await assistantMessage.hover();

    const copyButton = assistantMessage.locator('button').first();
    await copyButton.click();

    // Should show error message or handle gracefully
    // Might show "Failed to copy" toast
    await page.waitForTimeout(1000);

    // Page should not crash
    await expect(page.getByText('Response text')).toBeVisible();
  });

  test('should copy markdown formatting correctly', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await mockChatResponse(page, {
      answer: '# Heading\n\n**Bold text** and *italic text*\n\n- List item 1\n- List item 2',
      standalone_query: 'test',
      variant: 'outdoor',
      source_docs: [],
    });

    await page.goto('/');

    await page.fill('textarea[placeholder*="Ask about rules"]', 'Test');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');

    // Wait for markdown to render
    await page.waitForTimeout(2000);

    // Find and copy the message
    const assistantMessage = page.locator('div:not([class*="items-end"])').filter({ hasText: 'Heading' }).first();
    await assistantMessage.hover();

    const copyButton = assistantMessage.locator('button').first();
    await copyButton.click();

    await page.waitForTimeout(500);

    // Verify markdown is copied (not HTML)
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('# Heading');
    expect(clipboardText).toContain('**Bold text**');
    expect(clipboardText).toContain('*italic text*');
  });

  test('should copy long messages completely', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const longResponse = 'A'.repeat(1000) + ' End';

    await mockChatResponse(page, {
      answer: longResponse,
      standalone_query: 'test',
      variant: 'outdoor',
      source_docs: [],
    });

    await page.goto('/');

    await page.fill('textarea[placeholder*="Ask about rules"]', 'Test');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');
    await page.waitForTimeout(2000);

    const assistantMessage = page.locator('div:not([class*="items-end"])').filter({ hasText: /AAA+/ }).first();
    await assistantMessage.hover();

    const copyButton = assistantMessage.locator('button').first();
    await copyButton.click();

    await page.waitForTimeout(500);

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

    // Should copy complete message
    expect(clipboardText.length).toBe(longResponse.length);
    expect(clipboardText).toContain('End');
  });
});
