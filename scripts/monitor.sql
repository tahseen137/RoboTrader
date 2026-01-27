-- ============================================================================
-- ROBOTRADER MONITORING QUERIES
-- ============================================================================
-- Use these queries to monitor system health and performance
-- Run: docker exec trading_postgres psql -U n8n -d wealthsimple_trader -f scripts/monitor.sql
-- ============================================================================

\echo ''
\echo '============================================'
\echo 'RoboTrader System Health Report'
\echo '============================================'
\echo ''

-- Account Status
\echo '1. Account Status'
SELECT
    current_equity,
    buying_power,
    margin_health_score,
    CASE
        WHEN margin_health_score > 150 THEN '🟢 Healthy'
        WHEN margin_health_score > 125 THEN '🟡 Warning'
        ELSE '🔴 Critical'
    END as status,
    last_synced_at
FROM accounts
WHERE snaptrade_account_id = 'test_account_123';
\echo ''

-- Today's Trading Summary
\echo '2. Today Trading Performance'
SELECT
    COUNT(*) as total_trades,
    COUNT(*) FILTER (WHERE profit_loss > 0) as winning_trades,
    COUNT(*) FILTER (WHERE profit_loss < 0) as losing_trades,
    ROUND(100.0 * COUNT(*) FILTER (WHERE profit_loss > 0) / NULLIF(COUNT(*), 0), 2) as win_rate_percent,
    COALESCE(SUM(profit_loss), 0) as total_pnl,
    ROUND(COALESCE(AVG(profit_loss), 0), 2) as avg_pnl_per_trade,
    MAX(profit_loss) as best_trade,
    MIN(profit_loss) as worst_trade
FROM trades
WHERE DATE(entry_time) = CURRENT_DATE
  AND status = 'closed';
\echo ''

-- Open Positions
\echo '3. Open Positions'
SELECT
    symbol,
    quantity,
    entry_price,
    current_price,
    unrealized_pnl,
    ROUND(unrealized_pnl_percent, 2) as pnl_percent,
    CASE
        WHEN unrealized_pnl > 0 THEN '🟢 Profit'
        ELSE '🔴 Loss'
    END as status
FROM positions
ORDER BY unrealized_pnl DESC;
\echo ''

-- Cache Performance
\echo '4. Market Data Cache Performance'
SELECT
    COUNT(*) as total_entries,
    COUNT(DISTINCT symbol) as unique_symbols,
    COUNT(*) FILTER (WHERE cached_at > NOW() - INTERVAL '1 minute') as fresh_entries,
    ROUND(100.0 * COUNT(*) FILTER (WHERE cached_at > NOW() - INTERVAL '1 minute') / NULLIF(COUNT(*), 0), 2) as fresh_percent,
    MAX(cached_at) as last_cache_update,
    pg_size_pretty(pg_total_relation_size('market_data_cache')) as table_size
FROM market_data_cache
WHERE cached_at > NOW() - INTERVAL '1 day';
\echo ''

-- Recent Signals
\echo '5. Recent Trading Signals (Last Hour)'
SELECT
    symbol,
    action,
    ROUND(confidence, 2) as confidence,
    entry_price,
    TO_CHAR(created_at, 'HH24:MI:SS') as time
FROM signals
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 10;
\echo ''

-- Active Alerts
\echo '6. Active Alerts'
SELECT
    alert_type,
    severity,
    message,
    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') as alert_time,
    CASE
        WHEN acknowledged THEN '✓ Ack'
        ELSE '⚠ Pending'
    END as status
FROM alerts
WHERE acknowledged = false
ORDER BY created_at DESC
LIMIT 5;
\echo ''

-- Workflow Statistics (Last 24h)
\echo '7. System Activity (Last 24h)'
SELECT
    COUNT(*) FILTER (WHERE action = 'BUY') as buy_signals,
    COUNT(*) FILTER (WHERE action = 'SELL') as sell_signals,
    COUNT(*) FILTER (WHERE action = 'HOLD') as hold_signals,
    COUNT(DISTINCT symbol) as symbols_scanned
FROM signals
WHERE created_at > NOW() - INTERVAL '24 hours';
\echo ''

-- Risk Metrics
\echo '8. Risk Metrics'
SELECT
    COALESCE(SUM(profit_loss), 0) as daily_pnl,
    ROUND(100.0 * COALESCE(SUM(profit_loss), 0) / NULLIF(a.current_equity, 0), 2) as daily_return_percent,
    a.margin_health_score,
    (SELECT max_daily_loss_limit FROM users WHERE email = 'trader@example.com') as loss_limit,
    CASE
        WHEN ABS(COALESCE(SUM(profit_loss), 0)) < (SELECT max_daily_loss_limit FROM users WHERE email = 'trader@example.com')
        THEN '🟢 Within Limit'
        ELSE '🔴 Limit Breached'
    END as status
FROM trades t
CROSS JOIN accounts a
WHERE DATE(t.entry_time) = CURRENT_DATE
  AND a.snaptrade_account_id = 'test_account_123'
GROUP BY a.current_equity, a.margin_health_score;
\echo ''

-- Database Health
\echo '9. Database Health'
SELECT
    pg_size_pretty(pg_database_size('wealthsimple_trader')) as db_size,
    (SELECT COUNT(*) FROM trades) as total_trades,
    (SELECT COUNT(*) FROM positions) as open_positions,
    (SELECT COUNT(*) FROM signals) as total_signals,
    (SELECT COUNT(*) FROM alerts WHERE acknowledged = false) as pending_alerts;
\echo ''

\echo '============================================'
\echo 'Report Complete'
\echo '============================================'
\echo ''
