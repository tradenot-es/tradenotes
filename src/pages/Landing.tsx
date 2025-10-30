import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import dashboardPreview from "@/assets/dashboard-real-preview.jpg";
import { 
  TrendingUp, 
  BarChart3, 
  BookOpen, 
  LineChart, 
  Calendar,
  Check,
  Star,
  Import,
  FileText,
  Activity,
  Target
} from "lucide-react";

const Landing = () => {
  const features = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Trading Journal",
      description: "Dokumentiere jeden Trade mit detaillierten Notizen, Screenshots und Emotionsanalyse für nachhaltigen Lernerfolg"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Performance Analytics",
      description: "Umfassende Statistiken mit Win-Rate, R-Multiple, Profit-Factor, Expectancy und kritischen Risikomanagement-KPIs"
    },
    {
      icon: <LineChart className="h-6 w-6" />,
      title: "Equity Curve",
      description: "Visualisiere deine kumulative Kapitalentwicklung - erkenne Drawdown-Phasen und Wachstumstrends auf einen Blick"
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: "Consistency Tracker",
      description: "GitHub-Style Heatmap deiner Trading-Konsistenz über 12 Wochen - identifiziere profitable Muster und meide Verlusttage"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Trading Kalender",
      description: "Behalte den Überblick über deine Trades im Kalender-Format mit farblicher Kennzeichnung profitabler Tage"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Portfolio News",
      description: "Automatischer News-Feed für deine meist gehandelten Symbole - bleibe über marktbewegende Events informiert"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Detaillierte Reports",
      description: "Analysiere Performance nach Symbol, Wochentag, Uhrzeit, Holding-Period und Gewinn-/Verlustserien - finde deine profitabelsten Muster"
    },
    {
      icon: <Import className="h-6 w-6" />,
      title: "CSV Import/Export",
      description: "Importiere Trades aus deinem Broker via CSV oder exportiere deine Daten für weitere Analysen"
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: "Weekly Performance",
      description: "Wochenweise Übersicht deiner Trading-Performance mit Trades pro Woche und P&L-Entwicklung"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "P&L Charts",
      description: "Monatliche P&L-Entwicklung in übersichtlichen Bar-Charts - verfolge deinen Fortschritt über Zeit"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Daily Prep",
      description: "Bereite dich optimal auf den Trading-Tag vor mit politischen Events, Wirtschaftskalendern und deinen Watchlist-Symbolen"
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Trading Glossar",
      description: "Umfangreiches Glossar mit allen wichtigen Trading-Begriffen - von A wie Average True Range bis Z wie Zeitwertverfall"
    }
  ];

  const allFeatures = [
    "Unbegrenzte Trades dokumentieren",
    "Vollständige Performance Analytics (Win Rate, R-Multiple, Profit Factor, Expectancy)",
    "Trading Journal mit Notizen & Screenshots",
    "Equity Curve zur Kapitalverfolgung",
    "Consistency Tracker (12-Wochen Heatmap)",
    "Portfolio News für meist gehandelte Symbole",
    "Win/Loss Analytics & Performance Breakdown",
    "Trading Kalender-Ansicht",
    "P&L Charts & Visualisierungen",
    "CSV Import & Export",
    "Setup-basierte Performance Reports",
    "Hour-of-Day Analytics (beste Handelszeiten)",
    "Symbol Performance Reports",
    "Streak Analysis (Gewinn-/Verlustserien)",
    "Holding Period Analysis",
    "Weekly Performance Tracking",
    "Daily Prep mit politischen Events",
    "Trading Glossar mit allen wichtigen Begriffen",
    "Dark/Light Mode",
    "Multi-Language Support (DE, EN, ES, FR, NL)",
    "Alle zukünftigen Features inklusive",
    "7 Tage kostenlos testen"
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
                Professionelles Trading Journal
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Werde ein besserer Trader durch
                <span className="gradient-text block mt-2">
                  systematisches Journaling
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                TradeNotes.io hilft dir, aus jedem Trade zu lernen. Analysiere deine Performance, 
                erkenne Muster und entwickle eine profitable Trading-Strategie mit detaillierten Analytics und Charts.
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
              <div className="aspect-video rounded-2xl border border-primary/20 elegant-shadow overflow-hidden">
                <img 
                  src={dashboardPreview} 
                  alt="TradeNotes.io Dashboard mit Performance Charts, Trading Kalender und Analytics" 
                  className="w-full h-full object-cover"
                />
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
            <h2 className="text-4xl font-bold mb-4">Alles für erfolgreiches Trading-Journaling</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Alle Tools, die du brauchst, um aus deinen Trades zu lernen und konstant profitabel zu werden
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
            <Badge className="mb-4 glow-effect">Einfaches Pricing</Badge>
            <h2 className="text-4xl font-bold mb-4">Ein Preis. Alle Features.</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Keine versteckten Kosten. Kein kompliziertes Abo-Modell. Nur ein fairer Preis für alle Funktionen.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="border-primary glow-effect">
              <CardHeader className="text-center pb-8">
                <div className="inline-block mx-auto mb-4">
                  <Badge className="text-lg px-4 py-2">7 Tage kostenlos testen</Badge>
                </div>
                <CardTitle className="text-3xl mb-2">TradeNotes.io Premium</CardTitle>
                <CardDescription className="text-lg">
                  Zugriff auf alle Features – jetzt und in Zukunft
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  {/* Monthly Plan */}
                  <div className="text-center p-6 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-2">Monatlich</p>
                    <div className="mb-4">
                      <span className="text-5xl font-bold">9,99€</span>
                      <span className="text-muted-foreground ml-2">/Monat</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Jederzeit kündbar</p>
                  </div>
                  
                  {/* Yearly Plan */}
                  <div className="text-center p-6 rounded-lg bg-primary/10 border-2 border-primary relative">
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                      17% sparen
                    </Badge>
                    <p className="text-sm text-muted-foreground mb-2">Jährlich</p>
                    <div className="mb-4">
                      <span className="text-5xl font-bold">99€</span>
                      <span className="text-muted-foreground ml-2">/Jahr</span>
                    </div>
                    <p className="text-sm text-primary font-medium">Nur 8,25€ pro Monat</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="font-semibold text-lg mb-4 text-center">Alle Features inklusive:</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {allFeatures.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Button className="w-full" size="lg" variant="premium" asChild>
                    <Link to="/auth">7 Tage kostenlos testen</Link>
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    Keine Kreditkarte erforderlich • Jederzeit kündbar
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Starte heute mit deinem Trading Journal
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Beginne deine 7-tägige kostenlose Testphase und entwickle dich zum konstant profitablen Trader
          </p>
          <Button size="lg" variant="premium" asChild>
            <Link to="/auth">7 Tage kostenlos testen</Link>
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
                Das professionelle Trading Journal für ambitionierte Trader
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
