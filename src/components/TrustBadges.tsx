import { useTranslation } from "react-i18next";
import { Shield, Lock, Users, Zap } from "lucide-react";

export function TrustBadges() {
  const { t } = useTranslation();

  const badges = [
    { icon: Shield, label: t("landing.trustBadges.ssl") },
    { icon: Lock, label: t("landing.trustBadges.gdpr") },
    { icon: Users, label: t("landing.trustBadges.traders") },
    { icon: Zap, label: t("landing.trustBadges.sync") },
  ];

  return (
    <section className="py-12 px-4 bg-muted/20 border-y">
      <div className="max-w-5xl mx-auto flex flex-wrap justify-center items-center gap-8 text-muted-foreground text-sm">
        {badges.map((badge, index) => (
          <div key={index} className="flex items-center gap-2">
            <badge.icon className="h-5 w-5 text-primary" />
            <span>{badge.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
