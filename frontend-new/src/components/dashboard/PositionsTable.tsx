import { motion } from "framer-motion";
import { X, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Position {
  position_id: string;
  symbol: string;
  company_name?: string;
  quantity: number;
  entry_price: number;
  current_price?: number;
  unrealized_pnl?: number;
}

interface PositionsTableProps {
  data?: Position[];
  onClose?: (id: string) => void;
}

export function PositionsTable({ data, onClose }: PositionsTableProps) {
  const positions = data || [];
  const [sortField, setSortField] = useState<keyof Position>("symbol");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sortedPositions = [...positions].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    }
    return sortDirection === "asc" 
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const totalPages = Math.ceil(sortedPositions.length / itemsPerPage);
  const paginatedPositions = sortedPositions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: keyof Position) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const SortableHeader = ({ field, children }: { field: keyof Position; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:text-foreground transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="w-3 h-3 opacity-50" />
      </div>
    </TableHead>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card overflow-hidden"
    >
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-profit status-dot-live" />
          Open Positions
          <span className="text-sm font-normal text-muted-foreground">
            ({positions.length} active)
          </span>
        </h3>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <SortableHeader field="symbol">Symbol</SortableHeader>
              <TableHead>Qty</TableHead>
              <TableHead>Entry</TableHead>
              <TableHead>Current</TableHead>
              <TableHead>P&L</TableHead>
              <TableHead>P&L %</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPositions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No open positions
                </TableCell>
              </TableRow>
            ) : (
              paginatedPositions.map((position) => {
                const unrealizedPnL = position.unrealized_pnl ?? 0;
                const pnlPercent = position.entry_price > 0 && position.current_price
                  ? ((position.current_price - position.entry_price) / position.entry_price) * 100
                  : 0;
                return (
                <TableRow
                  key={position.position_id}
                  className="table-row-hover border-border"
                >
                  <TableCell className="font-semibold text-primary">
                    {position.symbol}
                  </TableCell>
                  <TableCell className="font-mono">{position.quantity}</TableCell>
                  <TableCell className="font-mono">{formatCurrency(position.entry_price)}</TableCell>
                  <TableCell className="font-mono">{formatCurrency(position.current_price ?? 0)}</TableCell>
                  <TableCell className={`font-mono font-semibold ${unrealizedPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {unrealizedPnL >= 0 ? '+' : ''}{formatCurrency(unrealizedPnL)}
                  </TableCell>
                  <TableCell className={`font-mono font-semibold ${pnlPercent >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onClose?.(position.position_id)}
                      className="h-8 w-8 p-0 text-loss hover:text-loss hover:bg-loss/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

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
