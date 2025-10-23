import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { mockTrades } from "@/lib/mockData";
import { AddTradeFAB } from "@/components/AddTradeFAB";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const Trades = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrade, setSelectedTrade] = useState<typeof mockTrades[0] | null>(null);

  const filteredTrades = mockTrades.filter((trade) =>
    trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trade.setup?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trades</h1>
          <p className="text-muted-foreground">Manage and review your trades</p>
        </div>
      </div>

      <Input
        placeholder="Search by symbol or setup..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Side</TableHead>
              <TableHead className="text-right">Entry</TableHead>
              <TableHead className="text-right">Exit</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">P&L</TableHead>
              <TableHead>Setup</TableHead>
              <TableHead>Tags</TableHead>
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
                  {new Date(trade.exitTime).toLocaleDateString()}
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
                <TableCell className="text-right">${trade.entryPrice.toFixed(2)}</TableCell>
                <TableCell className="text-right">${trade.exitPrice.toFixed(2)}</TableCell>
                <TableCell className="text-right">{trade.qty}</TableCell>
                <TableCell className={`text-right font-medium ${trade.pnlNet >= 0 ? "text-success" : "text-destructive"}`}>
                  ${trade.pnlNet.toFixed(2)}
                </TableCell>
                <TableCell>{trade.setup || "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {trade.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedTrade} onOpenChange={() => setSelectedTrade(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Trade Details: {selectedTrade?.symbol}</DialogTitle>
          </DialogHeader>
          {selectedTrade && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Entry Price</p>
                  <p className="text-lg font-semibold">${selectedTrade.entryPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Exit Price</p>
                  <p className="text-lg font-semibold">${selectedTrade.exitPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="text-lg font-semibold">{selectedTrade.qty}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Net P&L</p>
                  <p className={`text-lg font-semibold ${selectedTrade.pnlNet >= 0 ? "text-success" : "text-destructive"}`}>
                    ${selectedTrade.pnlNet.toFixed(2)}
                  </p>
                </div>
              </div>
              {selectedTrade.note && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Notes</p>
                  <p className="text-sm">{selectedTrade.note}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedTrade(null)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AddTradeFAB onClick={() => {}} />
    </div>
  );
};

export default Trades;
