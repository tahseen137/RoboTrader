# Quick Test - 5 Minute Setup

## Prerequisites
- ✓ Docker running
- [ ] Finnhub API key (get in 2 min at https://finnhub.io/register)

## Steps

### 1. Get Finnhub Key (2 min)
1. Go to https://finnhub.io/register
2. Sign up with email
3. Copy your API key from dashboard

### 2. Configure n8n (2 min)
Open http://localhost:5678

**PostgreSQL:**
- Credentials → Add → Postgres
- Name: `Trading Database`
- Host: `postgres`, Port: `5432`, DB: `wealthsimple_trader`, User: `n8n`
- Password: (from `.env` file - DB_PASSWORD)
- Test → Save

**Finnhub:**
- Add → HTTP Request
- Name: `Finnhub API`
- Auth: Header Auth
- Header Name: `X-Finnhub-Token`
- Value: [paste your key]
- Save

### 3. Import & Test (1 min)
1. Workflows → Import from File
2. Select: `n8n-workflows/1-market-scanner.json`
3. Open workflow → Click **Execute Workflow**
4. Watch it run!

## What to Expect
```
✓ Fetches AAPL, MSFT, GOOGL, TSLA, NVDA, AMD, META, AMZN
✓ Gets 5-min candle data from Finnhub
✓ Calculates SMA(10), SMA(30), RSI(14), ADX(14)
✓ Checks if conditions met for BUY signal
✓ Logs signal to database (if found)
```

## Verify Success
```bash
# Check database
docker-compose exec postgres psql -U n8n -d wealthsimple_trader -c "SELECT COUNT(*) FROM signals;"
```

Should return count > 0 if signals were generated.

## Troubleshooting

**Error: Invalid API key**
→ Check Finnhub credential has correct key

**Error: Can't connect to database**
→ PostgreSQL credential must use host `postgres` (not `localhost`)

**No errors but no signals**
→ Normal! Market conditions may not meet entry criteria
→ SMA(10) > SMA(30) + ADX > 20 + RSI between 30-60

## Done!
Market Scanner is working. See `TESTING_PHASE2.md` for full test suite.
