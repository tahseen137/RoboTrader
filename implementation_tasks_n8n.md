# IMPLEMENTATION TASKS WITH N8N - Complete Guide

## PROJECT: Automated Day Trading System (n8n Architecture)

---

## PHASE 1: N8N SETUP & FOUNDATION (Week 1)

### Task 1.1: Docker Environment Setup

#### Step 1.1.1: Install Docker & Docker Compose
```bash
# For Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose -y
sudo systemctl start docker
sudo systemctl enable docker

# For macOS
brew install docker docker-compose

# For Windows
# Download Docker Desktop from docker.com
```

**Deliverable:** Docker running with `docker --version`

---

#### Step 1.1.2: Create Project Structure
```bash
mkdir -p ~/wealthsimple-trader/{n8n-data,postgres-data,frontend,docs}
cd ~/wealthsimple-trader

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: trading_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: n8n
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: wealthsimple_trader
    volumes:
      - ./postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - trading_network

  n8n:
    image: n8nio/n8n:latest
    container_name: trading_n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=wealthsimple_trader
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - WEBHOOK_URL=${WEBHOOK_URL}
      - GENERIC_TIMEZONE=America/Toronto
      - N8N_LOG_LEVEL=info
      - EXECUTIONS_PROCESS=main
      - EXECUTIONS_MODE=regular
    volumes:
      - ./n8n-data:/home/node/.n8n
    depends_on:
      - postgres
    networks:
      - trading_network

networks:
  trading_network:
    driver: bridge
EOF

# Create .env file
cat > .env << 'EOF'
# Database
DB_PASSWORD=your_secure_password_here

# n8n Authentication
N8N_USER=admin
N8N_PASSWORD=your_n8n_password
N8N_ENCRYPTION_KEY=your_random_encryption_key_min_32_chars
WEBHOOK_URL=http://localhost:5678/

# SnapTrade API
SNAPTRADE_API_KEY=your_key
SNAPTRADE_SECRET=your_secret
SNAPTRADE_ACCOUNT_ID=your_account_id

# Alpha Vantage
ALPHA_VANTAGE_API_KEY=your_key

# Trading Config
MAX_DAILY_LOSS_PERCENT=0.05
MAX_CONCURRENT_POSITIONS=3
POSITION_SIZE_PERCENT=0.02
PROFIT_TARGET_PERCENT=0.03
STOP_LOSS_PERCENT=0.015

# Alerts
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
ALERT_EMAIL=your_email@example.com
EOF

chmod 600 .env
```

**Deliverable:** Project structure created with docker-compose.yml and .env

---

#### Step 1.1.3: Start n8n and PostgreSQL
```bash
# Start containers
docker-compose up -d

# Verify containers are running
docker ps

# Check logs
docker-compose logs -f

# Access n8n at http://localhost:5678
# Login with credentials from .env file
```

**Deliverable:** n8n accessible at http://localhost:5678

---

### Task 1.2: Database Schema Setup

#### Step 1.2.1: Connect to PostgreSQL
```bash
# Connect to PostgreSQL container
docker exec -it trading_postgres psql -U n8n -d wealthsimple_trader
```

#### Step 1.2.2: Create Database Schema
```sql
-- Users Table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    account_type VARCHAR(20) DEFAULT 'trader',
    created_at TIMESTAMP DEFAULT NOW(),
    tax_classification VARCHAR(20) DEFAULT 'investor',
    max_daily_loss_limit DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'active'
);

-- Accounts Table
CREATE TABLE accounts (
    account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    snaptrade_account_id VARCHAR(255),
    margin_balance DECIMAL(15,2),
    buying_power DECIMAL(15,2),
    cash_available DECIMAL(15,2),
    margin_health_score DECIMAL(5,2),
    last_synced_at TIMESTAMP,
    current_equity DECIMAL(15,2)
);

-- Trades Table
CREATE TABLE trades (
    trade_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(account_id),
    symbol VARCHAR(10),
    side VARCHAR(10),
    quantity INT,
    entry_price DECIMAL(10,2),
    exit_price DECIMAL(10,2),
    entry_time TIMESTAMP,
    exit_time TIMESTAMP,
    profit_loss DECIMAL(10,2),
    profit_loss_percent DECIMAL(5,2),
    status VARCHAR(20),
    reason_closed VARCHAR(50),
    stop_loss DECIMAL(10,2),
    profit_target DECIMAL(10,2),
    commission DECIMAL(10,2) DEFAULT 0,
    tax_lot_id UUID,
    superficial_loss_flag BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tax Lots Table
CREATE TABLE tax_lots (
    tax_lot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(account_id),
    symbol VARCHAR(10),
    quantity INT,
    average_cost DECIMAL(10,2),
    purchase_date DATE,
    status VARCHAR(20) DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Positions Table
CREATE TABLE positions (
    position_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(account_id),
    symbol VARCHAR(10),
    quantity INT,
    current_price DECIMAL(10,2),
    entry_price DECIMAL(10,2),
    unrealized_pnl DECIMAL(10,2),
    unrealized_pnl_percent DECIMAL(5,2),
    margin_requirement DECIMAL(10,2),
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Daily Metrics Table
CREATE TABLE daily_metrics (
    metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(account_id),
    trade_date DATE,
    trades_executed INT,
    winning_trades INT,
    losing_trades INT,
    win_rate DECIMAL(5,2),
    daily_pnl DECIMAL(10,2),
    daily_return_percent DECIMAL(5,2),
    margin_usage_percent DECIMAL(5,2),
    max_drawdown_day DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Alerts Table
CREATE TABLE alerts (
    alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(account_id),
    alert_type VARCHAR(50),
    severity VARCHAR(20),
    message TEXT,
    acknowledged BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Algorithm Config Table
CREATE TABLE algorithm_config (
    config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(account_id),
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

-- Watchlist Table
CREATE TABLE watchlist (
    watchlist_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(account_id),
    symbol VARCHAR(10),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Signals Table (for logging)
CREATE TABLE signals (
    signal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol VARCHAR(10),
    action VARCHAR(10),
    confidence DECIMAL(5,2),
    entry_price DECIMAL(10,2),
    indicators JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX idx_trades_account ON trades(account_id);
CREATE INDEX idx_trades_symbol ON trades(symbol);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_trades_date ON trades(entry_time);
CREATE INDEX idx_positions_account ON positions(account_id);
CREATE INDEX idx_tax_lots_account ON tax_lots(account_id);
CREATE INDEX idx_watchlist_account ON watchlist(account_id);
CREATE INDEX idx_signals_created ON signals(created_at);
```

**Deliverable:** Complete database schema with all tables and indexes

---

#### Step 1.2.3: Seed Initial Data
```sql
-- Insert test user
INSERT INTO users (email, tax_classification, max_daily_loss_limit, status)
VALUES ('trader@example.com', 'day_trader', 500.00, 'active');

-- Insert test account
INSERT INTO accounts (user_id, snaptrade_account_id, margin_balance, buying_power, cash_available, current_equity, margin_health_score)
VALUES (
    (SELECT user_id FROM users WHERE email = 'trader@example.com'),
    'test_account_123',
    10000.00,
    20000.00,
    5000.00,
    10000.00,
    200.00
);

-- Insert algorithm config
INSERT INTO algorithm_config (account_id, algorithm_name, max_position_value)
VALUES (
    (SELECT account_id FROM accounts LIMIT 1),
    'Multi-Confirmation Momentum Scalper',
    2500.00
);

-- Insert watchlist symbols
INSERT INTO watchlist (account_id, symbol) VALUES
    ((SELECT account_id FROM accounts LIMIT 1), 'AAPL'),
    ((SELECT account_id FROM accounts LIMIT 1), 'MSFT'),
    ((SELECT account_id FROM accounts LIMIT 1), 'GOOGL'),
    ((SELECT account_id FROM accounts LIMIT 1), 'TSLA'),
    ((SELECT account_id FROM accounts LIMIT 1), 'NVDA'),
    ((SELECT account_id FROM accounts LIMIT 1), 'AMD'),
    ((SELECT account_id FROM accounts LIMIT 1), 'META'),
    ((SELECT account_id FROM accounts LIMIT 1), 'AMZN');

-- Verify data
SELECT * FROM users;
SELECT * FROM accounts;
SELECT * FROM algorithm_config;
SELECT * FROM watchlist;
```

**Deliverable:** Seeded database ready for workflows

---

### Task 1.3: n8n Credentials Setup

#### Step 1.3.1: Configure SnapTrade Credentials
1. Open n8n at http://localhost:5678
2. Go to **Credentials** → **New Credential**
3. Search for "HTTP Request" (SnapTrade uses custom HTTP)
4. Create credential:
   - **Name:** SnapTrade API
   - **Authentication:** Header Auth
   - **Header Name:** Authorization
   - **Header Value:** Bearer YOUR_SNAPTRADE_KEY
5. Save credential

#### Step 1.3.2: Configure PostgreSQL Credentials
1. Go to **Credentials** → **New Credential**
2. Search for "PostgreSQL"
3. Create credential:
   - **Name:** Trading Database
   - **Host:** postgres
   - **Port:** 5432
   - **Database:** wealthsimple_trader
   - **User:** n8n
   - **Password:** (from .env)
   - **SSL:** Disabled (internal network)
4. Test connection
5. Save credential

#### Step 1.3.3: Configure Alpha Vantage Credentials
1. Go to **Credentials** → **New Credential**
2. Search for "HTTP Request"
3. Create credential:
   - **Name:** Alpha Vantage API
   - **Authentication:** None (uses query param)
4. Save credential

**Deliverable:** All API credentials configured in n8n

---

## PHASE 2: CORE WORKFLOWS (Weeks 2-3)

### Task 2.1: Build Workflow 1 - Market Scanner

#### Step 2.1.1: Create Workflow in n8n
1. Click **New Workflow**
2. Name: "Market Scanner (5-min)"
3. Add nodes in sequence:

**Node 1: Schedule Trigger**
- Trigger on: Interval
- Interval: Every 5 minutes
- Cron Expression: `*/5 9-16 * * 1-5` (Mon-Fri, 9 AM - 4 PM)

**Node 2: PostgreSQL - Fetch Watchlist**
- Credential: Trading Database
- Operation: Execute Query
- Query:
```sql
SELECT symbol FROM watchlist 
WHERE account_id = (SELECT account_id FROM accounts LIMIT 1) 
AND active = true;
```

**Node 3: Loop Over Items**
- Mode: Split Out Items

**Node 4: HTTP Request - Alpha Vantage**
- Method: GET
- URL: `https://www.alphavantage.co/query`
- Query Parameters:
  - function: TIME_SERIES_INTRADAY
  - symbol: `{{$json["symbol"]}}`
  - interval: 5min
  - apikey: YOUR_ALPHA_VANTAGE_KEY
  - outputsize: compact

**Node 5: Code Node - Calculate Indicators**
```javascript
// Get candles from Alpha Vantage response
const timeSeries = $json['Time Series (5min)'];
const candles = Object.entries(timeSeries).map(([time, data]) => ({
  time,
  close: parseFloat(data['4. close']),
  high: parseFloat(data['2. high']),
  low: parseFloat(data['3. low']),
  volume: parseFloat(data['5. volume'])
}));

// SMA Calculation
function calculateSMA(data, period) {
  const closes = data.slice(0, period).map(c => c.close);
  return closes.reduce((a, b) => a + b, 0) / period;
}

// RSI Calculation
function calculateRSI(data, period = 14) {
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = data[i].close - data[i-1].close;
    if (diff > 0) gains += diff;
    else losses += Math.abs(diff);
  }
  const rs = (gains / period) / (losses / period);
  return 100 - (100 / (1 + rs));
}

// ADX (simplified)
function calculateADX(data, period = 14) {
  let atr = 0;
  for (let i = 0; i < period; i++) {
    atr += data[i].high - data[i].low;
  }
  return (atr / period) > 0.5 ? 25 : 15;
}

const smaFast = calculateSMA(candles, 10);
const smaSlow = calculateSMA(candles, 30);
const rsi = calculateRSI(candles, 14);
const adx = calculateADX(candles, 14);

return [{
  symbol: $json.symbol,
  currentPrice: candles[0].close,
  smaFast,
  smaSlow,
  rsi,
  adx,
  volume: candles[0].volume
}];
```

**Node 6: IF Node - Check Signal Conditions**
- Condition 1: `{{$json["smaFast"]}} > {{$json["smaSlow"]}}`
- Condition 2: `{{$json["adx"]}} > 20`
- Condition 3: `{{$json["rsi"]}} > 30 AND {{$json["rsi"]}} < 60`
- Logic: AND (all conditions must be true)

**Node 7: Code Node - Calculate Confidence**
```javascript
const adx = $json.adx;
const rsi = $json.rsi;

const adxScore = Math.min(100, (adx / 50) * 100);
const rsiScore = Math.abs(rsi - 50) / 2.5;
const confidence = (adxScore + rsiScore) / 2;

return [{
  ...$json,
  confidence,
  action: 'BUY',
  timestamp: new Date().toISOString()
}];
```

**Node 8: PostgreSQL - Log Signal**
- Operation: Insert
- Table: signals
- Columns:
  - symbol: `{{$json["symbol"]}}`
  - action: `{{$json["action"]}}`
  - confidence: `{{$json["confidence"]}}`
  - entry_price: `{{$json["currentPrice"]}}`
  - indicators: `{{JSON.stringify($json)}}`

**Node 9: Webhook - Trigger Trade Execution**
- Method: POST
- URL: http://localhost:5678/webhook/execute-trade
- Body: `{{$json}}`

**Deliverable:** Working Market Scanner workflow that runs every 5 minutes

---

### Task 2.2: Build Workflow 2 - Trade Execution

#### Step 2.2.1: Create Trade Execution Workflow
1. Click **New Workflow**
2. Name: "Trade Execution"
3. Add nodes:

**Node 1: Webhook Trigger**
- Path: execute-trade
- Method: POST
- Authentication: None (internal only)

**Node 2: PostgreSQL - Check Daily Loss**
- Query:
```sql
SELECT COALESCE(SUM(profit_loss), 0) as daily_pnl
FROM trades
WHERE account_id = (SELECT account_id FROM accounts LIMIT 1)
AND DATE(exit_time) = CURRENT_DATE
AND status = 'CLOSED';
```

**Node 3: Code Node - Evaluate Loss Limit**
```javascript
const dailyPnL = $json.daily_pnl || 0;
const maxLoss = -500; // $500 max daily loss

return [{
  canTrade: dailyPnL > maxLoss,
  dailyPnL,
  remainingRisk: maxLoss - dailyPnL
}];
```

**Node 4: IF Node - Halt if Loss Exceeded**
- Condition: `{{$json["canTrade"]}} == true`
- True branch continues, False branch sends alert

**Node 5: HTTP Request - Get Account Balance**
- URL: `https://api.snaptrade.com/accounts/{{$env.SNAPTRADE_ACCOUNT_ID}}/balance`
- Headers: Authorization: Bearer YOUR_KEY

**Node 6: Code Node - Calculate Position Size**
```javascript
const buyingPower = $json.buyingPower;
const entryPrice = $input.first().json.currentPrice;
const riskPercent = 0.02; // 2% risk

const positionValue = buyingPower * riskPercent;
const quantity = Math.floor(positionValue / entryPrice);

return [{
  quantity: Math.max(1, quantity),
  entryPrice,
  symbol: $input.first().json.symbol
}];
```

**Node 7: PostgreSQL - Check Superficial Loss**
- Query:
```sql
SELECT COUNT(*) as violation_count
FROM trades
WHERE symbol = '{{$json["symbol"]}}'
AND profit_loss < 0
AND exit_time >= CURRENT_DATE - INTERVAL '30 days'
AND status = 'CLOSED';
```

**Node 8: IF Node - Block if Superficial Loss**
- Condition: `{{$json["violation_count"]}} == 0`

**Node 9: HTTP Request - Place Buy Order (SnapTrade)**
- Method: POST
- URL: `https://api.snaptrade.com/accounts/{{$env.SNAPTRADE_ACCOUNT_ID}}/orders`
- Body:
```json
{
  "action": "BUY",
  "symbol": "{{$json["symbol"]}}",
  "quantity": {{$json["quantity"]}},
  "orderType": "LIMIT",
  "limitPrice": {{$json["entryPrice"]}}
}
```

**Node 10: PostgreSQL - Log Trade**
- Operation: Insert
- Table: trades
- Columns:
  - symbol: `{{$json["symbol"]}}`
  - side: BUY
  - quantity: `{{$json["quantity"]}}`
  - entry_price: `{{$json["entryPrice"]}}`
  - entry_time: NOW()
  - status: OPEN
  - stop_loss: `{{$json["entryPrice"]}} * 0.985`
  - profit_target: `{{$json["entryPrice"]}} * 1.03`

**Node 11: Telegram - Send Notification**
- Message: `✅ BUY {{$json["quantity"]}} {{$json["symbol"]}} @ ${{$json["entryPrice"]}}`

**Deliverable:** Trade execution workflow with risk checks

---

### Task 2.3: Build Workflow 3 - Position Monitor

[Similar detailed node-by-node breakdown for Position Monitor workflow]

**Deliverable:** Position monitoring workflow running every 1 minute

---

## PHASE 3: RISK & TAX WORKFLOWS (Week 4)

### Task 3.1: Build Workflow 4 - Risk Management
[Detailed node configuration]

### Task 3.2: Build Workflow 5 - Tax Tracking
[Detailed node configuration]

**Deliverables:** Complete risk and tax workflows

---

## PHASE 4: REACT DASHBOARD (Week 5)

### Task 4.1: Initialize React App
```bash
cd ~/wealthsimple-trader/frontend
npx create-react-app trading-dashboard
cd trading-dashboard
npm install axios recharts react-router-dom @mui/material @emotion/react
```

### Task 4.2: Build Dashboard Components
[Component code for AccountOverview, PositionsTable, FundSlider, etc.]

### Task 4.3: Connect to n8n Webhooks
[WebSocket integration code]

**Deliverable:** Functional React dashboard

---

## PHASE 5: TESTING (Week 6)

### Task 5.1: Paper Trading Test
- Enable all workflows
- Monitor for 2 weeks
- Verify signals, executions, exits

### Task 5.2: Backtest Algorithm
- Export historical data
- Run simulations
- Optimize parameters

### Task 5.3: Stress Test
- Simulate margin calls
- Test superficial loss blocking
- Verify daily loss limits

**Deliverable:** Fully tested system ready for live trading

---

## QUICK START CHECKLIST

### Pre-Flight:
- [ ] Docker installed
- [ ] SnapTrade API keys obtained
- [ ] Alpha Vantage API key obtained
- [ ] Wealthsimple margin account funded
- [ ] Telegram bot created (optional)

### Week-by-Week:
- **Week 1**: ✅ n8n + PostgreSQL running
- **Week 2**: ✅ Market Scanner + Trade Execution workflows
- **Week 3**: ✅ Position Monitor workflow
- **Week 4**: ✅ Risk Management + Tax Tracking
- **Week 5**: ✅ React Dashboard
- **Week 6**: ✅ Testing complete

### Go-Live:
- [ ] 2+ weeks paper trading successful
- [ ] All workflows tested
- [ ] Margin monitoring verified
- [ ] Tax tracking confirmed
- [ ] Start with $500-$1000 real capital

---

**END OF IMPLEMENTATION GUIDE**
