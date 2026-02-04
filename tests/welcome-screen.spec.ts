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

    // Click About button in footer (the visible text button, not the header icon)
    await page.getByRole('button', { name: 'About', exact: true }).nth(1).click();

    // Check if dialog appears
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should display country selector with International as default', async ({ page }) => {
    await page.goto('/');

    // Check for country selector with International as default
    const countrySelect = page.getByText('International').first();
    await expect(countrySelect).toBeVisible();
  });

  test('should allow selecting a country', async ({ page }) => {
    await page.goto('/');

    // Open the country selector by clicking the trigger
    await page.getByText('International').first().click();

    // Wait for the dropdown to appear and select Belgium
    await page.getByRole('option', { name: 'Belgium' }).click();

    // Verify selection - Belgium should now be displayed instead of International
    await expect(page.getByText('Belgium').first()).toBeVisible();
  });
});
