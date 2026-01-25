# Quick Deploy: Caching Solution

**Time Required:** 5 minutes
**Solves:** Alpha Vantage rate limit (25 calls/day)
**Result:** Reduce API calls by 95% using database cache

---

## 🚀 One-Command Deployment (Windows)

```bash
cd C:\Projects\SourceCodes\RoboTrader
scripts\deploy_caching.bat
```

**That's it!** The script will:
1. Check Docker status
2. Start containers if needed
3. Apply database migration
4. Verify cache table created

---

## 📋 Manual Deployment (Step-by-Step)

### Step 1: Apply Database Migration

```bash
cd C:\Projects\SourceCodes\RoboTrader
docker exec -i trading_postgres psql -U n8n -d wealthsimple_trader < migrations\001_add_market_data_cache.sql
```

### Step 2: Import Cached Workflow

1. Open n8n: http://localhost:5678
2. Click **Workflows** > **Import from File**
3. Select: `n8n-workflows/1-market-scanner-cached.json`
4. Click **Import**

### Step 3: Switch Workflows

1. Open workflow: **"1. Market Scanner"** (original)
2. Toggle **Active** to **OFF**
3. Open workflow: **"1. Market Scanner (Cached)"**
4. Toggle **Active** to **ON**

### Step 4: Test

1. Click **Execute Workflow** in n8n
2. Check execution logs
3. Verify cache in database:

```bash
docker exec trading_postgres psql -U n8n -d wealthsimple_trader -c "SELECT symbol, close_price, cached_at FROM market_data_cache ORDER BY cached_at DESC LIMIT 5;"
```

---

## ✅ Verify It's Working

### Check 1: Cache Table Exists
```bash
docker exec trading_postgres psql -U n8n -d wealthsimple_trader -c "\d market_data_cache"
```

**Expected:** Table structure with columns: symbol, timeframe, close_price, cached_at, etc.

### Check 2: Cache is Populating
```bash
docker exec trading_postgres psql -U n8n -d wealthsimple_trader -c "SELECT COUNT(*) FROM market_data_cache;"
```

**Expected:** Row count increases after each workflow run

### Check 3: API Calls Reduced

**First run:** 8 API calls (cache miss)
**Second run:** 0 API calls (cache hit)

Look for `from_cache: true` in workflow execution data.

---

## 📊 Expected Results

| Metric | Before | After |
|--------|--------|-------|
| API calls/run | 8 | 0-1 (only new data) |
| Daily API calls | 624 | ~8 |
| Rate limit hit? | Yes (after 2 runs) | No ✅ |
| Workflow speed | ~12 sec | ~2 sec |

---

## 🔧 Troubleshooting

### Cache not populating?

**Check workflow node:** "Save to Cache"
```bash
# View n8n logs
docker-compose logs n8n | grep -i cache
```

### Workflow still slow?

**Check cache hit rate:**
```sql
SELECT
    COUNT(*) FILTER (WHERE from_cache = true) as cache_hits,
    COUNT(*) as total_runs
FROM signals
WHERE created_at > NOW() - INTERVAL '1 hour';
```

### Need to clear cache?

```bash
docker exec trading_postgres psql -U n8n -d wealthsimple_trader -c "DELETE FROM market_data_cache;"
```

---

## 📚 Full Documentation

- **Complete Guide:** `CACHING_SOLUTION.md`
- **Database Schema:** `migrations/001_add_market_data_cache.sql`
- **Workflow JSON:** `n8n-workflows/1-market-scanner-cached.json`

---

## ⏭️ Next Steps After Deployment

1. ✅ Cache deployed and working
2. Monitor for 24 hours during market hours
3. Proceed to **Phase 3** (Risk & Tax Workflows)
4. Or prepare for **Production** (scheduled triggers)

---

**Questions?** Check `CACHING_SOLUTION.md` for advanced configuration and monitoring.
