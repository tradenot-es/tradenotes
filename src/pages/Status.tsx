import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Clock, Activity } from "lucide-react";
import { usePageSeo } from "@/hooks/useSeo";

type ServiceStatus = "operational" | "down" | "checking";

const Status = () => {
  usePageSeo("status", "/status");
  // live check: /api/health answers only when the app server and its database are up
  const [apiStatus, setApiStatus] = useState<ServiceStatus>("checking");
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => setApiStatus(res.ok ? "operational" : "down"))
      .catch(() => setApiStatus("down"))
      .finally(() => setCheckedAt(new Date()));
  }, []);

  const services = [
    {
      name: "Website",
      status: "operational",
      description: "TradeNot.es Website"
    },
    {
      name: "App & Login",
      status: apiStatus,
      description: "Trading-Journal, Authentifizierung & Datenbank"
    }
  ];

  const allOperational = apiStatus === "operational";

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "degraded":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "down":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Operational</Badge>;
      case "degraded":
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">Eingeschränkt</Badge>;
      case "down":
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Ausgefallen</Badge>;
      default:
        return <Badge variant="outline">Unbekannt</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Activity className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">System Status</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Aktuelle Verfügbarkeit und Performance aller TradeNot.es Services
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-12">
            <Card className={allOperational ? "border-green-500/20 bg-green-500/5" : "border-yellow-500/20 bg-yellow-500/5"}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {allOperational ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-yellow-500" />
                  )}
                  <CardTitle className={allOperational ? "text-green-500" : "text-yellow-500"}>
                    {apiStatus === "checking" ? "Status wird geprüft …" : allOperational ? "Alle Systeme operational" : "Störung"}
                  </CardTitle>
                </div>
                <CardDescription>
                  {allOperational
                    ? "Alle Services laufen normal. Keine aktuellen Probleme bekannt."
                    : apiStatus === "down"
                      ? "Die App ist gerade nicht erreichbar. Wir arbeiten daran."
                      : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Letzte Aktualisierung: {(checkedAt ?? new Date()).toLocaleString('de-DE')}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-4xl mx-auto mb-12">
            <h2 className="text-2xl font-bold mb-6">Service Status</h2>
            <div className="space-y-4">
              {services.map((service, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {getStatusIcon(service.status)}
                        <div className="flex-1">
                          <h3 className="font-semibold">{service.name}</h3>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {getStatusBadge(service.status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Bei Problemen oder Fragen kontaktieren Sie uns unter{" "}
              <a href="/kontakt" className="text-primary hover:underline">
                support@tradenot.es
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Status;
