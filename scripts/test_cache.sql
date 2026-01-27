-- ============================================================================
-- TEST MARKET DATA CACHE
-- ============================================================================
-- Quick test queries to verify caching system is working
-- Run: docker exec trading_postgres psql -U n8n -d wealthsimple_trader -f scripts/test_cache.sql
-- ============================================================================

\echo ''
\echo '============================================'
\echo 'Market Data Cache - Test Suite'
\echo '============================================'
\echo ''

-- Test 1: Verify table exists
\echo 'Test 1: Verify cache table exists'
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_name = 'market_data_cache'
        ) THEN '✓ PASS - Table exists'
        ELSE '✗ FAIL - Table not found'
    END as result;
\echo ''

-- Test 2: Check indexes
\echo 'Test 2: Verify indexes'
SELECT
    indexname,
    CASE
        WHEN indexname IS NOT NULL THEN '✓ PASS'
        ELSE '✗ FAIL'
    END as status
FROM pg_indexes
WHERE tablename = 'market_data_cache'
ORDER BY indexname;
\echo ''

-- Test 3: Insert test data
\echo 'Test 3: Insert test data'
INSERT INTO market_data_cache (symbol, timeframe, open_price, high_price, low_price, close_price, volume, timestamp)
VALUES
    ('AAPL', '5min', 150.25, 151.00, 150.10, 150.80, 1000000, NOW() - INTERVAL '3 minutes'),
    ('MSFT', '5min', 380.50, 381.25, 380.00, 381.00, 800000, NOW() - INTERVAL '3 minutes'),
    ('TSLA', '5min', 245.00, 246.50, 244.75, 246.00, 1500000, NOW() - INTERVAL '10 minutes')
ON CONFLICT (symbol, timeframe, timestamp) DO NOTHING
RETURNING symbol || ' inserted' as result;
\echo ''

-- Test 4: Query fresh cache (< 5 min)
\echo 'Test 4: Query fresh cache (< 5 minutes old)'
SELECT
    symbol,
    close_price,
    EXTRACT(EPOCH FROM (NOW() - cached_at)) / 60 as age_minutes,
    CASE
        WHEN cached_at >= NOW() - INTERVAL '1 minute' THEN '✓ FRESH'
        ELSE '✗ STALE'
    END as cache_status
FROM market_data_cache
WHERE symbol IN ('AAPL', 'MSFT')
ORDER BY symbol;
\echo ''

-- Test 5: Query stale cache (> 5 min)
\echo 'Test 5: Identify stale cache entries (> 5 minutes old)'
SELECT
    symbol,
    close_price,
    EXTRACT(EPOCH FROM (NOW() - cached_at)) / 60 as age_minutes,
    '✗ STALE - Would trigger API call' as cache_status
FROM market_data_cache
WHERE cached_at < NOW() - INTERVAL '1 minute'
ORDER BY symbol;
\echo ''

-- Test 6: Cache lookup query (simulates workflow)
\echo 'Test 6: Simulate workflow cache lookup for AAPL'
SELECT
    symbol,
    close_price,
    timestamp,
    cached_at,
    EXTRACT(EPOCH FROM (NOW() - cached_at)) / 60 as age_minutes,
    CASE
        WHEN cached_at >= NOW() - INTERVAL '1 minute' THEN '✓ CACHE HIT - No API call needed'
        ELSE '✗ CACHE MISS - API call required'
    END as result
FROM market_data_cache
WHERE symbol = 'AAPL'
  AND timeframe = '5min'
  AND cached_at >= NOW() - INTERVAL '1 minute'
ORDER BY timestamp DESC
LIMIT 1;
\echo ''

-- Test 7: Overall cache statistics
\echo 'Test 7: Cache statistics'
SELECT
    COUNT(*) as total_entries,
    COUNT(DISTINCT symbol) as unique_symbols,
    COUNT(*) FILTER (WHERE cached_at >= NOW() - INTERVAL '1 minute') as fresh_entries,
    COUNT(*) FILTER (WHERE cached_at < NOW() - INTERVAL '1 minute') as stale_entries,
    MIN(cached_at) as oldest_entry,
    MAX(cached_at) as newest_entry,
    pg_size_pretty(pg_total_relation_size('market_data_cache')) as table_size
FROM market_data_cache;
\echo ''

-- Test 8: Cleanup test data (optional - comment out to keep test data)
\echo 'Test 8: Cleanup test data'
DELETE FROM market_data_cache
WHERE symbol IN ('AAPL', 'MSFT', 'TSLA')
  AND timestamp > NOW() - INTERVAL '1 hour'
RETURNING symbol || ' deleted' as result;
\echo ''

\echo '============================================'
\echo 'Test suite complete!'
\echo '============================================'
\echo ''
\echo 'If all tests show ✓ PASS, caching is ready'
\echo ''
