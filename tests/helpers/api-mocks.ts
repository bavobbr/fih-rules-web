import { Page } from '@playwright/test';

const API_BASE_URL = 'https://fih-rag-api-282549120912.europe-west1.run.app';

interface ChatResponse {
  answer: string;
  standalone_query: string;
  variant: string;
  source_docs: Array<{
    page_content: string;
    metadata: Record<string, unknown>;
  }>;
}

export async function mockHealthCheck(page: Page, healthy = true) {
  await page.route(`${API_BASE_URL}/health`, async (route) => {
    await route.fulfill({
      status: healthy ? 200 : 503,
      contentType: 'application/json',
      body: JSON.stringify({ status: healthy ? 'ok' : 'error' }),
    });
  });
}

export async function mockChatResponse(
  page: Page,
  response: Partial<ChatResponse> = {}
) {
  await page.route(`${API_BASE_URL}/chat`, async (route) => {
    const defaultResponse: ChatResponse = {
      answer: response.answer || 'This is a mocked response from the LLM.',
      standalone_query: response.standalone_query || 'mocked query',
      variant: response.variant || 'outdoor',
      source_docs: response.source_docs || [],
      ...response,
    };

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(defaultResponse),
    });
  });
}

export async function mockChatError(page: Page, status = 500) {
  await page.route(`${API_BASE_URL}/chat`, async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal server error' }),
    });
  });
}

export async function mockCountries(page: Page) {
  await page.route(`${API_BASE_URL}/jurisdictions`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { code: 'BEL', name: 'Belgium' },
        { code: 'NLD', name: 'Netherlands' },
        { code: 'DEU', name: 'Germany' },
      ]),
    });
  });
}

export async function blockGoogleAnalytics(page: Page) {
  // Block all Google Analytics requests to prevent polluting analytics data during tests
  await page.route('**/*google-analytics.com/**', route => route.abort());
  await page.route('**/*googletagmanager.com/**', route => route.abort());
  await page.route('**/*analytics.google.com/**', route => route.abort());
  await page.route('**/gtag/js**', route => route.abort());
}

export async function mockAllAPIs(page: Page) {
  await mockHealthCheck(page, true);
  await mockChatResponse(page);
  await mockCountries(page);
  await blockGoogleAnalytics(page);
}
