import { test, expect } from '../fixtures/test-fixtures.js';

test.describe('Account Overview', () => {
  test('displays healthy account state correctly', async ({ page, setScenario }) => {
    await setScenario('healthy');
    await page.goto('/');
    await page.waitForResponse('**/webhook/account-data');

    // Total Equity: $10,000
    await expect(page.getByText(/\$10,000/)).toBeVisible();

    // Buying Power: $8,500
    await expect(page.getByText(/\$8,500/)).toBeVisible();

    // Margin Health: 200%
    await expect(page.getByText(/200%/)).toBeVisible();

    // Daily P&L: +$150.50 (positive)
    await expect(page.getByText(/\+?\$150\.50|\$150\.50/)).toBeVisible();
  });

  test('displays warning margin state', async ({ page, setScenario }) => {
    await setScenario('warning_margin');
    await page.goto('/');
    await page.waitForResponse('**/webhook/account-data');

    // Margin Health: 135%
    await expect(page.getByText(/135%/)).toBeVisible();

    // Daily P&L: -$75.00 (negative)
    await expect(page.getByText(/-\$75/)).toBeVisible();
  });

  test('displays critical margin state', async ({ page, setScenario }) => {
    await setScenario('critical_margin');
    await page.goto('/');
    await page.waitForResponse('**/webhook/account-data');

    // Margin Health: 85%
    await expect(page.getByText(/85%/)).toBeVisible();

    // Daily P&L: -$180.00
    await expect(page.getByText(/-\$180/)).toBeVisible();
  });

  test('displays daily loss limit state', async ({ page, setScenario }) => {
    await setScenario('daily_loss_limit');
    await page.goto('/');
    await page.waitForResponse('**/webhook/account-data');

    // Daily P&L: -$400.00
    await expect(page.getByText(/-\$400/)).toBeVisible();
  });
});
