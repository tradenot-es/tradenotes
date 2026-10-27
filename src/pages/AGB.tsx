import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { usePageSeo } from "@/hooks/useSeo";

const AGB = () => {
  usePageSeo("terms", "/agb");
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("common.back")}
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{t("terms.title")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("terms.lastUpdated")}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 1. Geltungsbereich */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.scope.title")}</h2>
              <p className="text-muted-foreground mb-2">{t("terms.scope.content1")}</p>
              <p className="text-muted-foreground">{t("terms.scope.content2")}</p>
            </section>

            {/* 2. Vertragspartner */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.parties.title")}</h2>
              <p className="text-muted-foreground">{t("terms.parties.content")}</p>
            </section>

            {/* 3. Vertragsschluss */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.contract.title")}</h2>
              <p className="text-muted-foreground mb-2">{t("terms.contract.content1")}</p>
              <p className="text-muted-foreground">{t("terms.contract.content2")}</p>
            </section>

            {/* 4. Kostenlose Testphase */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.trial.title")}</h2>
              <p className="text-muted-foreground mb-2">{t("terms.trial.content1")}</p>
              <p className="text-muted-foreground">{t("terms.trial.content2")}</p>
            </section>

            {/* 5. Preise und Zahlungsbedingungen */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.pricing.title")}</h2>
              <p className="text-muted-foreground mb-2">{t("terms.pricing.content1")}</p>
              <p className="text-muted-foreground">{t("terms.pricing.content2")}</p>
            </section>

            {/* 6. Widerrufsrecht (EU) */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.withdrawal.title")}</h2>
              <p className="text-muted-foreground mb-2">{t("terms.withdrawal.content1")}</p>
              <p className="text-muted-foreground mb-2">{t("terms.withdrawal.content2")}</p>
              <p className="text-muted-foreground">{t("terms.withdrawal.content3")}</p>
            </section>

            {/* 7. Nutzungsrechte und Lizenz */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.license.title")}</h2>
              <p className="text-muted-foreground mb-2">{t("terms.license.content1")}</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>{t("terms.license.restriction1")}</li>
                <li>{t("terms.license.restriction2")}</li>
                <li>{t("terms.license.restriction3")}</li>
                <li>{t("terms.license.restriction4")}</li>
              </ul>
            </section>

            {/* 8. Nutzerpflichten */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.obligations.title")}</h2>
              <p className="text-muted-foreground mb-2">{t("terms.obligations.content1")}</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>{t("terms.obligations.rule1")}</li>
                <li>{t("terms.obligations.rule2")}</li>
                <li>{t("terms.obligations.rule3")}</li>
                <li>{t("terms.obligations.rule4")}</li>
              </ul>
            </section>

            {/* 9. Haftung */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.liability.title")}</h2>
              <p className="text-muted-foreground mb-2">{t("terms.liability.content1")}</p>
              <p className="text-muted-foreground mb-2">{t("terms.liability.content2")}</p>
              <p className="text-muted-foreground">{t("terms.liability.content3")}</p>
            </section>

            {/* 10. Datensicherheit */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.security.title")}</h2>
              <p className="text-muted-foreground mb-2">{t("terms.security.content1")}</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>{t("terms.security.cert1")}</li>
                <li>{t("terms.security.cert2")}</li>
                <li>{t("terms.security.cert3")}</li>
              </ul>
            </section>

            {/* 11. Laufzeit und Kündigung */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.termination.title")}</h2>
              <p className="text-muted-foreground mb-2">{t("terms.termination.content1")}</p>
              <p className="text-muted-foreground">{t("terms.termination.content2")}</p>
            </section>

            {/* 12. Änderungen der AGB */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.changes.title")}</h2>
              <p className="text-muted-foreground">{t("terms.changes.content")}</p>
            </section>

            {/* 13. Anwendbares Recht */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.law.title")}</h2>
              <p className="text-muted-foreground mb-2">{t("terms.law.content1")}</p>
              <p className="text-muted-foreground">{t("terms.law.content2")}</p>
            </section>

            {/* 14. Schlussbestimmungen */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.final.title")}</h2>
              <p className="text-muted-foreground">{t("terms.final.content")}</p>
            </section>

            {/* Contact */}
            <section className="pt-6 border-t">
              <h2 className="text-xl font-semibold mb-3">{t("terms.contact.title")}</h2>
              <p className="text-muted-foreground mb-2">{t("terms.contact.content")}</p>
              <Button variant="outline" asChild>
                <Link to="/kontakt">{t("terms.contact.button")}</Link>
              </Button>
            </section>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default AGB;
