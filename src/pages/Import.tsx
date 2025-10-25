import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, HelpCircle, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const Import = () => {
  const { t } = useTranslation();
  const { session } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-trades`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      toast.success(t("import.fileSelected") + " " + e.target.files[0].name);
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const trades = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const trade: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index];
        
        // Map CSV headers to trade fields
        if (header === 'symbol') trade.symbol = value;
        else if (header === 'side') trade.side = value.toLowerCase();
        else if (header === 'market') trade.market = value;
        else if (header === 'qty' || header === 'quantity') trade.qty = parseFloat(value);
        else if (header === 'entryprice' || header === 'entry_price') trade.entryPrice = parseFloat(value);
        else if (header === 'exitprice' || header === 'exit_price') trade.exitPrice = parseFloat(value);
        else if (header === 'entrytime' || header === 'entry_time') trade.entryTime = value;
        else if (header === 'exittime' || header === 'exit_time') trade.exitTime = value;
        else if (header === 'fees') trade.fees = parseFloat(value) || 0;
        else if (header === 'tags') trade.tags = value ? value.split(';') : [];
        else if (header === 'setup') trade.setup = value;
        else if (header === 'note') trade.note = value;
      });
      
      // Calculate PnL
      if (trade.entryPrice && trade.exitPrice && trade.qty) {
        const multiplier = trade.side === 'long' ? 1 : -1;
        trade.pnlNet = (trade.exitPrice - trade.entryPrice) * trade.qty * multiplier - (trade.fees || 0);
      }
      
      trades.push(trade);
    }
    
    return trades;
  };

  const handleImport = async () => {
    if (!file) {
      toast.error(t("import.selectFile"));
      return;
    }

    setImporting(true);
    
    try {
      const text = await file.text();
      const trades = parseCSV(text);
      
      if (trades.length === 0) {
        toast.error(t("import.noTradesFound"));
        setImporting(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error(t("import.notAuthenticated"));
        setImporting(false);
        return;
      }

      const response = await supabase.functions.invoke('import-trades', {
        body: trades,
      });

      if (response.error) {
        throw response.error;
      }

      toast.success(t("import.importSuccess", { count: trades.length }));
      setFile(null);
      
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(t("import.importError") + ": " + error.message);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `symbol,side,qty,entryPrice,exitPrice,entryTime,exitTime,fees,tags,setup,note
AAPL,long,100,150.50,155.25,2024-01-15T09:30:00Z,2024-01-15T15:45:00Z,2.00,momentum;tech,Breakout,Strong momentum breakout
TSLA,short,50,250.00,245.50,2024-01-16T10:00:00Z,2024-01-16T14:30:00Z,1.50,reversal,Failed Rally,Resistance rejection`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trade-import-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success(t("import.templateDownloaded"));
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success(t("import.webhookCopied"));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("import.title")}</h1>
          <p className="text-muted-foreground">{t("import.subtitle")}</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>{t("import.helpTitle")}</DialogTitle>
              <DialogDescription>{t("import.helpDescription")}</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6">
                {/* CSV Import Section */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t("import.helpCsvTitle")}</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>{t("import.helpCsvStep1")}</li>
                    <li>{t("import.helpCsvStep2")}</li>
                    <li>{t("import.helpCsvStep3")}</li>
                  </ol>
                </div>

                <Separator />

                {/* TradingView Section */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t("import.helpTvTitle")}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{t("import.helpTvIntro")}</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>{t("import.helpTvStep1")}</li>
                    <li>{t("import.helpTvStep2")}</li>
                    <li>{t("import.helpTvStep3")}</li>
                    <li>{t("import.helpTvStep4")}</li>
                  </ol>
                </div>

                <Separator />

                {/* NinjaTrader Section */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t("import.helpNtTitle")}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{t("import.helpNtIntro")}</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>{t("import.helpNtStep1")}</li>
                    <li>{t("import.helpNtStep2")}</li>
                    <li>{t("import.helpNtStep3")}</li>
                    <li>{t("import.helpNtStep4")}</li>
                  </ol>
                </div>

                <Separator />

                {/* Webhook Info */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t("import.helpWebhookTitle")}</h3>
                  <p className="text-sm text-muted-foreground">{t("import.helpWebhookInfo")}</p>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {session && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("import.webhookTitle")}</CardTitle>
            <CardDescription>{t("import.webhookDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <code className="flex-1 p-3 bg-muted rounded-md text-sm break-all">
                {webhookUrl}
              </code>
              <Button onClick={copyWebhookUrl} size="icon" variant="outline">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("import.webhookInstructions")}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("import.uploadCSV")}</CardTitle>
            <CardDescription>{t("import.uploadDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 border-border">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">{t("import.clickUpload")}</span> {t("import.dragDrop")}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("import.csvOnly")}</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".csv"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            {file && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm">{t("import.selected")}: {file.name}</p>
              </div>
            )}
            <Button onClick={handleImport} className="w-full" disabled={!file || importing}>
              {importing ? t("import.importing") : t("import.importTrades")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("import.csvTemplate")}</CardTitle>
            <CardDescription>{t("import.templateDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">{t("import.requiredFields")}</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {t("trades.symbol")}</li>
                <li>• {t("trades.side")} (long/short)</li>
                <li>• {t("trades.qty")}</li>
                <li>• {t("trades.entryPrice")}</li>
                <li>• {t("trades.exitPrice")}</li>
                <li>• {t("trades.entryTime")}</li>
                <li>• {t("trades.exitTime")}</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">{t("import.optionalFields")}</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {t("trades.fees")}</li>
                <li>• {t("trades.tags")}</li>
                <li>• {t("trades.setup")}</li>
                <li>• {t("trades.note")}</li>
              </ul>
            </div>
            <Button onClick={downloadTemplate} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              {t("import.downloadTemplate")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Import;
