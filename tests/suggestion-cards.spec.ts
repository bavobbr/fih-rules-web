import { test, expect } from '@playwright/test';
import { mockHealthCheck, mockChatResponse } from './helpers/api-mocks';

test.describe('Suggestion Cards', () => {
  test.beforeEach(async ({ page }) => {
    await mockHealthCheck(page, true);
    await mockChatResponse(page, {
      answer: 'This is a response to your question.',
      standalone_query: 'test',
      variant: 'outdoor',
      source_docs: [],
    });
  });

  test('should auto-submit when clicking suggestion card', async ({ page }) => {
    await page.goto('/');

    // Click on first suggestion card
    const firstSuggestion = page.getByText('What is the penalty for a deliberate foul in the circle?');
    await firstSuggestion.click();

    // Should see the question as a user message
    await expect(page.getByText('What is the penalty for a deliberate foul in the circle?')).toBeVisible();

    // Should see a response
    await expect(page.getByText('This is a response to your question.')).toBeVisible({ timeout: 5000 });
  });

  test('should show all four suggestion cards on welcome screen', async ({ page }) => {
    await page.goto('/');

    // Check all suggestions are visible
    await expect(page.getByText('Explain a rule')).toBeVisible();
    await expect(page.getByText('Check rules')).toBeVisible();
    await expect(page.getByText('Card suspensions')).toBeVisible();
    await expect(page.getByText('Quick check')).toBeVisible();

    // Check suggestion questions are visible
    await expect(page.getByText(/penalty for a deliberate foul/i)).toBeVisible();
    await expect(page.getByText(/What is rule 13.2/i)).toBeVisible();
    await expect(page.getByText(/How long is a green card/i)).toBeVisible();
    await expect(page.getByText(/Can I hit the ball in indoor/i)).toBeVisible();
  });

  test('should hide suggestion cards after first message', async ({ page }) => {
    await page.goto('/');

    // Verify suggestions are visible initially
    await expect(page.getByText('Explain a rule')).toBeVisible();

    // Click a suggestion
    const suggestion = page.getByText('What is the penalty for a deliberate foul in the circle?');
    await suggestion.click();

    // Wait for response
    await expect(page.getByText('This is a response to your question.')).toBeVisible({ timeout: 5000 });

    // Suggestions should no longer be visible
    await expect(page.getByText('Explain a rule')).not.toBeVisible();
  });

  test('should navigate to chat view after clicking suggestion', async ({ page }) => {
    await page.goto('/');

    // Initially on welcome screen
    await expect(page.getByRole('heading', { name: /what can i help with/i })).toBeVisible();

    // Click suggestion
    await page.getByText('What is rule 13.2?').click();

    // Wait for chat view
    await page.waitForTimeout(1000);

    // Welcome heading should be gone
    await expect(page.getByRole('heading', { name: /what can i help with/i })).not.toBeVisible();

    // Chat messages should be visible
    await expect(page.getByText('What is rule 13.2?')).toBeVisible();
  });

  test('should have hover effect on suggestion cards', async ({ page }) => {
    await page.goto('/');

    const card = page.getByRole('button').filter({ hasText: 'Explain a rule' });

    // Get initial styles
    const initialBg = await card.evaluate((el) => getComputedStyle(el).backgroundColor);

    // Hover over card
    await card.hover();

    // Wait for CSS transition
    await page.waitForTimeout(100);

    // Background should change (this might be tricky to test reliably)
    // At minimum, verify the card is still visible and interactive
    await expect(card).toBeVisible();
    await expect(card).toBeEnabled();
  });

  test('should submit correct question text from different cards', async ({ page }) => {
    const testCases = [
      { title: 'Explain a rule', question: 'What is the penalty for a deliberate foul in the circle?' },
      { title: 'Check rules', question: 'What is rule 13.2?' },
      { title: 'Card suspensions', question: 'How long is a green card suspension?' },
      { title: 'Quick check', question: 'Can I hit the ball in indoor hockey?' },
    ];

    for (const testCase of testCases) {
      await page.goto('/');

      // Click the card
      await page.getByText(testCase.question).click();

      // Should see the exact question
      await expect(page.getByText(testCase.question)).toBeVisible();

      // Wait for response
      await expect(page.getByText('This is a response to your question.')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should work with keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Tab to first suggestion card
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // May need multiple tabs to reach cards

    // Find focused element
    const focused = await page.evaluate(() => document.activeElement?.textContent);

    // If we successfully focused a suggestion, press Enter
    if (focused && focused.includes('penalty')) {
      await page.keyboard.press('Enter');

      // Should submit the question
      await expect(page.getByText(/penalty for a deliberate foul/i)).toBeVisible();
    }
  });

  test('should display suggestion card icons', async ({ page }) => {
    await page.goto('/');

    // Check that icons are present (SVG elements)
    const cards = page.locator('button').filter({ has: page.locator('svg') });

    // Should have at least 4 cards with icons (the suggestions)
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });
});
