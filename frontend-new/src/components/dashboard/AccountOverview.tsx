import { Wallet, TrendingUp, BarChart3, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  trend?: "up" | "down" | "neutral";
  progress?: number;
  delay?: number;
}

function MetricCard({ icon, label, value, subValue, trend, progress, delay = 0 }: MetricCardProps) {
  const trendColors = {
    up: "text-profit text-glow-profit",
    down: "text-loss text-glow-loss",
    neutral: "text-foreground",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card p-5 hover:bg-card/90 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>
        {subValue && (
          <span className={`text-sm font-medium ${trend ? trendColors[trend] : 'text-muted-foreground'}`}>
            {subValue}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`text-2xl font-bold font-mono ${trend ? trendColors[trend] : 'text-foreground'}`}>
          {value}
        </p>
      </div>
      {progress !== undefined && (
        <div className="mt-4">
          <Progress 
            value={progress} 
            className="h-2 bg-muted"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {progress >= 150 ? "Healthy" : progress >= 100 ? "Moderate" : "Critical"}
          </p>
        </div>
      )}
    </motion.div>
  );
}

interface AccountData {
  equity: number;
  buying_power: number;
  margin_health: number;
  daily_pnl: number;
}

interface AccountOverviewProps {
  data?: AccountData;
}

export function AccountOverview({ data }: AccountOverviewProps) {
  const equity = data?.equity ?? 3000.00;
  const buyingPower = data?.buying_power ?? 3000.00;
  const marginHealth = data?.margin_health ?? 200;
  const dailyPnL = data?.daily_pnl ?? 0;
  const dailyPnLPercent = equity > 0 ? (dailyPnL / equity) * 100 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        icon={<Wallet className="w-5 h-5" />}
        label="Total Equity"
        value={formatCurrency(equity)}
        delay={0}
      />
      <MetricCard
        icon={<TrendingUp className="w-5 h-5" />}
        label="Buying Power"
        value={formatCurrency(buyingPower)}
        delay={0.1}
      />
      <MetricCard
        icon={<BarChart3 className="w-5 h-5" />}
        label="Margin Health"
        value={`${marginHealth}%`}
        progress={marginHealth}
        delay={0.2}
      />
      <MetricCard
        icon={<DollarSign className="w-5 h-5" />}
        label="Daily P&L"
        value={formatCurrency(dailyPnL)}
        subValue={`${dailyPnL >= 0 ? "+" : ""}${dailyPnLPercent.toFixed(2)}%`}
        trend={dailyPnL >= 0 ? "up" : "down"}
        delay={0.3}
      />
    </div>
  );
}
