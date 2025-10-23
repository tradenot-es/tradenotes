import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddTradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddTradeDialog({ open, onOpenChange, onSuccess }: AddTradeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    symbol: "",
    side: "long" as "long" | "short",
    qty: "",
    entryPrice: "",
    exitPrice: "",
    entryTime: "",
    exitTime: "",
    fees: "2.00",
    setup: "",
    note: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht angemeldet");

      const qty = parseFloat(formData.qty);
      const entryPrice = parseFloat(formData.entryPrice);
      const exitPrice = parseFloat(formData.exitPrice);
      const fees = parseFloat(formData.fees);

      const priceDiff = formData.side === "long" 
        ? exitPrice - entryPrice 
        : entryPrice - exitPrice;
      const pnlNet = (priceDiff * qty) - fees;

      const { error } = await supabase.from("trades").insert({
        user_id: user.id,
        symbol: formData.symbol.toUpperCase(),
        side: formData.side,
        qty,
        entry_price: entryPrice,
        exit_price: exitPrice,
        entry_time: formData.entryTime,
        exit_time: formData.exitTime,
        fees,
        pnl_net: pnlNet,
        setup: formData.setup || null,
        note: formData.note || null,
      });

      if (error) throw error;

      toast.success("Trade erfolgreich hinzugefügt!");
      onSuccess();
      onOpenChange(false);
      setFormData({
        symbol: "",
        side: "long",
        qty: "",
        entryPrice: "",
        exitPrice: "",
        entryTime: "",
        exitTime: "",
        fees: "2.00",
        setup: "",
        note: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Hinzufügen des Trades");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neuer Trade</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol *</Label>
              <Input
                id="symbol"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                placeholder="AAPL"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="side">Richtung *</Label>
              <Select value={formData.side} onValueChange={(v) => setFormData({ ...formData, side: v as "long" | "short" })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="long">Long</SelectItem>
                  <SelectItem value="short">Short</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qty">Menge *</Label>
              <Input
                id="qty"
                type="number"
                step="0.01"
                value={formData.qty}
                onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entryPrice">Entry *</Label>
              <Input
                id="entryPrice"
                type="number"
                step="0.01"
                value={formData.entryPrice}
                onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exitPrice">Exit *</Label>
              <Input
                id="exitPrice"
                type="number"
                step="0.01"
                value={formData.exitPrice}
                onChange={(e) => setFormData({ ...formData, exitPrice: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entryTime">Entry Zeit *</Label>
              <Input
                id="entryTime"
                type="datetime-local"
                value={formData.entryTime}
                onChange={(e) => setFormData({ ...formData, entryTime: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exitTime">Exit Zeit *</Label>
              <Input
                id="exitTime"
                type="datetime-local"
                value={formData.exitTime}
                onChange={(e) => setFormData({ ...formData, exitTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fees">Gebühren ($)</Label>
              <Input
                id="fees"
                type="number"
                step="0.01"
                value={formData.fees}
                onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="setup">Setup</Label>
              <Input
                id="setup"
                value={formData.setup}
                onChange={(e) => setFormData({ ...formData, setup: e.target.value })}
                placeholder="Breakout, Reversal, etc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Notiz</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Trade-Notizen..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Speichert..." : "Trade hinzufügen"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
