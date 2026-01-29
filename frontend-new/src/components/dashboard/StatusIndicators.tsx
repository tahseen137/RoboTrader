import { motion } from "framer-motion";
import { 
  Wifi, 
  WifiOff, 
  Play, 
  Pause, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Activity
} from "lucide-react";
import { useState, useEffect } from "react";

type MarketStatus = "open" | "closed" | "pre" | "after";
type SystemStatus = "connected" | "disconnected" | "reconnecting";
type AlgorithmStatus = "active" | "paused" | "disabled" | "limit_hit";

interface StatusIndicatorsProps {
  marketStatus?: MarketStatus;
  systemStatus?: SystemStatus;
  algorithmStatus?: AlgorithmStatus;
  lastUpdate?: Date;
}

const marketConfig: Record<MarketStatus, { icon: React.ReactNode; label: string; color: string }> = {
  open: { icon: <Activity className="w-4 h-4" />, label: "Market Open", color: "bg-profit" },
  closed: { icon: <XCircle className="w-4 h-4" />, label: "Market Closed", color: "bg-loss" },
  pre: { icon: <Activity className="w-4 h-4" />, label: "Pre-Market", color: "bg-warning" },
  after: { icon: <Activity className="w-4 h-4" />, label: "After-Hours", color: "bg-warning" },
};

const systemConfig: Record<SystemStatus, { icon: React.ReactNode; label: string; color: string }> = {
  connected: { icon: <Wifi className="w-4 h-4" />, label: "Connected", color: "bg-profit" },
  disconnected: { icon: <WifiOff className="w-4 h-4" />, label: "Disconnected", color: "bg-loss" },
  reconnecting: { icon: <RefreshCw className="w-4 h-4 animate-spin" />, label: "Reconnecting...", color: "bg-warning" },
};

const algoConfig: Record<AlgorithmStatus, { icon: React.ReactNode; label: string; color: string }> = {
  active: { icon: <Play className="w-4 h-4" />, label: "Trading Active", color: "bg-profit" },
  paused: { icon: <Pause className="w-4 h-4" />, label: "Paused", color: "bg-warning" },
  disabled: { icon: <XCircle className="w-4 h-4" />, label: "Disabled", color: "bg-loss" },
  limit_hit: { icon: <AlertTriangle className="w-4 h-4" />, label: "Daily Limit Hit", color: "bg-warning" },
};

function StatusCard({ 
  icon, 
  label, 
  color, 
  title,
  pulse = false 
}: { 
  icon: React.ReactNode; 
  label: string; 
  color: string;
  title: string;
  pulse?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
      <div className={`p-2 rounded-lg ${color}/20`}>
        <div className={color.replace('bg-', 'text-')}>{icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{title}</p>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${color} ${pulse ? 'status-dot-live' : ''}`} />
          <p className="text-sm font-medium">{label}</p>
        </div>
      </div>
    </div>
  );
}

export function StatusIndicators({
  marketStatus = "open",
  systemStatus = "connected",
  algorithmStatus = "active",
  lastUpdate = new Date(),
}: StatusIndicatorsProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - lastUpdate.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdate]);

  const market = marketConfig[marketStatus];
  const system = systemConfig[systemStatus];
  const algo = algoConfig[algorithmStatus];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          System Status
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-profit status-dot-live" />
          <span>Updated {elapsed}s ago</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatusCard
          {...market}
          title="Market"
          pulse={marketStatus === "open"}
        />
        <StatusCard
          {...system}
          title="Connection"
          pulse={systemStatus === "connected"}
        />
        <StatusCard
          {...algo}
          title="Algorithm"
          pulse={algorithmStatus === "active"}
        />
      </div>
    </motion.div>
  );
}
