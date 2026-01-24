import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Mail, Globe, Scale, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

const Impressum = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">{t('imprint.title')}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('imprint.subtitle')}
            </p>
          </div>

          <div className="space-y-8">
            {/* Anbieter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-primary" />
                  {t('imprint.provider.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold text-lg">TradeNot.es</p>
                  <p className="text-muted-foreground whitespace-pre-line mt-2">
                    {t('imprint.provider.address')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Kontakt */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-6 w-6 text-primary" />
                  {t('imprint.contact.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <a href="mailto:info@tradenot.es" className="text-primary hover:underline">
                    info@tradenot.es
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <a href="https://tradenot.es" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    https://tradenot.es
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Verantwortlich für den Inhalt */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-6 w-6 text-primary" />
                  {t('imprint.responsible.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">
                  {t('imprint.responsible.content')}
                </p>
              </CardContent>
            </Card>

            {/* Haftungsausschluss */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-6 w-6 text-primary" />
                  {t('imprint.disclaimer.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">{t('imprint.disclaimer.content.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('imprint.disclaimer.content.text')}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t('imprint.disclaimer.links.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('imprint.disclaimer.links.text')}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t('imprint.disclaimer.copyright.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('imprint.disclaimer.copyright.text')}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t('imprint.disclaimer.trading.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('imprint.disclaimer.trading.text')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Impressum;
