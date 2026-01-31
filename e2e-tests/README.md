# RoboTrader E2E Tests

End-to-end testing suite for the RoboTrader dashboard using Playwright and a mock API server.

## Quick Start

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run all tests
npm test

# Run tests with UI (interactive mode)
npm run test:ui
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run mock:start` | Start mock server only |
| `npm test` | Run all tests |
| `npm run test:ui` | Interactive test UI |
| `npm run test:headed` | Run with visible browser |
| `npm run test:critical` | Run critical tests only |
| `npm run test:high` | Run high priority tests |
| `npm run report` | View HTML test report |

## Mock Server

The mock server runs on port 5679 and provides these endpoints:

- `GET /webhook/account-data` - Account metrics
- `GET /webhook/positions` - Open positions
- `GET /webhook/trades` - Trade history
- `GET /webhook/alerts` - System alerts
- `POST /api/scenario` - Switch test scenario

### Available Scenarios

- `healthy` - Normal account state ($10K equity, 200% margin)
- `warning_margin` - Margin at 135%
- `critical_margin` - Margin at 85%
- `daily_loss_limit` - -5% daily loss reached
- `no_positions` - Empty positions table
- `single_position` - One open position
- `many_positions` - 12+ positions (pagination testing)
- `profitable_day` - Multiple winning trades
- `losing_day` - Multiple losing trades
- `mixed_alerts` - All alert severity types
- `empty_state` - All data empty

## Project Structure

```
e2e-tests/
├── mock-server/          # Express mock API
│   ├── index.ts         # Server entry point
│   ├── types/           # TypeScript interfaces
│   └── data/            # Mock data scenarios
├── tests/
│   ├── fixtures/        # Custom test fixtures
│   ├── critical/        # Critical priority tests
│   ├── high/            # High priority tests
│   └── medium/          # Medium priority tests
└── utils/               # Test helpers
```

## Running Tests

### Start Mock Server Only

```bash
npm run mock:start
```

The server will start on http://localhost:5679

### Test Endpoints Manually

```bash
# Health check
curl http://localhost:5679/health

# Get account data
curl http://localhost:5679/webhook/account-data

# Change scenario
curl -X POST http://localhost:5679/api/scenario \
  -H "Content-Type: application/json" \
  -d '{"scenario":"critical_margin"}'
```

### Run Tests Against Frontend

1. **Update frontend to use mock server** (optional):
   Edit `frontend-new/.env.local`:
   ```
   VITE_API_BASE_URL=http://localhost:5679/webhook
   ```

2. **Start frontend**:
   ```bash
   cd ../frontend-new
   npm run dev
   ```

3. **Run E2E tests**:
   ```bash
   npm test
   ```

4. **View report**:
   ```bash
   npm run report
   ```

## Test Coverage

### Critical Tests (6)
- Dashboard loads with all components
- Account overview displays correctly
- Positions table functionality
- Trade history display
- Alert panel with severities
- Data polling updates

### High Priority Tests (2)
- Mobile responsive layout
- Status indicators

### Medium Priority Tests
- Error states
- Loading states
- Theme colors

## Development

### Adding New Scenarios

Edit `mock-server/data/scenarios.ts`:

```typescript
export const scenarios: Record<ScenarioName, Scenario> = {
  my_new_scenario: {
    accountData: { /* ... */ },
    positions: [ /* ... */ ],
    trades: [ /* ... */ ],
    alerts: [ /* ... */ ]
  }
};
```

### Adding New Tests

Create a new test file in the appropriate directory:

```typescript
import { test, expect } from '../fixtures/test-fixtures.js';

test.describe('My Feature', () => {
  test('should work correctly', async ({ page, setScenario }) => {
    await setScenario('healthy');
    await page.goto('/');
    // Test assertions...
  });
});
```

## CI/CD Integration

For CI environments, use:

```bash
npm run test:ci
```

This uses `start-server-and-test` to automatically start the mock server, wait for it to be ready, run tests, and clean up.

## Troubleshooting

### Port Already in Use

If port 5679 is already in use, set a different port:

```bash
MOCK_SERVER_PORT=5680 npm run mock:start
```

### Tests Failing

1. Ensure mock server is running
2. Ensure frontend is running on port 8080
3. Check browser console for errors
4. Run with `--headed` flag to see browser: `npm run test:headed`

### Playwright Not Installed

```bash
npx playwright install
```

## Notes

- The mock server mimics the n8n webhook endpoints exactly
- Account data is returned as an array (n8n format)
- All timestamps are dynamically generated relative to current time
- Scenarios can be switched during tests using the `setScenario` fixture
