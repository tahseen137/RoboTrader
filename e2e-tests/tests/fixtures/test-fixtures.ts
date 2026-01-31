import { test as base, expect } from '@playwright/test';

const MOCK_SERVER_URL = 'http://localhost:5679';

type TestFixtures = {
  setScenario: (scenario: string) => Promise<void>;
  getScenario: () => Promise<string>;
};

export const test = base.extend<TestFixtures>({
  setScenario: async ({ request }, use) => {
    const setScenario = async (scenario: string) => {
      const response = await request.post(`${MOCK_SERVER_URL}/api/scenario`, {
        data: { scenario }
      });
      if (!response.ok()) {
        throw new Error(`Failed to set scenario: ${await response.text()}`);
      }
    };
    await use(setScenario);
  },

  getScenario: async ({ request }, use) => {
    const getScenario = async () => {
      const response = await request.get(`${MOCK_SERVER_URL}/api/scenario`);
      const data = await response.json();
      return data.currentScenario;
    };
    await use(getScenario);
  },
});

export { expect };
