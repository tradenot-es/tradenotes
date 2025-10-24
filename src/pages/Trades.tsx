import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AddTradeFAB } from "@/components/AddTradeFAB";
import { AddTradeDialog } from "@/components/AddTradeDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Trade {
  id: string;
  symbol: string;
  side: string;
  qty: number;
  entry_price: number;
  exit_price: number;
  entry_time: string;
  exit_time: string;
  fees: number;
  pnl_net: number;
  r?: number;
  tags?: string[];
  setup?: string;
  note?: string;
}

const Trades = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTrades();
    }
  }, [user]);

  const loadTrades = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .order("exit_time", { ascending: false });

    if (!error && data) {
      setTrades(data);
    }
    setLoading(false);
  };

  const filteredTrades = trades.filter((trade) =>
    trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trade.setup?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">{t("common.loading")}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("trades.title")}</h1>
          <p className="text-muted-foreground">{t("trades.subtitle")}</p>
        </div>
      </div>

      <Input
        placeholder={t("trades.filterBy")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />

      {trades.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("trades.noTrades")}</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("trades.symbol")}</TableHead>
                <TableHead>{t("dashboard.pnlByMonth")}</TableHead>
                <TableHead>{t("trades.side")}</TableHead>
                <TableHead className="text-right">{t("trades.entryPrice")}</TableHead>
                <TableHead className="text-right">{t("trades.exitPrice")}</TableHead>
                <TableHead className="text-right">{t("trades.qty")}</TableHead>
                <TableHead className="text-right">{t("trades.pnl")}</TableHead>
                <TableHead>{t("trades.setup")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrades.map((trade) => (
                <TableRow
                  key={trade.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedTrade(trade)}
                >
                  <TableCell className="font-medium">{trade.symbol}</TableCell>
                  <TableCell>
                    {new Date(trade.exit_time).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={trade.side === "long" ? "default" : "secondary"}>
                      {trade.side === "long" ? (
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="mr-1 h-3 w-3" />
                      )}
                      {trade.side}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">${trade.entry_price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${trade.exit_price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{trade.qty}</TableCell>
                  <TableCell className={`text-right font-medium ${trade.pnl_net >= 0 ? "text-success" : "text-destructive"}`}>
                    ${trade.pnl_net.toFixed(2)}
                  </TableCell>
                  <TableCell>{trade.setup || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!selectedTrade} onOpenChange={() => setSelectedTrade(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("trades.tradeDetails")}: {selectedTrade?.symbol}</DialogTitle>
          </DialogHeader>
          {selectedTrade && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t("trades.entryPrice")}</p>
                  <p className="text-lg font-semibold">${selectedTrade.entry_price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("trades.exitPrice")}</p>
                  <p className="text-lg font-semibold">${selectedTrade.exit_price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("trades.qty")}</p>
                  <p className="text-lg font-semibold">{selectedTrade.qty}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("dashboard.netPnL")}</p>
                  <p className={`text-lg font-semibold ${selectedTrade.pnl_net >= 0 ? "text-success" : "text-destructive"}`}>
                    ${selectedTrade.pnl_net.toFixed(2)}
                  </p>
                </div>
              </div>
              {selectedTrade.note && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t("trades.note")}</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedTrade.note}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedTrade(null)}>{t("trades.close")}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AddTradeDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen}
        onSuccess={loadTrades}
      />

      <AddTradeFAB onClick={() => setAddDialogOpen(true)} />
    </div>
  );
};

export default Trades;
