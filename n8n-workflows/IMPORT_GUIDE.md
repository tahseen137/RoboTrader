# Quick Import Guide

## Step 1: Access n8n
Open http://localhost:5678 and login

## Step 2: Setup Credentials (First Time Only)

### PostgreSQL
1. Settings → Credentials → New
2. Type: Postgres
3. Fill: host=postgres, port=5432, database=wealthsimple_trader, user=n8n, password=[from .env]
4. Test → Save as "Trading Database"

### Finnhub
1. New Credential → HTTP Request
2. Auth: Header Auth
3. Name: X-Finnhub-Token, Value: [your key]
4. Save as "Finnhub API"

### SnapTrade
1. New Credential → HTTP Request
2. Auth: Header Auth
3. Name: Authorization, Value: Bearer [your key]
4. Save as "SnapTrade API"

### Telegram (optional)
1. New Credential → Telegram
2. Access Token: [your bot token]
3. Save as "Telegram Bot"

## Step 3: Import Workflows

1. Workflows → Import from File
2. Select `1-market-scanner.json`
3. Repeat for `2-trade-execution.json` and `3-position-monitor.json`

## Step 4: Update Variables

In each workflow, update these nodes:
- PostgreSQL nodes: Select "Trading Database" credential
- HTTP Finnhub nodes: Select "Finnhub API" credential
- HTTP SnapTrade nodes: Select "SnapTrade API" credential
- Telegram nodes: Select "Telegram Bot" credential

## Step 5: Activate

Toggle each workflow to "Active" ✓

## Step 6: Test

1. Execute Market Scanner manually (Execute Workflow button)
2. Check Executions tab for results
3. Verify database logs: `SELECT * FROM signals ORDER BY created_at DESC LIMIT 5;`

Done! Workflows will now run automatically.
