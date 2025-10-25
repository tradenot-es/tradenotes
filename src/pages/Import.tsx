import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, HelpCircle } from "lucide-react";
import { toast } from "sonner";
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
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      toast.success(t("import.fileSelected") + " " + e.target.files[0].name);
    }
  };

  const handleImport = () => {
    if (file) {
      toast.success(t("import.importWillConnect"));
    } else {
      toast.error(t("import.selectFile"));
    }
  };

  const downloadTemplate = () => {
    toast.info(t("import.templateSoon"));
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
            <Button onClick={handleImport} className="w-full" disabled={!file}>
              {t("import.importTrades")}
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
