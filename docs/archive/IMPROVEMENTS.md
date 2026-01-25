# RoboTrader - Suggested Improvements

**Created**: January 20, 2026
**Status**: For Future Reference

---

## Priority: HIGH

### 1. Missing Critical Infrastructure

**Problem**: No actual infrastructure files exist yet - only documentation.

**Current State**:
- No `docker-compose.yml` file
- No `.env.example` file for onboarding
- Project folder structure not created

**Recommendation**:
```bash
# Create a setup.sh script that scaffolds the entire project:
mkdir -p ~/wealthsimple-trader/{n8n-data,postgres-data,frontend,docs,backups}
```

**Files to Create**:
- `docker-compose.yml` - n8n + PostgreSQL containers
- `.env.example` - Template with all required variables
- `setup.sh` - Automated setup script
- `init.sql` - Database schema initialization

**Effort**: 2-3 hours

---

### 2. API Rate Limiting Concerns

**Problem**: Alpha Vantage free tier has strict rate limits that will cause issues.

**Current State**:
- Alpha Vantage free tier = 5 API calls/minute
- Watchlist has 25 stocks
- Scanner runs every 5 minutes
- 25 stocks × 1 call each = 25 calls per scan cycle
- At 5 calls/min, takes 5 minutes just to complete one scan!

**Recommendations**:

**Option A - Upgrade Alpha Vantage** ($50/month):
- 75 calls/minute
- Sufficient for 25 stocks

**Option B - Switch Data Provider**:
| Provider | Free Tier | Cost | Speed |
|----------|-----------|------|-------|
| Polygon.io | 5 calls/min | $29/mo | Fast |
| Finnhub | 60 calls/min | Free | Good |
| Twelve Data | 8 calls/min | $29/mo | Fast |
| Yahoo Finance | Unlimited* | Free | Slow |

**Option C - Implement Request Queuing**:
```javascript
// n8n Code Node - Rate Limiter
const RATE_LIMIT = 5; // calls per minute
const symbols = $json.symbols;
const batches = [];

for (let i = 0; i < symbols.length; i += RATE_LIMIT) {
  batches.push(symbols.slice(i, i + RATE_LIMIT));
}

// Process each batch with 60-second delay between
return batches.map((batch, index) => ({
  symbols: batch,
  delayMs: index * 60000
}));
```

**Effort**: 4-6 hours

---

### 3. Add Paper Trading Mode

**Problem**: No safety switch to prevent accidental live trading during development.

**Current State**:
- Workflows connect directly to SnapTrade
- No way to test without real money at risk
- Easy to accidentally execute live trades

**Recommendation**:

Add environment variable:
```env
TRADING_MODE=paper  # Options: paper, live
```

Create mock SnapTrade responses in n8n:
```javascript
// n8n Code Node - Trade Execution Router
const tradingMode = $env.TRADING_MODE || 'paper';

if (tradingMode === 'paper') {
  // Simulate order execution
  return {
    orderId: 'PAPER-' + Date.now(),
    status: 'FILLED',
    symbol: $json.symbol,
    quantity: $json.quantity,
    price: $json.entryPrice,
    simulatedAt: new Date().toISOString()
  };
}

// Continue to real SnapTrade API call
return $json;
```

Add to database:
```sql
ALTER TABLE trades ADD COLUMN is_paper_trade BOOLEAN DEFAULT false;
```

**Effort**: 3-4 hours

---

## Priority: MEDIUM

### 4. Dashboard WebSocket Implementation

**Problem**: HTML prototype uses fake data; React dashboard needs real-time updates.

**Current State**:
- Dashboard uses `setInterval()` with random number generation
- No connection to actual trading data
- No real-time position updates

**Recommendation**:

**Option A - n8n Webhook Streaming**:
```javascript
// React Dashboard - WebSocket Connection
const socket = new WebSocket('ws://localhost:5678/webhook/dashboard-updates');

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch(data.type) {
    case 'POSITION_UPDATE':
      updatePositions(data.positions);
      break;
    case 'TRADE_EXECUTED':
      addTrade(data.trade);
      break;
    case 'MARGIN_ALERT':
      showAlert(data.alert);
      break;
  }
};
```

**Option B - Socket.io with Express Middleware**:
```javascript
// Add to docker-compose.yml
services:
  websocket-server:
    image: node:18-alpine
    volumes:
      - ./websocket:/app
    ports:
      - "3001:3001"
```

**Option C - Poll n8n Database Directly**:
```javascript
// React - Polling approach (simpler but less real-time)
useEffect(() => {
  const interval = setInterval(async () => {
    const positions = await fetch('/api/positions');
    setPositions(await positions.json());
  }, 5000); // Every 5 seconds

  return () => clearInterval(interval);
}, []);
```

**Effort**: 8-12 hours

---

### 5. Missing Backtesting Framework

**Problem**: Cannot validate trading strategy before risking real money.

**Current State**:
- Implementation mentions backtesting but no framework
- No historical data storage
- No way to simulate past performance

**Recommendation**:

Create `backtest/` folder with Python scripts:

```python
# backtest/run_backtest.py
import backtrader as bt
import pandas as pd

class MomentumStrategy(bt.Strategy):
    params = (
        ('sma_fast', 10),
        ('sma_slow', 30),
        ('rsi_period', 14),
        ('adx_threshold', 20),
    )

    def __init__(self):
        self.sma_fast = bt.indicators.SMA(period=self.p.sma_fast)
        self.sma_slow = bt.indicators.SMA(period=self.p.sma_slow)
        self.rsi = bt.indicators.RSI(period=self.p.rsi_period)
        self.adx = bt.indicators.ADX(period=14)

    def next(self):
        if not self.position:
            if (self.sma_fast[0] > self.sma_slow[0] and
                self.adx[0] > self.p.adx_threshold and
                self.rsi[0] > 30 and self.rsi[0] < 60):
                self.buy()
        else:
            # Exit logic
            pnl_pct = (self.data.close[0] - self.position.price) / self.position.price
            if pnl_pct >= 0.03 or pnl_pct <= -0.015:
                self.sell()

# Run backtest
cerebro = bt.Cerebro()
cerebro.addstrategy(MomentumStrategy)
cerebro.broker.setcash(10000)
# Add data...
results = cerebro.run()
```

**Dependencies**:
```
backtrader>=1.9.78
pandas>=2.0.0
matplotlib>=3.7.0
yfinance>=0.2.0
```

**Effort**: 12-16 hours

---

### 6. Tax Calculation Complexity

**Problem**: ACB calculation is oversimplified; real Canadian tax rules are complex.

**Current State**:
- Basic superficial loss rule check (30-day window)
- Simple ACB calculation
- No support for:
  - Multiple purchases at different prices
  - Partial sales
  - Corporate actions (splits, dividends)
  - Cross-year tax lot tracking

**Recommendation**:

**Option A - Integrate with AdjustedCostBase.ca**:
- API available for premium users
- Handles all Canadian tax rules
- Official CRA-compliant calculations

**Option B - Build Robust Tax Lot System**:
```sql
-- Enhanced tax_lots table
CREATE TABLE tax_lots_v2 (
    lot_id UUID PRIMARY KEY,
    account_id UUID REFERENCES accounts(account_id),
    symbol VARCHAR(10),
    purchase_date DATE,
    quantity_purchased INT,
    quantity_remaining INT,
    purchase_price DECIMAL(10,2),
    commission DECIMAL(10,2),
    total_cost DECIMAL(15,2),  -- price * qty + commission
    acb_per_share DECIMAL(10,4),
    superficial_loss_adjustment DECIMAL(10,2) DEFAULT 0,
    tax_year INT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ACB calculation function
CREATE OR REPLACE FUNCTION calculate_acb(p_account_id UUID, p_symbol VARCHAR)
RETURNS DECIMAL AS $$
DECLARE
    total_cost DECIMAL;
    total_shares INT;
BEGIN
    SELECT
        SUM(total_cost + superficial_loss_adjustment),
        SUM(quantity_remaining)
    INTO total_cost, total_shares
    FROM tax_lots_v2
    WHERE account_id = p_account_id
      AND symbol = p_symbol
      AND quantity_remaining > 0;

    IF total_shares = 0 THEN
        RETURN 0;
    END IF;

    RETURN total_cost / total_shares;
END;
$$ LANGUAGE plpgsql;
```

**Effort**: 16-24 hours

---

### 7. Error Recovery Gaps

**Problem**: No recovery mechanism if n8n crashes mid-trade.

**Current State**:
- If n8n restarts, no position reconciliation
- Open positions in database may not match broker
- Stop losses may not be active after restart

**Recommendation**:

Create Workflow 0: Startup Reconciliation
```
Trigger: n8n startup (or manual)
Steps:
1. Query SnapTrade for all current positions
2. Query database for all "OPEN" trades
3. Compare and reconcile:
   - If position exists in broker but not DB → Add to DB
   - If position in DB but not broker → Mark as closed (investigate)
   - If quantities differ → Alert and log discrepancy
4. Re-enable position monitoring for all open positions
5. Send startup notification via Telegram
```

```javascript
// n8n Code Node - Reconciliation Logic
const brokerPositions = $json.snaptradePositions;
const dbPositions = $json.databasePositions;

const discrepancies = [];

// Check broker positions against DB
for (const bp of brokerPositions) {
  const dbMatch = dbPositions.find(dp => dp.symbol === bp.symbol);
  if (!dbMatch) {
    discrepancies.push({
      type: 'MISSING_IN_DB',
      symbol: bp.symbol,
      brokerQty: bp.quantity,
      action: 'ADD_TO_DB'
    });
  } else if (dbMatch.quantity !== bp.quantity) {
    discrepancies.push({
      type: 'QUANTITY_MISMATCH',
      symbol: bp.symbol,
      brokerQty: bp.quantity,
      dbQty: dbMatch.quantity,
      action: 'INVESTIGATE'
    });
  }
}

// Check DB positions against broker
for (const dp of dbPositions) {
  const brokerMatch = brokerPositions.find(bp => bp.symbol === dp.symbol);
  if (!brokerMatch) {
    discrepancies.push({
      type: 'MISSING_IN_BROKER',
      symbol: dp.symbol,
      dbQty: dp.quantity,
      action: 'MARK_CLOSED'
    });
  }
}

return { discrepancies, needsAttention: discrepancies.length > 0 };
```

**Effort**: 6-8 hours

---

### 8. Security Hardening

**Problem**: Current security is minimal; not production-ready.

**Current State**:
- n8n basic auth only
- Webhook endpoints have no authentication
- No rate limiting on webhooks
- No IP restrictions

**Recommendations**:

**A. Webhook Authentication**:
```javascript
// n8n Webhook Node - Add token validation
const authToken = $request.headers['x-auth-token'];
const expectedToken = $env.WEBHOOK_SECRET;

if (authToken !== expectedToken) {
  return {
    statusCode: 401,
    body: { error: 'Unauthorized' }
  };
}
```

**B. Use Cloudflare Tunnel for External Access**:
```yaml
# docker-compose.yml addition
services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    command: tunnel --no-autoupdate run
    environment:
      - TUNNEL_TOKEN=${CLOUDFLARE_TUNNEL_TOKEN}
```

**C. Add Fail2Ban for Brute Force Protection**:
```yaml
services:
  fail2ban:
    image: crazymax/fail2ban:latest
    volumes:
      - ./fail2ban:/data
      - /var/log:/var/log:ro
```

**D. Enable TLS**:
```yaml
services:
  traefik:
    image: traefik:v2.10
    command:
      - "--certificatesresolvers.letsencrypt.acme.email=you@email.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
```

**Effort**: 8-12 hours

---

## Priority: LOW

### 9. Monitoring & Observability

**Problem**: No centralized logging or metrics visualization.

**Current State**:
- Logs only in Docker containers
- No performance metrics
- No alerting on system issues (only trading alerts)

**Recommendation**:

Add monitoring stack to docker-compose:
```yaml
services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana

  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"

  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log:/var/log
      - ./promtail.yml:/etc/promtail/config.yml
```

**Pre-built Dashboards**:
- n8n workflow execution metrics
- Trade P&L over time
- Win rate trends
- Margin health history
- API response times

**Effort**: 8-10 hours

---

### 10. Multi-Account Support

**Problem**: Current design is single-tenant only.

**Current State**:
- Database schema supports multiple users/accounts
- But workflows are hardcoded to single account
- No user authentication in dashboard

**Recommendation**:

**Phase 1 - Parameterize Workflows**:
```javascript
// Replace hardcoded account queries
// FROM:
const query = "SELECT * FROM accounts LIMIT 1";

// TO:
const accountId = $env.ACCOUNT_ID || $json.accountId;
const query = `SELECT * FROM accounts WHERE account_id = '${accountId}'`;
```

**Phase 2 - Add Authentication**:
- Implement JWT auth in React dashboard
- Add user login/registration
- Associate workflows with user accounts

**Phase 3 - Workflow Isolation**:
- Create separate n8n workflow instances per user OR
- Use workflow variables to isolate user data

**Effort**: 20-30 hours (full implementation)

---

## Implementation Priority Matrix

| # | Improvement | Priority | Effort | Impact |
|---|-------------|----------|--------|--------|
| 1 | Infrastructure Files | HIGH | 2-3 hrs | Critical |
| 2 | API Rate Limiting | HIGH | 4-6 hrs | Critical |
| 3 | Paper Trading Mode | HIGH | 3-4 hrs | High |
| 4 | WebSocket Dashboard | MEDIUM | 8-12 hrs | Medium |
| 5 | Backtesting Framework | MEDIUM | 12-16 hrs | High |
| 6 | Tax Calculations | MEDIUM | 16-24 hrs | Medium |
| 7 | Error Recovery | MEDIUM | 6-8 hrs | High |
| 8 | Security Hardening | MEDIUM | 8-12 hrs | High |
| 9 | Monitoring Stack | LOW | 8-10 hrs | Low |
| 10 | Multi-Account | LOW | 20-30 hrs | Low |

---

## Quick Wins (< 4 hours each)

1. Create `docker-compose.yml` and `.env.example`
2. Add `TRADING_MODE=paper` toggle
3. Create `setup.sh` initialization script
4. Add startup reconciliation workflow
5. Implement webhook token authentication

---

## Notes

- Review this document before each development sprint
- Mark items as DONE when completed
- Add new improvement ideas as they arise
- Re-prioritize quarterly based on trading experience

---

**Last Reviewed**: January 20, 2026
