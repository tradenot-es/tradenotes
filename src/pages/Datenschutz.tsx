import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Server, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";
import { usePageSeo } from "@/hooks/useSeo";

const Datenschutz = () => {
  usePageSeo("privacy", "/datenschutz");
  const { t } = useTranslation();

  const certifications = [
    {
      name: t('privacy.certifications.soc2.name'),
      description: t('privacy.certifications.soc2.description'),
      icon: Shield
    },
    {
      name: t('privacy.certifications.iso.name'),
      description: t('privacy.certifications.iso.description'),
      icon: CheckCircle2
    },
    {
      name: t('privacy.certifications.gdpr.name'),
      description: t('privacy.certifications.gdpr.description'),
      icon: Lock
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">{t('privacy.title')}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('privacy.subtitle')}
            </p>
          </div>

          {/* Zertifizierungen */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              {t('privacy.certifications.title')}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {certifications.map((cert, index) => (
                <Card key={index} className="border-2">
                  <CardHeader>
                    <cert.icon className="h-12 w-12 text-primary mb-2" />
                    <CardTitle className="text-lg">{cert.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{cert.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Datenspeicherung */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-6 w-6 text-primary" />
                {t('privacy.dataStorage.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-1">{t('privacy.dataStorage.euRegion.badge')}</Badge>
                <div>
                  <p className="font-medium mb-2">{t('privacy.dataStorage.euRegion.title')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('privacy.dataStorage.euRegion.description')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-1">{t('privacy.dataStorage.encrypted.badge')}</Badge>
                <div>
                  <p className="font-medium mb-2">{t('privacy.dataStorage.encrypted.title')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('privacy.dataStorage.encrypted.description')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Datenschutz-Inhalt */}
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">{t('privacy.sections.controller.title')}</h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="mb-2">{t('privacy.sections.controller.content')}</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {t('privacy.sections.controller.company')}
                  </p>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">{t('privacy.sections.collection.title')}</h2>
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">{t('privacy.sections.collection.website.title')}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {t('privacy.sections.collection.website.intro')}
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                      {(t('privacy.sections.collection.website.items', { returnObjects: true }) as string[]).map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">{t('privacy.sections.collection.registration.title')}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {t('privacy.sections.collection.registration.intro')}
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                      {(t('privacy.sections.collection.registration.items', { returnObjects: true }) as string[]).map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">{t('privacy.sections.collection.trading.title')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('privacy.sections.collection.trading.description')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">{t('privacy.sections.legalBasis.title')}</h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-2">
                    {t('privacy.sections.legalBasis.intro')}
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-2 ml-4">
                    {(t('privacy.sections.legalBasis.items', { returnObjects: true }) as string[]).map((item, i) => (
                      <li key={i} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item) }} />
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">{t('privacy.sections.dataSharing.title')}</h2>
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {t('privacy.sections.dataSharing.intro')}
                  </p>
                  <div>
                    <h3 className="font-semibold mb-2">{t('privacy.sections.dataSharing.serviceProviders.title')}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {t('privacy.sections.dataSharing.serviceProviders.intro')}
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                      {(t('privacy.sections.dataSharing.serviceProviders.items', { returnObjects: true }) as string[]).map((item, i) => (
                        <li key={i} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item) }} />
                      ))}
                    </ul>
                    <p className="text-sm text-muted-foreground mt-2">
                      {t('privacy.sections.dataSharing.serviceProviders.compliance')}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">{t('privacy.sections.dataSharing.legal.title')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('privacy.sections.dataSharing.legal.description')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Eye className="h-6 w-6 text-primary" />
                {t('privacy.sections.rights.title')}
              </h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('privacy.sections.rights.intro')}
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-3">
                    {Object.entries(t('privacy.sections.rights.items', { returnObjects: true }) as Record<string, string>).map(([key, value]) => (
                      <li key={key} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(value) }} />
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-muted-foreground mt-4">
                    {t('privacy.sections.rights.contact')}
                  </p>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">{t('privacy.sections.security.title')}</h2>
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {t('privacy.sections.security.intro')}
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-2 ml-4">
                    {(t('privacy.sections.security.items', { returnObjects: true }) as string[]).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">{t('privacy.sections.cookies.title')}</h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-3">
                    {t('privacy.sections.cookies.intro')}
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-2 ml-4">
                    {(t('privacy.sections.cookies.items', { returnObjects: true }) as string[]).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                  <p className="text-sm text-muted-foreground mt-3">
                    {t('privacy.sections.cookies.noTracking')}
                  </p>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">{t('privacy.sections.retention.title')}</h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-3">
                    {t('privacy.sections.retention.intro')}
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-2 ml-4">
                    {(t('privacy.sections.retention.items', { returnObjects: true }) as string[]).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                  <p className="text-sm text-muted-foreground mt-3">
                    {t('privacy.sections.retention.deletion')}
                  </p>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">{t('privacy.sections.changes.title')}</h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    {t('privacy.sections.changes.description')}
                  </p>
                  <p className="text-sm text-muted-foreground mt-3">
                    <strong>{t('privacy.sections.changes.lastUpdated')}</strong> {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                {t('privacy.sections.complaint.title')}
              </h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-3">
                    {t('privacy.sections.complaint.intro')}
                  </p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {t('privacy.sections.complaint.authority')}
                  </p>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Datenschutz;
