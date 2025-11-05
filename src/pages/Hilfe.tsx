import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookOpen, HelpCircle, Search, Video } from "lucide-react";
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
      question: "Was sind die empfohlenen Metriken?",
      answer: "Wichtige Metriken sind: Win Rate, Durchschnittsgewinn/-verlust, Risk/Reward Ratio, Profit Factor, Sharpe Ratio und Maximum Drawdown. Diese finden Sie auf der Reports-Seite."
    },
    {
      question: "Kann ich mehrere Konten verwalten?",
      answer: "Ja, Sie können mehrere Trading-Konten in TradeNotes verwalten und zwischen ihnen wechseln oder alle zusammen analysieren."
    },
    {
      question: "Wie sicher sind meine Daten?",
      answer: "Ihre Daten werden verschlüsselt gespeichert und sind durch modernste Sicherheitsstandards geschützt. Nur Sie haben Zugriff auf Ihre Trading-Daten."
    }
  ];

  const helpCategories = [
    {
      icon: BookOpen,
      title: "Erste Schritte",
      description: "Lernen Sie die Grundlagen von TradeNotes kennen",
      topics: ["Account erstellen", "Ersten Trade hinzufügen", "Dashboard verstehen"]
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Schritt-für-Schritt Anleitungen in Videoform",
      topics: ["CSV Import", "Reports erstellen", "Journal führen"]
    },
    {
      icon: HelpCircle,
      title: "Häufige Fragen",
      description: "Antworten auf die meistgestellten Fragen",
      topics: ["Broker Support", "Metriken erklärt", "Troubleshooting"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Hilfe & Support</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Finden Sie Antworten auf Ihre Fragen und lernen Sie TradeNotes optimal zu nutzen
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Suchen Sie nach Hilfe-Themen..." 
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {helpCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg smooth-transition">
                <CardHeader>
                  <category.icon className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.topics.map((topic, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground hover:text-primary smooth-transition cursor-pointer">
                        • {topic}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Häufig gestellte Fragen (FAQ)</h2>
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
