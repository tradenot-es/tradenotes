import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Clock, Activity } from "lucide-react";

const Status = () => {
  const services = [
    {
      name: "Website",
      status: "operational",
      description: "Lovable Hauptwebsite"
    },
    {
      name: "Login",
      status: "operational",
      description: "Authentifizierungssystem"
    },
    {
      name: "Editor",
      status: "operational",
      description: "Lovable Editor & KI-Funktionen"
    },
    {
      name: "Hosting",
      status: "operational",
      description: "App-Hosting & Deployment"
    },
    {
      name: "Supabase",
      status: "operational",
      description: "Datenbank & Backend Services"
    }
  ];

  // Status history would be fetched from Lovable's actual status API
  const statusHistory = [] as Array<{
    date: string;
    type: string;
    title: string;
    description: string;
    duration: string;
  }>;

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

  const getHistoryIcon = (type: string) => {
    switch (type) {
      case "resolved":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "maintenance":
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Activity className="h-5 w-5 text-muted-foreground" />;
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
              Aktuelle Verfügbarkeit und Performance aller TradeNotes Services
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-12">
            <Card className="border-green-500/20 bg-green-500/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  <CardTitle className="text-green-500">Alle Systeme operational</CardTitle>
                </div>
                <CardDescription>
                  Alle Services laufen normal. Keine aktuellen Probleme bekannt.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Letzte Aktualisierung: {new Date().toLocaleString('de-DE')}
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

          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Detaillierte Status-Informationen</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  Für detaillierte Informationen zu aktuellen und vergangenen Vorfällen, sowie Echtzeit-Updates besuchen Sie bitte die offizielle Lovable Status-Seite:
                </p>
                <a 
                  href="https://status.lovable.dev" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                >
                  status.lovable.dev
                  <Activity className="h-4 w-4" />
                </a>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Bei Problemen oder Fragen kontaktieren Sie uns unter{" "}
              <a href="/kontakt" className="text-primary hover:underline">
                support@tradenotes.io
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Status;
