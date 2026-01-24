import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { AltchaWidget } from "@/components/AltchaWidget";
import { supabase } from "@/integrations/supabase/client";

const Kontakt = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [altchaPayload, setAltchaPayload] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!altchaPayload) {
      toast({
        title: "Fehler",
        description: "Bitte bestätigen Sie, dass Sie kein Roboter sind.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    // Basic validation
    if (!name.trim() || name.length > 100) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen gültigen Namen ein (max. 100 Zeichen).",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!email.trim() || email.length > 255 || !email.includes('@')) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!subject.trim() || subject.length > 200) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen gültigen Betreff ein (max. 200 Zeichen).",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!message.trim() || message.length > 2000) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie eine gültige Nachricht ein (max. 2000 Zeichen).",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Verify ALTCHA on backend
    try {
      const { data: verifyResult } = await supabase.functions.invoke('altcha-challenge', {
        body: { payload: altchaPayload },
        method: 'POST',
      });

      if (!verifyResult?.valid) {
        toast({
          title: "Fehler",
          description: "Captcha-Verifizierung fehlgeschlagen. Bitte versuchen Sie es erneut.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        setAltchaPayload(null);
        return;
      }
    } catch {
      toast({
        title: "Fehler",
        description: "Verifizierung fehlgeschlagen. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Nachricht gesendet",
        description: "Wir haben Ihre Nachricht erhalten und melden uns bald bei Ihnen.",
      });
      (e.target as HTMLFormElement).reset();
      setAltchaPayload(null);
      setIsSubmitting(false);
    }, 500);
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

          <div className="max-w-2xl mx-auto">
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
                    <Label htmlFor="name">Name *</Label>
                    <Input 
                      id="name" 
                      name="name"
                      placeholder="Ihr Name" 
                      maxLength={100}
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail *</Label>
                    <Input 
                      id="email" 
                      name="email"
                      type="email" 
                      placeholder="ihre@email.de" 
                      maxLength={255}
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Betreff *</Label>
                    <Input 
                      id="subject" 
                      name="subject"
                      placeholder="Worum geht es?" 
                      maxLength={200}
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Nachricht *</Label>
                    <Textarea 
                      id="message" 
                      name="message"
                      placeholder="Ihre Nachricht..." 
                      rows={6}
                      maxLength={2000}
                      required 
                    />
                  </div>
                  
                  <AltchaWidget 
                    onVerified={setAltchaPayload}
                    onError={() => setAltchaPayload(null)}
                  />
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting || !altchaPayload}>
                    {isSubmitting ? "Wird gesendet..." : "Nachricht senden"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Kontakt;
