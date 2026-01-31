import { test, expect } from '../fixtures/test-fixtures.js';

test.describe('Alert Panel', () => {
  test('shows alerts with different severities', async ({ page, setScenario }) => {
    await setScenario('mixed_alerts');
    await page.goto('/');
    await page.waitForResponse('**/webhook/alerts');

    // Info alert
    await expect(page.getByText(/Position opened/i)).toBeVisible();

    // Warning alert
    await expect(page.getByText(/Margin health at 140%/i)).toBeVisible();

    // Error alert
    await expect(page.getByText(/API rate limit/i)).toBeVisible();

    // Success alert
    await expect(page.getByText(/Position closed.*\+\$56/i)).toBeVisible();
  });

  test('shows empty state when no alerts', async ({ page, setScenario }) => {
    await setScenario('no_positions');
    await page.goto('/');
    await page.waitForResponse('**/webhook/alerts');

    await expect(page.getByText(/No.*alerts|No active alerts/i)).toBeVisible();
  });

  test('shows critical alerts prominently', async ({ page, setScenario }) => {
    await setScenario('critical_margin');
    await page.goto('/');
    await page.waitForResponse('**/webhook/alerts');

    // Critical margin alert should be visible
    await expect(page.getByText(/CRITICAL.*Margin.*below/i)).toBeVisible();
  });
});
