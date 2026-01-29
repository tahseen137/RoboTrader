# RoboTrader - Complete UI Feature List for Design

## Current Implementation (5 Components)

1. **AccountOverview** - Account metrics display
2. **PositionsTable** - Open positions table
3. **TradeHistory** - Past trades table
4. **AlertPanel** - System alerts
5. **FundSlider** - Capital allocation control

---

## DESIGN SYSTEM

**Theme:** Dark mode trading dashboard
**Colors:**
- Primary: `#00ff88` (Neon green)
- Secondary: `#ff4444` (Red)
- Background: `#0a0e1a` (Dark)
- Paper: `#161b2e` (Cards)

**Framework:** Material-UI (MUI)
**Update:** Real-time (5-second polling)

---

## 1. ACCOUNT OVERVIEW SECTION

### Display Cards (4 metrics in a row)

**Total Equity**
- Icon: 💰 AccountBalance
- Value: $3,000.00
- Label: "Total Equity"
- Color: Primary green

**Buying Power**
- Icon: 📈 TrendingUp
- Value: $3,000.00
- Label: "Buying Power"
- Color: Success green

**Margin Health**
- Icon: 📊 ShowChart
- Value: 200%
- Label: "Margin Health"
- Color: Dynamic (green/yellow/red)
- Progress bar below

**Daily P&L**
- Value: +$15.50 or -$8.20
- Label: "Daily P&L"
- Color: Green (profit) / Red (loss)

### Features
- 4-column responsive grid
- Card shadows/elevation
- Icon + value + label layout
- Linear progress bar for margin

---

## 2. POSITIONS TABLE

### Columns (7)
1. Symbol (e.g., TD.TO)
2. Quantity (shares)
3. Entry Price ($XXX.XX)
4. Current Price ($XXX.XX)
5. Unrealized P&L ($±XX.XX)
6. P&L % (±X.X%)
7. Actions (Close button)

### Features
- Sortable columns
- Color-coded P&L (green/red)
- Pagination (10 per page)
- Row hover effects
- Empty state message
- Responsive horizontal scroll

---

## 3. ALERT PANEL

### Alert Types

**Warning (Yellow)**
- Icon: ⚠️
- Example: "Margin at 135%"
- Left border: 4px yellow

**Error (Red)**
- Icon: 🚨
- Example: "Daily loss at 4%"
- Left border: 4px red

**Info (Blue)**
- Icon: ℹ️
- Example: "Trade executed"
- Left border: 4px blue

**Success (Green)**
- Icon: ✅
- Example: "Position closed +$15"
- Left border: 4px green

### Features
- Auto-dismiss after 30s
- Manual close (X button)
- Stack vertically
- Slide-in animation
- Show latest 5 alerts
- Relative timestamps ("3m ago")

---

## 4. TRADE HISTORY TABLE

### Columns (9)
1. Date/Time (MMM DD, HH:MM)
2. Symbol
3. Side (BUY/SELL badge)
4. Quantity
5. Entry Price
6. Exit Price
7. P&L ($±XX.XX)
8. P&L %
9. Reason (badge)

### Exit Reason Badges
- PROFIT_TARGET (green)
- STOP_LOSS (red)
- TRAILING_STOP (yellow)
- MANUAL (blue)
- EOD (gray)

### Features
- Date range filter
- Symbol filter
- Side filter (All/BUY/SELL)
- Pagination (20 per page)
- Export CSV button
- Summary bar:
  - Total trades
  - Win rate
  - Total P&L
  - Best/worst trade

---

## 5. FUND ALLOCATION SLIDER

### Slider Control
```
Trading Capital Allocation
├─────────●──────────────┤
$0       $3,000      $10,000

Current: $3,000
Position Size (10%): $300
Max Positions: 3
Total at Risk: $900
```

### Features
- Drag slider ($0-$10,000)
- Real-time calculations
- Preset buttons ($1K, $3K, $5K, $10K)
- Color-coded risk levels
- Save button
- Validation (min $100)

---

## 6. HEADER / NAV BAR

### Left Side
- Logo: "RoboTrader" (neon green)
- Status indicator:
  - 🟢 Live
  - 🟡 Paper
  - 🔴 Stopped
  - ⚪ Market Closed

### Right Side
- Current time
- Countdown to market close
- Settings icon
- Help icon
- Profile/Logout menu

---

## 7. REAL-TIME INDICATORS

### Status Badges

**Market Status**
- 🟢 Market Open (9:30 AM - 4:00 PM)
- 🔴 Market Closed
- 🟡 Pre-Market / After-Hours

**System Status**
- 🟢 Connected
- 🔴 Disconnected
- 🟡 Reconnecting...

**Algorithm Status**
- ✅ Trading Active
- ⏸️ Paused
- ❌ Disabled
- ⚠️ Daily Limit Hit

### Data Pulse
- Green dot pulses on update
- "Last updated: 3s ago"
- Red warning on failure

---

## 8. CHARTS & VISUALIZATIONS

### Daily P&L Chart (Line)
- Time axis (9:30 AM - 4:00 PM)
- Cumulative P&L ($)
- Green above $0, red below
- Gradient fill
- Trade markers as dots
- Hover tooltip

### Win Rate Pie Chart
- Green: Wins
- Red: Losses
- Gray: Breakeven
- Center: Win rate %
- Legend with counts

### Position Distribution (Bar)
- Stock symbols on X-axis
- Position value ($) on Y-axis
- Gradient bars
- Hover shows value
- Red line at limit

### Monthly Calendar Heatmap
- 7×5 grid (month view)
- Color: Red (loss) → Green (profit)
- Cell shows daily P&L
- Click for details

---

## 9. MOBILE RESPONSIVE

### Breakpoints
- Desktop (>1200px): 4 columns
- Tablet (768-1199px): 2 columns
- Mobile (<768px): 1 column stack

### Mobile Features
- Hamburger menu
- Swipeable cards
- Bottom navigation bar
- Horizontal scroll tables
- Compact charts
- FAB (Floating Action Button)

### Touch Gestures
- Swipe: Navigate
- Pull to refresh
- Long press: Context menu
- Pinch zoom: Charts

---

## 10. ADVANCED FEATURES

### Watchlist Manager
- Add/remove stocks
- Star favorites
- Live prices
- Drag to reorder

### Trade Simulator
- "What-if" calculator
- Input: Stock, qty, price
- Shows: Expected P&L
- Risk/reward ratio

### Performance Analytics
- Total trades
- Win rate
- Average profit
- Best/worst trades
- Sharpe ratio
- Max drawdown
- Time filters (Day/Week/Month/Year)
- Export PDF report

### Notifications Center
- Bell icon with count badge
- Dropdown list
- Categories: Trades/Alerts/System
- Mark read/unread
- Clear all

### Risk Dashboard
- Gauge: Risk level (0-100%)
- Open positions: X/3
- Capital deployed
- Daily loss vs limit
- Margin health
- Emergency stop button

---

## 11. COMPONENT RECOMMENDATIONS

### Charts
- Library: Recharts or Chart.js
- Types: Line, Pie, Bar, Area, Heatmap

### Tables
- Library: MUI DataGrid
- Features: Sort, filter, page, export

### Icons
- Library: Material Icons
- Consistent with MUI

### Indicators
- Library: MUI Chips/Badges
- Status, alerts, trade badges

---

## 12. COLOR SYSTEM

### Semantic Colors
- Profit: `#00ff88`
- Loss: `#ff4444`
- Warning: `#ffc107`
- Info: `#2196f3`
- Neutral: `#9e9e9e`

### Backgrounds
- Primary: `#0a0e1a`
- Secondary: `#161b2e`
- Hover: `#1e2537`

### Text
- Primary: `#ffffff`
- Secondary: `#b0b8c8`
- Disabled: `#6b7280`

### Borders
- Border: `rgba(255,255,255,0.12)`
- Divider: `rgba(255,255,255,0.08)`

---

## 13. TYPOGRAPHY

- H1: 48px (Logo)
- H2: 36px (Page titles)
- H3: 24px (Sections)
- H4: 20px (Cards)
- H5: 16px (Subheaders)
- Body1: 14px (Main)
- Body2: 12px (Secondary)
- Caption: 10px (Labels)

---

## 14. ANIMATIONS

### Transitions
- Page load: Fade in (300ms)
- Cards: Slide up + fade (200ms)
- Hover: Scale 1.02 (150ms)
- Click: Scale 0.95 (100ms)
- Alerts: Slide from right (250ms)
- Data update: Pulse green (500ms)

### Loading States
- Skeleton screens (tables/cards)
- Circular spinner (API calls)
- Linear progress (top bar)
- Shimmer effect

### Feedback
- Success: ✓ animation + green flash
- Error: Shake + red border
- Save: Ripple effect
- Delete: Fade + slide left

---

## SUMMARY

**Total Features:**
- 6 main dashboard sections
- 2 data tables (sortable, filterable)
- 4+ chart types
- 8 real-time status indicators
- 5 interactive controls
- 4 alert severity types
- 3 responsive breakpoints
- 10+ micro-interactions

**Pages:**
- 1 main dashboard
- 3 modals (Settings, Help, Analytics)

**Backend Integration:**
- 4 API endpoints (account, positions, trades, alerts)
- 5-second polling for real-time updates
- RESTful webhooks via n8n

---

This feature list is production-ready and integrates with your existing n8n workflow backend.
