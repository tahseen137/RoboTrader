import { test, expect } from '../fixtures/test-fixtures.js';

test.describe('Data Polling', () => {
  test('updates data when scenario changes', async ({ page, setScenario }) => {
    // Start with healthy scenario
    await setScenario('healthy');
    await page.goto('/');
    await page.waitForResponse('**/webhook/account-data');

    // Verify initial equity
    await expect(page.getByText(/\$10,000/)).toBeVisible();

    // Change to warning_margin scenario
    await setScenario('warning_margin');

    // Wait for polling to pick up new data (default 5 seconds + buffer)
    await page.waitForTimeout(6000);

    // Verify equity changed to $5,000
    await expect(page.getByText(/\$5,000/)).toBeVisible();
  });
});
