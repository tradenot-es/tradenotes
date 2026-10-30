import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo.webp";
import { instance } from "@/config/instance";

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
];

export const Navigation = () => {
  const { i18n, t } = useTranslation();
  const [isAnimating, setIsAnimating] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (langCode: string) => {
    if (langCode !== i18n.language) {
      setIsAnimating(true);
      i18n.changeLanguage(langCode);
    }
  };

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 font-bold text-xl">
            <img 
              src={logo} 
              alt="TradeNotes" 
              className="h-12 w-auto drop-shadow-[0_0_15px_hsl(158,100%,45%,0.4)] hue-rotate-[30deg] brightness-110" 
            />
            <span>TradeNot.es</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            {!instance.selfHosted && <Link 
              to="/features" 
              className={`text-sm font-medium hover:text-primary transition-all duration-300 ${isAnimating ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}`}
            >
              {t("landing.nav.features")}
            </Link>}
            <Link 
              to="/auth" 
              className={`text-sm font-medium hover:text-primary transition-all duration-300 ${isAnimating ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}`}
              style={{ transitionDelay: '100ms' }}
            >
              {t("nav.login")}
            </Link>
            
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 transition-transform duration-200 hover:scale-105">
                  <Globe className={`h-4 w-4 transition-transform duration-300 ${isAnimating ? 'rotate-180' : 'rotate-0'}`} />
                  <span 
                    key={currentLanguage.code} 
                    className={`hidden lg:inline transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                  >
                    {currentLanguage.flag} {currentLanguage.code.toUpperCase()}
                  </span>
                  <span 
                    className={`lg:hidden transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                  >
                    {currentLanguage.flag}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover z-50 animate-scale-in">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`transition-colors duration-200 ${lang.code === i18n.language ? "bg-accent" : ""}`}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Mobile Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm" className="transition-transform duration-200 hover:scale-105">
                  <Globe className={`h-4 w-4 transition-transform duration-300 ${isAnimating ? 'rotate-180' : 'rotate-0'}`} />
                  <span className={`ml-1 transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                    {currentLanguage.flag}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover z-50 animate-scale-in">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`transition-colors duration-200 ${lang.code === i18n.language ? "bg-accent" : ""}`}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="premium" asChild className="hidden md:inline-flex">
              <Link 
                to="/auth"
                className={`transition-all duration-300 ${isAnimating ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}`}
                style={{ transitionDelay: '150ms' }}
              >
                {t("landing.cta.startNow")}
              </Link>
            </Button>

            {/* Mobile Button */}
            <Button variant="premium" size="sm" asChild className="md:hidden">
              <Link to="/auth">Start</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
