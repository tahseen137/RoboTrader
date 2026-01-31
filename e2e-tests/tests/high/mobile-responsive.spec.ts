import { test, expect } from '../fixtures/test-fixtures.js';

test.describe('Mobile Responsive', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('dashboard is usable on mobile', async ({ page, setScenario }) => {
    await setScenario('healthy');
    await page.goto('/');
    await page.waitForResponse('**/webhook/account-data');

    // Dashboard should still show key metrics
    await expect(page.getByText(/\$10,000/)).toBeVisible();
    await expect(page.getByText(/200%/)).toBeVisible();
  });

  test('tables are scrollable on mobile', async ({ page, setScenario }) => {
    await setScenario('many_positions');
    await page.goto('/');
    await page.waitForResponse('**/webhook/positions');

    // Positions should still be accessible
    await expect(page.getByText('AAPL')).toBeVisible();
  });
});
