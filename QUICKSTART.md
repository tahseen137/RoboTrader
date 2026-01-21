# RoboTrader - Quick Start Guide

**Get up and running in 15 minutes!**

---

## Prerequisites

Before starting, ensure you have:

- [x] **Docker Desktop** installed and running
  - Not installed? See `INSTALL_DOCKER.md`
  - Verify: `docker --version` and `docker-compose --version`

- [x] **Git** installed
  - Verify: `git --version`

- [x] **API Credentials** ready:
  - SnapTrade API key (from https://snaptrade.com/)
  - Alpha Vantage API key (free from https://www.alphavantage.co/support/#api-key)

---

## Step 1: Clone & Setup (2 minutes)

```bash
# Clone the repository
git clone https://github.com/tahseen137/RoboTrader.git
cd RoboTrader

# Create environment file from template
cp .env.example .env
```

---

## Step 2: Configure Environment Variables (5 minutes)

Open `.env` in your text editor and set the following **required** variables:

### 🔴 Required (Must Change)

```bash
# Database Password
DB_PASSWORD=your_strong_password_here_123

# n8n Authentication
N8N_PASSWORD=your_n8n_password
N8N_ENCRYPTION_KEY=your_random_32_character_encryption_key_here

# SnapTrade API
SNAPTRADE_API_KEY=your_snaptrade_api_key
SNAPTRADE_SECRET=your_snaptrade_secret
SNAPTRADE_ACCOUNT_ID=your_account_id

# Alpha Vantage
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
```

### 🟡 Optional but Recommended

```bash
# Telegram Alerts (optional but useful)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Email Alerts
ALERT_EMAIL=your_email@example.com
```

### ⚙️ Trading Parameters (defaults are safe)

```bash
# Set to "paper" for testing (HIGHLY RECOMMENDED)
TRADING_MODE=paper

# Risk limits (default values are conservative)
MAX_DAILY_LOSS_PERCENT=0.05        # 5% max daily loss
MAX_CONCURRENT_POSITIONS=3          # Max 3 positions
POSITION_SIZE_PERCENT=0.02          # 2% per trade
PROFIT_TARGET_PERCENT=0.03          # 3% profit target
STOP_LOSS_PERCENT=0.015             # 1.5% stop loss
```

**💡 Tip**: Use `openssl rand -base64 32` to generate secure random keys

---

## Step 3: Start Docker Containers (2 minutes)

```bash
# Start n8n + PostgreSQL in background
docker-compose up -d

# Check containers are running
docker-compose ps

# Expected output:
#   trading_n8n       running
#   trading_postgres  running (healthy)
```

### Verify Startup

```bash
# View logs (optional)
docker-compose logs -f

# Press Ctrl+C to exit logs

# Check n8n health
curl http://localhost:5678/healthz
# Expected: OK
```

---

## Step 4: Access n8n Interface (1 minute)

1. Open your browser: **http://localhost:5678**

2. Login with credentials from `.env`:
   - **Username**: `admin` (or your N8N_USER)
   - **Password**: Your N8N_PASSWORD

3. You should see the n8n welcome screen

✅ **Success!** n8n is running and connected to PostgreSQL.

---

## Step 5: Verify Database (2 minutes)

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U n8n -d wealthsimple_trader

# Inside PostgreSQL, run:
\dt  # List all tables

# You should see:
#   users, accounts, trades, positions, watchlist, etc.

# Check seed data
SELECT * FROM watchlist;

# Expected: 8 stocks (AAPL, MSFT, GOOGL, TSLA, NVDA, AMD, META, AMZN)

# Exit PostgreSQL
\q
```

✅ **Success!** Database is initialized with seed data.

---

## Step 6: Configure n8n Credentials (3 minutes)

### Add PostgreSQL Credentials

1. In n8n, click **Credentials** (left sidebar)
2. Click **New Credential**
3. Search for "PostgreSQL"
4. Fill in:
   - **Name**: `Trading Database`
   - **Host**: `postgres`
   - **Port**: `5432`
   - **Database**: `wealthsimple_trader`
   - **User**: `n8n`
   - **Password**: (your DB_PASSWORD from .env)
   - **SSL**: Disabled
5. Click **Test connection**
6. Click **Save**

### Add SnapTrade API Credentials

1. Click **New Credential**
2. Search for "HTTP Request"
3. Fill in:
   - **Name**: `SnapTrade API`
   - **Authentication**: Header Auth
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer YOUR_SNAPTRADE_API_KEY`
4. Click **Save**

### Add Alpha Vantage Credentials

1. Click **New Credential**
2. Search for "HTTP Request"
3. Fill in:
   - **Name**: `Alpha Vantage API`
   - **Authentication**: None (uses query params)
4. Click **Save**

✅ **Success!** Credentials configured.

---

## Step 7: Import First Workflow (Optional)

**Note**: Workflows will be created in Phase 2. For now, you can create a test workflow:

1. Click **New Workflow**
2. Name it "Test Workflow"
3. Add a **Schedule Trigger** node
4. Add a **PostgreSQL** node
5. Query: `SELECT * FROM watchlist;`
6. Connect the nodes
7. Click **Save** and then **Execute Workflow**

✅ If it works, your setup is complete!

---

## Next Steps

### Immediate (Recommended)
- [ ] Review `IMPROVEMENTS.md` for enhancement ideas
- [ ] Read `CLAUDE.md` for project structure
- [ ] Check `PHASE1_PROGRESS.md` for implementation status

### Phase 2 (Week 2-3)
- [ ] Build Workflow 1: Market Scanner
- [ ] Build Workflow 2: Trade Execution
- [ ] Build Workflow 3: Position Monitor

See `implementation_tasks_n8n.md` for full roadmap.

---

## Common Issues

### Containers won't start

**Problem**: `docker-compose up -d` fails

**Solution**:
```bash
# Check Docker Desktop is running
docker info

# Check .env file exists
ls -la .env

# View error logs
docker-compose logs

# Restart Docker Desktop
# Then try again: docker-compose up -d
```

### Can't access n8n at localhost:5678

**Problem**: Browser shows "can't connect"

**Solution**:
```bash
# Check n8n container is running
docker-compose ps

# Check logs
docker-compose logs n8n

# Verify port isn't in use
netstat -an | grep 5678

# Restart n8n
docker-compose restart n8n
```

### Database connection error in n8n

**Problem**: PostgreSQL credential test fails

**Solution**:
```bash
# Wait for postgres to be healthy
docker-compose ps  # Look for "healthy" status

# Check postgres logs
docker-compose logs postgres

# Verify password matches .env
grep DB_PASSWORD .env

# Try connecting manually
docker-compose exec postgres psql -U n8n -d wealthsimple_trader
```

### Permission denied errors (Linux/Mac only)

**Solution**:
```bash
# Fix volume permissions
sudo chown -R $USER:$USER postgres-data n8n-data

# Restart containers
docker-compose down
docker-compose up -d
```

---

## Useful Commands

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f n8n
docker-compose logs -f postgres

# Restart a service
docker-compose restart n8n

# Check status
docker-compose ps

# Connect to database
docker-compose exec postgres psql -U n8n -d wealthsimple_trader

# Access n8n shell
docker-compose exec n8n /bin/sh

# Update images
docker-compose pull
docker-compose up -d

# Completely remove everything (⚠️  deletes data)
docker-compose down -v
```

---

## Verification Checklist

- [ ] Docker Desktop installed and running
- [ ] `docker --version` shows version 24.0+
- [ ] `.env` file created and configured
- [ ] `docker-compose up -d` successful
- [ ] `docker-compose ps` shows both containers running
- [ ] n8n accessible at http://localhost:5678
- [ ] Can login to n8n with credentials
- [ ] Database has 10 tables (\dt in psql)
- [ ] Watchlist has 8 stocks
- [ ] PostgreSQL credentials work in n8n
- [ ] SnapTrade credentials configured
- [ ] Alpha Vantage credentials configured

---

## What You've Accomplished

✅ **Phase 1 Complete!**
- Docker environment running
- PostgreSQL database initialized with schema
- n8n workflow automation ready
- Credentials configured
- Seed data loaded

**You're ready to build workflows!**

---

## Getting Help

- **Documentation**: See `README.md`, `CLAUDE.md`, `system_design_v2_n8n.md`
- **Implementation Guide**: See `implementation_tasks_n8n.md`
- **GitHub Issues**: https://github.com/tahseen137/RoboTrader/issues
- **Progress Tracking**: See `PHASE1_PROGRESS.md`

---

**Estimated Time**: 15-20 minutes total
**Difficulty**: Beginner-friendly
**Next Phase**: Build Market Scanner workflow (see `implementation_tasks_n8n.md`)
