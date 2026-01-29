import { motion } from "framer-motion";
import { Shield, AlertOctagon, TrendingDown, Wallet, BarChart2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface AccountData {
  equity?: number;
  buying_power?: number;
  margin_health?: number;
  daily_pnl?: number;
}

interface RiskDashboardProps {
  data?: AccountData;
  onEmergencyStop?: () => void;
}

export function RiskDashboard({ data, onEmergencyStop }: RiskDashboardProps) {
  // Extract values with defaults
  const totalCapital = data?.equity ?? 3000;
  const marginHealth = data?.margin_health ?? 200;
  const dailyPnl = data?.daily_pnl ?? 0;

  // Calculate risk metrics
  const dailyLossLimit = totalCapital * 0.05; // 5% of capital
  const dailyLoss = Math.abs(Math.min(dailyPnl, 0));
  const capitalDeployed = totalCapital - (data?.buying_power ?? totalCapital);
  const openPositions = 0; // Will be calculated from positions data later
  const maxPositions = 3;

  // Calculate risk level (0-100)
  const lossRisk = (dailyLoss / dailyLossLimit) * 50; // 0-50 based on daily loss
  const deploymentRisk = (capitalDeployed / totalCapital) * 30; // 0-30 based on deployment
  const marginRisk = marginHealth < 150 ? (150 - marginHealth) / 150 * 20 : 0; // 0-20 based on margin
  const riskLevel = Math.min(100, lossRisk + deploymentRisk + marginRisk);

  const risk = {
    riskLevel,
    openPositions,
    maxPositions,
    capitalDeployed,
    totalCapital,
    dailyLoss,
    dailyLossLimit,
    marginHealth,
  };

  const getRiskColor = (level: number) => {
    if (level < 30) return "text-profit";
    if (level < 60) return "text-warning";
    return "text-loss";
  };

  const getRiskLabel = (level: number) => {
    if (level < 30) return "Low";
    if (level < 60) return "Moderate";
    return "High";
  };

  const handleEmergencyStop = () => {
    onEmergencyStop?.();
    toast({
      title: "Emergency Stop Activated",
      description: "All trading has been halted. Positions remain open.",
      variant: "destructive",
    });
  };

  const capitalPercent = (risk.capitalDeployed / risk.totalCapital) * 100;
  const lossPercent = (risk.dailyLoss / risk.dailyLossLimit) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Risk Dashboard
        </h3>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleEmergencyStop}
          className="gap-2"
        >
          <AlertOctagon className="w-4 h-4" />
          Emergency Stop
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Gauge */}
        <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/30 border border-border">
          <div className="relative w-32 h-32">
            {/* SVG Gauge */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="hsl(224, 47%, 18%)"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={
                  risk.riskLevel < 30
                    ? "hsl(152, 100%, 50%)"
                    : risk.riskLevel < 60
                    ? "hsl(45, 93%, 47%)"
                    : "hsl(0, 84%, 60%)"
                }
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(risk.riskLevel / 100) * 251.2} 251.2`}
                className="transition-all duration-500"
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold font-mono ${getRiskColor(risk.riskLevel)}`}>
                {risk.riskLevel}%
              </span>
              <span className="text-xs text-muted-foreground">Risk Level</span>
            </div>
          </div>
          <p className={`mt-2 text-sm font-medium ${getRiskColor(risk.riskLevel)}`}>
            {getRiskLabel(risk.riskLevel)} Risk
          </p>
        </div>

        {/* Metrics */}
        <div className="space-y-4">
          {/* Open Positions */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart2 className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Open Positions</span>
                <span className="font-mono font-semibold">
                  {risk.openPositions}/{risk.maxPositions}
                </span>
              </div>
              <Progress 
                value={(risk.openPositions / risk.maxPositions) * 100} 
                className="h-2"
              />
            </div>
          </div>

          {/* Capital Deployed */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info/10">
              <Wallet className="w-4 h-4 text-info" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Capital Deployed</span>
                <span className="font-mono font-semibold">
                  ${risk.capitalDeployed.toLocaleString()} / ${risk.totalCapital.toLocaleString()}
                </span>
              </div>
              <Progress 
                value={capitalPercent} 
                className="h-2"
              />
            </div>
          </div>

          {/* Daily Loss */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <TrendingDown className="w-4 h-4 text-warning" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Daily Loss vs Limit</span>
                <span className={`font-mono font-semibold ${lossPercent > 80 ? 'text-loss' : lossPercent > 50 ? 'text-warning' : 'text-foreground'}`}>
                  {risk.dailyLoss.toFixed(1)}% / {risk.dailyLossLimit}%
                </span>
              </div>
              <Progress 
                value={lossPercent} 
                className={`h-2 ${lossPercent > 80 ? '[&>div]:bg-loss' : lossPercent > 50 ? '[&>div]:bg-warning' : ''}`}
              />
            </div>
          </div>

          {/* Margin Health */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-profit/10">
              <Shield className="w-4 h-4 text-profit" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Margin Health</span>
                <span className={`font-mono font-semibold ${risk.marginHealth >= 150 ? 'text-profit' : risk.marginHealth >= 100 ? 'text-warning' : 'text-loss'}`}>
                  {risk.marginHealth}%
                </span>
              </div>
              <Progress 
                value={Math.min(risk.marginHealth, 200) / 2} 
                className="h-2"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
