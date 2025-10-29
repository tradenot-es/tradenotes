import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { 
  TrendingUp, 
  BarChart3, 
  BookOpen, 
  Target, 
  LineChart, 
  Calendar,
  Check,
  Star
} from "lucide-react";

const Landing = () => {
  const features = [
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Erweiterte Analytics",
      description: "Detaillierte Performance-Metriken und Statistiken für fundierte Entscheidungen"
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Trading Journal",
      description: "Dokumentiere jeden Trade mit Notizen, Screenshots und Emotionen"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Setup-Verwaltung",
      description: "Organisiere deine Trading-Setups mit individuellen Checklisten"
    },
    {
      icon: <LineChart className="h-6 w-6" />,
      title: "P&L Tracking",
      description: "Verfolge deinen Gewinn und Verlust in Echtzeit mit aussagekräftigen Charts"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Kalender-Ansicht",
      description: "Visualisiere deine Trading-Performance im Kalender-Format"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Performance Reports",
      description: "Automatisch generierte Reports mit allen wichtigen KPIs"
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "0",
      period: "kostenlos",
      description: "Perfekt für den Einstieg",
      features: [
        "Bis zu 50 Trades pro Monat",
        "Basis Analytics",
        "Trading Journal",
        "Mobile App Zugang"
      ],
      highlighted: false
    },
    {
      name: "Professional",
      price: "29",
      period: "pro Monat",
      description: "Für ernsthafte Trader",
      features: [
        "Unbegrenzte Trades",
        "Erweiterte Analytics",
        "Setup-Verwaltung mit Checklisten",
        "Automatische Reports",
        "Prioritäts-Support",
        "CSV Import/Export"
      ],
      highlighted: true
    },
    {
      name: "Team",
      price: "99",
      period: "pro Monat",
      description: "Für Trading-Teams",
      features: [
        "Alles aus Professional",
        "Bis zu 5 Team-Mitglieder",
        "Gemeinsame Setups",
        "Team Analytics",
        "Dedizierter Account Manager"
      ],
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge className="w-fit glow-effect">
                Next-Gen Trading Journal
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Alles über dein Trading...
                <span className="gradient-text block mt-2">
                  ...was deine Spreadsheets nie zeigten
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                TradeNotes.io zeigt dir die Metriken, die wirklich zählen – und die Verhaltensweisen, 
                die zu Profit führen, durch die Kraft von Journaling und Analytics.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" variant="premium" asChild>
                  <Link to="/auth">Jetzt starten</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#features">Features entdecken</a>
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <Star className="h-5 w-5 fill-primary text-primary" />
                </div>
                <span>4.9/5 von 1000+ Tradern</span>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-2xl border border-primary/20 elegant-shadow overflow-hidden">
                <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-24 w-24 text-primary mx-auto mb-4" />
                    <p className="text-lg font-medium">Dashboard Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4">Features</Badge>
            <h2 className="text-4xl font-bold mb-4">Alles was du brauchst</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Von detaillierten Analytics bis zur kompletten Trade-Historie – alle Tools an einem Ort
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="smooth-transition hover:scale-105">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4">Pricing</Badge>
            <h2 className="text-4xl font-bold mb-4">Wähle deinen Plan</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Starte kostenlos und upgrade jederzeit wenn du bereit bist
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative ${plan.highlighted ? 'border-primary glow-effect' : ''}`}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Beliebt
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground ml-2">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.highlighted ? "premium" : "outline"}
                    asChild
                  >
                    <Link to="/auth">
                      {plan.price === "0" ? "Kostenlos starten" : "Jetzt upgraden"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Bereit, dein Trading auf das nächste Level zu bringen?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Schließe dich tausenden erfolgreichen Tradern an, die bereits TradeNotes.io nutzen
          </p>
          <Button size="lg" variant="premium" asChild>
            <Link to="/auth">Jetzt kostenlos starten</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">TradeNotes.io</h3>
              <p className="text-sm text-muted-foreground">
                Die professionelle Trading Journal Plattform
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produkt</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary">Features</a></li>
                <li><a href="#pricing" className="hover:text-primary">Pricing</a></li>
                <li><Link to="/auth" className="hover:text-primary">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Hilfe Center</a></li>
                <li><a href="#" className="hover:text-primary">Kontakt</a></li>
                <li><a href="#" className="hover:text-primary">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Datenschutz</a></li>
                <li><a href="#" className="hover:text-primary">AGB</a></li>
                <li><a href="#" className="hover:text-primary">Impressum</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2025 TradeNotes.io. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
