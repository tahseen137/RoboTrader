import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Trade {
  trade_id: string;
  symbol: string;
  profit_loss: number;
  exit_time: string;
}

interface PnLDataPoint {
  time: string;
  pnl: number;
  trade?: string;
}

interface PnLChartProps {
  data?: Trade[];
}

export function PnLChart({ data: trades }: PnLChartProps) {
  // Convert trades to cumulative P&L chart data
  const chartData: PnLDataPoint[] = [];

  if (trades && trades.length > 0) {
    let cumulativePnL = 0;
    trades.forEach((trade) => {
      cumulativePnL += trade.profit_loss;
      const exitTime = new Date(trade.exit_time);
      chartData.push({
        time: exitTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        pnl: cumulativePnL,
        trade: `${trade.symbol} ${trade.profit_loss >= 0 ? '+' : ''}$${trade.profit_loss.toFixed(2)}`,
      });
    });
  } else {
    // Default data if no trades
    chartData.push({ time: "09:30", pnl: 0 });
  }

  const currentPnL = chartData[chartData.length - 1]?.pnl || 0;
  const isProfit = currentPnL >= 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Daily P&L
        </h3>
        <div className={`text-2xl font-bold font-mono ${isProfit ? 'text-profit text-glow-profit' : 'text-loss text-glow-loss'}`}>
          {isProfit ? '+' : ''}{formatCurrency(currentPnL)}
        </div>
      </div>

      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(152, 100%, 50%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(152, 100%, 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(224, 47%, 18%)"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const value = payload[0].value as number;
                  const point = chartData.find(d => d.time === label);
                  return (
                    <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
                      <p className="text-sm text-muted-foreground">{label}</p>
                      <p className={`text-lg font-bold font-mono ${value >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {value >= 0 ? '+' : ''}{formatCurrency(value)}
                      </p>
                      {point?.trade && (
                        <p className="text-xs text-primary mt-1">{point.trade}</p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="pnl"
              stroke={isProfit ? "hsl(152, 100%, 50%)" : "hsl(0, 84%, 60%)"}
              strokeWidth={2}
              fill={isProfit ? "url(#profitGradient)" : "url(#lossGradient)"}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Trade markers legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-profit" />
          <span>Profitable trades</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-loss" />
          <span>Loss trades</span>
        </div>
      </div>
    </motion.div>
  );
}
