import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, XCircle } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { usePageSeo } from "@/hooks/useSeo";

/** Target of the unsubscribe link in newsletter mails (server/src/app.ts redirects here). */
const NewsletterUnsubscribed = () => {
  usePageSeo("notFound", "/newsletter-abgemeldet", { noindex: true });
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const failed = params.get("error") === "1";
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-32 pb-16">
        <div className="mx-auto max-w-lg px-4 text-center">
          {failed ? <XCircle className="mx-auto h-12 w-12 text-destructive" /> : <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />}
          <h1 className="mt-4 text-2xl font-bold">{t(failed ? "newsletter.unsubscribeFailed" : "newsletter.unsubscribed")}</h1>
          <p className="mt-2 text-muted-foreground">{t(failed ? "newsletter.unsubscribeFailedText" : "newsletter.unsubscribedText")}</p>
          <Button asChild className="mt-6">
            <Link to="/dashboard/account">{t("newsletter.toAccount")}</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewsletterUnsubscribed;
