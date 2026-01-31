import express from 'express';
import cors from 'cors';
import { scenarios, getScenario } from './data/scenarios.js';
import type { ScenarioName } from './types/index.js';

const app = express();
const PORT = process.env.MOCK_SERVER_PORT || 5679;

// Current scenario (can be changed via API)
let currentScenario: ScenarioName = 'healthy';

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', scenario: currentScenario, timestamp: new Date().toISOString() });
});

// Scenario management
app.get('/api/scenario', (req, res) => {
  res.json({ currentScenario, availableScenarios: Object.keys(scenarios) });
});

app.post('/api/scenario', (req, res) => {
  const { scenario } = req.body;
  if (scenarios[scenario as ScenarioName]) {
    currentScenario = scenario;
    console.log(`📊 Scenario changed to: ${scenario}`);
    res.json({ success: true, currentScenario });
  } else {
    res.status(400).json({ success: false, error: 'Invalid scenario', availableScenarios: Object.keys(scenarios) });
  }
});

// Webhook endpoints (mimics n8n)
app.get('/webhook/account-data', (req, res) => {
  const scenario = getScenario(currentScenario);
  // n8n returns array format
  res.json([scenario.accountData]);
});

app.get('/webhook/positions', (req, res) => {
  const scenario = getScenario(currentScenario);
  res.json(scenario.positions);
});

app.get('/webhook/trades', (req, res) => {
  const scenario = getScenario(currentScenario);
  res.json(scenario.trades);
});

app.get('/webhook/alerts', (req, res) => {
  const scenario = getScenario(currentScenario);
  res.json(scenario.alerts);
});

app.listen(PORT, () => {
  console.log(`\n🚀 RoboTrader Mock Server running on http://localhost:${PORT}`);
  console.log(`📊 Current scenario: ${currentScenario}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET  /health                 - Health check`);
  console.log(`  GET  /api/scenario           - Get current scenario`);
  console.log(`  POST /api/scenario           - Set scenario {"scenario": "name"}`);
  console.log(`  GET  /webhook/account-data   - Account data`);
  console.log(`  GET  /webhook/positions      - Open positions`);
  console.log(`  GET  /webhook/trades         - Trade history`);
  console.log(`  GET  /webhook/alerts         - System alerts`);
  console.log(`\nAvailable scenarios: ${Object.keys(scenarios).join(', ')}\n`);
});

export { app };
