import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { SetupDefinition } from "@/types/setup";
import { Star, Upload, X, Info, Sparkles, Edit3, Camera, ArrowLeft, Copy, TrendingUp, TrendingDown } from "lucide-react";
import { SymbolCombobox } from "./SymbolCombobox";
import { getSymbolInfo, getMarketDefaultFee, detectMarketFromSymbol } from "@/lib/symbolData";
import { useFrequentSymbols } from "@/hooks/useFrequentSymbols";

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
  r?: number;
  initial_risk?: number;
  stop_loss_price?: number;
  rating?: number;
  screenshot_url?: string;
  setup?: string;
  note?: string;
  setup_checklist_completed?: boolean[];
  tags?: string[];
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
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [analyzingChart, setAnalyzingChart] = useState(false);
  const [entryMode, setEntryMode] = useState<'manual' | 'screenshot'>('manual');
  const [modeSelected, setModeSelected] = useState(false);
  const [screenshotAnalyzed, setScreenshotAnalyzed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [setupDefinitions, setSetupDefinitions] = useState<SetupDefinition[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [checklistCompleted, setChecklistCompleted] = useState<boolean[]>([]);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [symbolInfo, setSymbolInfo] = useState<{ pointValue?: number; multiplier?: number; info?: string }>({});
  const [extractedData, setExtractedData] = useState<any>(null);
  const [formData, setFormData] = useState({
    symbol: "",
    side: "long" as "long" | "short",
    market: "Stock" as "Stock" | "Futures" | "Crypto" | "Option" | "Forex" | "Index",
    qty: "",
    entryPrice: "",
    exitPrice: "",
    stopLossPrice: "",
    initialRisk: "",
    entryTime: "",
    exitTime: "",
    fees: "2.00",
    setup: "",
    note: "",
  });

  // Load frequent symbols
  const { frequentSymbols } = useFrequentSymbols(formData.market);

  // Calculate live P&L
  const calculateLivePnL = () => {
    const qty = parseFloat(formData.qty);
    const entryPrice = parseFloat(formData.entryPrice);
    const exitPrice = parseFloat(formData.exitPrice);
    const fees = parseFloat(formData.fees);

    if (!qty || !entryPrice || !exitPrice || !fees) return null;

    const priceDiff = formData.side === "long" 
      ? exitPrice - entryPrice 
      : entryPrice - exitPrice;
    
    let pnlGross = priceDiff * qty;
    if (formData.market === "Futures" && symbolInfo.pointValue) {
      pnlGross = priceDiff * qty * symbolInfo.pointValue;
    } else if (formData.market === "Option" && symbolInfo.multiplier) {
      pnlGross = priceDiff * qty * symbolInfo.multiplier;
    }
    
    const pnlNet = pnlGross - fees;
    const returnPercent = ((exitPrice - entryPrice) / entryPrice) * 100;

    return { pnlNet, returnPercent };
  };

  const livePnL = calculateLivePnL();

  // Load setup definitions and tags
  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase
        .from("user_settings")
        .select("setup_definitions, tags")
        .maybeSingle();
      
      if (data?.setup_definitions) {
        setSetupDefinitions(data.setup_definitions as unknown as SetupDefinition[]);
      }
      if (data?.tags) {
        setAvailableTags(data.tags);
      }
    };
    
    if (open) {
      loadSettings();
    }
  }, [open]);

  // Copy last trade function
  const copyLastTrade = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", user.id)
        .order("exit_time", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        toast.error(t("trades.noTradeFound"));
        return;
      }

      // Copy data from last trade
      setFormData({
        symbol: data.symbol,
        side: data.side as "long" | "short",
        market: data.market as any,
        qty: data.qty.toString(),
        entryPrice: "", // Keep empty for user to fill
        exitPrice: "",  // Keep empty for user to fill
        stopLossPrice: data.stop_loss_price?.toString() || "",
        initialRisk: data.initial_risk?.toString() || "",
        entryTime: new Date().toISOString().substring(0, 16),
        exitTime: new Date().toISOString().substring(0, 16),
        fees: data.fees.toString(),
        setup: data.setup || "",
        note: "",
      });
      setSelectedTags(data.tags || []);
      
      toast.success(t("trades.lastTradeCopied"));
    } catch (error) {
      console.error("Error copying last trade:", error);
      toast.error(t("trades.copyError"));
    }
  };

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
          stopLossPrice: editTrade.stop_loss_price?.toString() || "",
          initialRisk: editTrade.initial_risk?.toString() || "",
          entryTime: editTrade.entry_time.substring(0, 16),
          exitTime: editTrade.exit_time.substring(0, 16),
          fees: editTrade.fees.toString(),
          setup: editTrade.setup || "",
          note: editTrade.note || "",
        });
        setChecklistCompleted(editTrade.setup_checklist_completed || []);
        setSelectedTags(editTrade.tags || []);
        setRating(editTrade.rating || 0);
        setScreenshotPreview(editTrade.screenshot_url || null);
      } else if (preselectedDate) {
        // Set preselected date for new trade
        const dateStr = preselectedDate.toISOString().split('T')[0];
        setFormData(prev => ({
          ...prev,
          entryTime: dateStr + 'T09:00',
          exitTime: dateStr + 'T16:00'
        }));
      } else {
        // Set current date and time for new trade
        const now = new Date();
        const dateTimeStr = now.toISOString().substring(0, 16);
        setFormData(prev => ({
          ...prev,
          entryTime: dateTimeStr,
          exitTime: dateTimeStr
        }));
      }
    } else {
      // Reset when dialog closes
      setChecklistCompleted([]);
      setSelectedTags([]);
      setTagSearchQuery("");
      setScreenshotFile(null);
      setScreenshotPreview(null);
      setRating(0);
      setModeSelected(false);
      setEntryMode('manual');
      setScreenshotAnalyzed(false);
      setExtractedData(null);
    }
  }, [preselectedDate, open, editTrade]);

  // Update checklist when setup changes
  useEffect(() => {
    const selectedSetup = setupDefinitions.find(s => s.name === formData.setup);
    if (selectedSetup && checklistCompleted.length !== selectedSetup.checklist.length) {
      setChecklistCompleted(new Array(selectedSetup.checklist.length).fill(false));
    }
  }, [formData.setup, setupDefinitions]);

  // Auto-update fees when market changes
  useEffect(() => {
    if (!editTrade && formData.market) {
      const defaultFee = getMarketDefaultFee(formData.market);
      setFormData(prev => ({ ...prev, fees: defaultFee.toFixed(2) }));
    }
  }, [formData.market, editTrade]);

  // Auto-detect market when symbol changes (only for new trades)
  useEffect(() => {
    if (!editTrade && formData.symbol) {
      const detectedMarket = detectMarketFromSymbol(formData.symbol);
      if (detectedMarket) {
        setFormData(prev => ({ ...prev, market: detectedMarket as any }));
      }
    }
  }, [formData.symbol, editTrade]);

  // Auto-fill exit price with entry price
  useEffect(() => {
    if (!editTrade && formData.entryPrice && !formData.exitPrice) {
      setFormData(prev => ({ ...prev, exitPrice: prev.entryPrice }));
    }
  }, [formData.entryPrice, editTrade]);

  // Update symbol info when symbol or market changes
  useEffect(() => {
    if (formData.symbol && formData.market) {
      const info = getSymbolInfo(formData.symbol, formData.market);
      setSymbolInfo(info);
    } else {
      setSymbolInfo({});
    }
  }, [formData.symbol, formData.market]);

  // Fetch current price for a symbol
  const fetchCurrentPrice = async (symbol: string, market: string) => {
    if (!symbol) return;
    
    setLoadingPrice(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-stock-price', {
        body: { symbol, market }
      });

      if (error) throw error;

      if (data?.price) {
        setFormData(prev => ({ ...prev, entryPrice: data.price.toString() }));
        toast.success(t("trades.priceUpdated", { price: data.price }));
      } else {
        toast.error(t("trades.priceNotAvailable"));
      }
    } catch (error) {
      console.error("Error fetching price:", error);
      toast.error(t("trades.priceError"));
    } finally {
      setLoadingPrice(false);
    }
  };

  // Analyze chart screenshot with AI
  const analyzeChartScreenshot = async () => {
    if (!screenshotFile) {
      toast.error(t("trades.noScreenshotSelected"));
      return;
    }

    setAnalyzingChart(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          if (reader.result && typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = reject;
      });
      
      reader.readAsDataURL(screenshotFile);
      const imageBase64 = await base64Promise;

      // Call the analyze-chart edge function
      const { data, error } = await supabase.functions.invoke("analyze-chart", {
        body: { imageBase64 },
      });

      if (error) {
        console.error("Error analyzing chart:", error);
        toast.error(t("trades.chartAnalysisError"));
        return;
      }

      if (data?.success && data?.data) {
        const extracted = data.data;
        setExtractedData(extracted);
        
        // Update form with extracted data using new field names
        setFormData((prev) => ({
          ...prev,
          symbol: extracted.symbol || prev.symbol,
          side: extracted.side || prev.side,
          market: extracted.market || prev.market,
          qty: extracted.size ? String(extracted.size) : prev.qty,
          entryPrice: extracted.entry_price ? String(extracted.entry_price) : prev.entryPrice,
          exitPrice: extracted.exit_price ? String(extracted.exit_price) : prev.exitPrice,
          stopLossPrice: extracted.stop_loss_price ? String(extracted.stop_loss_price) : prev.stopLossPrice,
          initialRisk: extracted.planned_risk ? String(extracted.planned_risk) : prev.initialRisk,
          fees: extracted.fees !== undefined ? String(extracted.fees) : prev.fees,
          entryTime: extracted.entry_time || prev.entryTime,
          exitTime: extracted.exit_time || prev.exitTime,
          setup: extracted.setup || prev.setup,
          note: extracted.notes ? (prev.note ? `${prev.note}\n\n${extracted.notes}` : extracted.notes) : prev.note,
        }));

        if (extracted.tags) {
          setSelectedTags(extracted.tags);
        }
        
        if (extracted.trade_quality_rating) {
          setRating(extracted.trade_quality_rating);
        }

        // Show success message with confidence level
        const confidencePercent = Math.round((extracted.overall_confidence || 0) * 100);
        toast.success(`${t("trades.chartAnalyzed")} (${confidencePercent}% Confidence)`);
        setScreenshotAnalyzed(true);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("trades.chartAnalysisError"));
    } finally {
      setAnalyzingChart(false);
    }
  };

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

      // Upload screenshot if provided
      let screenshotUrl = editTrade?.screenshot_url || null;
      if (screenshotFile) {
        const fileExt = screenshotFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('trade-screenshots')
          .upload(fileName, screenshotFile);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('trade-screenshots')
          .getPublicUrl(fileName);
        
        screenshotUrl = publicUrl;
      }

      // Calculate P&L
      const priceDiff = formData.side === "long" 
        ? exitPrice - entryPrice 
        : entryPrice - exitPrice;
      
      // For Futures, multiply by point value; for Options, multiply by multiplier
      let pnlGross = priceDiff * qty;
      if (formData.market === "Futures" && symbolInfo.pointValue) {
        pnlGross = priceDiff * qty * symbolInfo.pointValue;
      } else if (formData.market === "Option" && symbolInfo.multiplier) {
        pnlGross = priceDiff * qty * symbolInfo.multiplier;
      }
      
      const pnlNet = pnlGross - fees;

      const stopLossPrice = formData.stopLossPrice ? parseFloat(formData.stopLossPrice) : null;
      const initialRisk = formData.initialRisk ? parseFloat(formData.initialRisk) : null;
      
      // Calculate R-Multiple if initial_risk is provided
      let rMultiple = null;
      if (initialRisk && initialRisk > 0) {
        rMultiple = pnlNet / initialRisk;
      }

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
        stop_loss_price: stopLossPrice,
        initial_risk: initialRisk,
        r: rMultiple,
        rating: rating > 0 ? rating : null,
        screenshot_url: screenshotUrl,
        setup: formData.setup || null,
        note: formData.note || null,
        setup_checklist_completed: checklistCompleted.length > 0 ? checklistCompleted : null,
        tags: selectedTags.length > 0 ? selectedTags : null,
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
        stopLossPrice: "",
        initialRisk: "",
        entryTime: "",
        exitTime: "",
        fees: "2.00",
        setup: "",
        note: "",
      });
      setChecklistCompleted([]);
      setSelectedTags([]);
      setScreenshotFile(null);
      setScreenshotPreview(null);
      setRating(0);
      setModeSelected(false);
      setScreenshotAnalyzed(false);
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
          <DialogTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {modeSelected && !editTrade && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setModeSelected(false)}
                  className="h-8 w-8"
                  type="button"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              {editTrade ? t("trades.editTrade") : t("trades.newTrade")}
            </div>
            {!editTrade && modeSelected && (
              <Button
                variant="outline"
                size="sm"
                onClick={copyLastTrade}
                type="button"
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                {t("trades.copyLastTrade")}
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        
        {/* Mode Selection Cards - only show for new trades */}
        {!editTrade && !modeSelected && (
          <div className="grid md:grid-cols-2 gap-6 py-6">
            <Card 
              className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 group"
              onClick={() => {
                setEntryMode('manual');
                setModeSelected(true);
              }}
            >
              <CardHeader className="text-center space-y-4">
                <div className="flex items-center justify-center">
                  <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Edit3 className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div>
                  <CardTitle className="mb-2">{t('trades.manualEntry')}</CardTitle>
                  <CardDescription>
                    {t('trades.manualEntryDescription')}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
            
            <Card 
              className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 group relative"
              onClick={() => {
                setEntryMode('screenshot');
                setModeSelected(true);
              }}
            >
              <div className="absolute top-3 right-3">
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI
                </Badge>
              </div>
              <CardHeader className="text-center space-y-4">
                <div className="flex items-center justify-center">
                  <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Camera className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div>
                  <CardTitle className="mb-2">{t('trades.screenshotAnalysis')}</CardTitle>
                  <CardDescription>
                    {t('trades.screenshotHint')}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Screenshot Upload Screen - only for screenshot mode before analysis */}
        {modeSelected && entryMode === 'screenshot' && !screenshotAnalyzed && (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center">
                  <div className="p-6 rounded-full bg-primary/10">
                    <Camera className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold">{t('trades.screenshotAnalysis')}</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {t('trades.screenshotHint')}
                </p>
              </div>
              
              <div className="space-y-2">
                {screenshotFile && (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(screenshotFile)}
                      alt="Screenshot preview"
                      className="w-full h-64 object-contain rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => {
                        setScreenshotFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                <div className="flex flex-col gap-3">
                  <Input
                    id="screenshot"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setScreenshotFile(file);
                      }
                    }}
                    className="cursor-pointer"
                  />
                  
                  {screenshotFile && (
                    <Button
                      type="button"
                      variant="default"
                      size="lg"
                      onClick={analyzeChartScreenshot}
                      disabled={analyzingChart}
                      className="w-full"
                    >
                      <Sparkles className="h-5 w-5 mr-2" />
                      {analyzingChart ? t('trades.analyzing') : t('trades.analyzeChart')}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form - only show after mode selection or for edit */}
        {(editTrade || (modeSelected && (entryMode === 'manual' || screenshotAnalyzed))) && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Live P&L Preview */}
          {livePnL && (
            <Card className={`border-2 ${livePnL.pnlNet >= 0 ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5'}`}>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {livePnL.pnlNet >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                    <span className="text-sm font-medium text-muted-foreground">
                      {t("trades.livePnL")}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${livePnL.pnlNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${livePnL.pnlNet.toFixed(2)}
                    </div>
                    <div className={`text-sm ${livePnL.pnlNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {livePnL.returnPercent >= 0 ? '+' : ''}{livePnL.returnPercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
              <div className="flex items-center gap-2">
                <Label htmlFor="symbol">{t("trades.symbol")} *</Label>
                {extractedData?.field_confidence?.symbol !== undefined && (
                  <Badge variant="outline" className={`text-xs ${
                    extractedData.field_confidence.symbol >= 0.8 
                      ? 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20' 
                      : extractedData.field_confidence.symbol >= 0.5
                      ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20'
                      : 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20'
                  }`}>
                    {Math.round(extractedData.field_confidence.symbol * 100)}%
                  </Badge>
                )}
              </div>
              
              {/* Frequent Symbols Quick Chips */}
              {frequentSymbols.length > 0 && !editTrade && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {frequentSymbols.slice(0, 5).map((item) => (
                    <Badge
                      key={item.symbol}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => {
                        setFormData({ ...formData, symbol: item.symbol });
                        fetchCurrentPrice(item.symbol, formData.market);
                      }}
                    >
                      {item.symbol}
                    </Badge>
                  ))}
                </div>
              )}
              
              <SymbolCombobox
                value={formData.symbol}
                onChange={(value) => {
                  setFormData({ ...formData, symbol: value });
                  setErrors({ ...errors, symbol: undefined });
                  // Auto-fetch price when symbol changes
                  if (value) {
                    fetchCurrentPrice(value, formData.market);
                  }
                }}
                market={formData.market}
              />
              {symbolInfo.info && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Info className="h-3 w-3" />
                  <span>{symbolInfo.info}</span>
                </div>
              )}
              {errors.symbol && (
                <p className="text-sm text-destructive">{errors.symbol}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="side">{t("trades.side")} *</Label>
              <ToggleGroup 
                type="single" 
                value={formData.side} 
                onValueChange={(v) => {
                  if (v) setFormData({ ...formData, side: v as "long" | "short" });
                }}
                className="justify-start"
              >
                <ToggleGroupItem 
                  value="long" 
                  aria-label="Long position"
                  className="flex-1 data-[state=on]:bg-green-500 data-[state=on]:text-white gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  {t("trades.long")}
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="short" 
                  aria-label="Short position"
                  className="flex-1 data-[state=on]:bg-red-500 data-[state=on]:text-white gap-2"
                >
                  <TrendingDown className="h-4 w-4" />
                  {t("trades.short")}
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="qty">{t("trades.qty")} *</Label>
                {extractedData?.field_confidence?.size !== undefined && (
                  <Badge variant="outline" className={`text-xs ${
                    extractedData.field_confidence.size >= 0.8 
                      ? 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20' 
                      : extractedData.field_confidence.size >= 0.5
                      ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20'
                      : 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20'
                  }`}>
                    {Math.round(extractedData.field_confidence.size * 100)}%
                  </Badge>
                )}
              </div>
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
              <div className="flex items-center gap-2">
                <Label htmlFor="entryPrice">{t("trades.entryPrice")} *</Label>
                {extractedData?.field_confidence?.entry_price !== undefined && (
                  <Badge variant="outline" className={`text-xs ${
                    extractedData.field_confidence.entry_price >= 0.8 
                      ? 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20' 
                      : extractedData.field_confidence.entry_price >= 0.5
                      ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20'
                      : 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20'
                  }`}>
                    {Math.round(extractedData.field_confidence.entry_price * 100)}%
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
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
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (formData.symbol) {
                      fetchCurrentPrice(formData.symbol, formData.market);
                    } else {
                      toast.error(t("trades.selectSymbolFirst"));
                    }
                  }}
                  disabled={loadingPrice}
                  title={t("trades.refreshPrice")}
                >
                  {loadingPrice ? (
                    <span className="animate-spin">↻</span>
                  ) : (
                    "↻"
                  )}
                </Button>
              </div>
              {errors.entryPrice && (
                <p className="text-sm text-destructive">{errors.entryPrice}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="exitPrice">{t("trades.exitPrice")} *</Label>
                {extractedData?.field_confidence?.exit_price !== undefined && (
                  <Badge variant="outline" className={`text-xs ${
                    extractedData.field_confidence.exit_price >= 0.8 
                      ? 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20' 
                      : extractedData.field_confidence.exit_price >= 0.5
                      ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20'
                      : 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20'
                  }`}>
                    {Math.round(extractedData.field_confidence.exit_price * 100)}%
                  </Badge>
                )}
              </div>
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
              <div className="flex items-center gap-2">
                <Label htmlFor="fees">{t("trades.fees")} ($)</Label>
                {extractedData?.field_confidence?.fees !== undefined && (
                  <Badge variant="outline" className={`text-xs ${
                    extractedData.field_confidence.fees >= 0.8 
                      ? 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20' 
                      : extractedData.field_confidence.fees >= 0.5
                      ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20'
                      : 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20'
                  }`}>
                    {Math.round(extractedData.field_confidence.fees * 100)}%
                  </Badge>
                )}
              </div>
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
              <Label htmlFor="stopLossPrice">{t("trades.stopLossPrice")} ($)</Label>
              <Input
                id="stopLossPrice"
                type="number"
                step="0.01"
                value={formData.stopLossPrice}
                onChange={(e) => setFormData({ ...formData, stopLossPrice: e.target.value })}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="initialRisk">{t("trades.initialRisk")} ($)</Label>
              <Input
                id="initialRisk"
                type="number"
                step="0.01"
                value={formData.initialRisk}
                onChange={(e) => setFormData({ ...formData, initialRisk: e.target.value })}
                placeholder="Optional"
              />
              <p className="text-xs text-muted-foreground">
                {t("trades.initialRiskHint")}
              </p>
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

          {/* Tags */}
          {availableTags.length > 0 && (
            <div className="space-y-2">
              <Label>{t("trades.tags")}</Label>
              <Input
                placeholder={t("trades.searchTags")}
                value={tagSearchQuery}
                onChange={(e) => setTagSearchQuery(e.target.value)}
                className="mb-2"
              />
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                {availableTags
                  .filter(tag => 
                    tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
                  )
                  .map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        if (selectedTags.includes(tag)) {
                          setSelectedTags(selectedTags.filter(t => t !== tag));
                        } else {
                          setSelectedTags([...selectedTags, tag]);
                        }
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
              </div>
              {selectedTags.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedTags.length} {t("trades.tagsSelected")}
                </p>
              )}
            </div>
          )}

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

          {/* Rating */}
          <div className="space-y-2">
            <Label>{t("trades.rating")}</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-colors"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <button
                  type="button"
                  onClick={() => setRating(0)}
                  className="ml-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("trades.ratingHint")}
            </p>
          </div>

          {/* Screenshot Upload and Analysis */}
          {entryMode === 'manual' && (
            <div className="space-y-2">
              <Label htmlFor="screenshot">{t('trades.screenshot')} ({t('trades.optional')})</Label>
              <div className="space-y-2">
                {screenshotPreview && !screenshotFile && (
                  <div className="relative">
                    <img
                      src={screenshotPreview}
                      alt="Current screenshot"
                      className="w-full h-32 object-cover rounded border"
                    />
                  </div>
                )}
                {screenshotFile && (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(screenshotFile)}
                      alt="Screenshot preview"
                      className="w-full h-32 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => {
                        setScreenshotFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <Input
                  id="screenshot"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setScreenshotFile(file);
                    }
                  }}
                  className="cursor-pointer"
                />
              </div>
            </div>
          )}
          
          {/* Screenshot Preview for analyzed mode */}
          {entryMode === 'screenshot' && screenshotFile && (
            <div className="space-y-2">
              <Label>{t('trades.screenshot')}</Label>
              <div className="relative">
                <img
                  src={URL.createObjectURL(screenshotFile)}
                  alt="Analyzed screenshot"
                  className="w-full h-48 object-contain rounded-lg border"
                />
                <Badge className="absolute top-2 left-2 gap-1">
                  <Sparkles className="h-3 w-3" />
                  {t('trades.chartAnalyzed')}
                </Badge>
              </div>
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
        )}
      </DialogContent>
    </Dialog>
  );
}
