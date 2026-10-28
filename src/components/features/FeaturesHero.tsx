import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParallax } from "@/hooks/useParallax";
import {
  Search,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Zap,
  ShieldCheck,
  Plug,
} from "lucide-react";

import { useScreens } from "@/lib/screens";

interface FeaturesHeroProps {
  onCategoryClick: (categoryId: string) => void;
  onSearchChange: (query: string) => void;
}

interface TeaserCard {
  id: string;
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
}

const teaserCards: TeaserCard[] = [
  {
    id: "trading-tools",
    icon: <TrendingUp className="h-5 w-5" />,
    titleKey: "features.categories.tradingTools",
    descriptionKey: "features.teaserCards.tradingTools",
  },
  {
    id: "analytics",
    icon: <BarChart3 className="h-5 w-5" />,
    titleKey: "features.categories.analytics",
    descriptionKey: "features.teaserCards.analytics",
  },
  {
    id: "discipline",
    icon: <ShieldCheck className="h-5 w-5" />,
    titleKey: "features.categories.discipline",
    descriptionKey: "features.teaserCards.discipline",
  },
  {
    id: "import",
    icon: <Plug className="h-5 w-5" />,
    titleKey: "features.categories.import",
    descriptionKey: "features.teaserCards.import",
  },
];

const categoryFilters = [
  { id: "discipline", labelKey: "features.categories.discipline" },
  { id: "import", labelKey: "features.categories.import" },
  { id: "trading-tools", labelKey: "features.categories.tradingTools" },
  { id: "analytics", labelKey: "features.categories.analytics" },
  { id: "reports", labelKey: "features.categories.reports" },
  { id: "market-intel", labelKey: "features.categories.marketIntel" },
];

export function FeaturesHero({ onCategoryClick, onSearchChange }: FeaturesHeroProps) {
  const { t } = useTranslation();
  // collage: real screenshots of the app in the current language
  const shot = useScreens();
  const [searchQuery, setSearchQuery] = useState("");
  const parallaxOffset = useParallax(0.15);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearchChange(value);
  };

  const handleCategoryClick = (categoryId: string) => {
    onCategoryClick(categoryId);
  };

  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Parallax Background Elements */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ transform: `translateY(${parallaxOffset}px)` }}
      >
        {/* Gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-primary/4 rounded-full blur-2xl" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 circuit-grid-bg opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Content */}
          <div className="space-y-8 animate-fade-in-up">
            {/* Badge */}
            <Badge className="glow-effect px-4 py-1.5 text-sm font-medium">
              <Zap className="h-3.5 w-3.5 mr-1.5" />
              {t("features.featureCount")}
            </Badge>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                {t("features.heroTitle")}
              </h1>
              <p className="text-xl text-muted-foreground max-w-xl">
                {t("features.heroDescription")}
              </p>
            </div>

            {/* Search + Category Filters */}
            <div className="space-y-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t("features.searchPlaceholder")}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-all"
                  aria-label={t("features.searchPlaceholder")}
                />
              </div>

              {/* Category Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                {categoryFilters.map((category) => (
                  <Button
                    key={category.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleCategoryClick(category.id)}
                    className="text-xs hover:bg-primary/10 hover:border-primary/50 transition-all"
                  >
                    {t(category.labelKey)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Teaser Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              {teaserCards.map((card, index) => (
                <button
                  key={card.id}
                  onClick={() => handleCategoryClick(card.id)}
                  className="group glossy-card p-4 text-left rounded-xl hover:shadow-glow transition-all duration-300 cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {card.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">
                        {t(card.titleKey)}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {t(card.descriptionKey)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Primary CTA */}
            <Button variant="premium" size="lg" asChild className="gap-2 group">
              <Link to="/auth">
                {t("features.ctaPrimary")}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {/* Right Column: Hero Visual Collage */}
          <div className="hidden lg:block relative">
            <div
              className="feature-collage"
              style={{ transform: `translateY(${-parallaxOffset * 0.5}px)` }}
            >
              {/* Top Left - discipline & score */}
              <div className="feature-collage-item col-span-1 row-span-1 aspect-video">
                <img
                  src={shot("discipline-score")}
                  alt={`${t("discipline.title")} · ${t("score.title")}`}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* Top Right - day view */}
              <div className="feature-collage-item col-span-1 row-span-1 aspect-video">
                <img
                  src={shot("days")}
                  alt={t("days.title")}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* Bottom Left - behaviour report */}
              <div className="feature-collage-item col-span-1 row-span-1 aspect-video">
                <img
                  src={shot("reports-behavior")}
                  alt={t("behavior.reportTitle")}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* Bottom Right - equity curve */}
              <div className="feature-collage-item col-span-1 row-span-1 aspect-video">
                <img
                  src={shot("equity")}
                  alt={t("dashboard.equityCurve")}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            {/* Floating accent elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
