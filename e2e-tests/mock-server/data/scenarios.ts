import type { Scenario, ScenarioName } from '../types/index.js';

// Helper functions to generate timestamps
const minutesAgo = (mins: number) => new Date(Date.now() - mins * 60 * 1000).toISOString();
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

export const scenarios: Record<ScenarioName, Scenario> = {
  healthy: {
    accountData: {
      equity: 10000.00,
      buying_power: 8500.00,
      margin_health: 200,
      daily_pnl: 150.50
    },
    positions: [
      {
        position_id: 'pos-001',
        symbol: 'AAPL',
        company_name: 'Apple Inc.',
        quantity: 10,
        entry_price: 175.50,
        current_price: 180.25,
        unrealized_pnl: 47.50,
        unrealized_pnl_percent: 2.71,
        status: 'OPEN',
        created_at: hoursAgo(2)
      },
      {
        position_id: 'pos-002',
        symbol: 'MSFT',
        company_name: 'Microsoft Corporation',
        quantity: 5,
        entry_price: 380.00,
        current_price: 395.00,
        unrealized_pnl: 75.00,
        unrealized_pnl_percent: 3.95,
        status: 'OPEN',
        created_at: hoursAgo(1)
      }
    ],
    trades: [
      {
        trade_id: 'trade-001',
        symbol: 'GOOGL',
        company_name: 'Alphabet Inc.',
        quantity: 8,
        entry_price: 140.00,
        exit_price: 145.50,
        profit_loss: 44.00,
        profit_loss_percent: 3.93,
        entry_time: hoursAgo(4),
        exit_time: hoursAgo(3),
        status: 'PROFIT_TARGET',
        side: 'BUY'
      },
      {
        trade_id: 'trade-002',
        symbol: 'TSLA',
        company_name: 'Tesla Inc.',
        quantity: 5,
        entry_price: 245.00,
        exit_price: 242.00,
        profit_loss: -15.00,
        profit_loss_percent: -1.22,
        entry_time: hoursAgo(5),
        exit_time: hoursAgo(4),
        status: 'STOP_LOSS',
        side: 'BUY'
      }
    ],
    alerts: [
      {
        alert_id: 'alert-001',
        symbol: 'AAPL',
        alert_type: 'POSITION_OPENED',
        message: 'Position opened: BUY 10 AAPL @ $175.50',
        severity: 'info',
        created_at: hoursAgo(2)
      },
      {
        alert_id: 'alert-002',
        symbol: 'GOOGL',
        alert_type: 'PROFIT_TARGET',
        message: 'Profit target hit: GOOGL +$44.00 (+3.93%)',
        severity: 'success',
        created_at: hoursAgo(3)
      }
    ]
  },

  warning_margin: {
    accountData: {
      equity: 5000.00,
      buying_power: 1200.00,
      margin_health: 135,
      daily_pnl: -75.00
    },
    positions: [
      {
        position_id: 'pos-001',
        symbol: 'NVDA',
        company_name: 'NVIDIA Corporation',
        quantity: 8,
        entry_price: 480.00,
        current_price: 465.00,
        unrealized_pnl: -120.00,
        unrealized_pnl_percent: -3.13,
        status: 'OPEN',
        created_at: hoursAgo(3)
      }
    ],
    trades: [],
    alerts: [
      {
        alert_id: 'alert-001',
        alert_type: 'MARGIN_WARNING',
        message: 'Margin health at 135% - approaching minimum threshold',
        severity: 'warning',
        created_at: minutesAgo(5)
      }
    ]
  },

  critical_margin: {
    accountData: {
      equity: 3000.00,
      buying_power: 200.00,
      margin_health: 85,
      daily_pnl: -180.00
    },
    positions: [
      {
        position_id: 'pos-001',
        symbol: 'TSLA',
        company_name: 'Tesla Inc.',
        quantity: 10,
        entry_price: 260.00,
        current_price: 235.00,
        unrealized_pnl: -250.00,
        unrealized_pnl_percent: -9.62,
        status: 'OPEN',
        created_at: hoursAgo(4)
      }
    ],
    trades: [],
    alerts: [
      {
        alert_id: 'alert-001',
        alert_type: 'MARGIN_CRITICAL',
        message: 'CRITICAL: Margin health below 100% - liquidation imminent',
        severity: 'error',
        created_at: minutesAgo(1)
      },
      {
        alert_id: 'alert-002',
        alert_type: 'MARGIN_WARNING',
        message: 'Margin health dropped to 85%',
        severity: 'warning',
        created_at: minutesAgo(10)
      }
    ]
  },

  daily_loss_limit: {
    accountData: {
      equity: 8000.00,
      buying_power: 6000.00,
      margin_health: 175,
      daily_pnl: -400.00
    },
    positions: [],
    trades: [
      {
        trade_id: 'trade-001',
        symbol: 'AMD',
        company_name: 'Advanced Micro Devices',
        quantity: 15,
        entry_price: 145.00,
        exit_price: 138.00,
        profit_loss: -105.00,
        profit_loss_percent: -4.83,
        entry_time: hoursAgo(3),
        exit_time: hoursAgo(2),
        status: 'STOP_LOSS',
        side: 'BUY'
      },
      {
        trade_id: 'trade-002',
        symbol: 'META',
        company_name: 'Meta Platforms Inc.',
        quantity: 5,
        entry_price: 500.00,
        exit_price: 470.00,
        profit_loss: -150.00,
        profit_loss_percent: -6.00,
        entry_time: hoursAgo(5),
        exit_time: hoursAgo(4),
        status: 'STOP_LOSS',
        side: 'BUY'
      }
    ],
    alerts: [
      {
        alert_id: 'alert-001',
        alert_type: 'DAILY_LOSS_LIMIT',
        message: 'Daily loss limit reached (-5%). Trading paused until tomorrow.',
        severity: 'error',
        created_at: minutesAgo(30)
      }
    ]
  },

  no_positions: {
    accountData: {
      equity: 10000.00,
      buying_power: 10000.00,
      margin_health: 300,
      daily_pnl: 0
    },
    positions: [],
    trades: [],
    alerts: []
  },

  single_position: {
    accountData: {
      equity: 10000.00,
      buying_power: 8000.00,
      margin_health: 200,
      daily_pnl: 47.50
    },
    positions: [
      {
        position_id: 'pos-001',
        symbol: 'AAPL',
        company_name: 'Apple Inc.',
        quantity: 10,
        entry_price: 175.50,
        current_price: 180.25,
        unrealized_pnl: 47.50,
        unrealized_pnl_percent: 2.71,
        status: 'OPEN',
        created_at: hoursAgo(1)
      }
    ],
    trades: [],
    alerts: [
      {
        alert_id: 'alert-001',
        symbol: 'AAPL',
        alert_type: 'POSITION_OPENED',
        message: 'Position opened: BUY 10 AAPL @ $175.50',
        severity: 'info',
        created_at: hoursAgo(1)
      }
    ]
  },

  many_positions: {
    accountData: {
      equity: 25000.00,
      buying_power: 5000.00,
      margin_health: 165,
      daily_pnl: 325.00
    },
    positions: [
      { position_id: 'pos-001', symbol: 'AAPL', company_name: 'Apple Inc.', quantity: 10, entry_price: 175.50, current_price: 180.25, unrealized_pnl: 47.50, unrealized_pnl_percent: 2.71, status: 'OPEN', created_at: hoursAgo(1) },
      { position_id: 'pos-002', symbol: 'MSFT', company_name: 'Microsoft Corporation', quantity: 5, entry_price: 380.00, current_price: 395.00, unrealized_pnl: 75.00, unrealized_pnl_percent: 3.95, status: 'OPEN', created_at: hoursAgo(2) },
      { position_id: 'pos-003', symbol: 'GOOGL', company_name: 'Alphabet Inc.', quantity: 8, entry_price: 140.00, current_price: 138.50, unrealized_pnl: -12.00, unrealized_pnl_percent: -1.07, status: 'OPEN', created_at: hoursAgo(3) },
      { position_id: 'pos-004', symbol: 'TSLA', company_name: 'Tesla Inc.', quantity: 5, entry_price: 245.00, current_price: 252.00, unrealized_pnl: 35.00, unrealized_pnl_percent: 2.86, status: 'OPEN', created_at: hoursAgo(4) },
      { position_id: 'pos-005', symbol: 'AMZN', company_name: 'Amazon.com Inc.', quantity: 12, entry_price: 178.00, current_price: 185.50, unrealized_pnl: 90.00, unrealized_pnl_percent: 4.21, status: 'OPEN', created_at: hoursAgo(5) },
      { position_id: 'pos-006', symbol: 'NVDA', company_name: 'NVIDIA Corporation', quantity: 3, entry_price: 480.00, current_price: 495.00, unrealized_pnl: 45.00, unrealized_pnl_percent: 3.13, status: 'OPEN', created_at: hoursAgo(6) },
      { position_id: 'pos-007', symbol: 'AMD', company_name: 'Advanced Micro Devices', quantity: 15, entry_price: 145.00, current_price: 142.00, unrealized_pnl: -45.00, unrealized_pnl_percent: -2.07, status: 'OPEN', created_at: hoursAgo(7) },
      { position_id: 'pos-008', symbol: 'META', company_name: 'Meta Platforms Inc.', quantity: 4, entry_price: 500.00, current_price: 515.00, unrealized_pnl: 60.00, unrealized_pnl_percent: 3.00, status: 'OPEN', created_at: hoursAgo(8) },
      { position_id: 'pos-009', symbol: 'NFLX', company_name: 'Netflix Inc.', quantity: 6, entry_price: 475.00, current_price: 468.00, unrealized_pnl: -42.00, unrealized_pnl_percent: -1.47, status: 'OPEN', created_at: hoursAgo(9) },
      { position_id: 'pos-010', symbol: 'CRM', company_name: 'Salesforce Inc.', quantity: 8, entry_price: 265.00, current_price: 272.00, unrealized_pnl: 56.00, unrealized_pnl_percent: 2.64, status: 'OPEN', created_at: hoursAgo(10) },
      { position_id: 'pos-011', symbol: 'ORCL', company_name: 'Oracle Corporation', quantity: 10, entry_price: 125.00, current_price: 128.00, unrealized_pnl: 30.00, unrealized_pnl_percent: 2.40, status: 'OPEN', created_at: hoursAgo(11) },
      { position_id: 'pos-012', symbol: 'INTC', company_name: 'Intel Corporation', quantity: 20, entry_price: 45.00, current_price: 43.50, unrealized_pnl: -30.00, unrealized_pnl_percent: -3.33, status: 'OPEN', created_at: hoursAgo(12) },
    ],
    trades: [],
    alerts: []
  },

  profitable_day: {
    accountData: {
      equity: 12500.00,
      buying_power: 10000.00,
      margin_health: 220,
      daily_pnl: 450.00
    },
    positions: [],
    trades: [
      { trade_id: 'trade-001', symbol: 'AAPL', company_name: 'Apple Inc.', quantity: 10, entry_price: 175.00, exit_price: 180.50, profit_loss: 55.00, profit_loss_percent: 3.14, entry_time: hoursAgo(6), exit_time: hoursAgo(5), status: 'PROFIT_TARGET', side: 'BUY' },
      { trade_id: 'trade-002', symbol: 'MSFT', company_name: 'Microsoft Corporation', quantity: 8, entry_price: 375.00, exit_price: 388.00, profit_loss: 104.00, profit_loss_percent: 3.47, entry_time: hoursAgo(5), exit_time: hoursAgo(4), status: 'PROFIT_TARGET', side: 'BUY' },
      { trade_id: 'trade-003', symbol: 'GOOGL', company_name: 'Alphabet Inc.', quantity: 12, entry_price: 138.00, exit_price: 143.50, profit_loss: 66.00, profit_loss_percent: 3.99, entry_time: hoursAgo(4), exit_time: hoursAgo(3), status: 'TRAILING_STOP', side: 'BUY' },
      { trade_id: 'trade-004', symbol: 'NVDA', company_name: 'NVIDIA Corporation', quantity: 5, entry_price: 470.00, exit_price: 465.00, profit_loss: -25.00, profit_loss_percent: -1.06, entry_time: hoursAgo(3), exit_time: hoursAgo(2), status: 'STOP_LOSS', side: 'BUY' },
      { trade_id: 'trade-005', symbol: 'AMZN', company_name: 'Amazon.com Inc.', quantity: 15, entry_price: 175.00, exit_price: 185.00, profit_loss: 150.00, profit_loss_percent: 5.71, entry_time: hoursAgo(2), exit_time: hoursAgo(1), status: 'PROFIT_TARGET', side: 'BUY' },
      { trade_id: 'trade-006', symbol: 'TSLA', company_name: 'Tesla Inc.', quantity: 8, entry_price: 240.00, exit_price: 252.50, profit_loss: 100.00, profit_loss_percent: 5.21, entry_time: hoursAgo(1), exit_time: minutesAgo(30), status: 'PROFIT_TARGET', side: 'BUY' },
    ],
    alerts: [
      { alert_id: 'alert-001', alert_type: 'DAILY_SUMMARY', message: 'Great day! 5 wins, 1 loss. Total P&L: +$450.00', severity: 'success', created_at: minutesAgo(5) }
    ]
  },

  losing_day: {
    accountData: {
      equity: 9200.00,
      buying_power: 7500.00,
      margin_health: 180,
      daily_pnl: -280.00
    },
    positions: [],
    trades: [
      { trade_id: 'trade-001', symbol: 'TSLA', company_name: 'Tesla Inc.', quantity: 5, entry_price: 250.00, exit_price: 242.00, profit_loss: -40.00, profit_loss_percent: -3.20, entry_time: hoursAgo(5), exit_time: hoursAgo(4), status: 'STOP_LOSS', side: 'BUY' },
      { trade_id: 'trade-002', symbol: 'NVDA', company_name: 'NVIDIA Corporation', quantity: 3, entry_price: 480.00, exit_price: 468.00, profit_loss: -36.00, profit_loss_percent: -2.50, entry_time: hoursAgo(4), exit_time: hoursAgo(3), status: 'STOP_LOSS', side: 'BUY' },
      { trade_id: 'trade-003', symbol: 'AMD', company_name: 'Advanced Micro Devices', quantity: 10, entry_price: 148.00, exit_price: 140.00, profit_loss: -80.00, profit_loss_percent: -5.41, entry_time: hoursAgo(3), exit_time: hoursAgo(2), status: 'STOP_LOSS', side: 'BUY' },
      { trade_id: 'trade-004', symbol: 'META', company_name: 'Meta Platforms Inc.', quantity: 2, entry_price: 505.00, exit_price: 480.00, profit_loss: -50.00, profit_loss_percent: -4.95, entry_time: hoursAgo(2), exit_time: hoursAgo(1), status: 'STOP_LOSS', side: 'BUY' },
      { trade_id: 'trade-005', symbol: 'AAPL', company_name: 'Apple Inc.', quantity: 8, entry_price: 178.00, exit_price: 168.50, profit_loss: -76.00, profit_loss_percent: -5.34, entry_time: hoursAgo(1), exit_time: minutesAgo(30), status: 'STOP_LOSS', side: 'BUY' },
    ],
    alerts: [
      { alert_id: 'alert-001', alert_type: 'DAILY_WARNING', message: 'Tough day. 0 wins, 5 losses. Consider reviewing strategy.', severity: 'warning', created_at: minutesAgo(10) }
    ]
  },

  mixed_alerts: {
    accountData: {
      equity: 10000.00,
      buying_power: 8000.00,
      margin_health: 180,
      daily_pnl: 50.00
    },
    positions: [
      { position_id: 'pos-001', symbol: 'AAPL', company_name: 'Apple Inc.', quantity: 10, entry_price: 175.50, current_price: 178.00, unrealized_pnl: 25.00, unrealized_pnl_percent: 1.42, status: 'OPEN', created_at: hoursAgo(1) }
    ],
    trades: [],
    alerts: [
      { alert_id: 'alert-001', symbol: 'AAPL', alert_type: 'POSITION_OPENED', message: 'Position opened: BUY 10 AAPL @ $175.50', severity: 'info', created_at: minutesAgo(2) },
      { alert_id: 'alert-002', alert_type: 'MARGIN_WARNING', message: 'Margin health at 140% - monitor closely', severity: 'warning', created_at: minutesAgo(15) },
      { alert_id: 'alert-003', alert_type: 'API_ERROR', message: 'Alpha Vantage API rate limit reached. Using cached data.', severity: 'error', created_at: minutesAgo(30) },
      { alert_id: 'alert-004', symbol: 'MSFT', alert_type: 'POSITION_CLOSED', message: 'Position closed: MSFT +$56.00 (Profit Target)', severity: 'success', created_at: minutesAgo(45) },
      { alert_id: 'alert-005', alert_type: 'SYSTEM_INFO', message: 'Market scanner running. Next scan in 5 minutes.', severity: 'info', created_at: minutesAgo(60) },
    ]
  },

  empty_state: {
    accountData: {
      equity: 0,
      buying_power: 0,
      margin_health: 0,
      daily_pnl: 0
    },
    positions: [],
    trades: [],
    alerts: []
  }
};

export function getScenario(name: ScenarioName): Scenario {
  return scenarios[name] || scenarios.healthy;
}
