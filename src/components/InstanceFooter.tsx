import { useTranslation } from "react-i18next";
import { instance } from "@/config/instance";
import { project } from "@/config/project";

/** Footer of a self-hosted instance: no legal pages of tradenot.es, just version, source and donations. */
export function InstanceFooter({ className = "" }: { className?: string }) {
  const { t } = useTranslation();
  const link = "hover:text-foreground transition-colors";
  return (
    <div className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground ${className}`}>
      <span>
        TradeNot.es {instance.version} · {t("selfhost.footer")}
      </span>
      <span className="text-border">•</span>
      <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className={link}>
        {t("landing.footerSource")}
      </a>
      <span className="text-border">•</span>
      <a href={project.donateUrl} target="_blank" rel="noopener noreferrer" className={link}>
        {t("landing.footerDonate")}
      </a>
    </div>
  );
}
