import { test, expect } from '../fixtures/test-fixtures.js';

test.describe('Trade History', () => {
  test('shows empty state when no trades', async ({ page, setScenario }) => {
    await setScenario('no_positions');
    await page.goto('/');
    await page.waitForResponse('**/webhook/trades');

    await expect(page.getByText(/No trades|No trade history/i)).toBeVisible();
  });

  test('displays profitable trades correctly', async ({ page, setScenario }) => {
    await setScenario('profitable_day');
    await page.goto('/');
    await page.waitForResponse('**/webhook/trades');

    // Should show trade symbols
    await expect(page.getByText('AAPL')).toBeVisible();

    // Should show profit values
    await expect(page.getByText(/\+?\$55\.00|\$55/)).toBeVisible();
  });

  test('displays losing trades correctly', async ({ page, setScenario }) => {
    await setScenario('losing_day');
    await page.goto('/');
    await page.waitForResponse('**/webhook/trades');

    // Should show loss values (negative)
    await expect(page.getByText(/-\$40\.00|-\$40/)).toBeVisible();
  });

  test('shows trade status badges', async ({ page, setScenario }) => {
    await setScenario('profitable_day');
    await page.goto('/');
    await page.waitForResponse('**/webhook/trades');

    // Should show PROFIT_TARGET status
    await expect(page.getByText(/PROFIT.?TARGET|Profit Target/i)).toBeVisible();
  });
});
