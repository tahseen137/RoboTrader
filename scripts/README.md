# RoboTrader Scripts

Automation scripts for deployment, testing, and maintenance.

---

## 📁 Available Scripts

### `deploy_caching.bat` (Windows)
**Purpose:** Deploy Alpha Vantage caching solution in one command

**Usage:**
```bash
cd C:\Projects\SourceCodes\RoboTrader
scripts\deploy_caching.bat
```

**What it does:**
1. Checks Docker status
2. Starts containers if needed
3. Applies database migration
4. Verifies cache table created
5. Shows next steps

**Time:** ~1 minute

---

### `deploy_caching.sh` (Linux/Mac)
**Purpose:** Same as above, for Unix systems

**Usage:**
```bash
cd /c/Projects/SourceCodes/RoboTrader
chmod +x scripts/deploy_caching.sh
./scripts/deploy_caching.sh
```

---

### `test_cache.sql`
**Purpose:** Test suite for cache functionality

**Usage:**
```bash
docker exec trading_postgres psql -U n8n -d wealthsimple_trader -f scripts/test_cache.sql
```

**Tests:**
1. ✓ Cache table exists
2. ✓ Indexes created
3. ✓ Insert test data
4. ✓ Query fresh cache
5. ✓ Identify stale entries
6. ✓ Simulate workflow lookup
7. ✓ Cache statistics
8. ✓ Cleanup test data

**Time:** ~10 seconds

---

## 🚀 Quick Start

**First-time setup:**
```bash
# 1. Deploy caching
scripts\deploy_caching.bat

# 2. Test it works
docker exec trading_postgres psql -U n8n -d wealthsimple_trader -f scripts\test_cache.sql

# 3. Import workflow in n8n
# Open http://localhost:5678
# Import: n8n-workflows/1-market-scanner-cached.json
```

---

## 📚 Related Documentation

- **Quick Start:** `../QUICK_DEPLOY_CACHE.md`
- **Full Guide:** `../CACHING_SOLUTION.md`
- **Summary:** `../CACHE_SOLUTION_SUMMARY.md`

---

## 🔧 Troubleshooting

### Script fails: "Docker not running"
**Fix:** Start Docker Desktop and retry

### Script fails: "PostgreSQL not found"
**Fix:** Run `docker-compose up -d` first

### Test suite shows errors
**Fix:** Check that migration ran successfully:
```bash
docker exec trading_postgres psql -U n8n -d wealthsimple_trader -c "\d market_data_cache"
```

---

## 📝 Notes

- All scripts are idempotent (safe to run multiple times)
- Original workflows are preserved as backups
- Database migrations use `IF NOT EXISTS` for safety
- Scripts include error checking and validation
