import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, AlertCircle, Info, CheckCircle, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

type AlertType = "warning" | "error" | "info" | "success";

interface Alert {
  alert_id: string;
  symbol?: string;
  company_name?: string;
  alert_type: string;
  message: string;
  severity: string;
  created_at: string;
}

const alertConfig: Record<AlertType, { icon: React.ReactNode; color: string; border: string; bg: string }> = {
  warning: {
    icon: <AlertTriangle className="w-5 h-5" />,
    color: "text-warning",
    border: "border-l-4 border-l-warning",
    bg: "bg-warning/5",
  },
  error: {
    icon: <AlertCircle className="w-5 h-5" />,
    color: "text-loss",
    border: "border-l-4 border-l-loss",
    bg: "bg-loss/5",
  },
  info: {
    icon: <Info className="w-5 h-5" />,
    color: "text-info",
    border: "border-l-4 border-l-info",
    bg: "bg-info/5",
  },
  success: {
    icon: <CheckCircle className="w-5 h-5" />,
    color: "text-profit",
    border: "border-l-4 border-l-profit",
    bg: "bg-profit/5",
  },
};

const mockAlerts: Alert[] = [
  { id: "1", type: "warning", message: "Margin health at 135% - approaching minimum threshold", timestamp: new Date(Date.now() - 3 * 60 * 1000) },
  { id: "2", type: "error", message: "Daily loss limit at 4% - trading paused", timestamp: new Date(Date.now() - 8 * 60 * 1000) },
  { id: "3", type: "success", message: "Position closed: TD.TO +$15.50", timestamp: new Date(Date.now() - 12 * 60 * 1000) },
  { id: "4", type: "info", message: "Trade executed: BUY 10 SHOP.TO @ $95.20", timestamp: new Date(Date.now() - 25 * 60 * 1000) },
];

interface AlertPanelProps {
  data?: Alert[];
  maxAlerts?: number;
}

export function AlertPanel({ data, maxAlerts = 5 }: AlertPanelProps) {
  const initialAlerts = data || [];
  const [alerts, setAlerts] = useState(initialAlerts.slice(0, maxAlerts));

  const formatRelativeTime = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  // Auto-dismiss after 30 seconds (simulated)
  useEffect(() => {
    const timers = alerts.map(alert => {
      const age = Date.now() - alert.timestamp.getTime();
      const remaining = Math.max(0, 30000 - age);
      if (remaining > 0) {
        return setTimeout(() => dismissAlert(alert.id), remaining);
      }
      return null;
    });

    return () => timers.forEach(t => t && clearTimeout(t));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card overflow-hidden"
    >
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-warning" />
          System Alerts
          {alerts.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-warning/20 text-warning">
              {alerts.length}
            </span>
          )}
        </h3>
      </div>

      <div className="divide-y divide-border max-h-[300px] overflow-y-auto scrollbar-thin">
        <AnimatePresence mode="popLayout">
          {alerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center text-muted-foreground"
            >
              No active alerts
            </motion.div>
          ) : (
            alerts.map((alert) => {
              const alertType = (alert.severity?.toLowerCase() as AlertType) || "info";
              const config = alertConfig[alertType] || alertConfig.info;
              return (
                <motion.div
                  key={alert.alert_id}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.25 }}
                  className={`p-4 ${config.border} ${config.bg} flex items-start gap-3`}
                >
                  <div className={config.color}>{config.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(new Date(alert.created_at))}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissAlert(alert.alert_id)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
