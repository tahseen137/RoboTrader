import { Bot, Settings, HelpCircle, LogOut, Clock, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

type MarketStatus = "live" | "paper" | "stopped" | "closed";
type SystemStatus = "connected" | "disconnected" | "reconnecting";

interface HeaderProps {
  marketStatus?: MarketStatus;
  systemStatus?: SystemStatus;
  notifications?: number;
}

const statusConfig = {
  live: { color: "bg-profit", label: "Live", glow: true },
  paper: { color: "bg-warning", label: "Paper", glow: false },
  stopped: { color: "bg-loss", label: "Stopped", glow: false },
  closed: { color: "bg-muted-foreground", label: "Market Closed", glow: false },
};

const systemConfig = {
  connected: { color: "bg-profit", label: "Connected" },
  disconnected: { color: "bg-loss", label: "Disconnected" },
  reconnecting: { color: "bg-warning", label: "Reconnecting..." },
};

export function Header({ 
  marketStatus = "live", 
  systemStatus = "connected",
  notifications = 3 
}: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeToClose, setTimeToClose] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      // Calculate time to market close (4:00 PM EST)
      const closeHour = 16;
      const closeMinute = 0;
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      if (hours < closeHour || (hours === closeHour && minutes < closeMinute)) {
        const diffMinutes = (closeHour * 60 + closeMinute) - (hours * 60 + minutes);
        const h = Math.floor(diffMinutes / 60);
        const m = diffMinutes % 60;
        setTimeToClose(`${h}h ${m}m to close`);
      } else {
        setTimeToClose("Market closed");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const status = statusConfig[marketStatus];
  const system = systemConfig[systemStatus];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50"
    >
      {/* Left Side - Logo & Status */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bot className="w-8 h-8 text-primary" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-profit rounded-full status-dot-live" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-primary text-glow-profit">Robo</span>
            <span className="text-foreground">Trader</span>
          </h1>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border">
            <div className={`w-2 h-2 rounded-full ${status.color} ${status.glow ? 'status-dot-live' : ''}`} />
            <span className="text-sm font-medium">{status.label}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border">
            <div className={`w-2 h-2 rounded-full ${system.color}`} />
            <span className="text-sm text-muted-foreground">{system.label}</span>
          </div>
        </div>
      </div>

      {/* Right Side - Time & Actions */}
      <div className="flex items-center gap-4">
        {/* Time Display */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="font-mono">
              {currentTime.toLocaleTimeString("en-US", { 
                hour: "2-digit", 
                minute: "2-digit", 
                second: "2-digit" 
              })}
            </span>
          </div>
          <span className="text-muted-foreground/60">|</span>
          <span className="text-warning font-medium">{timeToClose}</span>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {notifications > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-loss border-0"
            >
              {notifications}
            </Badge>
          )}
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="icon">
          <Settings className="w-5 h-5" />
        </Button>

        {/* Help */}
        <Button variant="ghost" size="icon">
          <HelpCircle className="w-5 h-5" />
        </Button>

        {/* Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/50 to-secondary/50 flex items-center justify-center text-sm font-semibold">
                RT
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card border-border">
            <DropdownMenuItem className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-loss">
              <LogOut className="w-4 h-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}
