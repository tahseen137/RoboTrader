import { test, expect } from '../fixtures/test-fixtures.js';

test.describe('Dashboard Loading', () => {
  test.beforeEach(async ({ page, setScenario }) => {
    await setScenario('healthy');
    await page.goto('/');
  });

  test('should load dashboard with all main components', async ({ page }) => {
    // Wait for data to load
    await page.waitForResponse('**/webhook/account-data');

    // Header should be visible
    await expect(page.locator('header')).toBeVisible();

    // Account Overview cards
    await expect(page.getByText(/Total Equity|Equity/i)).toBeVisible();
    await expect(page.getByText(/Buying Power/i)).toBeVisible();
    await expect(page.getByText(/Margin Health/i)).toBeVisible();
    await expect(page.getByText(/Daily P&L|Daily PnL/i)).toBeVisible();

    // Positions section
    await expect(page.getByText(/Open Positions|Positions/i)).toBeVisible();

    // Trade History section
    await expect(page.getByText(/Trade History|Recent Trades/i)).toBeVisible();
  });

  test('should display correct account values', async ({ page }) => {
    await page.waitForResponse('**/webhook/account-data');

    // Verify equity value ($10,000 in healthy scenario)
    await expect(page.getByText(/\$10,000/)).toBeVisible();

    // Verify margin health (200% in healthy scenario)
    await expect(page.getByText(/200%/)).toBeVisible();
  });

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForResponse('**/webhook/account-data');

    // Filter out known acceptable errors (like CORS in dev)
    const criticalErrors = errors.filter(e => !e.includes('favicon'));
    expect(criticalErrors).toHaveLength(0);
  });
});
