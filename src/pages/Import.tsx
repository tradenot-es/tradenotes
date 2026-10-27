import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, HelpCircle, Copy, Check, Key, RefreshCw, Trash2, Eye, EyeOff, FileCode2, Radio, Zap, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, db, invoke } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { PageHeader } from "@/components/PageHeader";
import { createZip } from "@/lib/zip";
import { CsvImport, detectCsv } from "@/lib/csvImport";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { dateLocale } from "@/lib/dateLocale";

const Import = () => {
  const { t, i18n } = useTranslation();
  const { session } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [pendingExecutions, setPendingExecutions] = useState<any[]>([]);
  const [lastExecutionAt, setLastExecutionAt] = useState<string | null>(null);
  const [csv, setCsv] = useState<CsvImport | null>(null);
  // a CSV export does not say whether it was paper or live trading
  const [csvAccountType, setCsvAccountType] = useState<'sim' | 'evaluation' | 'performance' | 'live'>('sim');
  const [loadingApiKey, setLoadingApiKey] = useState(false);
  const [selectedExecutions, setSelectedExecutions] = useState<Set<string>>(new Set());
  
  const webhookUrl = `${window.location.origin}/api/import-trades`;

  // Load API key and pending executions
  useEffect(() => {
    if (session?.user) {
      loadApiKey();
      loadPendingExecutions();
    }
  }, [session]);

  const loadApiKey = async () => {
    try {
      // the key is not readable through the data API, only through this endpoint
      const { data: result, error } = await apiFetch('/api/webhook-key');
      if (error) throw new Error('Failed to load API key');
      if (result.webhook_api_key) {
        setApiKey(result.webhook_api_key);
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    }
  };

  const loadPendingExecutions = async () => {
    try {
      // fills of positions that are still open (not yet part of a trade)
      const { data, error } = await db
        .from('executions')
        .select('*')
        .eq('matched', false)
        .order('time', { ascending: false });
      if (error) throw error;
      setPendingExecutions(data || []);

      const { data: last } = await db
        .from('executions')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1);
      setLastExecutionAt(last?.[0]?.created_at ?? null);
    } catch (error) {
      console.error('Error loading pending executions:', error);
    }
  };

  const regenerateApiKey = async () => {
    setLoadingApiKey(true);
    try {
      const { data: result, error } = await apiFetch('/api/webhook-key', { method: 'POST' });
      if (error) throw new Error('Failed to regenerate API key');
      if (result.webhook_api_key) {
        setApiKey(result.webhook_api_key);
        toast.success(t("import.ntApiKeyRegenerated"));
      }
    } catch (error: any) {
      console.error('Error regenerating API key:', error);
      toast.error(t("import.ntApiKeyRegenerateError"));
    } finally {
      setLoadingApiKey(false);
    }
  };

  const deletePendingExecution = async (id: string) => {
    try {
      const { error } = await db
        .from('executions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setSelectedExecutions(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      await loadPendingExecutions();
      toast.success(t("import.ntExecutionDeleted"));
    } catch (error) {
      console.error('Error deleting execution:', error);
      toast.error(t("import.ntExecutionDeleteError"));
    }
  };

  const deleteSelectedExecutions = async () => {
    if (selectedExecutions.size === 0) return;
    
    try {
      const { error } = await db
        .from('executions')
        .delete()
        .in('id', Array.from(selectedExecutions));
      
      if (error) throw error;
      
      const count = selectedExecutions.size;
      setSelectedExecutions(new Set());
      await loadPendingExecutions();
      toast.success(t("import.ntExecutionsDeleted", { count }));
    } catch (error) {
      console.error('Error deleting executions:', error);
      toast.error(t("import.ntExecutionDeleteError"));
    }
  };

  const toggleSelectExecution = (id: string) => {
    setSelectedExecutions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedExecutions.size === pendingExecutions.length) {
      setSelectedExecutions(new Set());
    } else {
      setSelectedExecutions(new Set(pendingExecutions.map(e => e.id)));
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setApiKeyCopied(true);
    toast.success(t("import.ntApiKeyCopied"));
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  /** The add-on source with the user's key and this server's address filled in. */
  const addOnSource = async () => {
    const response = await fetch('/TradeNotesSync.cs');
    if (!response.ok) throw new Error(`add-on template: ${response.status}`);
    return (await response.text())
      .replace('ApiKey = "YOUR_API_KEY_HERE"', `ApiKey = "${apiKey}"`)
      .replace('Endpoint = "https://tradenot.es/api/import-trades"', `Endpoint = "${webhookUrl}"`);
  };

  const saveFile = (blob: Blob, name: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ZIP in the layout of a NinjaTrader export, for Tools → Import → NinjaScript Add-On
  const downloadAddOn = async (format: 'zip' | 'cs') => {
    if (!apiKey) {
      toast.error(t("import.ntNoApiKeyError"));
      return;
    }
    try {
      const source = await addOnSource();
      if (format === 'cs') {
        saveFile(new Blob([source], { type: 'text/plain' }), 'TradeNotesSync.cs');
      } else {
        const info = '<?xml version="1.0" encoding="utf-8"?>\r\n<NinjaTrader>\r\n  <Export>\r\n    <Version>8.1.4.1</Version>\r\n  </Export>\r\n</NinjaTrader>\r\n';
        saveFile(
          createZip([
            { name: 'Info.xml', content: info },
            { name: 'AddOns/TradeNotesSync.cs', content: source },
          ]),
          'TradeNotesSync.zip',
        );
      }
      toast.success(t("import.ntScriptDownloadedWithKey"));
    } catch (error) {
      console.error('Error downloading add-on:', error);
      toast.error(t("import.ntScriptDownloadError"));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    // allow picking the same file again, e.g. after the next weekly export
    e.target.value = '';
    if (!selected) return;
    setFile(selected);
    setCsv(detectCsv(await selected.text()));
  };

  const handleImport = async () => {
    if (!file || !csv) {
      toast.error(t("import.selectFile"));
      return;
    }
    setImporting(true);
    try {
      if (csv.format === 'template') {
        if (csv.trades.length === 0) throw new Error(t("import.noTradesFound"));
        const { error } = await invoke('import-trades', { body: csv.trades });
        if (error) throw error;
        toast.success(t("import.importSuccess", { count: csv.trades.length }));
      } else if (csv.format === 'tradingview') {
        if (csv.executions.length === 0) throw new Error(t("import.noTradesFound"));
        let created = 0;
        let duplicates = 0;
        // in chunks, the server takes up to 5000 per request
        for (let i = 0; i < csv.executions.length; i += 2000) {
          const { data, error } = await invoke<{ tradesCreated: number; duplicates: number }>('import-trades', {
            body: { source: 'tradingview', accountType: csvAccountType, executions: csv.executions.slice(i, i + 2000) },
          });
          if (error) throw error;
          created += data.tradesCreated;
          duplicates += data.duplicates;
        }
        toast.success(t("import.tvImportResult", { created, duplicates }));
        await loadPendingExecutions();
      } else {
        throw new Error(t("import.unknownFormat"));
      }
      setFile(null);
      setCsv(null);
    } catch (error: unknown) {
      console.error('Import error:', error);
      const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : String(error);
      toast.error(t("import.importError") + ": " + message);
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

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("import.title")}
        subtitle={t("import.subtitle")}
        actions={
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
                    <h3 className="font-semibold text-lg mb-2">{t("import.tvTitle")}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{t("import.tvIntro")}</p>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                      <li>{t("import.tvStep1")}</li>
                      <li>{t("import.tvStep2")}</li>
                      <li>{t("import.tvStep3")}</li>
                      <li>{t("import.tvStep4")}</li>
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

                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        }
      />

      {session && (
        <>
          {/* NinjaTrader Integration Card */}
          <Card className="mb-6 border-2 border-primary/20 shadow-lg bg-gradient-to-br from-background to-primary/5">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                {t("import.ntTitle")}
              </CardTitle>
              <CardDescription className="text-base">{t("import.ntDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Download add-on */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">{t("import.ntScriptTitle")}</h3>
                <p className="text-sm text-muted-foreground">{t("import.ntScriptDescription")}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={() => downloadAddOn('zip')} className="flex-1" disabled={!apiKey}>
                    <Download className="mr-2 h-4 w-4" />
                    {t("import.ntDownloadScript")}
                  </Button>
                  {apiKey && (
                    <Badge variant="secondary" className="text-xs shrink-0">
                      <Key className="h-3 w-3 mr-1" />
                      {t("import.ntScriptIncludesKey")}
                    </Badge>
                  )}
                </div>
                <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                  <li>{t("import.ntInstallStep1")}</li>
                  <li>{t("import.ntInstallStep2")}</li>
                  <li>{t("import.ntInstallStep3")}</li>
                </ol>
                <p className="text-xs text-muted-foreground">
                  {t("import.ntInstallFallback")}{" "}
                  <button type="button" onClick={() => downloadAddOn('cs')} className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline" disabled={!apiKey}>
                    <FileCode2 className="h-3 w-3" aria-hidden />
                    TradeNotesSync.cs
                  </button>
                </p>
                <p className="flex items-center gap-2 text-xs">
                  <Radio className={`h-3.5 w-3.5 ${lastExecutionAt ? 'text-success' : 'text-muted-foreground'}`} aria-hidden />
                  {lastExecutionAt
                    ? t("import.ntLastExecution", { time: formatDistanceToNow(new Date(lastExecutionAt), { addSuffix: true, locale: dateLocale(i18n.language) }) })
                    : t("import.ntNoExecutionYet")}
                </p>
              </div>

              <Separator />

              {/* API Key Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{t("import.ntApiKeyTitle")}</h3>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" disabled={loadingApiKey}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loadingApiKey ? 'animate-spin' : ''}`} />
                        {t("import.ntRegenerateKey")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("import.ntRegenerateKeyConfirm")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("import.ntRegenerateKeyWarning")}
                <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-amber-600 dark:text-amber-400 text-sm font-medium">
                    {t("import.ntRegenerateKeyNinjaTraderNote")}
                  </p>
                  <ul className="mt-2 text-xs text-muted-foreground list-disc list-inside space-y-1">
                    <li>{t("import.ntRegenerateKeyOptionA")}</li>
                    <li>{t("import.ntRegenerateKeyOptionB")}</li>
                  </ul>
                </div>
              </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={regenerateApiKey}>
                          {t("import.ntRegenerateKey")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <div className="flex items-center gap-2 p-4 bg-background rounded-lg border-2">
                  <code className="flex-1 p-3 bg-muted rounded-md text-sm break-all font-mono">
                    {showApiKey ? apiKey : '•'.repeat(48)}
                  </code>
                  <Button onClick={() => setShowApiKey(!showApiKey)} size="icon" variant="ghost">
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button onClick={copyApiKey} size="icon" variant="default">
                    {apiKeyCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("import.ntApiKeyInfo")}
                </p>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg mt-2">
                  <p className="text-amber-600 dark:text-amber-400 text-xs font-medium">
                    ⚠️ {t("import.ntApiKeySecurityWarning")}
                  </p>
                </div>
              </div>

              {/* Pending Executions */}
              {pendingExecutions.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="text-sm font-semibold">{t("import.ntPendingTitle")}</h3>
                        <Badge variant="secondary">{pendingExecutions.length}</Badge>
                      </div>
                      {selectedExecutions.size > 0 && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4 mr-1" />
                              {t("import.ntDeleteSelected", { count: selectedExecutions.size })}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t("import.ntDeleteSelectedConfirm", { count: selectedExecutions.size })}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t("import.ntDeleteSelectedWarning")}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                              <AlertDialogAction onClick={deleteSelectedExecutions}>
                                {t("common.delete")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{t("import.ntPendingDescription")}</p>
                    
                    {/* Select All Header */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border">
                      <Checkbox
                        id="select-all"
                        checked={selectedExecutions.size === pendingExecutions.length && pendingExecutions.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                      <label htmlFor="select-all" className="text-xs font-medium cursor-pointer">
                        {t("import.ntSelectAll")}
                      </label>
                    </div>
                    
                    <div className="space-y-2">
                      {pendingExecutions.map((exec) => (
                        <div key={exec.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                          <Checkbox
                            checked={selectedExecutions.has(exec.id)}
                            onCheckedChange={() => toggleSelectExecution(exec.id)}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{exec.symbol} ({exec.market}) · {exec.account}</p>
                            <p className="text-xs text-muted-foreground">
                              {exec.side === 'buy' ? 'Buy' : 'Sell'} {Number(exec.qty)} @ {Number(exec.price)} • {new Date(exec.time).toLocaleString()}
                            </p>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t("import.ntDeleteExecutionConfirm")}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("import.ntDeleteExecutionWarning")}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deletePendingExecution(exec.id)}>
                                  {t("common.delete")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

        </>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              {t("import.tvTitle")}
            </CardTitle>
            <CardDescription>{t("import.tvIntro")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              <li>{t("import.tvStep1")}</li>
              <li>{t("import.tvStep2")}</li>
              <li>{t("import.tvStep3")}</li>
              <li>{t("import.tvStep4")}</li>
            </ol>
            <p className="text-xs text-muted-foreground">{t("import.tvNote")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("import.uploadCSV")}</CardTitle>
            <CardDescription>{t("import.uploadDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 border-border">
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
            {file && csv && (
              <div className="space-y-3 rounded-md bg-muted p-3 text-sm" role="status">
                <p className="font-medium">{file.name}</p>
                {csv.format === 'template' && <p>{t("import.detectedTemplate", { count: csv.trades.length })}</p>}
                {csv.format === 'tradingview' && (
                  <>
                    <p>{t("import.detectedTradingView", { count: csv.executions.length, skipped: csv.skipped })}</p>
                    <div className="space-y-1.5">
                      <label htmlFor="csv-account-type" className="text-xs text-muted-foreground">{t("import.csvAccountType")}</label>
                      <Select value={csvAccountType} onValueChange={(v) => setCsvAccountType(v as typeof csvAccountType)}>
                        <SelectTrigger id="csv-account-type" className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sim">{t("import.accountTypes.sim")}</SelectItem>
                          <SelectItem value="evaluation">{t("import.accountTypes.evaluation")}</SelectItem>
                          <SelectItem value="performance">{t("import.accountTypes.performance")}</SelectItem>
                          <SelectItem value="live">{t("import.accountTypes.live")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                {csv.format === 'unknown' && (
                  <p className="text-destructive">{t("import.unknownFormatDetail", { headers: csv.headers.slice(0, 8).join(", ") })}</p>
                )}
              </div>
            )}
            <Button onClick={handleImport} className="w-full" disabled={!file || !csv || csv.format === 'unknown' || importing}>
              {importing ? t("import.importing") : t("import.importTrades")}
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
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
