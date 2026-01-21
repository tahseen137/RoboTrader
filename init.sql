-- ============================================================================
-- ROBOTRADER DATABASE INITIALIZATION SCRIPT
-- ============================================================================
-- PostgreSQL schema for automated day trading system
--
-- This script runs automatically when the Docker container starts for the
-- first time. It creates all tables, indexes, and seed data.
--
-- Tables:
--   - users: User accounts
--   - accounts: Wealthsimple account info
--   - trades: Trade history
--   - positions: Current open positions
--   - tax_lots: Tax lot tracking (Canadian rules)
--   - daily_metrics: Performance metrics
--   - alerts: System alerts
--   - algorithm_config: Trading parameters
--   - watchlist: Stocks to monitor
--   - signals: Trading signals log
--
-- ============================================================================

\echo 'Starting RoboTrader database initialization...'

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\echo 'Extensions created'

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    account_type VARCHAR(20) DEFAULT 'trader',
    created_at TIMESTAMP DEFAULT NOW(),
    tax_classification VARCHAR(20) DEFAULT 'investor',
    max_daily_loss_limit DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'active'
);

\echo 'Table created: users'

-- Accounts Table
CREATE TABLE IF NOT EXISTS accounts (
    account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    snaptrade_account_id VARCHAR(255),
    margin_balance DECIMAL(15,2),
    buying_power DECIMAL(15,2),
    cash_available DECIMAL(15,2),
    margin_health_score DECIMAL(5,2),
    last_synced_at TIMESTAMP,
    current_equity DECIMAL(15,2)
);

\echo 'Table created: accounts'

-- Trades Table
CREATE TABLE IF NOT EXISTS trades (
    trade_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(account_id) ON DELETE CASCADE,
    symbol VARCHAR(10) NOT NULL,
    side VARCHAR(10) NOT NULL,
    quantity INT NOT NULL,
    entry_price DECIMAL(10,2),
    exit_price DECIMAL(10,2),
    entry_time TIMESTAMP,
    exit_time TIMESTAMP,
    profit_loss DECIMAL(10,2),
    profit_loss_percent DECIMAL(5,2),
    status VARCHAR(20) NOT NULL,
    reason_closed VARCHAR(50),
    stop_loss DECIMAL(10,2),
    profit_target DECIMAL(10,2),
    commission DECIMAL(10,2) DEFAULT 0,
    tax_lot_id UUID,
    superficial_loss_flag BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

\echo 'Table created: trades'

-- Tax Lots Table
CREATE TABLE IF NOT EXISTS tax_lots (
    tax_lot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(account_id) ON DELETE CASCADE,
    symbol VARCHAR(10) NOT NULL,
    quantity INT NOT NULL,
    average_cost DECIMAL(10,2),
    purchase_date DATE,
    status VARCHAR(20) DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT NOW()
);

\echo 'Table created: tax_lots'

-- Positions Table
CREATE TABLE IF NOT EXISTS positions (
    position_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(account_id) ON DELETE CASCADE,
    symbol VARCHAR(10) NOT NULL,
    quantity INT NOT NULL,
    current_price DECIMAL(10,2),
    entry_price DECIMAL(10,2),
    unrealized_pnl DECIMAL(10,2),
    unrealized_pnl_percent DECIMAL(5,2),
    margin_requirement DECIMAL(10,2),
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

\echo 'Table created: positions'

-- Daily Metrics Table
CREATE TABLE IF NOT EXISTS daily_metrics (
    metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(account_id) ON DELETE CASCADE,
    trade_date DATE NOT NULL,
    trades_executed INT DEFAULT 0,
    winning_trades INT DEFAULT 0,
    losing_trades INT DEFAULT 0,
    win_rate DECIMAL(5,2),
    daily_pnl DECIMAL(10,2),
    daily_return_percent DECIMAL(5,2),
    margin_usage_percent DECIMAL(5,2),
    max_drawdown_day DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(account_id, trade_date)
);

\echo 'Table created: daily_metrics'

-- Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(account_id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    message TEXT,
    acknowledged BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

\echo 'Table created: alerts'

-- Algorithm Config Table
CREATE TABLE IF NOT EXISTS algorithm_config (
    config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(account_id) ON DELETE CASCADE,
    algorithm_name VARCHAR(100),
    sma_fast INT DEFAULT 10,
    sma_slow INT DEFAULT 30,
    rsi_period INT DEFAULT 14,
    rsi_overbought INT DEFAULT 70,
    rsi_oversold INT DEFAULT 30,
    adx_threshold INT DEFAULT 20,
    profit_target_percent DECIMAL(5,2) DEFAULT 3.00,
    stop_loss_percent DECIMAL(5,2) DEFAULT 1.50,
    position_size_percent DECIMAL(5,2) DEFAULT 2.00,
    max_position_value DECIMAL(15,2),
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

\echo 'Table created: algorithm_config'

-- Watchlist Table
CREATE TABLE IF NOT EXISTS watchlist (
    watchlist_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(account_id) ON DELETE CASCADE,
    symbol VARCHAR(10) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(account_id, symbol)
);

\echo 'Table created: watchlist'

-- Signals Table (for logging)
CREATE TABLE IF NOT EXISTS signals (
    signal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol VARCHAR(10) NOT NULL,
    action VARCHAR(10) NOT NULL,
    confidence DECIMAL(5,2),
    entry_price DECIMAL(10,2),
    indicators JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

\echo 'Table created: signals'

-- ============================================================================
-- INDEXES (Performance Optimization)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_trades_account ON trades(account_id);
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
CREATE INDEX IF NOT EXISTS idx_trades_date ON trades(entry_time);
CREATE INDEX IF NOT EXISTS idx_trades_exit_time ON trades(exit_time);

CREATE INDEX IF NOT EXISTS idx_positions_account ON positions(account_id);
CREATE INDEX IF NOT EXISTS idx_positions_symbol ON positions(symbol);

CREATE INDEX IF NOT EXISTS idx_tax_lots_account ON tax_lots(account_id);
CREATE INDEX IF NOT EXISTS idx_tax_lots_symbol ON tax_lots(symbol);
CREATE INDEX IF NOT EXISTS idx_tax_lots_status ON tax_lots(status);

CREATE INDEX IF NOT EXISTS idx_watchlist_account ON watchlist(account_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_active ON watchlist(active);

CREATE INDEX IF NOT EXISTS idx_signals_created ON signals(created_at);
CREATE INDEX IF NOT EXISTS idx_signals_symbol ON signals(symbol);

CREATE INDEX IF NOT EXISTS idx_alerts_account ON alerts(account_id);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at);

CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_metrics(trade_date);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_account_date ON daily_metrics(account_id, trade_date);

\echo 'Indexes created'

-- ============================================================================
-- SEED DATA (Initial Test Data)
-- ============================================================================

-- Insert test user
INSERT INTO users (email, tax_classification, max_daily_loss_limit, status)
VALUES ('trader@example.com', 'day_trader', 500.00, 'active')
ON CONFLICT (email) DO NOTHING;

\echo 'Seed user created'

-- Insert test account
INSERT INTO accounts (
    user_id,
    snaptrade_account_id,
    margin_balance,
    buying_power,
    cash_available,
    current_equity,
    margin_health_score
)
SELECT
    user_id,
    'test_account_123',
    10000.00,
    20000.00,
    5000.00,
    10000.00,
    200.00
FROM users
WHERE email = 'trader@example.com'
ON CONFLICT DO NOTHING;

\echo 'Seed account created'

-- Insert algorithm config
INSERT INTO algorithm_config (
    account_id,
    algorithm_name,
    max_position_value
)
SELECT
    account_id,
    'Multi-Confirmation Momentum Scalper',
    2500.00
FROM accounts
WHERE snaptrade_account_id = 'test_account_123'
ON CONFLICT DO NOTHING;

\echo 'Algorithm config created'

-- Insert watchlist symbols
INSERT INTO watchlist (account_id, symbol)
SELECT
    account_id,
    symbol
FROM accounts,
UNNEST(ARRAY['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'AMD', 'META', 'AMZN']) AS symbol
WHERE snaptrade_account_id = 'test_account_123'
ON CONFLICT (account_id, symbol) DO NOTHING;

\echo 'Watchlist symbols created'

-- ============================================================================
-- VERIFICATION
-- ============================================================================

\echo ''
\echo '============================================'
\echo 'Database initialization complete!'
\echo '============================================'
\echo ''

-- Display statistics
SELECT
    'users' as table_name,
    COUNT(*) as row_count
FROM users
UNION ALL
SELECT
    'accounts',
    COUNT(*)
FROM accounts
UNION ALL
SELECT
    'algorithm_config',
    COUNT(*)
FROM algorithm_config
UNION ALL
SELECT
    'watchlist',
    COUNT(*)
FROM watchlist;

\echo ''
\echo 'Watchlist symbols:'
SELECT symbol FROM watchlist ORDER BY symbol;

\echo ''
\echo '============================================'
\echo 'RoboTrader database is ready!'
\echo 'Access with: psql -U n8n -d wealthsimple_trader'
\echo '============================================'
