import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import footerLogo from "@/assets/tradenotes-logo-new-transparent.png";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-4">
            <img 
              src={footerLogo} 
              alt="TradeNot.es Logo" 
              className="h-24 w-auto drop-shadow-[0_0_20px_hsl(158,100%,45%,0.4)] hue-rotate-[30deg] brightness-110" 
            />
            <p className="text-sm text-muted-foreground">
              {t("landing.footerDescription")}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t("landing.footerProduct")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/features" className="hover:text-primary">{t("landing.footerAllFeatures")}</Link></li>
              <li><Link to="/auth" className="hover:text-primary">{t("landing.footerLogin")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t("landing.footerSupport")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/hilfe" className="hover:text-primary">{t("landing.footerHelp")}</Link></li>
              <li><Link to="/kontakt" className="hover:text-primary">{t("landing.footerContact")}</Link></li>
              <li><Link to="/status" className="hover:text-primary">{t("landing.footerStatus")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t("landing.footerLegal")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/datenschutz" className="hover:text-primary">{t("landing.footerPrivacy")}</Link></li>
              <li><Link to="/agb" className="hover:text-primary">{t("landing.footerTerms")}</Link></li>
              <li><Link to="/impressum" className="hover:text-primary">{t("landing.footerImprint")}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          {t("landing.footerCopyright", { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
}
