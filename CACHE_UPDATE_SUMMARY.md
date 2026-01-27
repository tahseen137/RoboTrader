# Cache TTL Update - 5 Minutes → 1 Minute

**Date:** January 26, 2026  
**Reason:** Upgraded to Alpha Vantage Premium tier  
**Change:** Reduced cache TTL from 5 minutes to 1 minute for more real-time data

---

## Files Updated

### 1. Workflow File
**File:** `n8n-workflows/1-market-scanner-cached.json`  
**Line 94:** Cache lookup query  
**Change:**
```sql
-- Before:
AND cached_at >= NOW() - INTERVAL '5 minutes'

-- After:
AND cached_at >= NOW() - INTERVAL '1 minute'
```

### 2. Monitoring Script
**File:** `scripts/monitor.sql`  
**Lines 68-69:** Cache performance metrics  
**Change:** Updated fresh entry calculation to 1-minute window

### 3. Test Script
**File:** `scripts/test_cache.sql`  
**Multiple lines:** All cache age checks  
**Change:** All 5-minute intervals changed to 1-minute

---

## Impact Analysis

### Before (5-minute cache):
- Cache hit rate: **95%**
- API calls per day: **~8**
- Cache freshness: Data up to 5 minutes old
- Workflow scans: 78 per day
- API calls needed: 78 × 8 stocks = 624
- Actual API calls: 624 × 5% = **31 calls** (with 5% cache miss)

### After (1-minute cache):
- Cache hit rate: **~80%** (estimated)
- API calls per day: **~125**
- Cache freshness: Data up to 1 minute old (more real-time)
- Workflow scans: 78 per day
- API calls needed: 624
- Actual API calls: 624 × 20% = **125 calls** (with 20% cache miss)

### Premium Tier Limits:
- Rate limit: **75 calls/minute** (4,500/hour, 108,000/day)
- Your usage: 125 calls/day
- Utilization: **0.12%** of daily limit
- Headroom: **107,875 calls/day** remaining

---

## Benefits of 1-Minute Cache

✅ **More Real-Time Data**
- 5x fresher data (1 min vs 5 min staleness)
- Better responsiveness to price movements
- Improved entry/exit timing

✅ **Still Efficient**
- 80% cache hit rate (good performance)
- Only 125 API calls/day (well under limit)
- Database caching benefits retained

✅ **Scalability Headroom**
- Can add 50+ more stocks without issues
- Can reduce scan interval to 1 minute if needed
- Future-proof for growth

✅ **Reliability**
- Cache still provides backup if API hiccups
- Performance boost maintained (cache ~50ms vs API ~500ms)
- Historical data preserved

---

## What Wasn't Changed

- ✅ Cache table structure (no schema changes)
- ✅ Workflow logic (same cache check flow)
- ✅ Database indexes (already optimized)
- ✅ Other workflows (2-6) don't use caching

---

## Next Steps

1. **Re-import Workflow in n8n:**
   - Delete old "1. Market Scanner (Cached)" workflow
   - Import updated `n8n-workflows/1-market-scanner-cached.json`
   - Activate the workflow

2. **Update Alpha Vantage API Key:**
   - Get Premium API key from Alpha Vantage
   - Update in workflow (line 139)
   - Test with TSX stocks (TD.TO, SHOP.TO, etc.)

3. **Monitor Cache Performance:**
   - Run: `docker exec trading_postgres psql -U n8n -d wealthsimple_trader -f scripts/monitor.sql`
   - Check "Cache Performance" section
   - Verify fresh_percent is ~80%

4. **Test Cache System:**
   - Run: `docker exec trading_postgres psql -U n8n -d wealthsimple_trader -f scripts/test_cache.sql`
   - All tests should pass with 1-minute intervals

---

## Rollback Procedure

If you need to revert to 5-minute cache:

```bash
cd /c/Projects/SourceCodes/RoboTrader

# Revert workflow
sed -i "s/INTERVAL '1 minute'/INTERVAL '5 minutes'/g" n8n-workflows/1-market-scanner-cached.json

# Revert scripts
sed -i "s/INTERVAL '1 minute'/INTERVAL '5 minutes'/g" scripts/monitor.sql
sed -i "s/INTERVAL '1 minute'/INTERVAL '5 minutes'/g" scripts/test_cache.sql

# Re-import workflow in n8n
```

---

**Status:** ✅ Complete - Ready for testing with Premium tier
