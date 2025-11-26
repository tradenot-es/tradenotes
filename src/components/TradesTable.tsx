import { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { useCurrency } from "@/hooks/useCurrency";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Trade {
  id: string;
  symbol: string;
  side: string;
  market: string;
  qty: number;
  entry_price: number;
  exit_price: number;
  entry_time: string;
  exit_time: string;
  fees: number;
  pnl_net: number;
  rating?: number;
  screenshot_url?: string;
  setup?: string;
  note?: string;
}

interface TradesTableProps {
  trades: Trade[];
  onEditTrade?: (trade: Trade) => void;
}

export function TradesTable({ trades, onEditTrade }: TradesTableProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const [expandedTrade, setExpandedTrade] = useState<string | null>(null);

  const calculateHoldPeriod = (entryTime: string, exitTime: string) => {
    const entry = new Date(entryTime);
    const exit = new Date(exitTime);
    
    const days = differenceInDays(exit, entry);
    const hours = differenceInHours(exit, entry);
    const minutes = differenceInMinutes(exit, entry);

    if (days > 0) return `${days} ${days === 1 ? 'DAY' : 'DAYS'}`;
    if (hours > 0) return `${hours} HR`;
    return `${minutes} MIN`;
  };

  const calculateReturnPercentage = (trade: Trade) => {
    const entryTotal = trade.entry_price * trade.qty;
    if (entryTotal === 0) return 0;
    return ((trade.pnl_net / entryTotal) * 100);
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-[100px]">Date</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Side</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Entry</TableHead>
            <TableHead className="text-right">Exit</TableHead>
            <TableHead className="text-right">Ent Tot</TableHead>
            <TableHead className="text-right">Ext Tot</TableHead>
            <TableHead>Hold</TableHead>
            <TableHead className="text-right">Return</TableHead>
            <TableHead className="text-right">Return %</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => {
            const isWin = trade.pnl_net > 0;
            const entryTotal = trade.entry_price * trade.qty;
            const exitTotal = trade.exit_price * trade.qty;
            const returnPercentage = calculateReturnPercentage(trade);
            const holdPeriod = calculateHoldPeriod(trade.entry_time, trade.exit_time);
            const isExpanded = expandedTrade === trade.id;

            return (
              <>
                <TableRow 
                  key={trade.id}
                  className={cn(
                    "border-border cursor-pointer transition-colors",
                    isExpanded && "bg-muted/50"
                  )}
                  onClick={() => setExpandedTrade(isExpanded ? null : trade.id)}
                >
                  <TableCell className="font-medium text-muted-foreground">
                    {new Date(trade.exit_time).toLocaleDateString('en-US', { 
                      month: 'numeric',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>
                    <span className="text-primary font-semibold">{trade.symbol}</span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={isWin ? "default" : "destructive"}
                      className={cn(
                        "font-semibold",
                        isWin ? "bg-green-500/20 text-green-500 hover:bg-green-500/30" : "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                      )}
                    >
                      {isWin ? "● WIN" : "● LOSS"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {trade.side === "long" ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-muted-foreground capitalize">{trade.side}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{trade.qty}</TableCell>
                  <TableCell className="text-right">{formatCurrency(trade.entry_price)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(trade.exit_price)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(entryTotal)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(exitTotal)}</TableCell>
                  <TableCell>
                    <span className="text-primary font-medium">{holdPeriod}</span>
                  </TableCell>
                  <TableCell className={cn(
                    "text-right font-semibold",
                    isWin ? "text-green-500" : "text-red-500"
                  )}>
                    {formatCurrency(trade.pnl_net)}
                  </TableCell>
                  <TableCell className={cn(
                    "text-right font-semibold",
                    isWin ? "text-green-500" : "text-red-500"
                  )}>
                    {returnPercentage.toFixed(2)}%
                  </TableCell>
                  <TableCell>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </TableCell>
                </TableRow>
                {isExpanded && (trade.note || trade.setup || trade.screenshot_url) && (
                  <TableRow className="border-border bg-muted/30">
                    <TableCell colSpan={13} className="p-6">
                      <div className="space-y-4">
                        {trade.setup && (
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-2">Trade Setup</h4>
                            <Badge variant="outline" className="text-primary border-primary/50">
                              {trade.setup}
                            </Badge>
                          </div>
                        )}
                        {trade.note && (
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-2">Notes</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{trade.note}</p>
                          </div>
                        )}
                        {trade.screenshot_url && (
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-2">Chart Screenshot</h4>
                            <img 
                              src={trade.screenshot_url} 
                              alt="Trade chart"
                              className="rounded-lg border border-border max-w-2xl"
                            />
                          </div>
                        )}
                        {onEditTrade && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditTrade(trade);
                            }}
                          >
                            Edit Trade
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            );
          })}
          {trades.length === 0 && (
            <TableRow>
              <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                No trades found for this period
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
