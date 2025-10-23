import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";
import { toast } from "sonner";

const Import = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      toast.success("File selected: " + e.target.files[0].name);
    }
  };

  const handleImport = () => {
    if (file) {
      toast.success("Import functionality will be connected to backend");
    } else {
      toast.error("Please select a file first");
    }
  };

  const downloadTemplate = () => {
    toast.info("CSV template download will be available soon");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Import Trades</h1>
        <p className="text-muted-foreground">Import your trades from CSV files</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV</CardTitle>
            <CardDescription>Select a CSV file to import your trades</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 border-border">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">CSV files only</p>
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
                <p className="text-sm">Selected: {file.name}</p>
              </div>
            )}
            <Button onClick={handleImport} className="w-full" disabled={!file}>
              Import Trades
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CSV Template</CardTitle>
            <CardDescription>Download a template to structure your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Required Fields:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Symbol</li>
                <li>• Side (long/short)</li>
                <li>• Quantity</li>
                <li>• Entry Price</li>
                <li>• Exit Price</li>
                <li>• Entry Time</li>
                <li>• Exit Time</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Optional Fields:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Fees</li>
                <li>• Tags</li>
                <li>• Setup</li>
                <li>• Note</li>
              </ul>
            </div>
            <Button onClick={downloadTemplate} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Import;
