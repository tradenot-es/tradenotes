import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { SetupDefinition } from "@/types/setup";

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
  setup?: string;
  note?: string;
  setup_checklist_completed?: boolean[];
}

interface AddTradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  preselectedDate?: Date;
  editTrade?: Trade | null;
}

export function AddTradeDialog({ open, onOpenChange, onSuccess, preselectedDate, editTrade }: AddTradeDialogProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [setupDefinitions, setSetupDefinitions] = useState<SetupDefinition[]>([]);
  const [checklistCompleted, setChecklistCompleted] = useState<boolean[]>([]);
  const [formData, setFormData] = useState({
    symbol: "",
    side: "long" as "long" | "short",
    market: "Stock" as "Stock" | "Futures" | "Crypto" | "Option" | "Forex" | "Index",
    qty: "",
    entryPrice: "",
    exitPrice: "",
    entryTime: "",
    exitTime: "",
    fees: "2.00",
    setup: "",
    note: "",
  });

  // Load setup definitions
  useEffect(() => {
    const loadSetups = async () => {
      const { data } = await supabase
        .from("user_settings")
        .select("setup_definitions")
        .maybeSingle();
      
      if (data?.setup_definitions) {
        setSetupDefinitions(data.setup_definitions as unknown as SetupDefinition[]);
      }
    };
    
    if (open) {
      loadSetups();
    }
  }, [open]);

  // Set preselected date when dialog opens with a date or load edit data
  useEffect(() => {
    if (open) {
      if (editTrade) {
        // Load trade data for editing
        setFormData({
          symbol: editTrade.symbol,
          side: editTrade.side as "long" | "short",
          market: editTrade.market as any,
          qty: editTrade.qty.toString(),
          entryPrice: editTrade.entry_price.toString(),
          exitPrice: editTrade.exit_price.toString(),
          entryTime: editTrade.entry_time.substring(0, 16),
          exitTime: editTrade.exit_time.substring(0, 16),
          fees: editTrade.fees.toString(),
          setup: editTrade.setup || "",
          note: editTrade.note || "",
        });
        setChecklistCompleted(editTrade.setup_checklist_completed || []);
      } else if (preselectedDate) {
        // Set preselected date for new trade
        const dateStr = preselectedDate.toISOString().split('T')[0];
        setFormData(prev => ({
          ...prev,
          entryTime: dateStr + 'T09:00',
          exitTime: dateStr + 'T16:00'
        }));
      }
    } else {
      // Reset checklist when dialog closes
      setChecklistCompleted([]);
    }
  }, [preselectedDate, open, editTrade]);

  // Update checklist when setup changes
  useEffect(() => {
    const selectedSetup = setupDefinitions.find(s => s.name === formData.setup);
    if (selectedSetup && checklistCompleted.length !== selectedSetup.checklist.length) {
      setChecklistCompleted(new Array(selectedSetup.checklist.length).fill(false));
    }
  }, [formData.setup, setupDefinitions]);

  const tradeSchema = z.object({
    symbol: z.string()
      .trim()
      .min(1, { message: t("validation.symbolRequired") })
      .max(10, { message: t("validation.symbolTooLong") })
      .regex(/^[A-Z0-9]+$/, { message: t("validation.symbolInvalid") }),
    side: z.enum(['long', 'short']),
    market: z.enum(['Stock', 'Futures', 'Crypto', 'Option', 'Forex', 'Index']),
    qty: z.number()
      .positive({ message: t("validation.qtyPositive") })
      .max(1000000, { message: t("validation.qtyMax") }),
    entryPrice: z.number()
      .positive({ message: t("validation.pricePositive") })
      .max(1000000, { message: t("validation.priceMax") }),
    exitPrice: z.number()
      .positive({ message: t("validation.pricePositive") })
      .max(1000000, { message: t("validation.priceMax") }),
    entryTime: z.string(),
    exitTime: z.string(),
    fees: z.number()
      .nonnegative({ message: t("validation.feesNonNegative") })
      .max(10000, { message: t("validation.feesMax") }),
    setup: z.string().max(100, { message: t("validation.setupTooLong") }).optional(),
    note: z.string().max(1000, { message: t("validation.noteTooLong") }).optional()
  }).refine(data => new Date(data.exitTime) > new Date(data.entryTime), {
    message: t("validation.exitTimeAfterEntry"),
    path: ["exitTime"]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const qty = parseFloat(formData.qty);
    const entryPrice = parseFloat(formData.entryPrice);
    const exitPrice = parseFloat(formData.exitPrice);
    const fees = parseFloat(formData.fees);

    // Validate input
    const validation = tradeSchema.safeParse({
      symbol: formData.symbol.toUpperCase(),
      side: formData.side,
      market: formData.market,
      qty,
      entryPrice,
      exitPrice,
      entryTime: formData.entryTime,
      exitTime: formData.exitTime,
      fees,
      setup: formData.setup || undefined,
      note: formData.note || undefined
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      toast.error(t("trades.required"));
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht angemeldet");

      const priceDiff = formData.side === "long" 
        ? exitPrice - entryPrice 
        : entryPrice - exitPrice;
      const pnlNet = (priceDiff * qty) - fees;

      const tradeData = {
        symbol: formData.symbol.toUpperCase(),
        side: formData.side,
        market: formData.market,
        qty,
        entry_price: entryPrice,
        exit_price: exitPrice,
        entry_time: formData.entryTime,
        exit_time: formData.exitTime,
        fees,
        pnl_net: pnlNet,
        setup: formData.setup || null,
        note: formData.note || null,
        setup_checklist_completed: checklistCompleted.length > 0 ? checklistCompleted : null,
      };

      let error;
      if (editTrade) {
        // Update existing trade
        const result = await supabase
          .from("trades")
          .update(tradeData)
          .eq('id', editTrade.id);
        error = result.error;
      } else {
        // Insert new trade
        const result = await supabase
          .from("trades")
          .insert({
            user_id: user.id,
            ...tradeData
          });
        error = result.error;
      }

      if (error) throw error;

      toast.success(editTrade ? t("trades.tradeUpdated") : t("trades.tradeAdded"));
      onSuccess();
      onOpenChange(false);
      setFormData({
        symbol: "",
        side: "long",
        market: "Stock",
        qty: "",
        entryPrice: "",
        exitPrice: "",
        entryTime: "",
        exitTime: "",
        fees: "2.00",
        setup: "",
        note: "",
      });
      setChecklistCompleted([]);
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
          <DialogTitle>{editTrade ? t("trades.editTrade") : t("trades.newTrade")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="market">{t("trades.market")} *</Label>
              <Select value={formData.market} onValueChange={(v) => setFormData({ ...formData, market: v as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Stock">{t("trades.stock")}</SelectItem>
                  <SelectItem value="Futures">{t("trades.futures")}</SelectItem>
                  <SelectItem value="Crypto">{t("trades.crypto")}</SelectItem>
                  <SelectItem value="Option">{t("trades.option")}</SelectItem>
                  <SelectItem value="Forex">{t("trades.forex")}</SelectItem>
                  <SelectItem value="Index">{t("trades.index")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="symbol">{t("trades.symbol")} *</Label>
              <Input
                id="symbol"
                value={formData.symbol}
                onChange={(e) => {
                  setFormData({ ...formData, symbol: e.target.value.toUpperCase() });
                  setErrors({ ...errors, symbol: undefined });
                }}
                placeholder="AAPL"
              />
              {errors.symbol && (
                <p className="text-sm text-destructive">{errors.symbol}</p>
              )}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qty">{t("trades.qty")} *</Label>
              <Input
                id="qty"
                type="number"
                step="0.01"
                value={formData.qty}
                onChange={(e) => {
                  setFormData({ ...formData, qty: e.target.value });
                  setErrors({ ...errors, qty: undefined });
                }}
              />
              {errors.qty && (
                <p className="text-sm text-destructive">{errors.qty}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="entryPrice">{t("trades.entryPrice")} *</Label>
              <Input
                id="entryPrice"
                type="number"
                step="0.01"
                value={formData.entryPrice}
                onChange={(e) => {
                  setFormData({ ...formData, entryPrice: e.target.value });
                  setErrors({ ...errors, entryPrice: undefined });
                }}
              />
              {errors.entryPrice && (
                <p className="text-sm text-destructive">{errors.entryPrice}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="exitPrice">{t("trades.exitPrice")} *</Label>
              <Input
                id="exitPrice"
                type="number"
                step="0.01"
                value={formData.exitPrice}
                onChange={(e) => {
                  setFormData({ ...formData, exitPrice: e.target.value });
                  setErrors({ ...errors, exitPrice: undefined });
                }}
              />
              {errors.exitPrice && (
                <p className="text-sm text-destructive">{errors.exitPrice}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entryTime">{t("trades.entryTime")} *</Label>
              <Input
                id="entryTime"
                type="datetime-local"
                value={formData.entryTime}
                onChange={(e) => {
                  setFormData({ ...formData, entryTime: e.target.value });
                  setErrors({ ...errors, entryTime: undefined });
                }}
              />
              {errors.entryTime && (
                <p className="text-sm text-destructive">{errors.entryTime}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="exitTime">{t("trades.exitTime")} *</Label>
              <Input
                id="exitTime"
                type="datetime-local"
                value={formData.exitTime}
                onChange={(e) => {
                  setFormData({ ...formData, exitTime: e.target.value });
                  setErrors({ ...errors, exitTime: undefined });
                }}
              />
              {errors.exitTime && (
                <p className="text-sm text-destructive">{errors.exitTime}</p>
              )}
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
                onChange={(e) => {
                  setFormData({ ...formData, fees: e.target.value });
                  setErrors({ ...errors, fees: undefined });
                }}
              />
              {errors.fees && (
                <p className="text-sm text-destructive">{errors.fees}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="setup">{t("trades.setup")}</Label>
              <Select 
                value={formData.setup} 
                onValueChange={(v) => {
                  setFormData({ ...formData, setup: v });
                  setErrors({ ...errors, setup: undefined });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("trades.selectSetup")} />
                </SelectTrigger>
                <SelectContent>
                  {setupDefinitions.map((setup) => (
                    <SelectItem key={setup.name} value={setup.name}>
                      {setup.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.setup && (
                <p className="text-sm text-destructive">{errors.setup}</p>
              )}
            </div>
          </div>

          {/* Setup Checklist */}
          {formData.setup && setupDefinitions.find(s => s.name === formData.setup)?.checklist.length > 0 && (
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <Label className="text-base font-semibold">{t("trades.setupChecklist")}</Label>
              <div className="space-y-2">
                {setupDefinitions
                  .find(s => s.name === formData.setup)
                  ?.checklist.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <Checkbox
                        id={`checklist-${idx}`}
                        checked={checklistCompleted[idx] || false}
                        onCheckedChange={(checked) => {
                          const newCompleted = [...checklistCompleted];
                          newCompleted[idx] = checked as boolean;
                          setChecklistCompleted(newCompleted);
                        }}
                      />
                      <Label 
                        htmlFor={`checklist-${idx}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {item}
                      </Label>
                    </div>
                  ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {checklistCompleted.filter(Boolean).length} / {setupDefinitions.find(s => s.name === formData.setup)?.checklist.length || 0} {t("trades.checklistCompleted")}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="note">{t("trades.note")}</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => {
                setFormData({ ...formData, note: e.target.value });
                setErrors({ ...errors, note: undefined });
              }}
              placeholder={t("trades.note")}
              rows={3}
            />
            {errors.note && (
              <p className="text-sm text-destructive">{errors.note}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? t("common.loading") : (editTrade ? t("trades.updateTrade") : t("trades.addTrade"))}
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
