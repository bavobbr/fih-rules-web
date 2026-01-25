# Playwright Tests

## Setup

Playwright is already installed. Browsers are installed automatically.

## Running Tests

### Run all tests (headless)
```bash
npm test
```

### Run tests with UI (interactive mode)
```bash
npm run test:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### Run specific test file
```bash
npx playwright test tests/welcome-screen.spec.ts
```

## API Mocking

Tests use mocked API responses to avoid external dependencies. The mock helpers are in `tests/helpers/api-mocks.ts`.

### Available Mock Functions

- `mockHealthCheck(page, healthy)` - Mock the `/health` endpoint
- `mockChatResponse(page, response)` - Mock the `/chat` endpoint with custom response
- `mockChatError(page, status)` - Mock API errors
- `mockAllAPIs(page)` - Mock all API endpoints with default responses

### Example Test with Mocking

```typescript
import { test, expect } from '@playwright/test';
import { mockChatResponse } from './helpers/api-mocks';

test('should display chat response', async ({ page }) => {
  // Mock the API
  await mockChatResponse(page, {
    answer: 'Rule 13.2 states...',
    standalone_query: 'What is rule 13.2?',
    variant: 'outdoor',
    source_docs: [],
  });

  await page.goto('/');

  // Interact with the app
  await page.fill('textarea[placeholder*="Ask about rules"]', 'What is rule 13.2?');
  await page.click('button[type="submit"]');

  // Assert
  await expect(page.getByText('Rule 13.2 states...')).toBeVisible();
});
```

## Writing New Tests

1. Create a new file in `tests/` directory with `.spec.ts` extension
2. Import test utilities and mocks
3. Use `test.beforeEach()` to set up API mocks
4. Write test cases

## Test Structure

```
tests/
├── README.md                 # This file
├── helpers/
│   └── api-mocks.ts         # API mocking utilities
└── welcome-screen.spec.ts   # Example test file
```

## Tips

- Always mock API calls to avoid flaky tests
- Use `page.getByRole()` for better accessibility testing
- Take screenshots on failure (configured by default)
- Check `playwright-report/` for detailed test results
