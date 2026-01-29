import { useQuery } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5678/webhook";
const UPDATE_INTERVAL = parseInt(import.meta.env.VITE_UPDATE_INTERVAL || "5000");

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
  entry_time: string;
  exit_time: string;
  status: string;
}

export interface Alert {
  alert_id: string;
  symbol?: string;
  company_name?: string;
  alert_type: string;
  message: string;
  severity: string;
  created_at: string;
}

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/${endpoint}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  const data = await response.json();
  // n8n returns array, take first item for account data
  return Array.isArray(data) ? data[0] || {} : data;
}

async function fetchArrayAPI<T>(endpoint: string): Promise<T[]> {
  const response = await fetch(`${API_BASE_URL}/${endpoint}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export function useAccountData() {
  return useQuery<AccountData>({
    queryKey: ["account-data"],
    queryFn: () => fetchAPI<AccountData>("account-data"),
    refetchInterval: UPDATE_INTERVAL,
    staleTime: UPDATE_INTERVAL - 1000,
  });
}

export function usePositions() {
  return useQuery<Position[]>({
    queryKey: ["positions"],
    queryFn: () => fetchArrayAPI<Position>("positions"),
    refetchInterval: UPDATE_INTERVAL,
    staleTime: UPDATE_INTERVAL - 1000,
  });
}

export function useTrades() {
  return useQuery<Trade[]>({
    queryKey: ["trades"],
    queryFn: () => fetchArrayAPI<Trade>("trades"),
    refetchInterval: UPDATE_INTERVAL * 2, // Trades update less frequently
    staleTime: UPDATE_INTERVAL * 2 - 1000,
  });
}

export function useAlerts() {
  return useQuery<Alert[]>({
    queryKey: ["alerts"],
    queryFn: () => fetchArrayAPI<Alert>("alerts"),
    refetchInterval: UPDATE_INTERVAL,
    staleTime: UPDATE_INTERVAL - 1000,
  });
}
