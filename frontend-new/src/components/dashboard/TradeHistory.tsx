import { motion } from "framer-motion";
import { ArrowUpDown, Download, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ExitReason = "PROFIT_TARGET" | "STOP_LOSS" | "TRAILING_STOP" | "MANUAL" | "EOD";
type Side = "BUY" | "SELL";

interface Trade {
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

interface TradeHistoryProps {
  data?: Trade[];
}

const reasonColors: Record<ExitReason, string> = {
  PROFIT_TARGET: "bg-profit/20 text-profit border-profit/30",
  STOP_LOSS: "bg-loss/20 text-loss border-loss/30",
  TRAILING_STOP: "bg-warning/20 text-warning border-warning/30",
  MANUAL: "bg-info/20 text-info border-info/30",
  EOD: "bg-muted text-muted-foreground border-border",
};

const mockTrades: Trade[] = [
  { id: "1", date: new Date("2024-01-15T10:30:00"), symbol: "TD.TO", side: "BUY", quantity: 10, entryPrice: 84.50, exitPrice: 86.20, pnl: 17.00, pnlPercent: 2.01, reason: "PROFIT_TARGET" },
  { id: "2", date: new Date("2024-01-15T11:45:00"), symbol: "RY.TO", side: "BUY", quantity: 5, entryPrice: 143.00, exitPrice: 141.50, pnl: -7.50, pnlPercent: -1.05, reason: "STOP_LOSS" },
  { id: "3", date: new Date("2024-01-15T14:20:00"), symbol: "SHOP.TO", side: "BUY", quantity: 3, entryPrice: 94.00, exitPrice: 96.80, pnl: 8.40, pnlPercent: 2.98, reason: "TRAILING_STOP" },
  { id: "4", date: new Date("2024-01-14T09:45:00"), symbol: "ENB.TO", side: "SELL", quantity: 15, entryPrice: 48.20, exitPrice: 47.80, pnl: 6.00, pnlPercent: 0.83, reason: "MANUAL" },
  { id: "5", date: new Date("2024-01-14T15:55:00"), symbol: "BCE.TO", side: "BUY", quantity: 8, entryPrice: 52.30, exitPrice: 52.10, pnl: -1.60, pnlPercent: -0.38, reason: "EOD" },
];

interface TradeHistoryProps {
  trades?: Trade[];
}

export function TradeHistory({ data }: TradeHistoryProps) {
  const trades = data || [];
  const [sideFilter, setSideFilter] = useState<"all" | Side>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredTrades = trades.filter(trade => 
    sideFilter === "all" || trade.side === sideFilter
  );

  const totalPages = Math.ceil(filteredTrades.length / itemsPerPage);
  const paginatedTrades = filteredTrades.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Summary calculations
  const totalTrades = trades.length;
  const wins = trades.filter(t => t.pnl > 0).length;
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
  const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
  const bestTrade = Math.max(...trades.map(t => t.pnl));
  const worstTrade = Math.min(...trades.map(t => t.pnl));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-semibold">Trade History</h3>
        <div className="flex items-center gap-3">
          <Select value={sideFilter} onValueChange={(v) => setSideFilter(v as "all" | Side)}>
            <SelectTrigger className="w-32 bg-muted border-border">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Trades</SelectItem>
              <SelectItem value="BUY">Buy Only</SelectItem>
              <SelectItem value="SELL">Sell Only</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="px-4 py-3 bg-muted/30 border-b border-border grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Total Trades</span>
          <p className="font-semibold font-mono">{totalTrades}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Win Rate</span>
          <p className="font-semibold font-mono text-profit">{winRate.toFixed(1)}%</p>
        </div>
        <div>
          <span className="text-muted-foreground">Total P&L</span>
          <p className={`font-semibold font-mono ${totalPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
            {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Best Trade</span>
          <p className="font-semibold font-mono text-profit">+{formatCurrency(bestTrade)}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Worst Trade</span>
          <p className="font-semibold font-mono text-loss">{formatCurrency(worstTrade)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead>Date/Time</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Side</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Entry</TableHead>
              <TableHead>Exit</TableHead>
              <TableHead>P&L</TableHead>
              <TableHead>P&L %</TableHead>
              <TableHead>Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTrades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No trades found
                </TableCell>
              </TableRow>
            ) : (
              paginatedTrades.map((trade) => {
                const pnlPercent = trade.entry_price > 0
                  ? ((trade.exit_price - trade.entry_price) / trade.entry_price) * 100
                  : 0;
                return (
                <TableRow
                  key={trade.trade_id}
                  className="table-row-hover border-border"
                >
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(trade.exit_time).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-semibold text-primary">
                    {trade.symbol}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-profit/20 text-profit border-profit/30"
                    >
                      CLOSED
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">{trade.quantity}</TableCell>
                  <TableCell className="font-mono">{formatCurrency(trade.entry_price)}</TableCell>
                  <TableCell className="font-mono">{formatCurrency(trade.exit_price)}</TableCell>
                  <TableCell className={`font-mono font-semibold ${trade.profit_loss >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {trade.profit_loss >= 0 ? '+' : ''}{formatCurrency(trade.profit_loss)}
                  </TableCell>
                  <TableCell className={`font-mono font-semibold ${pnlPercent >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-muted text-muted-foreground">
                      {trade.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-border flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
