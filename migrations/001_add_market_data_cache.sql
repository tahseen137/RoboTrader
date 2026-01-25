-- ============================================================================
-- MIGRATION: Add Market Data Cache Table
-- ============================================================================
-- Purpose: Implement caching to solve Alpha Vantage rate limit issues
-- Date: 2026-01-24
-- Author: RoboTrader Team
-- ============================================================================

\echo 'Starting migration: Add market_data_cache table...'

-- ============================================================================
-- CREATE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS market_data_cache (
    cache_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol VARCHAR(10) NOT NULL,
    timeframe VARCHAR(20) NOT NULL,        -- '5min', '1min', '15min', 'daily'
    open_price DECIMAL(10,4),
    high_price DECIMAL(10,4),
    low_price DECIMAL(10,4),
    close_price DECIMAL(10,4),
    volume BIGINT,
    timestamp TIMESTAMP NOT NULL,          -- Market data timestamp (e.g., "2026-01-24 10:00:00")
    cached_at TIMESTAMP DEFAULT NOW(),     -- When we cached this data
    UNIQUE(symbol, timeframe, timestamp)   -- Prevent duplicate cache entries
);

\echo 'Table created: market_data_cache'

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

-- Index for fast lookup by symbol and time
CREATE INDEX IF NOT EXISTS idx_market_data_symbol_time
ON market_data_cache(symbol, timestamp);

-- Index for cache cleanup queries
CREATE INDEX IF NOT EXISTS idx_market_data_cached
ON market_data_cache(cached_at);

-- Index for timeframe filtering
CREATE INDEX IF NOT EXISTS idx_market_data_timeframe
ON market_data_cache(timeframe);

-- Composite index for the most common query pattern
CREATE INDEX IF NOT EXISTS idx_market_data_lookup
ON market_data_cache(symbol, timeframe, cached_at DESC);

\echo 'Indexes created'

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show table structure
\echo ''
\echo '============================================'
\echo 'Table structure:'
\echo '============================================'
\d market_data_cache

-- Show indexes
\echo ''
\echo '============================================'
\echo 'Indexes:'
\echo '============================================'
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'market_data_cache'
ORDER BY indexname;

-- Initial row count (should be 0)
\echo ''
\echo '============================================'
\echo 'Initial row count:'
\echo '============================================'
SELECT COUNT(*) as cache_rows FROM market_data_cache;

\echo ''
\echo '============================================'
\echo 'Migration complete!'
\echo '============================================'
\echo ''
\echo 'Next steps:'
\echo '1. Import workflow: n8n-workflows/1-market-scanner-cached.json'
\echo '2. Deactivate old Market Scanner workflow'
\echo '3. Activate new cached workflow'
\echo '4. Monitor cache performance with queries in CACHING_SOLUTION.md'
\echo ''

-- ============================================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- ============================================================================
-- To rollback this migration, run:
-- DROP TABLE IF EXISTS market_data_cache CASCADE;
-- DROP INDEX IF EXISTS idx_market_data_symbol_time;
-- DROP INDEX IF EXISTS idx_market_data_cached;
-- DROP INDEX IF EXISTS idx_market_data_timeframe;
-- DROP INDEX IF EXISTS idx_market_data_lookup;
