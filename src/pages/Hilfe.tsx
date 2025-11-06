import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

const Hilfe = () => {
  const faqs = [
    {
      question: "Wie starte ich mit TradeNotes?",
      answer: "Nach der Registrierung können Sie sofort loslegen. Fügen Sie Ihren ersten Trade über den 'Trade hinzufügen' Button hinzu oder importieren Sie bestehende Trades über die CSV-Import Funktion."
    },
    {
      question: "Welche Broker werden unterstützt?",
      answer: "TradeNotes unterstützt CSV-Importe von den meisten großen Brokern wie Interactive Brokers, TD Ameritrade, E-Trade und vielen mehr. Sie können auch manuell jeden Trade eingeben."
    },
    {
      question: "Wie funktioniert der CSV-Import?",
      answer: "Gehen Sie zur Import-Seite, laden Sie Ihre CSV-Datei hoch und ordnen Sie die Spalten den entsprechenden Feldern zu. TradeNotes erkennt automatisch viele gängige Formate."
    },
    {
      question: "Was ist die Equity Curve?",
      answer: "Die Equity Curve zeigt die Entwicklung Ihres Kapitals über die Zeit. Sie hilft Ihnen, Trends zu erkennen und Ihre Performance zu analysieren."
    },
    {
      question: "Wie berechnet sich die Win Rate?",
      answer: "Die Win Rate ist der Prozentsatz gewinnbringender Trades im Verhältnis zur Gesamtzahl der Trades. Eine Win Rate von 60% bedeutet, dass 6 von 10 Trades profitabel waren."
    },
    {
      question: "Was bedeutet R-Multiple?",
      answer: "Das R-Multiple zeigt, wie viel Sie im Verhältnis zu Ihrem initiierten Risiko gewonnen oder verloren haben. Ein R-Multiple von 2.0 bedeutet, dass Sie das Doppelte Ihres Risikos gewonnen haben."
    },
    {
      question: "Was ist der Profit Factor?",
      answer: "Der Profit Factor ist das Verhältnis zwischen Bruttogewinn und Bruttoverlust. Ein Profit Factor über 1.0 bedeutet, dass Sie profitabel sind. Ein Wert von 2.0 bedeutet, dass Sie doppelt so viel gewinnen wie verlieren."
    },
    {
      question: "Was ist Maximum Drawdown?",
      answer: "Der Maximum Drawdown ist der größte Verlust vom Höchststand zum Tiefststand Ihres Kapitals. Er zeigt, wie viel Kapital Sie im schlimmsten Fall verloren haben, bevor Sie sich erholt haben."
    },
    {
      question: "Was sind die empfohlenen Metriken?",
      answer: "Wichtige Metriken sind: Win Rate, Durchschnittsgewinn/-verlust, Risk/Reward Ratio, Profit Factor, Sharpe Ratio und Maximum Drawdown. Diese finden Sie auf der Reports-Seite."
    },
    {
      question: "Wie nutze ich das Trading-Journal effektiv?",
      answer: "Dokumentieren Sie vor jedem Trade Ihre Analyse, Ihr Setup und Ihre Emotionen. Nach dem Trade notieren Sie, ob Sie sich an Ihren Plan gehalten haben und was Sie gelernt haben. Diese Reflexion ist entscheidend für Ihre Weiterentwicklung."
    },
    {
      question: "Was ist die Daily Prep Funktion?",
      answer: "Die Daily Prep hilft Ihnen, sich vor dem Trading vorzubereiten. Sie können Marktanalysen, wichtige Levels, Ihren Trading-Plan und Ihre mentale Verfassung dokumentieren."
    },
    {
      question: "Wie erstelle ich Trading-Setups?",
      answer: "Gehen Sie zu Einstellungen > Trading Setups und fügen Sie Ihre Strategien hinzu (z.B. 'Breakout', 'Pullback', 'Trendfolge'). Sie können dann jeden Trade einem Setup zuordnen und die Performance einzelner Strategien analysieren."
    },
    {
      question: "Wie funktioniert der KI-Assistent?",
      answer: "Der KI-Assistent analysiert Ihre Trading-Daten und gibt Ihnen personalisierte Einblicke und Empfehlungen. Er kann Muster in Ihrem Trading erkennen und Verbesserungsvorschläge machen."
    },
    {
      question: "Kann ich mehrere Konten verwalten?",
      answer: "Ja, Sie können mehrere Trading-Konten in TradeNotes verwalten und zwischen ihnen wechseln oder alle zusammen analysieren."
    },
    {
      question: "Welche Reports stehen zur Verfügung?",
      answer: "TradeNotes bietet verschiedene Reports: Performance-Übersicht, Analyse nach Setups, Zeitanalyse (Wochentag/Stunde), Symbol-Performance, Streak-Analyse und Halteperioden-Analyse."
    },
    {
      question: "Wie kann ich meine Performance verbessern?",
      answer: "Nutzen Sie die Reports um Stärken und Schwächen zu identifizieren. Analysieren Sie welche Setups, Zeiten und Symbole am besten funktionieren. Führen Sie regelmäßig Journal-Einträge und reflektieren Sie über Ihre Trades."
    },
    {
      question: "Werden meine Daten mit anderen geteilt?",
      answer: "Nein, Ihre Trading-Daten sind vollständig privat. Sie werden verschlüsselt gespeichert und nur Sie haben Zugriff darauf. Wir teilen keine Daten mit Dritten."
    },
    {
      question: "Wie sicher sind meine Daten?",
      answer: "Ihre Daten werden verschlüsselt gespeichert und sind durch modernste Sicherheitsstandards geschützt. Nur Sie haben Zugriff auf Ihre Trading-Daten."
    },
    {
      question: "Gibt es eine Mobile-App?",
      answer: "TradeNotes ist als responsive Web-App konzipiert und funktioniert auf allen Geräten optimal. Sie können die App über Ihren mobilen Browser nutzen."
    },
    {
      question: "Wie kann ich mein Abonnement verwalten?",
      answer: "Gehen Sie zu Account > Abonnement, um Ihren aktuellen Plan zu sehen, zu upgraden oder Zahlungsinformationen zu ändern."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">FAQ - Häufig gestellte Fragen</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Finden Sie schnell Antworten auf Ihre Fragen zu TradeNotes
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Suchen Sie nach Themen..." 
                className="pl-10"
              />
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="mt-16 text-center">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Haben Sie weitere Fragen?</CardTitle>
                <CardDescription>
                  Unser Support-Team steht Ihnen gerne zur Verfügung
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="premium">
                  <Link to="/kontakt">Kontakt aufnehmen</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Hilfe;
