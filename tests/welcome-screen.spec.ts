import { test, expect } from '@playwright/test';
import { mockAllAPIs } from './helpers/api-mocks';

test.describe('Welcome Screen', () => {
  test.beforeEach(async ({ page }) => {
    // Mock all API calls to avoid external dependencies
    await mockAllAPIs(page);
  });

  test('should display welcome screen on initial load', async ({ page }) => {
    await page.goto('/');

    // Check for the main heading
    await expect(page.getByRole('heading', { name: /what can i help with/i })).toBeVisible();

    // Check for badges (use .first() since some text appears in both badges and suggestions)
    await expect(page.getByText('Outdoor').first()).toBeVisible();
    await expect(page.getByText('Indoor').first()).toBeVisible();
    await expect(page.getByText('Hockey5s').first()).toBeVisible();

    // Check for input field
    await expect(page.getByPlaceholder(/ask about rules/i)).toBeVisible();

    // Check for suggestion cards
    await expect(page.getByText('Explain a rule')).toBeVisible();
    await expect(page.getByText('Check rules')).toBeVisible();
    await expect(page.getByText('Card suspensions')).toBeVisible();
    await expect(page.getByText('Quick check')).toBeVisible();

    // Check for attribution footer
    await expect(page.getByText(/based on/i)).toBeVisible();
    await expect(page.getByText(/official FIH rules/i)).toBeVisible();
  });

  test('should have clickable suggestion cards', async ({ page }) => {
    await page.goto('/');

    // Click on a suggestion card
    const suggestionCard = page.getByText('What is the penalty for a deliberate foul in the circle?');
    await expect(suggestionCard).toBeVisible();

    // Verify it's clickable (has button parent)
    const button = suggestionCard.locator('xpath=ancestor::button');
    await expect(button).toBeEnabled();
  });

  test('should show About dialog when About button is clicked', async ({ page }) => {
    await page.goto('/');

    // Click About button
    await page.getByRole('button', { name: /about & disclaimers/i }).click();

    // Check if dialog appears (you may need to adjust based on actual dialog content)
    // This is a placeholder - adjust based on your AboutDialog component
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
