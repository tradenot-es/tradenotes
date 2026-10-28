import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AltchaWidget } from "@/components/AltchaWidget";
import { invoke } from "@/lib/api";
import { usePageSeo } from "@/hooks/useSeo";
import { operator } from "@/config/operator";

// field → maximum length, same limits as the server
const FIELDS = { name: 100, email: 255, subject: 200, message: 2000 } as const;

const Kontakt = () => {
  usePageSeo("contact", "/kontakt");
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [altchaPayload, setAltchaPayload] = useState<string | null>(null);
  const [captchaRound, setCaptchaRound] = useState(0);

  const fail = (description: string) => toast({ title: t("contact.errorTitle"), description, variant: "destructive" });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!altchaPayload) return fail(t("contact.errors.captcha"));

    const form = e.currentTarget;
    const formData = new FormData(form);
    const values = Object.fromEntries(
      Object.keys(FIELDS).map((field) => [field, String(formData.get(field) ?? "").trim()]),
    ) as Record<keyof typeof FIELDS, string>;
    for (const [field, max] of Object.entries(FIELDS) as [keyof typeof FIELDS, number][]) {
      if (!values[field] || values[field].length > max || (field === "email" && !values.email.includes("@"))) {
        return fail(t(`contact.errors.${field}`, { max }));
      }
    }

    setIsSubmitting(true);
    // the server checks the captcha and forwards the message by email
    const { error } = await invoke("contact", { body: { ...values, altcha: altchaPayload } });
    // a captcha solution is single-use, so every attempt needs a fresh one
    setAltchaPayload(null);
    setCaptchaRound((r) => r + 1);
    setIsSubmitting(false);
    if (error) return fail(t("contact.errors.send"));

    toast({ title: t("contact.sentTitle"), description: t("contact.sentDescription") });
    form.reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">{t("contact.title")}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("contact.subtitle")}</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>{t("contact.formTitle")}</CardTitle>
                <CardDescription>
                  {t("contact.formDescription")}{" "}
                  <a href={`mailto:${operator.email}`} className="text-primary hover:underline">
                    {operator.email}
                  </a>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("contact.name")} *</Label>
                    <Input id="name" name="name" placeholder={t("contact.namePlaceholder")} maxLength={FIELDS.name} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t("contact.email")} *</Label>
                    <Input id="email" name="email" type="email" placeholder={t("contact.emailPlaceholder")} maxLength={FIELDS.email} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">{t("contact.subject")} *</Label>
                    <Input id="subject" name="subject" placeholder={t("contact.subjectPlaceholder")} maxLength={FIELDS.subject} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{t("contact.message")} *</Label>
                    <Textarea id="message" name="message" placeholder={t("contact.messagePlaceholder")} rows={6} maxLength={FIELDS.message} required />
                  </div>

                  <AltchaWidget key={captchaRound} onVerified={setAltchaPayload} onError={() => setAltchaPayload(null)} />

                  <p className="text-xs text-muted-foreground">{t("contact.privacyNote")}</p>

                  <Button type="submit" className="w-full" disabled={isSubmitting || !altchaPayload}>
                    {isSubmitting ? t("contact.sending") : t("contact.send")}
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
