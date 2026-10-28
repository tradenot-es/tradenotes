import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { TextBlocks } from "@/components/LegalPage";
import { usePageSeo } from "@/hooks/useSeo";

interface Faq {
  q: string;
  a: string;
}

const Hilfe = () => {
  usePageSeo("help", "/hilfe");
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const faqs = t("help.items", { returnObjects: true }) as Faq[];

  const visible = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return faqs.filter((faq) => words.every((word) => `${faq.q} ${faq.a}`.toLowerCase().includes(word)));
  }, [faqs, query]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t("help.title")}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("help.subtitle")}</p>
          </div>

          <div className="max-w-4xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("help.searchPlaceholder")}
                aria-label={t("help.searchPlaceholder")}
                className="pl-10"
              />
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {visible.length === 0 ? (
              <p className="text-center text-muted-foreground">{t("help.noResults")}</p>
            ) : (
              <Accordion type="single" collapsible className="space-y-4">
                {visible.map((faq) => (
                  <AccordionItem key={faq.q} value={faq.q} className="border rounded-lg px-6">
                    <AccordionTrigger className="text-left hover:no-underline">{faq.q}</AccordionTrigger>
                    <AccordionContent>
                      <TextBlocks text={faq.a} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>

          <div className="mt-16 text-center">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>{t("help.moreTitle")}</CardTitle>
                <CardDescription>{t("help.moreDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="premium">
                  <Link to="/kontakt">{t("help.contactButton")}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Hilfe;
