import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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

      toast.success(t("trades.tradeAdded"));
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
      toast.error(error.message || t("trades.addError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("trades.newTrade")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">{t("trades.symbol")} *</Label>
              <Input
                id="symbol"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                placeholder="AAPL"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="side">{t("trades.side")} *</Label>
              <Select value={formData.side} onValueChange={(v) => setFormData({ ...formData, side: v as "long" | "short" })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="long">{t("trades.long")}</SelectItem>
                  <SelectItem value="short">{t("trades.short")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qty">{t("trades.qty")} *</Label>
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
              <Label htmlFor="entryPrice">{t("trades.entryPrice")} *</Label>
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
              <Label htmlFor="exitPrice">{t("trades.exitPrice")} *</Label>
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
              <Label htmlFor="entryTime">{t("trades.entryTime")} *</Label>
              <Input
                id="entryTime"
                type="datetime-local"
                value={formData.entryTime}
                onChange={(e) => setFormData({ ...formData, entryTime: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exitTime">{t("trades.exitTime")} *</Label>
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
              <Label htmlFor="fees">{t("trades.fees")} ($)</Label>
              <Input
                id="fees"
                type="number"
                step="0.01"
                value={formData.fees}
                onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="setup">{t("trades.setup")}</Label>
              <Input
                id="setup"
                value={formData.setup}
                onChange={(e) => setFormData({ ...formData, setup: e.target.value })}
                placeholder="Breakout, Reversal, etc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">{t("trades.note")}</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder={t("trades.note")}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? t("common.loading") : t("trades.addTrade")}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("trades.cancel")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
