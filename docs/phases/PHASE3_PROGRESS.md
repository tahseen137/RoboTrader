# Phase 3: Risk Management & Tax Tracking

**Status**: ✅ COMPLETE
**Completed**: January 25, 2026

---

## Tasks

### 3.1 Workflow 4: Risk Management
- [x] Schedule trigger (every 5 minutes)
- [x] Fetch account data & daily P&L
- [x] Calculate margin health & risk metrics
- [x] Alert system (green/yellow/red thresholds)
- [x] Emergency liquidation logic
- [x] Disable trading on critical alerts
- [x] Log alerts to database
- [x] Telegram notifications

### 3.2 Workflow 5: Tax Tracking
- [x] Webhook trigger (post-trade)
- [x] 30-day superficial loss detection
- [x] ACB (Adjusted Cost Base) calculation
- [x] Tax lot management
- [x] Flag superficial losses
- [x] Tax alerts to database

### 3.3 Integration
- [x] Position Monitor triggers Tax Tracking webhook
- [x] Risk alerts stored in alerts table
- [x] Daily metrics updated

---

## Workflow Details

### Workflow 4: Risk Management
**File**: `n8n-workflows/4-risk-management.json`

**Features**:
- Monitors margin health every 5 minutes
- Alert levels:
  - 🟢 Green: >150% (safe)
  - 🟡 Yellow: 125-150% (warning)
  - 🔴 Red: <125% (critical)
- Daily loss limit: 5% of equity
- Emergency actions:
  - Disable trading algorithm
  - Fetch all open positions
  - Send Telegram alert
  - Log to database

### Workflow 5: Tax Tracking
**File**: `n8n-workflows/5-tax-tracking.json`

**Features**:
- Canadian superficial loss rule (30 days)
- ACB calculation per symbol
- Tax lot tracking
- Automatic flagging
- Tax alerts for year-end reporting

---

## Import Instructions

1. Open n8n: http://localhost:5678
2. Import `4-risk-management.json`
3. Import `5-tax-tracking.json`
4. Verify PostgreSQL credentials connected
5. Activate both workflows

---

## Testing

Run manual tests:
```sql
-- Test margin alert
UPDATE accounts SET margin_health_score = 120 WHERE snaptrade_account_id = 'test_account_123';

-- Execute Workflow 4, check alerts table
SELECT * FROM alerts ORDER BY created_at DESC LIMIT 3;

-- Test tax tracking (requires closed trade)
-- Execute Workflow 5 via webhook with trade_id
```

---

## Next Steps

- [ ] Import workflows to n8n
- [ ] Test margin alerts
- [ ] Test superficial loss detection
- [ ] Switch to scheduled triggers (production)
- [ ] Monitor during market hours
