import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, AlertCircle, Clock, Activity } from "lucide-react";
import { usePageSeo } from "@/hooks/useSeo";
import { operator } from "@/config/operator";

type ServiceStatus = "operational" | "down" | "checking";

const STATUS_ICONS: Record<ServiceStatus, JSX.Element> = {
  operational: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  down: <AlertCircle className="h-5 w-5 text-red-500" />,
  checking: <Clock className="h-5 w-5 text-muted-foreground" />,
};

const BADGE_STYLES: Record<ServiceStatus, string> = {
  operational: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  down: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
  checking: "",
};

const Status = () => {
  usePageSeo("status", "/status");
  const { t, i18n } = useTranslation();
  // live check: /api/health answers only when the app server and its database are up
  const [apiStatus, setApiStatus] = useState<ServiceStatus>("checking");
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => setApiStatus(res.ok ? "operational" : "down"))
      .catch(() => setApiStatus("down"))
      .finally(() => setCheckedAt(new Date()));
  }, []);

  // the page itself loaded, so the website is up
  const services: { key: "website" | "app"; status: ServiceStatus }[] = [
    { key: "website", status: "operational" },
    { key: "app", status: apiStatus },
  ];

  const allOperational = apiStatus === "operational";
  const summary = apiStatus === "checking" ? "checking" : allOperational ? "ok" : "outage";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Activity className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">{t("status.title")}</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("status.subtitle")}</p>
          </div>

          <div className="max-w-4xl mx-auto mb-12">
            <Card className={allOperational ? "border-green-500/20 bg-green-500/5" : "border-yellow-500/20 bg-yellow-500/5"}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {allOperational ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-yellow-500" />
                  )}
                  <CardTitle className={allOperational ? "text-green-500" : "text-yellow-500"}>
                    {t(`status.summary.${summary}`)}
                  </CardTitle>
                </div>
                {summary !== "checking" && <CardDescription>{t(`status.summary.${summary}Description`)}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {t("status.checkedAt", { time: (checkedAt ?? new Date()).toLocaleString(i18n.language) })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-4xl mx-auto mb-12">
            <h2 className="text-2xl font-bold mb-6">{t("status.servicesTitle")}</h2>
            <div className="space-y-4">
              {services.map((service) => (
                <Card key={service.key}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        {STATUS_ICONS[service.status]}
                        <div className="flex-1">
                          <h3 className="font-semibold">{t(`status.services.${service.key}`)}</h3>
                          <p className="text-sm text-muted-foreground">{t(`status.services.${service.key}Description`)}</p>
                        </div>
                      </div>
                      <Badge variant={service.status === "checking" ? "outline" : "default"} className={BADGE_STYLES[service.status]}>
                        {t(`status.states.${service.status}`)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              {t("status.contact")}{" "}
              <a href={`mailto:${operator.email}`} className="text-primary hover:underline">
                {operator.email}
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Status;
