import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";

const Kontakt = () => {
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic would go here
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Kontakt</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Haben Sie Fragen oder benötigen Unterstützung? Wir sind für Sie da.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Senden Sie uns eine Nachricht</CardTitle>
                <CardDescription>
                  Füllen Sie das Formular aus und wir melden uns schnellstmöglich bei Ihnen.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Ihr Name" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail</Label>
                    <Input id="email" type="email" placeholder="ihre@email.de" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Betreff</Label>
                    <Input id="subject" placeholder="Worum geht es?" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Nachricht</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Ihre Nachricht..." 
                      rows={5}
                      required 
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Nachricht senden
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Kontaktinformationen</CardTitle>
                  <CardDescription>
                    Weitere Möglichkeiten, uns zu erreichen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">E-Mail</p>
                      <p className="text-sm text-muted-foreground">support@tradenotes.io</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Telefon</p>
                      <p className="text-sm text-muted-foreground">+49 (0) 123 456789</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Adresse</p>
                      <p className="text-sm text-muted-foreground">
                        TradeNotes GmbH<br />
                        Musterstraße 123<br />
                        10115 Berlin, Deutschland
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Öffnungszeiten</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Montag - Freitag</span>
                    <span className="font-medium">9:00 - 18:00 Uhr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Samstag - Sonntag</span>
                    <span className="font-medium">Geschlossen</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Kontakt;
