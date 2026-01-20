# AUTOMATED DAY TRADING SYSTEM - UPDATED DESIGN WITH N8N
## Version 2.0 - n8n Workflow Automation Architecture

## EXECUTIVE SUMMARY

This document outlines a complete automated day trading system with **n8n workflow automation**, Wealthsimple margin account integration via SnapTrade, intelligent algorithm execution, tax-aware trading, and real-time monitoring dashboard.

**Key Technology Decisions:**
- **n8n** as the core automation orchestrator (replaces custom Node.js backend)
- Wealthsimple integration via SnapTrade API (no native API available)
- PostgreSQL for data persistence
- React dashboard for monitoring and control
- Canadian tax compliance (capital gains vs. business income)
- Margin account risk management

---

## 1. UPDATED SYSTEM ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                  AUTOMATED TRADING SYSTEM v2.0                   │
│                     (n8n-Powered Architecture)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐         ┌──────────────────┐              │
│  │  React Dashboard │◄────────┤   n8n Webhooks   │              │
│  │  - Live Returns  │         │   - Real-time    │              │
│  │  - Fund Control  │         │   - Monitoring   │              │
│  │  - Performance   │         │   - Alerts       │              │
│  └──────────────────┘         └──────────────────┘              │
│           ▲                            ▲                          │
│           │                            │                          │
│           └────────────────────────────┘                          │
│                      │                                            │
│          ┌───────────▼──────────────┐                            │
│          │   n8n WORKFLOW ENGINE    │                            │
│          │  ╔════════════════════╗  │                            │
│          │  ║ Workflow 1:        ║  │                            │
│          │  ║ Market Scanner     ║  │                            │
│          │  ║ (Every 5 minutes)  ║  │                            │
│          │  ╚════════════════════╝  │                            │
│          │  ╔════════════════════╗  │                            │
│          │  ║ Workflow 2:        ║  │                            │
│          │  ║ Trade Execution    ║  │                            │
│          │  ║ (On signal trigger)║  │                            │
│          │  ╚════════════════════╝  │                            │
│          │  ╔════════════════════╗  │                            │
│          │  ║ Workflow 3:        ║  │                            │
│          │  ║ Position Monitor   ║  │                            │
│          │  ║ (Every 1 minute)   ║  │                            │
│          │  ╚════════════════════╝  │                            │
│          │  ╔════════════════════╗  │                            │
│          │  ║ Workflow 4:        ║  │                            │
│          │  ║ Risk Management    ║  │                            │
│          │  ║ (Continuous)       ║  │                            │
│          │  ╚════════════════════╝  │                            │
│          │  ╔════════════════════╗  │                            │
│          │  ║ Workflow 5:        ║  │                            │
│          │  ║ Tax Tracking       ║  │                            │
│          │  ║ (Post-trade)       ║  │                            │
│          │  ╚════════════════════╝  │                            │
│          └───────────────┬──────────┘                            │
│                          │                                        │
│      ┌───────────────────┼───────────────┐                       │
│      │                   │               │                       │
│  ┌───▼────┐   ┌──────────▼───┐   ┌─────▼──────┐               │
│  │Alpha   │   │  SnapTrade   │   │PostgreSQL  │               │
│  │Vantage │   │  API Client  │   │  Database  │               │
│  │(Market │   │(Wealthsimple)│   │            │               │
│  │ Data)  │   └──────────────┘   └────────────┘               │
│  └────────┘                                                      │
│                                                                   │
│      ┌───────────────────▼──────────────┐                       │
│      │   Wealthsimple Margin Account    │                       │
│      │  - Fund Storage                  │                       │
│      │  - Position Management           │                       │
│      │  - Margin Monitoring             │                       │
│      └──────────────────────────────────┘                       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. N8N WORKFLOW ARCHITECTURE

### 2.1 Workflow 1: Market Scanner (Scheduled: Every 5 minutes)

**Purpose:** Scan watchlist stocks, calculate technical indicators, generate trading signals

**n8n Nodes:**
1. **Schedule Trigger** - Executes every 5 minutes during market hours (9:30 AM - 4:00 PM EST)
2. **PostgreSQL Node** - Fetch watchlist symbols and algorithm config
3. **HTTP Request Node** - Call Alpha Vantage API for each symbol (5-minute candles)
4. **Code Node (JavaScript)** - Calculate technical indicators:
   - SMA (10, 30)
   - RSI (14)
   - ADX (14)
   - Bollinger Bands
5. **IF Node** - Check if signal conditions met:
   - SMA(10) > SMA(30) AND
   - ADX > 20 AND
   - RSI crosses 50 from below
6. **Function Node** - Calculate confidence score
7. **Webhook Node** - Trigger Workflow 2 (Trade Execution) if signal found
8. **PostgreSQL Node** - Log signal generation

**Environment Variables:**
- `ALPHA_VANTAGE_API_KEY`
- `MARKET_HOURS_START=09:30`
- `MARKET_HOURS_END=16:00`
- `WATCHLIST_TABLE=watchlist`

---

### 2.2 Workflow 2: Trade Execution (Webhook Trigger)

**Purpose:** Execute trades from validated signals with risk checks

**n8n Nodes:**
1. **Webhook Node** - Receives signal from Workflow 1
2. **PostgreSQL Node** - Check daily loss limit
3. **IF Node** - Halt if daily loss > 5% of account equity
4. **HTTP Request Node** - Get account balance from SnapTrade
5. **Code Node** - Calculate margin health score
6. **IF Node** - Check margin health (must be > 150%)
7. **PostgreSQL Node** - Check concurrent positions (max 3)
8. **Code Node** - Calculate position size (2% account risk)
9. **PostgreSQL Node** - Check superficial loss rule (30-day lookback)
10. **HTTP Request Node** - Place BUY order via SnapTrade API
11. **Wait Node** - Wait 3 seconds for order confirmation
12. **HTTP Request Node** - Get order status from SnapTrade
13. **PostgreSQL Node** - Log trade with entry price, stop loss, profit target
14. **PostgreSQL Node** - Create tax lot entry
15. **Telegram Node** - Send trade notification
16. **Set Node** - Store trade_id for monitoring

**Error Handling:**
- If order fails → Log error → Send alert
- If margin insufficient → Halt execution
- If superficial loss detected → Block trade → Warn user

---

### 2.3 Workflow 3: Position Monitor (Scheduled: Every 1 minute)

**Purpose:** Monitor open positions for exit conditions

**n8n Nodes:**
1. **Schedule Trigger** - Every 1 minute during market hours
2. **PostgreSQL Node** - Fetch all open positions
3. **Loop Node** - Iterate through each position
4. **HTTP Request Node** - Get current price from Alpha Vantage (latest quote)
5. **Code Node** - Calculate unrealized P&L
6. **IF Node** - Check exit conditions:
   - **Take Profit:** Current price >= profit target
   - **Stop Loss:** Current price <= stop loss
   - **Trailing Stop:** Profit > 1% AND pullback 0.5%
7. **HTTP Request Node** - Place SELL order via SnapTrade (if exit condition met)
8. **PostgreSQL Node** - Update trade record with exit data
9. **Code Node** - Calculate realized P&L
10. **PostgreSQL Node** - Update daily metrics
11. **PostgreSQL Node** - Close tax lot
12. **Telegram Node** - Send exit notification

**Trailing Stop Logic (Code Node):**
```javascript
const entryPrice = $json.entry_price;
const currentPrice = $json.current_price;
const profitPercent = ((currentPrice - entryPrice) / entryPrice) * 100;

if (profitPercent > 1) {
  const trailingStopPrice = entryPrice * 1.005; // Lock in 0.5% profit
  if (currentPrice <= trailingStopPrice) {
    return { shouldExit: true, reason: 'TRAILING_STOP' };
  }
}
return { shouldExit: false };
```

---

### 2.4 Workflow 4: Risk Management (Scheduled: Every 5 minutes)

**Purpose:** Monitor margin health and enforce risk limits

**n8n Nodes:**
1. **Schedule Trigger** - Every 5 minutes (continuous monitoring)
2. **PostgreSQL Node** - Get account details
3. **HTTP Request Node** - Fetch real-time margin balance from SnapTrade
4. **Code Node** - Calculate margin health score:
   ```javascript
   const marginHealth = (buyingPower / marginBalance) * 100;
   return { score: Math.min(100, Math.max(0, marginHealth)) };
   ```
5. **Switch Node** - Route based on margin health:
   - **< 100%:** Emergency liquidation
   - **< 125%:** Close all positions
   - **< 150%:** Reduce positions by 50%
   - **> 150%:** Green status (no action)
6. **IF Node** - Check daily loss limit (5% max)
7. **HTTP Request Node** - Emergency close positions via SnapTrade (if critical)
8. **PostgreSQL Node** - Update account status
9. **Telegram Node** - Send margin warning/alert
10. **Email Node** - Send critical email alert

**Alert Levels:**
- 🟢 Green: Margin health > 150%
- 🟡 Yellow: Margin health 125-150% (warning)
- 🔴 Red: Margin health < 125% (critical action required)

---

### 2.5 Workflow 5: Tax Tracking (Triggered on Trade Close)

**Purpose:** Track tax lots, check superficial loss rule, calculate ACB

**n8n Nodes:**
1. **Webhook Node** - Triggered when Workflow 3 closes a trade
2. **PostgreSQL Node** - Fetch closed trade details
3. **Code Node** - Calculate realized gain/loss
4. **PostgreSQL Node** - Update tax_lots table (close matching lot)
5. **Code Node** - Calculate Adjusted Cost Base (ACB):
   ```javascript
   const totalCost = (quantity1 * price1) + (quantity2 * price2);
   const totalQuantity = quantity1 + quantity2;
   const acb = totalCost / totalQuantity;
   return { acb };
   ```
6. **PostgreSQL Node** - Check superficial loss rule (30-day window)
7. **IF Node** - If loss AND repurchase within 30 days:
   - Flag as superficial loss
   - Add loss to ACB of new purchase
8. **PostgreSQL Node** - Update yearly tax summary
9. **Code Node** - Classify trader (investor vs. day trader):
   ```javascript
   const tradesPerDay = totalTrades / 252;
   if (tradesPerDay >= 1.0) return 'DAY_TRADER';
   else if (tradesPerDay >= 0.5) return 'ACTIVE_TRADER';
   else return 'INVESTOR';
   ```
10. **PostgreSQL Node** - Store classification for year-end reporting

---

## 3. N8N INSTALLATION & SETUP

### 3.1 Docker Installation

```bash
# Create project directory
mkdir wealthsimple-trader && cd wealthsimple-trader

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: n8n
      POSTGRES_PASSWORD: your_password
      POSTGRES_DB: wealthsimple_trader
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your_password
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=wealthsimple_trader
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=your_password
      - N8N_ENCRYPTION_KEY=your_encryption_key
      - WEBHOOK_URL=https://your-domain.com/
      - GENERIC_TIMEZONE=America/Toronto
      - N8N_LOG_LEVEL=info
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      - postgres

volumes:
  postgres_data:
  n8n_data:
EOF

# Start n8n
docker-compose up -d

# Access n8n at http://localhost:5678
```

### 3.2 Environment Variables Configuration

Create `.env` file in n8n:

```env
# SnapTrade API
SNAPTRADE_API_KEY=your_key_here
SNAPTRADE_SECRET=your_secret_here
SNAPTRADE_BASE_URL=https://api.snaptrade.com
SNAPTRADE_ACCOUNT_ID=your_account_id

# Alpha Vantage (Market Data)
ALPHA_VANTAGE_API_KEY=your_key_here
ALPHA_VANTAGE_BASE_URL=https://www.alphavantage.co/query

# Database
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=wealthsimple_trader
DATABASE_USER=n8n
DATABASE_PASSWORD=your_password

# Trading Parameters
MAX_DAILY_LOSS_PERCENT=0.05
MAX_CONCURRENT_POSITIONS=3
POSITION_SIZE_PERCENT=0.02
PROFIT_TARGET_PERCENT=0.03
STOP_LOSS_PERCENT=0.015

# Alerts
TELEGRAM_BOT_TOKEN=your_telegram_token
TELEGRAM_CHAT_ID=your_chat_id
ALERT_EMAIL=your_email@example.com

# Market Hours
MARKET_HOURS_START=09:30
MARKET_HOURS_END=16:00
TIMEZONE=America/Toronto
```

---

## 4. DATABASE SCHEMA (UNCHANGED)

[Same PostgreSQL schema as original design - tables: users, accounts, trades, tax_lots, positions, daily_metrics, alerts, algorithm_config]

---

## 5. ALGORITHM IMPLEMENTATION IN N8N

### 5.1 Technical Indicator Calculation (Code Node)

```javascript
// n8n Code Node: Calculate Technical Indicators
const candles = $json.candles; // From Alpha Vantage

// SMA Calculation
function calculateSMA(data, period) {
  const closes = data.slice(0, period).map(c => parseFloat(c.close));
  return closes.reduce((a, b) => a + b, 0) / period;
}

// RSI Calculation
function calculateRSI(data, period = 14) {
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = parseFloat(data[i].close) - parseFloat(data[i-1].close);
    if (diff > 0) gains += diff;
    else losses += Math.abs(diff);
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// ADX Calculation (simplified)
function calculateADX(data, period = 14) {
  let volatility = 0;
  for (let i = 0; i < period; i++) {
    const tr = parseFloat(data[i].high) - parseFloat(data[i].low);
    volatility += tr;
  }
  const atr = volatility / period;
  return atr > 0.5 ? 25 : 15; // Simplified ADX
}

// Execute calculations
const smaFast = calculateSMA(candles, 10);
const smaSlow = calculateSMA(candles, 30);
const rsi = calculateRSI(candles, 14);
const adx = calculateADX(candles, 14);

// Generate signal
let signal = null;
if (smaFast > smaSlow && adx > 20 && rsi > 30 && rsi < 60) {
  signal = {
    action: 'BUY',
    symbol: $json.symbol,
    confidence: (adx / 50 * 100 + Math.abs(rsi - 50) / 2.5) / 2,
    entryPrice: parseFloat(candles[0].close),
    indicators: { smaFast, smaSlow, rsi, adx }
  };
}

return signal ? [signal] : [];
```

---

## 6. REACT DASHBOARD INTEGRATION

### 6.1 Dashboard Updates

The React dashboard now connects to:
- **PostgreSQL** directly for trade history, positions, metrics
- **n8n Webhooks** for real-time updates
- **n8n REST API** to trigger workflows manually

### 6.2 Fund Allocation Control

When user adjusts fund slider in dashboard:
1. React sends POST request to n8n webhook
2. n8n updates `algorithm_config` table
3. Position sizing recalculates in next trade

**n8n Webhook Node:**
```javascript
// Receive fund update from dashboard
const newFundAmount = $json.fundAmount;
const userId = $json.userId;

// Update database
// (PostgreSQL node will execute)
return {
  query: `UPDATE algorithm_config 
          SET max_position_value = $1 
          WHERE user_id = $2`,
  values: [newFundAmount, userId]
};
```

---

## 7. SECURITY MEASURES

### 7.1 n8n Security
- Basic Auth enabled (username/password)
- SSL/TLS for all external communications
- API credentials stored in n8n's encrypted credentials system
- Webhook endpoints use authentication tokens

### 7.2 SnapTrade Security
- OAuth 2.0 tokens refreshed automatically
- Rate limiting on API calls
- IP whitelisting (optional)

### 7.3 Database Security
- Encrypted connections (SSL)
- Regular backups (daily)
- Audit logs for all trades

---

## 8. MONITORING & ALERTS

### 8.1 Alert Types

**Telegram Alerts:**
- ✅ Trade executed
- ❌ Trade closed (P&L)
- ⚠️ Margin warning (< 150%)
- 🚨 Daily loss limit reached
- 📊 Daily summary (end of day)

**Email Alerts:**
- Critical margin call (< 125%)
- Emergency liquidation triggered
- Weekly performance report

### 8.2 Dashboard Live Updates

n8n sends webhook to React dashboard:
- When trade opens/closes
- When margin health changes
- When daily P&L updates

---

## 9. ADVANTAGES OF N8N ARCHITECTURE

### vs. Custom Node.js Backend:

| Feature | Custom Node.js | n8n Solution |
|---------|----------------|--------------|
| Development Time | 8-10 weeks | 4-6 weeks |
| Visual Debugging | No | Yes ✓ |
| Built-in Retry Logic | Manual | Automatic ✓ |
| Error Handling | Custom code | Visual nodes ✓ |
| Maintenance | High | Low ✓ |
| Scaling | Manual | Built-in ✓ |
| Cost | Server + dev time | Free (self-hosted) ✓ |
| Workflow Updates | Code changes | Drag-and-drop ✓ |

### Key Benefits:
1. **80% faster development** - Pre-built nodes for APIs, databases, alerts
2. **Visual workflow** - See entire trading logic in one screen
3. **No cron jobs** - Built-in scheduling with timezone support
4. **Zero maintenance** - Docker container handles everything
5. **Proven for trading** - Used by live trading bots (Alpha Vantage + Alpaca integrations)

---

## 10. IMPLEMENTATION ROADMAP (UPDATED)

### Phase 1: Foundation (Week 1)
- [ ] Install Docker + docker-compose
- [ ] Deploy n8n and PostgreSQL
- [ ] Configure environment variables
- [ ] Set up SnapTrade API credentials
- [ ] Create database schema

### Phase 2: Core Workflows (Weeks 2-3)
- [ ] Build Workflow 1: Market Scanner
- [ ] Build Workflow 2: Trade Execution
- [ ] Build Workflow 3: Position Monitor
- [ ] Test with paper trading

### Phase 3: Risk & Tax (Week 4)
- [ ] Build Workflow 4: Risk Management
- [ ] Build Workflow 5: Tax Tracking
- [ ] Test margin call scenarios

### Phase 4: Dashboard (Week 5)
- [ ] Build React frontend
- [ ] Connect to PostgreSQL
- [ ] Integrate n8n webhooks
- [ ] Add fund allocation slider

### Phase 5: Testing (Week 6)
- [ ] Paper trade for 2 weeks
- [ ] Backtest algorithm
- [ ] Stress test margin scenarios
- [ ] User acceptance testing

### Phase 6: Go Live (Week 7)
- [ ] Deploy to production
- [ ] Enable live trading
- [ ] Monitor first week closely

**Total Time: 6-7 weeks** (vs. 10-12 weeks with custom Node.js)

---

## 11. SUCCESS METRICS (UNCHANGED)

| Metric | Target | Timeframe |
|--------|--------|-----------|
| Win Rate | 55-65% | Monthly |
| Monthly Return | 2-5% | Month 3+ |
| Max Drawdown | < 15% | Daily max 5% |
| Sharpe Ratio | > 1.0 | Monthly |
| Workflow Uptime | > 99% | Monthly |

---

## 12. NEXT STEPS

1. **Install n8n** via Docker
2. **Import workflow templates** (provided separately)
3. **Configure SnapTrade credentials**
4. **Set up watchlist** in database
5. **Enable Workflow 1** (Market Scanner)
6. **Paper trade for 2 weeks**
7. **Go live with small capital** ($500-$1000)

---

## APPENDIX: WORKFLOW JSON TEMPLATES

[Separate document will contain exportable n8n JSON files for all 5 workflows]

**END OF DESIGN DOCUMENT v2.0**
