# n8n Workflows

Import these workflows into n8n at http://localhost:5678

## Setup Order

1. Configure credentials first (see CREDENTIALS_SETUP.md)
2. Import workflows in this order:
   - `1-market-scanner.json` - Scans stocks every 5 min
   - `2-trade-execution.json` - Executes trades with risk checks
   - `3-position-monitor.json` - Monitors positions every 1 min

## Activation

After import, activate workflows in n8n dashboard.
