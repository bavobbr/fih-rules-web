import { test, expect } from '@playwright/test';
import { mockHealthCheck, mockChatResponse } from './helpers/api-mocks';

// Long response to ensure scrolling is needed
const LONG_RESPONSE = `
Rule 13.2 is a comprehensive rule about free hits and their execution.

## Key Points

A free hit is awarded when an offense is committed outside the circle. The ball must be stationary before the hit is taken.

### Location Requirements

- The free hit must be taken close to where the offense occurred
- It must be within playing distance
- The player cannot gain a significant advantage by moving the ball

### Player Positioning

All opposing players must be at least 5 meters from the ball when a free hit is taken. This is crucial for fair play.

#### Defenders Inside the Circle

If an attacking free hit is taken within 5 meters of the circle, defenders inside the circle may be less than 5 meters from the ball, provided they:

1. Do not interfere with play
2. Do not attempt to play the ball
3. Remain inside the circle until the ball has traveled at least 5 meters or been touched by a defending player

### Execution Rules

- All players except the player taking the free hit must be at least 5 meters away
- The ball must be stationary
- The hit can be taken as a push, flick, or scoop
- Self-pass is allowed - the player can run with the ball immediately after touching it

### Raised Ball Considerations

It is permitted to play the ball high from a free hit, subject to rules about dangerous play. The ball cannot be intentionally raised into a group of players in a dangerous manner.

## Common Scenarios

**Scenario 1: Quick Free Hit**
If defenders are not yet 5 meters away, the attacking team can still take a quick free hit. However, if they choose to do so, they cannot penalize defenders who are closer than 5 meters unless those defenders are interfering with play.

**Scenario 2: Circle Edge Free Hits**
Free hits awarded within 5 meters of the attacking circle require special attention to the 5-meter rule, as defenders inside the circle have different positioning allowances.

**Scenario 3: Self-Pass Execution**
A player taking a free hit can immediately start running with the ball after touching it, which is often faster than making a pass to a teammate.

## Penalties for Violations

If defenders fail to retreat 5 meters or interfere with the free hit:
- A second free hit may be awarded
- In case of persistent violation, a card may be issued
- The umpire may advance the free hit 10 meters

### Summary

Understanding free hit rules is essential for both attacking and defending play. The 5-meter rule ensures fair play while the self-pass option adds tactical variety to the game.
`.trim();

test.describe('Scroll Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await mockHealthCheck(page, true);
  });

  test('should scroll new user question to top after first message', async ({ page }) => {
    // Capture console logs
    page.on('console', msg => {
      if (msg.text().includes('[Scroll Debug]')) {
        console.log('BROWSER LOG:', msg.text());
      }
    });

    // Mock first response
    await mockChatResponse(page, {
      answer: LONG_RESPONSE,
      standalone_query: 'What is rule 13.2?',
      variant: 'outdoor',
      source_docs: [],
    });

    await page.goto('/');

    // Submit first question
    await page.fill('textarea[placeholder*="Ask about rules"]', 'What is rule 13.2?');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');

    // Wait for first response to appear
    await expect(page.getByText(/Rule 13.2 is a comprehensive/)).toBeVisible({ timeout: 10000 });

    // Scroll down to see more of the response
    await page.evaluate(() => {
      const scrollContainer = document.querySelector('[class*="overflow-y-auto"]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    });

    // Wait for scroll to settle
    await page.waitForTimeout(1000);

    // Now submit a second question
    await page.fill('textarea[placeholder*="Ask about rules"]', 'What is rule 13.1?');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');

    // Wait for the second user message to appear and scroll to complete
    await page.waitForTimeout(2000); // Wait for scroll animation and DOM update

    // Get all user messages
    const userMessages = page.locator('div[class*="items-end"] p');
    const lastUserMessage = userMessages.last();

    // Check if the last user message is near the top of the viewport
    const boundingBox = await lastUserMessage.boundingBox();
    expect(boundingBox).not.toBeNull();

    if (boundingBox) {
      // The question should be scrolled near the top
      // Accounting for header (~64px) + padding, expect < 500px
      expect(boundingBox.y).toBeLessThan(500);
      expect(boundingBox.y).toBeGreaterThan(0);
    }
  });

  test('should keep question visible while response is loading', async ({ page }) => {
    // Mock with delayed response
    let resolveResponse: ((value: unknown) => void) | null = null;
    const responsePromise = new Promise((resolve) => {
      resolveResponse = resolve;
    });

    await page.route('**/chat', async (route) => {
      // Wait for signal before responding
      await responsePromise;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          answer: 'Short response',
          standalone_query: 'test query',
          variant: 'outdoor',
          source_docs: [],
        }),
      });
    });

    await page.goto('/');

    // Submit question
    await page.fill('textarea[placeholder*="Ask about rules"]', 'What is rule 13.2?');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');

    // Wait for scroll to happen
    await page.waitForTimeout(500);

    // Check that question is visible while loading
    const userMessage = page.locator('div[class*="items-end"] p').first();
    await expect(userMessage).toBeVisible();

    // Question should be near top
    const boundingBox = await userMessage.boundingBox();
    if (boundingBox) {
      expect(boundingBox.y).toBeLessThan(500);
    }

    // Complete the response
    if (resolveResponse) resolveResponse(true);
    await page.waitForTimeout(500);
  });

  test('should handle multiple questions with long responses', async ({ page }) => {
    let questionCount = 0;

    await page.route('**/chat', async (route) => {
      questionCount++;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          answer: `Response ${questionCount}: ${LONG_RESPONSE}`,
          standalone_query: `Question ${questionCount}`,
          variant: 'outdoor',
          source_docs: [],
        }),
      });
    });

    await page.goto('/');

    // Ask 3 questions in sequence
    for (let i = 1; i <= 3; i++) {
      await page.fill('textarea[placeholder*="Ask about rules"]', `Question ${i}`);
      await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');

      // Wait for response
      await expect(page.getByText(`Response ${i}:`)).toBeVisible({ timeout: 10000 });

      // Wait for scroll animation and DOM updates between questions
      await page.waitForTimeout(1500);
    }

    // Wait for final scroll animation to complete
    await page.waitForTimeout(1500);

    // The last user message should be visible near the top
    const userMessages = page.locator('div[class*="items-end"] p');
    const lastUserMessage = userMessages.last();

    await expect(lastUserMessage).toBeVisible();

    const boundingBox = await lastUserMessage.boundingBox();
    if (boundingBox) {
      // Account for header, multiple messages, and layout
      // After 3 questions with long responses, position will be higher
      expect(boundingBox.y).toBeLessThan(850);
    }
  });

  test('should scroll works on desktop viewport', async ({ page }) => {
    // Set larger desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    await mockChatResponse(page, {
      answer: LONG_RESPONSE,
      standalone_query: 'test',
      variant: 'outdoor',
      source_docs: [],
    });

    await page.goto('/');

    // Submit first question to get into chat mode
    await page.fill('textarea[placeholder*="Ask about rules"]', 'First question');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');
    await expect(page.getByText(/Rule 13.2 is a comprehensive/)).toBeVisible({ timeout: 10000 });

    // Scroll to bottom
    await page.evaluate(() => {
      const scrollContainer = document.querySelector('[class*="overflow-y-auto"]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    });

    await page.waitForTimeout(500);

    // Submit second question
    await page.fill('textarea[placeholder*="Ask about rules"]', 'Second question');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');

    await page.waitForTimeout(1000);

    // Check scroll position
    const userMessages = page.locator('div[class*="items-end"] p');
    const lastUserMessage = userMessages.last();
    const boundingBox = await lastUserMessage.boundingBox();

    if (boundingBox) {
      // On desktop with more height, should still scroll to top
      // Account for header, padding, and first message
      expect(boundingBox.y).toBeLessThan(850);
    }
  });

  test('should scroll works on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await mockChatResponse(page, {
      answer: LONG_RESPONSE,
      standalone_query: 'test',
      variant: 'outdoor',
      source_docs: [],
    });

    await page.goto('/');

    await page.fill('textarea[placeholder*="Ask about rules"]', 'First question');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');
    await expect(page.getByText(/Rule 13.2 is a comprehensive/)).toBeVisible({ timeout: 10000 });

    // Scroll to bottom
    await page.evaluate(() => {
      const scrollContainer = document.querySelector('[class*="overflow-y-auto"]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    });

    await page.waitForTimeout(500);

    // Submit second question
    await page.fill('textarea[placeholder*="Ask about rules"]', 'Second question');
    await page.press('textarea[placeholder*="Ask about rules"]', 'Enter');

    await page.waitForTimeout(1000);

    // Check scroll position
    const userMessages = page.locator('div[class*="items-end"] p');
    const lastUserMessage = userMessages.last();
    const boundingBox = await lastUserMessage.boundingBox();

    if (boundingBox) {
      // On mobile with limited height, scrolling is even more critical
      // Account for header and layout
      expect(boundingBox.y).toBeLessThan(500);
    }
  });
});
