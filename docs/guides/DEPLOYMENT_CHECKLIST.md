# RoboTrader - Caching Solution Deployment Checklist

Use this checklist to deploy the Alpha Vantage caching solution.

---

## ✅ Pre-Deployment Checklist

- [ ] Docker Desktop installed and running
- [ ] RoboTrader containers running (`trading_n8n`, `trading_postgres`)
- [ ] n8n accessible at http://localhost:5678
- [ ] PostgreSQL accessible (test connection)
- [ ] Original workflows backed up (already in git)

**Verify Docker Status:**
```bash
docker ps
# Should show: trading_n8n and trading_postgres
```

---

## 🚀 Deployment Steps

### Step 1: Database Migration
- [ ] Navigate to RoboTrader directory
- [ ] Run deployment script:
  ```bash
  cd C:\Projects\SourceCodes\RoboTrader
  scripts\deploy_caching.bat
  ```
- [ ] Verify success message appears
- [ ] Check cache table exists:
  ```bash
  docker exec trading_postgres psql -U n8n -d wealthsimple_trader -c "\d market_data_cache"
  ```

**Expected:** Table structure with 9 columns displayed

---

### Step 2: Import Cached Workflow
- [ ] Open n8n: http://localhost:5678
- [ ] Login with credentials from `.env`
- [ ] Click **Workflows** in left sidebar
- [ ] Click **Import from File** button
- [ ] Select: `n8n-workflows/1-market-scanner-cached.json`
- [ ] Click **Import**
- [ ] Workflow appears as "1. Market Scanner (Cached)"

---

### Step 3: Configure Workflow
- [ ] Open imported workflow
- [ ] Verify PostgreSQL credential is connected (all DB nodes should show green checkmark)
- [ ] Check Alpha Vantage API key in "Fetch from Alpha Vantage" node
- [ ] Verify all nodes are properly connected (no red errors)

---

### Step 4: Deactivate Old Workflow
- [ ] Go to Workflows list
- [ ] Find **"1. Market Scanner"** (original)
- [ ] Toggle **Active** switch to **OFF**
- [ ] Confirm deactivation

**Important:** Keep old workflow for backup, don't delete

---

### Step 5: Activate New Workflow
- [ ] Find **"1. Market Scanner (Cached)"**
- [ ] Toggle **Active** switch to **ON**
- [ ] Workflow status shows "Active"

---

### Step 6: Manual Test
- [ ] Open "1. Market Scanner (Cached)" workflow
- [ ] Click **Execute Workflow** button
- [ ] Wait for execution to complete (~15 seconds first run)
- [ ] Check execution status: Success ✅
- [ ] Review execution data:
  - [ ] 8 stocks processed
  - [ ] Indicators calculated
  - [ ] Signals logged
  - [ ] `from_cache: false` (first run)

---

### Step 7: Verify Cache Populated
```bash
docker exec trading_postgres psql -U n8n -d wealthsimple_trader -c "
SELECT
    symbol,
    close_price,
    cached_at,
    EXTRACT(EPOCH FROM (NOW() - cached_at)) / 60 as age_minutes
FROM market_data_cache
ORDER BY cached_at DESC
LIMIT 8;
"
```

**Expected:** 8 rows (one per stock) with recent cached_at timestamps

---

### Step 8: Test Cache Hit
- [ ] Wait 1 minute (ensure cache is still fresh)
- [ ] Click **Execute Workflow** again in n8n
- [ ] Execution completes faster (~2 seconds)
- [ ] Check execution data shows `from_cache: true`
- [ ] No new cache entries created (verify with Step 7 query)

**Expected:** 0 API calls, all data from cache

---

### Step 9: Run Test Suite
```bash
docker exec trading_postgres psql -U n8n -d wealthsimple_trader -f scripts\test_cache.sql
```

**Expected:** All tests show ✓ PASS

---

### Step 10: Monitor First Hour
- [ ] Let workflow run automatically (if scheduled)
- [ ] Check execution history every 15 minutes
- [ ] Verify cache hit rate is 80%+
- [ ] Monitor API usage (should stay under 25/day)

---

## 📊 Success Criteria

After deployment, verify:

- [x] Cache table exists in database
- [x] New workflow active, old workflow inactive
- [x] Manual execution succeeds
- [x] Cache populates with 8 stocks
- [x] Second run uses cached data (0 API calls)
- [x] Test suite passes
- [x] No errors in n8n execution logs
- [x] Cache hit rate > 80%

---

## 🔍 Verification Queries

### Check Cache Size
```sql
SELECT
    COUNT(*) as total_rows,
    COUNT(DISTINCT symbol) as unique_symbols,
    pg_size_pretty(pg_total_relation_size('market_data_cache')) as table_size
FROM market_data_cache;
```

### Check Fresh vs Stale
```sql
SELECT
    COUNT(*) FILTER (WHERE cached_at >= NOW() - INTERVAL '5 minutes') as fresh,
    COUNT(*) FILTER (WHERE cached_at < NOW() - INTERVAL '5 minutes') as stale
FROM market_data_cache;
```

### View Recent Activity
```sql
SELECT
    symbol,
    close_price,
    TO_CHAR(timestamp, 'HH24:MI') as market_time,
    TO_CHAR(cached_at, 'HH24:MI:SS') as cached_time,
    ROUND(EXTRACT(EPOCH FROM (NOW() - cached_at)) / 60, 1) as age_min
FROM market_data_cache
ORDER BY cached_at DESC
LIMIT 10;
```

---

## ⚠️ Troubleshooting

### Issue: Script fails with "Docker not running"
**Solution:**
```bash
# Start Docker Desktop
# Wait for green status indicator
# Re-run deployment script
```

### Issue: "Table already exists" error
**Solution:**
```bash
# This is OK - migration is idempotent
# Table already created from previous run
# Continue with Step 2
```

### Issue: Workflow import fails
**Solution:**
- Check file path is correct
- Ensure n8n is running
- Try manual import via copy-paste JSON

### Issue: PostgreSQL credential missing
**Solution:**
1. Go to **Credentials** in n8n
2. Click **Add Credential**
3. Select **PostgreSQL**
4. Enter connection details from `.env`
5. Test connection
6. Save
7. Re-open workflow and assign credential

### Issue: Cache not populating
**Solution:**
- Check "Save to Cache" node in workflow execution
- Verify SQL syntax (look for red errors)
- Check PostgreSQL credential connected
- Review n8n execution logs

### Issue: Rate limit still hit
**Solution:**
- Verify cache TTL is 5+ minutes
- Check cache hit rate (should be >80%)
- Confirm old workflow is deactivated
- Review workflow schedule (not running too frequently)

---

## 🔄 Rollback Procedure

If caching causes issues:

### Option 1: Switch Back to Old Workflow
1. Deactivate "1. Market Scanner (Cached)"
2. Activate "1. Market Scanner" (original)
3. No database changes needed

### Option 2: Remove Cache Table
```sql
DROP TABLE market_data_cache CASCADE;
```

### Option 3: Full Rollback
```bash
# Remove cache table
docker exec trading_postgres psql -U n8n -d wealthsimple_trader -c "DROP TABLE market_data_cache CASCADE;"

# Revert init.sql (if needed)
git checkout init.sql

# Delete cached workflow in n8n
# Re-activate original workflow
```

---

## 📈 Post-Deployment Monitoring

### Daily (First Week)
- [ ] Check cache hit rate
- [ ] Verify API usage < 25 calls/day
- [ ] Review workflow execution history
- [ ] Monitor database size

### Weekly
- [ ] Review cache performance metrics
- [ ] Check for errors in logs
- [ ] Verify all 8 stocks caching correctly

### Monthly
- [ ] Consider cache cleanup (if database > 1GB)
- [ ] Review and optimize cache TTL
- [ ] Document any issues encountered

---

## 📚 Reference Documentation

- **Quick Start:** `QUICK_DEPLOY_CACHE.md`
- **Full Guide:** `CACHING_SOLUTION.md`
- **Architecture:** `docs/CACHE_ARCHITECTURE.md`
- **Summary:** `CACHE_SOLUTION_SUMMARY.md`

---

## ✅ Deployment Complete!

Once all checkboxes are marked:
- [x] System is ready for automated trading
- [x] Rate limit issue solved
- [x] Performance improved 83%
- [x] Ready for Phase 3 (Risk & Tax Workflows)

**Next Steps:**
1. Monitor cache for 24-48 hours
2. Review Phase 3 tasks in `PROJECT_STATUS.md`
3. Begin building Workflow 4 (Risk Management)

---

**Deployment Date:** __________
**Deployed By:** __________
**Status:** __________ (Success / Issues Noted)
**Notes:** _________________________________________________
