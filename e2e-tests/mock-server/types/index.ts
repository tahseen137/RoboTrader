// TypeScript interfaces copied from frontend-new/src/hooks/use-dashboard-api.ts

export interface AccountData {
  equity: number;
  buying_power: number;
  margin_health: number;
  daily_pnl: number;
}

export interface Position {
  position_id: string;
  symbol: string;
  company_name?: string;
  quantity: number;
  entry_price: number;
  current_price?: number;
  unrealized_pnl?: number;
  unrealized_pnl_percent?: number;
  status: string;
  created_at: string;
}

export interface Trade {
  trade_id: string;
  symbol: string;
  company_name?: string;
  quantity: number;
  entry_price: number;
  exit_price: number;
  profit_loss: number;
  profit_loss_percent?: number;
  entry_time: string;
  exit_time: string;
  status: string;
  side?: string;
}

export interface Alert {
  alert_id: string;
  symbol?: string;
  company_name?: string;
  alert_type: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  created_at: string;
}

export type ScenarioName =
  | 'healthy'
  | 'warning_margin'
  | 'critical_margin'
  | 'daily_loss_limit'
  | 'no_positions'
  | 'single_position'
  | 'many_positions'
  | 'profitable_day'
  | 'losing_day'
  | 'mixed_alerts'
  | 'empty_state';

export interface Scenario {
  accountData: AccountData;
  positions: Position[];
  trades: Trade[];
  alerts: Alert[];
}
