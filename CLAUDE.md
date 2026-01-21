# RoboTrader - Claude Context

**Project**: Automated Day Trading System for Wealthsimple
**Architecture**: n8n Workflow Automation + React Dashboard
**Broker Integration**: Wealthsimple via SnapTrade API
**Last Updated**: January 20, 2026

---

## Project Overview

RoboTrader is an automated day trading system designed for Wealthsimple margin accounts. It uses n8n as the workflow automation engine to execute a momentum-based scalping strategy with built-in risk management and Canadian tax compliance.

### Key Components

1. **n8n Workflow Engine** - Core automation orchestrator (5 workflows)
2. **React Dashboard** - Real-time monitoring and control interface
3. **PostgreSQL Database** - Trade history, positions, tax lots, metrics
4. **SnapTrade API** - Wealthsimple account integration (trading & account data)
5. **Finnhub API** - Real-time market data (WebSocket streaming, live quotes)
6. **Alpha Vantage API** - Historical data & backtesting (50+ pre-calculated indicators)

### Trading Strategy

**Multi-Confirmation Momentum Scalper**
- Entry: SMA(10) > SMA(30) + ADX > 20 + RSI crosses 50 from below
- Exit: 3% profit target OR 1.5% stop loss OR trailing stop
- Position Size: 2% of account equity per trade
- Max Concurrent Positions: 3
- Max Daily Loss: 5% of equity

---

## Project Structure

```
RoboTrader/
├── Day Trading Dashboard.html    # Static HTML dashboard prototype
├── implementation_tasks_n8n.md   # Step-by-step implementation guide
├── system_design_v2_n8n.md       # System architecture documentation
├── CLAUDE.md                     # This file
│
├── (TO BE CREATED)
├── docker-compose.yml            # n8n + PostgreSQL containers
├── .env                          # API keys and configuration
├── frontend/                     # React dashboard app
│   ├── src/
│   │   ├── components/
│   │   │   ├── AccountOverview.jsx
│   │   │   ├── PositionsTable.jsx
│   │   │   ├── TradeHistory.jsx
│   │   │   ├── FundSlider.jsx
│   │   │   └── AlertPanel.jsx
│   │   └── App.jsx
│   └── package.json
├── n8n-data/                     # n8n workflow storage
├── postgres-data/                # Database persistence
└── docs/                         # Additional documentation
```

---

## n8n Workflows (5 Total)

### Workflow 1: Market Scanner
- **Trigger**: Every 5 minutes (9:30 AM - 4:00 PM EST, Mon-Fri)
- **Purpose**: Scan watchlist stocks, calculate indicators, generate signals
- **Data Source**: Finnhub API (real-time candles)
- **Output**: Trading signals to Workflow 2

**Technical Indicators Calculated**:
- SMA (10-period fast, 30-period slow)
- RSI (14-period)
- ADX (14-period)
- Bollinger Bands (optional)

### Workflow 2: Trade Execution
- **Trigger**: Webhook from Workflow 1
- **Purpose**: Execute trades with risk checks
- **Checks Before Trade**:
  - Daily loss limit (< 5%)
  - Margin health (> 150%)
  - Concurrent positions (< 3)
  - Superficial loss rule (30-day lookback)
- **Output**: Order placed via SnapTrade API

### Workflow 3: Position Monitor
- **Trigger**: Every 1 minute during market hours
- **Purpose**: Monitor open positions for exit conditions
- **Exit Conditions**:
  - Take Profit: Current price >= entry * 1.03
  - Stop Loss: Current price <= entry * 0.985
  - Trailing Stop: After 1% profit, exit on 0.5% pullback

### Workflow 4: Risk Management
- **Trigger**: Every 5 minutes (continuous)
- **Purpose**: Monitor margin health, enforce limits
- **Alert Levels**:
  - Green: Margin health > 150%
  - Yellow: 125-150% (warning)
  - Red: < 125% (emergency action)

### Workflow 5: Tax Tracking
- **Trigger**: Post-trade (webhook from Workflow 3)
- **Purpose**: Track tax lots, calculate ACB, check superficial loss
- **Canadian Tax Rules**:
  - 30-day superficial loss rule
  - Adjusted Cost Base (ACB) calculation
  - Trader classification (investor vs. day trader)

---

## Database Schema

### Core Tables

```sql
-- Users & Accounts
users (user_id, email, tax_classification, max_daily_loss_limit)
accounts (account_id, user_id, snaptrade_account_id, margin_balance, buying_power, margin_health_score)

-- Trading
trades (trade_id, account_id, symbol, side, quantity, entry_price, exit_price, profit_loss, status, superficial_loss_flag)
positions (position_id, account_id, symbol, quantity, current_price, entry_price, unrealized_pnl)
signals (signal_id, symbol, action, confidence, indicators JSONB)

-- Tax & Compliance
tax_lots (tax_lot_id, account_id, symbol, quantity, average_cost, purchase_date, status)

-- Configuration
algorithm_config (config_id, account_id, sma_fast, sma_slow, rsi_period, profit_target_percent, stop_loss_percent, max_position_value)
watchlist (watchlist_id, account_id, symbol, active)

-- Metrics & Alerts
daily_metrics (metric_id, account_id, trade_date, trades_executed, win_rate, daily_pnl)
alerts (alert_id, account_id, alert_type, severity, message, acknowledged)
```

### Key Indexes
- `idx_trades_account`, `idx_trades_symbol`, `idx_trades_status`
- `idx_positions_account`
- `idx_tax_lots_account`
- `idx_signals_created`

---

## API Integrations

### SnapTrade API (Wealthsimple)
- **Purpose**: Account access, order execution, balance queries
- **Endpoints Used**:
  - `GET /accounts/{id}/balance` - Account balances
  - `POST /accounts/{id}/orders` - Place orders
  - `GET /accounts/{id}/orders/{order_id}` - Order status
- **Auth**: Bearer token (OAuth 2.0)
- **Note**: Does NOT provide reliable real-time market data

### Finnhub API (Real-time Market Data)
- **Purpose**: Real-time quotes, WebSocket streaming, intraday candles
- **Endpoints Used**:
  - `GET /quote` - Real-time stock quote
  - `GET /stock/candle` - Intraday/daily candles (OHLCV)
  - `WebSocket wss://ws.finnhub.io` - Live price streaming
- **Rate Limit**: 60 calls/minute (free tier)
- **Free Tier Includes**: WebSocket streaming for real-time prices

### Alpha Vantage API (Historical & Backtesting)
- **Purpose**: Historical data, pre-calculated indicators, backtesting
- **Endpoints Used**:
  - `TIME_SERIES_DAILY` - Daily historical data (20+ years)
  - `SMA`, `RSI`, `ADX`, `BBANDS` - Pre-calculated indicators
  - `TIME_SERIES_INTRADAY` - Historical intraday data
- **Rate Limit**: 25 calls/day OR 5 calls/minute (free tier)
- **Best For**: Strategy backtesting, historical analysis

### Telegram API (Alerts)
- **Purpose**: Real-time trade notifications
- **Message Types**: Trade executed, trade closed, margin warnings

---

## Environment Variables

```env
# SnapTrade API (Trading & Account)
SNAPTRADE_API_KEY=your_key
SNAPTRADE_SECRET=your_secret
SNAPTRADE_ACCOUNT_ID=your_account_id

# Finnhub API (Real-time Data)
FINNHUB_API_KEY=your_key
FINNHUB_WEBSOCKET_ENABLED=true

# Alpha Vantage API (Historical & Backtesting)
ALPHA_VANTAGE_API_KEY=your_key

# Database
DB_PASSWORD=secure_password

# n8n
N8N_USER=admin
N8N_PASSWORD=secure_password
N8N_ENCRYPTION_KEY=min_32_char_random_key
WEBHOOK_URL=http://localhost:5678/

# Trading Parameters
MAX_DAILY_LOSS_PERCENT=0.05
MAX_CONCURRENT_POSITIONS=3
POSITION_SIZE_PERCENT=0.02
PROFIT_TARGET_PERCENT=0.03
STOP_LOSS_PERCENT=0.015

# Alerts
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_CHAT_ID=your_chat_id
ALERT_EMAIL=your@email.com
```

---

## Dashboard Features

### Current HTML Prototype (`Day Trading Dashboard.html`)

The static HTML prototype demonstrates:

1. **Account Overview**
   - Total Equity display
   - Buying Power (margin)
   - Margin Health (visual bar)
   - Cash Available

2. **Today's Summary**
   - Trades executed / max positions
   - Win rate percentage
   - Daily P&L (dollar and percent)
   - Max drawdown

3. **Live Positions Table**
   - Symbol, Quantity, Entry/Current Price
   - Unrealized P&L
   - Close button per position

4. **Fund Management Slider**
   - Adjustable trading capital ($500 - $5,000)
   - Slider + input synchronization

5. **Recent Trades History**
   - Last 10 trades with P&L

6. **Algorithm Status**
   - Strategy name
   - Running/Paused status
   - Last signal
   - Watchlist size

7. **Alerts Panel**
   - Margin warnings
   - Tax notices (superficial loss)
   - System status

### React Dashboard (To Be Built)
- Real-time WebSocket updates from n8n
- Interactive fund allocation control
- Historical performance charts (Recharts)
- Material UI components

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [x] Design system architecture
- [x] Create HTML dashboard prototype
- [ ] Install Docker + docker-compose
- [ ] Deploy n8n and PostgreSQL
- [ ] Configure API credentials
- [ ] Create database schema

### Phase 2: Core Workflows (Weeks 2-3)
- [ ] Build Workflow 1: Market Scanner
- [ ] Build Workflow 2: Trade Execution
- [ ] Build Workflow 3: Position Monitor
- [ ] Paper trading tests

### Phase 3: Risk & Tax (Week 4)
- [ ] Build Workflow 4: Risk Management
- [ ] Build Workflow 5: Tax Tracking
- [ ] Margin call scenario tests

### Phase 4: Dashboard (Week 5)
- [ ] Initialize React app
- [ ] Build dashboard components
- [ ] Connect to n8n webhooks
- [ ] WebSocket integration

### Phase 5: Testing (Week 6)
- [ ] 2-week paper trading period
- [ ] Backtest algorithm
- [ ] Stress test margin scenarios

### Phase 6: Go Live (Week 7)
- [ ] Production deployment
- [ ] Start with $500-$1000 capital
- [ ] Close monitoring first week

---

## Key Design Decisions

### 1. n8n vs Custom Node.js Backend
- **Chosen**: n8n workflow automation
- **Why**:
  - 80% faster development (4-6 weeks vs 10-12 weeks)
  - Visual debugging and workflow monitoring
  - Built-in retry logic and error handling
  - Zero maintenance Docker deployment
  - Pre-built nodes for APIs, databases, alerts

### 2. SnapTrade API vs Direct Wealthsimple
- **Chosen**: SnapTrade API
- **Why**: Wealthsimple has no official public API; SnapTrade provides authorized broker integration

### 3. Dual Market Data Provider Architecture
- **Chosen**: Finnhub (real-time) + Alpha Vantage (historical)
- **Why Finnhub for Real-time**:
  - WebSocket streaming for instant price updates
  - 60 API calls/minute (vs 5 for Alpha Vantage)
  - Better for position monitoring and stop-loss execution
- **Why Alpha Vantage for Historical**:
  - 50+ pre-calculated technical indicators
  - 20+ years of historical data
  - Best for backtesting and strategy optimization
- **Why Not Just One Provider**:
  - SnapTrade recommends using dedicated market data providers
  - Finnhub lacks pre-calculated indicators for backtesting
  - Alpha Vantage rate limits are too restrictive for real-time

### 4. PostgreSQL vs Other Databases
- **Chosen**: PostgreSQL
- **Why**:
  - Native n8n support
  - JSONB for flexible indicator storage
  - Strong financial data handling
  - Docker-ready

### 5. Margin Account Focus
- **Why Margin**: 2x buying power for larger position sizes
- **Risk Controls**: Automated margin health monitoring with emergency liquidation

---

## Trading Parameters

| Parameter | Default | Range | Description |
|-----------|---------|-------|-------------|
| SMA Fast | 10 | 5-20 | Fast moving average period |
| SMA Slow | 30 | 20-50 | Slow moving average period |
| RSI Period | 14 | 7-21 | RSI calculation period |
| RSI Overbought | 70 | 60-80 | RSI overbought threshold |
| RSI Oversold | 30 | 20-40 | RSI oversold threshold |
| ADX Threshold | 20 | 15-30 | Minimum ADX for trend strength |
| Profit Target | 3.0% | 1-5% | Take profit percentage |
| Stop Loss | 1.5% | 1-3% | Stop loss percentage |
| Position Size | 2.0% | 1-5% | Account risk per trade |
| Max Positions | 3 | 1-5 | Concurrent open positions |
| Max Daily Loss | 5.0% | 3-10% | Daily loss limit |

---

## Success Metrics

| Metric | Target | Timeframe |
|--------|--------|-----------|
| Win Rate | 55-65% | Monthly |
| Monthly Return | 2-5% | Month 3+ |
| Max Drawdown | < 15% | Rolling |
| Daily Max Loss | < 5% | Daily |
| Sharpe Ratio | > 1.0 | Monthly |
| Workflow Uptime | > 99% | Monthly |

---

## Common Commands

```bash
# Start n8n + PostgreSQL
docker-compose up -d

# View logs
docker-compose logs -f

# Connect to database
docker exec -it trading_postgres psql -U n8n -d wealthsimple_trader

# Stop containers
docker-compose down

# Backup database
docker exec trading_postgres pg_dump -U n8n wealthsimple_trader > backup.sql
```

---

## Troubleshooting

### Workflow Not Triggering
- Check schedule trigger timezone (America/Toronto)
- Verify workflow is activated (toggle on)
- Check n8n logs for errors

### SnapTrade API Errors
- Verify API credentials in n8n credentials
- Check rate limits
- Confirm account ID is correct

### Database Connection Issues
- Ensure postgres container is running
- Verify database credentials in n8n
- Check network connectivity (both on trading_network)

### Margin Alerts Firing
- Check account balance on Wealthsimple
- Reduce position sizes
- Consider adding funds

---

## Security Notes

- **Never commit .env file** - Contains API secrets
- **Use n8n basic auth** - Protect workflow access
- **SSL for production** - Enable TLS for all connections
- **Regular backups** - Daily database snapshots
- **Audit logs** - All trades logged with timestamps

---

## Future Enhancements

1. **Additional Strategies**
   - Mean reversion algorithm
   - Breakout strategy
   - Sector rotation

2. **Enhanced Analytics**
   - Equity curve visualization
   - Trade journal with notes
   - Performance attribution

3. **Mobile App**
   - React Native companion app
   - Push notifications
   - Quick position close

4. **Machine Learning**
   - Signal confidence improvement
   - Pattern recognition
   - Dynamic parameter optimization

---

## Quick Reference

### Start Development
```bash
cd ~/wealthsimple-trader
docker-compose up -d
# Access n8n at http://localhost:5678
```

### Market Hours (EST)
- Open: 9:30 AM
- Close: 4:00 PM
- Days: Monday - Friday

### Key Files
1. `system_design_v2_n8n.md` - Full architecture details
2. `implementation_tasks_n8n.md` - Step-by-step setup
3. `Day Trading Dashboard.html` - UI prototype

---

**Project Status**: Design Phase Complete | Implementation Ready

**Next Steps**:
1. Create Docker environment
2. Deploy n8n + PostgreSQL
3. Build Workflow 1 (Market Scanner)
4. Paper trade for 2 weeks
