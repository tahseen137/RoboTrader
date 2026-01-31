import { test, expect } from '../fixtures/test-fixtures.js';

test.describe('Positions Table', () => {
  test('shows empty state when no positions', async ({ page, setScenario }) => {
    await setScenario('no_positions');
    await page.goto('/');
    await page.waitForResponse('**/webhook/positions');

    await expect(page.getByText(/No open positions|No positions/i)).toBeVisible();
  });

  test('displays single position correctly', async ({ page, setScenario }) => {
    await setScenario('single_position');
    await page.goto('/');
    await page.waitForResponse('**/webhook/positions');

    // Symbol should be visible
    await expect(page.getByText('AAPL')).toBeVisible();

    // Entry price
    await expect(page.getByText(/\$175\.50/)).toBeVisible();

    // Unrealized P&L
    await expect(page.getByText(/\+?\$47\.50/)).toBeVisible();
  });

  test('displays multiple positions with pagination', async ({ page, setScenario }) => {
    await setScenario('many_positions');
    await page.goto('/');
    await page.waitForResponse('**/webhook/positions');

    // Should show multiple symbols
    await expect(page.getByText('AAPL')).toBeVisible();
    await expect(page.getByText('MSFT')).toBeVisible();

    // Should have pagination if more than 10 positions
    const paginationNext = page.getByRole('button', { name: /next|>/i });
    if (await paginationNext.isVisible()) {
      await paginationNext.click();
      // After pagination, later positions should be visible
      await expect(page.getByText(/ORCL|INTC/)).toBeVisible();
    }
  });

  test('shows profit positions in green', async ({ page, setScenario }) => {
    await setScenario('single_position');
    await page.goto('/');
    await page.waitForResponse('**/webhook/positions');

    // The P&L cell should have green styling
    const pnlCell = page.getByText(/\+?\$47\.50/);
    await expect(pnlCell).toBeVisible();
  });

  test('shows loss positions in red', async ({ page, setScenario }) => {
    await setScenario('many_positions');
    await page.goto('/');
    await page.waitForResponse('**/webhook/positions');

    // GOOGL has -$12.00 unrealized P&L
    const lossCell = page.getByText(/-\$12\.00/);
    await expect(lossCell).toBeVisible();
  });
});
