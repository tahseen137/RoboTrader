import { test, expect } from '../fixtures/test-fixtures.js';

test.describe('Status Indicators', () => {
  test('shows connection status', async ({ page, setScenario }) => {
    await setScenario('healthy');
    await page.goto('/');
    await page.waitForResponse('**/webhook/account-data');

    // Should indicate connected status
    await expect(page.getByText(/Connected|Online|Live/i)).toBeVisible();
  });
});
