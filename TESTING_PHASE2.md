# Testing Phase 2 - Core Workflows

## Prerequisites Checklist

Before testing, you need API keys:

- [ ] **Finnhub API Key** - Get free at https://finnhub.io/register
- [ ] **Alpha Vantage API Key** - Get free at https://www.alphavantage.co/support/#api-key
- [ ] **SnapTrade API** - Contact https://snaptrade.com/ (optional for initial tests)
- [ ] **Telegram Bot** - Optional for notifications

## Step 1: Verify Environment (1 min)

```bash
# Check containers
docker-compose ps

# Should show:
# trading_n8n       Up (healthy)
# trading_postgres  Up (healthy)
```

Access n8n: http://localhost:5678

## Step 2: Configure Credentials (5 min)

**IMPORTANT**: Credential names must match exactly as shown below. The workflows reference these names.

### A. PostgreSQL (Required)
1. n8n → Credentials (left sidebar) → Add Credential
2. Search: **Postgres**
3. Name: `Trading Database` (exact name required)
4. Config:
   ```
   Host: postgres
   Port: 5432
   Database: wealthsimple_trader
   User: n8n
   Password: [check your .env DB_PASSWORD]
   SSL: Disabled
   ```
5. Test → Save

### B. Finnhub (Required)
1. Add Credential → Search: **HTTP Request**
2. Name: `Finnhub API` (exact name required)
3. Authentication: **Header Auth**
4. Config:
   ```
   Header Name: X-Finnhub-Token
   Header Value: [your FINNHUB_API_KEY]
   ```
5. Save

### C. SnapTrade (Optional - skip for now)
1. New Credential → **HTTP Request**
2. Name: `SnapTrade API`
3. Auth: **Header Auth**
4. Config:
   ```
   Header Name: Authorization
   Header Value: Bearer [your SNAPTRADE_API_KEY]
   ```
5. Save

### D. Telegram (Optional)
1. New Credential → **Telegram**
2. Access Token: `[your bot token]`
3. Save as `Telegram Bot`

## Step 3: Import Workflows (3 min)

**NOTE**: If credential names match exactly, workflows should auto-connect. Otherwise, manually select credentials.

### Import Workflow 1: Market Scanner
1. n8n → Workflows (left sidebar) → Add Workflow dropdown → **Import from File**
2. Browse to: `n8n-workflows/1-market-scanner.json`
3. Click **Import**
4. Open imported workflow
5. Verify credentials connected:
   - PostgreSQL nodes: Should show "Trading Database"
   - HTTP Request node: Should show "Finnhub API"
   - If not connected, click node → Select credential
6. Click **Save** (top right)

### Import Workflow 2: Trade Execution
1. Import: `n8n-workflows/2-trade-execution.json`
2. Update credentials (Postgres, SnapTrade if available)
3. Save
4. **Note**: Keep this INACTIVE until SnapTrade is configured

### Import Workflow 3: Position Monitor
1. Import: `n8n-workflows/3-position-monitor.json`
2. Update credentials (Postgres, Finnhub)
3. Save
4. **Note**: Keep INACTIVE for now

## Step 4: Test Market Scanner (10 min)

### Manual Test
1. Open **Market Scanner** workflow
2. Click **Execute Workflow** (play button)
3. Watch execution:
   - Should fetch 8 stocks from watchlist
   - Fetch candle data from Finnhub
   - Calculate indicators
   - Check for signals

### Expected Results
```
✓ Fetched watchlist (8 stocks)
✓ Got candle data from Finnhub
✓ Calculated SMA, RSI, ADX
✓ Checked signal conditions
✓ Logged to database (if signal found)
```

### Verify in Database
```bash
docker-compose exec postgres psql -U n8n -d wealthsimple_trader

# Check signals logged
SELECT symbol, action, confidence, created_at
FROM signals
ORDER BY created_at DESC
LIMIT 5;

# Exit
\q
```

### Common Issues

**Error: "Finnhub API error 401"**
- Fix: Check API key in credential

**Error: "Database connection failed"**
- Fix: Verify postgres credential host is `postgres` (not localhost)

**No signals generated**
- OK! Market conditions may not meet entry criteria
- SMA(10) must be > SMA(30) + ADX > 20 + RSI cross 50

## Step 5: Test Without SnapTrade (Paper Testing)

Since you may not have SnapTrade yet, modify Trade Execution:

1. Open **Trade Execution** workflow
2. Replace SnapTrade HTTP nodes with **Code** nodes:
   ```javascript
   // Simulate order response
   return [{
     order_id: 'PAPER_' + Date.now(),
     status: 'FILLED',
     filled_price: $input.first().json.entryPrice,
     message: 'Paper trade - no real order placed'
   }];
   ```
3. Save and **Activate**

## Step 6: End-to-End Test (15 min)

### Test Flow
1. **Activate** Market Scanner
2. Wait 5 minutes (or execute manually)
3. Check if signal generated:
   ```sql
   SELECT * FROM signals ORDER BY created_at DESC LIMIT 1;
   ```
4. If signal exists, check if trade logged:
   ```sql
   SELECT * FROM trades ORDER BY entry_time DESC LIMIT 1;
   ```

### Monitor Executions
- n8n → Executions tab
- See all workflow runs
- Click to view details

## Step 7: Verify Data Flow

```bash
# Connect to database
docker-compose exec postgres psql -U n8n -d wealthsimple_trader

# Check workflow ran
SELECT COUNT(*) FROM signals WHERE created_at > NOW() - INTERVAL '1 hour';

# Check watchlist
SELECT * FROM watchlist WHERE active = true;

# Check algorithm config
SELECT * FROM algorithm_config;

# Exit
\q
```

## Success Criteria

- [x] Containers running
- [ ] n8n accessible at http://localhost:5678
- [ ] Credentials configured
- [ ] Market Scanner imported
- [ ] Market Scanner executes without errors
- [ ] Finnhub API returns candle data
- [ ] Indicators calculated (SMA, RSI, ADX)
- [ ] Signals logged to database
- [ ] Trade Execution workflow ready (with/without SnapTrade)

## Next Steps

Once testing passes:
1. Get SnapTrade credentials for real trading
2. Test Trade Execution with real API
3. Activate Position Monitor
4. Run paper trading for 1 week
5. Move to Phase 3 (Risk Management)

## Troubleshooting

### n8n won't start
```bash
docker-compose logs n8n
docker-compose restart n8n
```

### Can't connect to database
```bash
docker-compose exec postgres psql -U n8n -d wealthsimple_trader
# If fails, check .env DB_PASSWORD
```

### Finnhub API rate limit
- Free tier: 60 calls/min
- 8 stocks = 8 calls per scan
- Running every 5 min = OK

### Need help
- Check logs: n8n Executions tab
- Database: `SELECT * FROM signals;`
- Workflow JSON: `n8n-workflows/README.md`
