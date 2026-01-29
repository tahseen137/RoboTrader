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

interface PnLDataPoint {
  time: string;
  pnl: number;
  trade?: string;
}

const mockData: PnLDataPoint[] = [
  { time: "09:30", pnl: 0 },
  { time: "10:00", pnl: 12.50, trade: "BUY TD.TO" },
  { time: "10:30", pnl: 8.20 },
  { time: "11:00", pnl: 25.80, trade: "SELL TD.TO +$15.50" },
  { time: "11:30", pnl: 18.40 },
  { time: "12:00", pnl: 22.60, trade: "BUY SHOP.TO" },
  { time: "12:30", pnl: 28.90 },
  { time: "13:00", pnl: 24.30 },
  { time: "13:30", pnl: 32.50, trade: "SELL RY.TO -$5.20" },
  { time: "14:00", pnl: 38.20 },
  { time: "14:30", pnl: 45.60, trade: "SELL SHOP.TO +$8.40" },
  { time: "15:00", pnl: 42.10 },
  { time: "15:30", pnl: 48.80 },
];

interface PnLChartProps {
  data?: PnLDataPoint[];
}

export function PnLChart({ data = mockData }: PnLChartProps) {
  const currentPnL = data[data.length - 1]?.pnl || 0;
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
            data={data}
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
                  const point = data.find(d => d.time === label);
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
