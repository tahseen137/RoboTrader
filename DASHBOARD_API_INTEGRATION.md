# Dashboard API Integration Guide

## Overview
The dashboard is now configured to fetch real data from n8n webhooks. However, Workflow 6 needs to be manually updated in the n8n UI to include response nodes.

## What Was Done

### 1. Updated Workflow 6 (Dashboard API) ✅
**File**: `n8n-workflows/6-dashboard-api.json`

Added "Respond to Webhook" nodes after each PostgreSQL query:
- Account Data: Webhook → PostgreSQL → **Respond to Webhook**
- Positions: Webhook → PostgreSQL → **Respond to Webhook**
- Trades: Webhook → PostgreSQL → **Respond to Webhook**
- Alerts: Webhook → PostgreSQL → **Respond to Webhook**

**Before**: Workflows returned `{"message":"Workflow was started"}` (async execution)
**After**: Workflows will return actual data synchronously

### 2. Created API Hooks ✅
**File**: `frontend-new/src/hooks/use-dashboard-api.ts`

TypeScript hooks using React Query:
- `useAccountData()` - Fetches account equity, buying power, margin health, daily P&L
- `usePositions()` - Fetches open positions
- `useTrades()` - Fetches trade history
- `useAlerts()` - Fetches system alerts

Features:
- Auto-refresh every 5 seconds (configurable via VITE_UPDATE_INTERVAL)
- TypeScript interfaces matching database schema
- Error handling and loading states
- Proper cache management

### 3. Connected Components to Real Data ✅

Updated components to accept and use real data:

**AccountOverview.tsx**:
- Changed from mock data to `data` prop with API types
- Maps `equity`, `buying_power`, `margin_health`, `daily_pnl` from API
- Calculates daily P&L percentage dynamically

**PositionsTable.tsx**:
- Updated interface to match database schema (`position_id`, `entry_price`, etc.)
- Calculates unrealized P&L and percentage from current/entry prices
- Handles empty state when no positions exist

**TradeHistory.tsx**:
- Updated interface to match database schema (`trade_id`, `profit_loss`, etc.)
- Displays exit time and calculates P&L percentage
- Shows trade status from database

**AlertPanel.tsx**:
- Updated interface to match database schema (`alert_id`, `severity`, `created_at`)
- Maps severity levels to alert types (warning, error, info, success)
- Formats timestamps with relative time

**Index.tsx**:
- Imported all API hooks
- Passes real data to all dashboard components
- Auto-refreshes data every 5 seconds

## Manual Steps Required

### Update Workflow 6 in n8n UI

1. Open n8n: http://localhost:5678
2. Navigate to Workflow "6. Dashboard API"
3. For each of the 4 branches (account-data, positions, trades, alerts):

   **After the PostgreSQL node**, add a "Respond to Webhook" node:
   - Click the + icon after the PostgreSQL node
   - Search for "Respond to Webhook"
   - Configure:
     - **Respond With**: JSON
     - **Response Body**: `{{ $json }}`
   - Connect PostgreSQL → Respond to Webhook

4. Save the workflow
5. Ensure workflow is **Active** (toggle in top right)

### Test the API

After updating the workflow, test each endpoint:

```bash
# Should return account data (not "Workflow was started")
curl http://localhost:5678/webhook/account-data

# Expected:
# {"equity": 3000, "buying_power": 3000, "margin_health": 200, "daily_pnl": 0}

curl http://localhost:5678/webhook/positions
# Expected: [] or array of positions

curl http://localhost:5678/webhook/trades
# Expected: [] or array of trades

curl http://localhost:5678/webhook/alerts
# Expected: [] or array of alerts
```

## Verify Dashboard Connection

1. Start frontend: `cd frontend-new && npm run dev`
2. Open browser: http://localhost:8081
3. Open browser DevTools → Network tab
4. Look for requests to `http://localhost:5678/webhook/*`
5. Verify responses contain real data (not "Workflow was started")

## Configuration

**Environment Variables** (`.env.local`):
```bash
VITE_API_BASE_URL=http://localhost:5678/webhook
VITE_APP_TITLE=RoboTrader Dashboard
VITE_UPDATE_INTERVAL=5000  # Refresh interval in milliseconds
```

## Database Schema

The API expects these database tables:

**accounts**:
- `current_equity` → API: `equity`
- `buying_power` → API: `buying_power`
- `margin_health_score` → API: `margin_health`

**positions**:
- `position_id`, `symbol`, `quantity`, `entry_price`, `current_price`, `unrealized_pnl`

**trades**:
- `trade_id`, `symbol`, `quantity`, `entry_price`, `exit_price`, `profit_loss`, `entry_time`, `exit_time`

**alerts**:
- `alert_id`, `symbol`, `alert_type`, `message`, `severity`, `created_at`

## Troubleshooting

**Issue**: Dashboard shows "Workflow was started"
- **Cause**: Workflow 6 missing "Respond to Webhook" nodes
- **Fix**: Follow manual steps above to add response nodes

**Issue**: No data appears in dashboard
- **Cause**: Database tables are empty
- **Fix**: Run trading algorithm or insert test data

**Issue**: CORS errors in browser
- **Cause**: n8n not configured for cross-origin requests
- **Fix**: n8n webhooks should allow CORS by default, check n8n logs

**Issue**: "Failed to fetch" errors
- **Cause**: n8n container not running or wrong port
- **Fix**: `docker-compose up -d` and verify port 5678

## Next Steps

1. ✅ Update Workflow 6 with response nodes (manual)
2. Test all 4 API endpoints return data
3. Verify dashboard shows real data
4. Add error boundaries for API failures
5. Add loading skeletons for better UX
6. Implement real-time WebSocket updates (future enhancement)
