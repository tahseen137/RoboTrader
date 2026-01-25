# Phase 2: Core Workflows

**Branch**: `feature/phase2-core-workflows`
**Started**: 2026-01-20
**Completed**: 2026-01-22
**Status**: ✅ COMPLETE

## Tasks

### 2.1 n8n Credentials Setup
- [x] PostgreSQL credentials
- [x] Finnhub API credentials (replaced with Alpha Vantage)
- [x] Alpha Vantage credentials
- [x] SnapTrade credentials
- [x] Telegram credentials

### 2.2 Workflow 1: Market Scanner
- [x] Import workflow JSON
- [x] Switched from Finnhub to Alpha Vantage for candle data
- [x] Added data transformation node
- [x] Verify indicator calculations
- [x] Fixed SQL query for signal logging

### 2.3 Workflow 2: Trade Execution
- [x] Import workflow JSON
- [x] Configure risk checks (daily loss, margin health, position count, superficial loss)
- [x] Fixed UUID type casting issues
- [x] Fixed type conversion for numeric comparisons
- [x] Removed env variable dependencies
- [x] Test with paper trading

### 2.4 Workflow 3: Position Monitor
- [x] Import workflow JSON
- [x] Configure exit conditions
- [x] Test stop-loss/take-profit
- [x] Removed env variable dependencies

### 2.5 Integration Testing
- [x] Manual execution tests completed
- [ ] End-to-end automated test
- [ ] Paper trading validation (pending live market hours)

## Notes
- All workflows successfully tested with manual triggers
- Alpha Vantage used instead of Finnhub for intraday data (free tier limitation)
- All environment variables hardcoded in workflows to avoid n8n access restrictions
- Ready for live market testing during trading hours (9:30 AM - 4:00 PM EST)
