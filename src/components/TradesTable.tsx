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
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, HelpCircle, Circle, Award, TrendingUpIcon, DollarSign, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TradeSentimentGauge } from "./TradeSentimentGauge";
import { TradeNewsContext } from "./TradeNewsContext";
import { NewsHypeIndicator } from "./NewsHypeIndicator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { AccountType } from "@/types/trade";

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
  account_type?: AccountType;
  account_name?: string;
}

interface TradesTableProps {
  trades: Trade[];
  onEditTrade?: (trade: Trade) => void;
  onDeleteTrade?: (tradeId: string) => void;
}

export function TradesTable({ trades, onEditTrade, onDeleteTrade }: TradesTableProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const [expandedTrade, setExpandedTrade] = useState<string | null>(null);

  // Calculate summary statistics
  const totalTrades = trades.length;
  const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl_net, 0);
  const avgReturnPercentage = totalTrades > 0
    ? trades.reduce((sum, trade) => {
        const entryTotal = trade.entry_price * trade.qty;
        return sum + (entryTotal === 0 ? 0 : ((trade.pnl_net / entryTotal) * 100));
      }, 0) / totalTrades
    : 0;
  const winningTrades = trades.filter(t => t.pnl_net > 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

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

  const ColumnHeader = ({ label, tooltip }: { label: string; tooltip: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-help">
            {label}
            <HelpCircle className="h-3 w-3 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const AccountTypeBadge = ({ type, accountName }: { type?: string; accountName?: string }) => {
    if (!type) return null;
    
    const config = {
      sim: { 
        label: t("accountType.sim"), 
        color: "bg-blue-500/20 text-blue-500 border-blue-500/30", 
        icon: Circle 
      },
      evaluation: { 
        label: t("accountType.evaluation"), 
        color: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30", 
        icon: TrendingUpIcon 
      },
      performance: { 
        label: t("accountType.performance"), 
        color: "bg-green-500/20 text-green-500 border-green-500/30", 
        icon: Award 
      },
      live: { 
        label: t("accountType.live"), 
        color: "bg-red-500/20 text-red-500 border-red-500/30", 
        icon: DollarSign 
      },
    };
    
    const { label, color, icon: Icon } = config[type as keyof typeof config] || config.live;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={cn("font-medium border", color)}>
              <Icon className="h-3 w-3 mr-1" />
              {label}
            </Badge>
          </TooltipTrigger>
          {accountName && (
            <TooltipContent>
              <p className="text-xs">{accountName}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="space-y-4">
      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground mb-1">{t("trades.table.totalTrades")}</p>
          <p className="text-2xl font-semibold">{totalTrades}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground mb-1">{t("trades.table.totalPnL")}</p>
          <p className={cn(
            "text-2xl font-semibold",
            totalPnL > 0 ? "text-green-500" : totalPnL < 0 ? "text-red-500" : ""
          )}>
            {formatCurrency(totalPnL)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground mb-1">{t("trades.table.avgReturn")}</p>
          <p className={cn(
            "text-2xl font-semibold",
            avgReturnPercentage > 0 ? "text-green-500" : avgReturnPercentage < 0 ? "text-red-500" : ""
          )}>
            {avgReturnPercentage.toFixed(2)}%
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground mb-1">{t("trades.table.winRate")}</p>
          <p className={cn(
            "text-2xl font-semibold",
            winRate >= 50 ? "text-green-500" : winRate >= 40 ? "text-yellow-500" : "text-red-500"
          )}>
            {winRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Trades Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-[100px]">
              <ColumnHeader label={t("trades.table.date")} tooltip={t("trades.table.dateTooltip")} />
            </TableHead>
            <TableHead>
              <ColumnHeader label={t("trades.table.symbol")} tooltip={t("trades.table.symbolTooltip")} />
            </TableHead>
            <TableHead>
              <ColumnHeader label={t("accountType.label")} tooltip={t("accountType.tooltip")} />
            </TableHead>
            <TableHead>
              <ColumnHeader label={t("trades.table.status")} tooltip={t("trades.table.statusTooltip")} />
            </TableHead>
            <TableHead>
              <ColumnHeader label={t("trades.table.side")} tooltip={t("trades.table.sideTooltip")} />
            </TableHead>
            <TableHead className="text-right">
              <ColumnHeader label={t("trades.table.qty")} tooltip={t("trades.table.qtyTooltip")} />
            </TableHead>
            <TableHead className="text-right">
              <ColumnHeader label={t("trades.table.entry")} tooltip={t("trades.table.entryTooltip")} />
            </TableHead>
            <TableHead className="text-right">
              <ColumnHeader label={t("trades.table.exit")} tooltip={t("trades.table.exitTooltip")} />
            </TableHead>
            <TableHead className="text-right">
              <ColumnHeader label={t("trades.table.entTotal")} tooltip={t("trades.table.entTotalTooltip")} />
            </TableHead>
            <TableHead className="text-right">
              <ColumnHeader label={t("trades.table.extTotal")} tooltip={t("trades.table.extTotalTooltip")} />
            </TableHead>
            <TableHead>
              <ColumnHeader label={t("trades.table.hold")} tooltip={t("trades.table.holdTooltip")} />
            </TableHead>
            <TableHead className="text-right">
              <ColumnHeader label={t("trades.table.return")} tooltip={t("trades.table.returnTooltip")} />
            </TableHead>
            <TableHead className="text-right">
              <ColumnHeader label={t("trades.table.returnPct")} tooltip={t("trades.table.returnPctTooltip")} />
            </TableHead>
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
                    isExpanded && "bg-muted/50",
                    !isExpanded && "hover:bg-muted/30",
                    trades.indexOf(trade) % 2 === 0 ? "bg-muted/5" : ""
                  )}
                  onClick={() => setExpandedTrade(isExpanded ? null : trade.id)}
                >
                  <TableCell className="font-medium text-muted-foreground">
                    <div className="flex flex-col">
                      <span>{new Date(trade.exit_time).toLocaleDateString('en-US', { 
                        month: 'numeric',
                        day: 'numeric',
                        year: 'numeric'
                      })}</span>
                      <span className="text-xs text-muted-foreground/70">
                        {new Date(trade.exit_time).toLocaleTimeString('en-US', { 
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-primary font-semibold">{trade.symbol}</span>
                  </TableCell>
                  <TableCell>
                    <AccountTypeBadge type={trade.account_type} accountName={trade.account_name} />
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
                {isExpanded && (
                  <TableRow className="border-border bg-muted/30">
                    <TableCell colSpan={14} className="p-6">
                      <div className="space-y-4">
                        {/* News Intelligence Section */}
                        <div className="space-y-3 pb-4 border-b border-border">
                          <h4 className="text-sm font-semibold text-foreground">📰 News Intelligence</h4>
                          
                          {/* Sentiment Gauge */}
                          <TradeSentimentGauge 
                            symbol={trade.symbol}
                            side={trade.side as "long" | "short"}
                            entryTime={trade.entry_time}
                          />

                          {/* News Context */}
                          <TradeNewsContext 
                            symbol={trade.symbol}
                            entryTime={trade.entry_time}
                          />

                          {/* Hype Indicator */}
                          <NewsHypeIndicator 
                            symbol={trade.symbol}
                            entryTime={trade.entry_time}
                          />
                        </div>

                        {/* Trade Details Section */}
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
                        <div className="flex gap-2">
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
                          {onDeleteTrade && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  {t("common.delete")}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t("trades.deleteDialog.title")}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t("trades.deleteDialog.description", { symbol: trade.symbol })}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => onDeleteTrade(trade.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {t("common.delete")}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            );
          })}
          {trades.length === 0 && (
            <TableRow>
              <TableCell colSpan={14} className="text-center py-8 text-muted-foreground">
                No trades found for this period
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
