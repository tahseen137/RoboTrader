# RoboTrader

> **Automated Day Trading System for Wealthsimple**
>
> Built with n8n workflow automation, PostgreSQL, and React

![Project Status](https://img.shields.io/badge/status-design%20phase-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![CI](https://github.com/YOUR_USERNAME/RoboTrader/actions/workflows/ci.yml/badge.svg)
![Security](https://github.com/YOUR_USERNAME/RoboTrader/actions/workflows/security-scan.yml/badge.svg)
![Documentation](https://github.com/YOUR_USERNAME/RoboTrader/actions/workflows/documentation.yml/badge.svg)

---

## 🚀 Overview

RoboTrader is an automated day trading system that executes a **Multi-Confirmation Momentum Scalper** strategy on Wealthsimple margin accounts. It uses n8n as the core automation engine to scan markets, execute trades, manage risk, and track tax obligations—all while you sleep.

### Key Features

- 📊 **Automated Trading** - Multi-indicator momentum strategy (SMA + RSI + ADX)
- 🛡️ **Risk Management** - Automatic margin monitoring, stop losses, daily loss limits
- 📈 **Real-time Dashboard** - Monitor positions, P&L, and performance metrics
- 🇨🇦 **Canadian Tax Compliance** - Superficial loss tracking, ACB calculation
- 🔔 **Smart Alerts** - Telegram + Email notifications for trades and warnings
- 🐳 **Docker Ready** - Complete environment in one `docker-compose up` command

---

## 📁 Project Structure

```
RoboTrader/
├── Day Trading Dashboard.html    # HTML prototype (view in browser)
├── system_design_v2_n8n.md       # Complete architecture documentation
├── implementation_tasks_n8n.md   # Step-by-step setup guide
├── CLAUDE.md                     # Quick reference for Claude/developers
├── IMPROVEMENTS.md               # Future enhancement roadmap
├── README.md                     # This file
└── .gitignore                    # Git ignore rules
```

---

## 🎯 Trading Strategy

**Multi-Confirmation Momentum Scalper**

| Parameter | Value | Description |
|-----------|-------|-------------|
| Entry Signal | SMA(10) > SMA(30) | Fast MA crosses above slow MA |
| Trend Filter | ADX > 20 | Confirms strong trend |
| Momentum | RSI 30-60 | Avoids overbought/oversold |
| Profit Target | +3.0% | Take profit level |
| Stop Loss | -1.5% | Maximum loss per trade |
| Position Size | 2% of equity | Risk per trade |
| Max Positions | 3 concurrent | Position limit |
| Max Daily Loss | -5% | Trading halts if reached |

**Expected Performance**:
- Win Rate: 55-65%
- Monthly Return: 2-5%
- Max Drawdown: < 15%

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│              REACT DASHBOARD                        │
│  (Real-time monitoring & fund allocation control)   │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│              N8N WORKFLOWS                          │
│  ┌──────────────────────────────────────────────┐  │
│  │ 1. Market Scanner (every 5 min)             │  │
│  │ 2. Trade Execution (on signal)              │  │
│  │ 3. Position Monitor (every 1 min)           │  │
│  │ 4. Risk Management (every 5 min)            │  │
│  │ 5. Tax Tracking (post-trade)                │  │
│  └──────────────────────────────────────────────┘  │
└─────────────┬───────────────────┬───────────────────┘
              │                   │
    ┌─────────▼────────┐   ┌──────▼──────┐
    │ SnapTrade API    │   │ PostgreSQL  │
    │ (Wealthsimple)   │   │  Database   │
    └──────────────────┘   └─────────────┘
```

---

## 🚦 Quick Start

### Prerequisites

- Docker & Docker Compose installed
- Wealthsimple margin account (funded)
- SnapTrade API credentials ([get them here](https://snaptrade.com))
- Alpha Vantage API key ([free tier](https://www.alphavantage.co/support/#api-key))

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/RoboTrader.git
cd RoboTrader

# Create environment file
cp .env.example .env

# Edit .env with your API credentials
nano .env

# Start n8n + PostgreSQL
docker-compose up -d

# Access n8n at http://localhost:5678
# Login with credentials from .env
```

### First Run

1. **Import n8n Workflows** (files in `workflows/` folder)
2. **Configure Credentials** in n8n UI
3. **Seed Database** with initial data:
   ```bash
   docker exec -it trading_postgres psql -U n8n -d wealthsimple_trader -f init.sql
   ```
4. **Enable Paper Trading Mode** in `.env`:
   ```
   TRADING_MODE=paper
   ```
5. **Activate Workflows** in n8n
6. **Monitor Logs**:
   ```bash
   docker-compose logs -f
   ```

---

## 📊 Dashboard

Open `Day Trading Dashboard.html` in your browser to see the prototype UI.

**Features**:
- Live account balance & margin health
- Open positions table with P&L
- Trade history (last 10 trades)
- Fund allocation slider ($500 - $5,000)
- Algorithm status & alerts panel

**React Version** (coming in Phase 4):
- Real-time WebSocket updates
- Historical performance charts
- Mobile-responsive design

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| [CLAUDE.md](./CLAUDE.md) | Quick reference for developers |
| [system_design_v2_n8n.md](./system_design_v2_n8n.md) | Full architecture & design |
| [implementation_tasks_n8n.md](./implementation_tasks_n8n.md) | Step-by-step setup guide |
| [IMPROVEMENTS.md](./IMPROVEMENTS.md) | Future enhancements roadmap |

---

## 🔐 Security

- **API Keys**: Never commit `.env` file (already in `.gitignore`)
- **Basic Auth**: n8n protected with username/password
- **Webhook Tokens**: All webhooks use secret tokens
- **SSL/TLS**: Enable for production deployments

---

## 🧪 Testing

**Paper Trading** (recommended 2+ weeks):
```env
TRADING_MODE=paper
```

**Backtesting** (coming soon):
```bash
cd backtest/
python run_backtest.py --start 2024-01-01 --end 2024-12-31
```

**Stress Testing**:
- Margin call scenarios
- Superficial loss rule validation
- Daily loss limit enforcement

---

## 📈 Current Status

| Phase | Status |
|-------|--------|
| Design & Documentation | ✅ Complete |
| HTML Dashboard Prototype | ✅ Complete |
| Docker Infrastructure | ⏳ Not Started |
| n8n Workflows | ⏳ Not Started |
| React Dashboard | ⏳ Not Started |
| Paper Trading | ⏳ Not Started |
| Live Trading | ⏳ Not Started |

**Next Steps**: Create `docker-compose.yml` and start building Workflow 1 (Market Scanner)

---

## 🤝 Contributing

This is a personal trading system, but suggestions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-idea`)
3. Commit your changes (`git commit -m 'Add amazing idea'`)
4. Push to the branch (`git push origin feature/amazing-idea`)
5. Open a Pull Request

---

## ⚠️ Disclaimer

**This software is for educational purposes only.**

- Trading involves substantial risk of loss
- Past performance does not guarantee future results
- Only trade with money you can afford to lose
- I am not a financial advisor
- Test thoroughly with paper trading before risking real capital
- Ensure compliance with local securities regulations

**Use at your own risk!**

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- [n8n](https://n8n.io/) - Workflow automation platform
- [SnapTrade](https://snaptrade.com/) - Wealthsimple API integration
- [Alpha Vantage](https://www.alphavantage.co/) - Market data provider

---

**Built with ☕ and Python** | **Happy Trading! 📈**
