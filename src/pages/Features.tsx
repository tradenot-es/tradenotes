import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Feature illustrations - Professional Trading Screenshots
import tradingDashboardImg from "@/assets/features/trading-dashboard-pro.webp";
import orderBookImg from "@/assets/features/order-book-pro.webp";
import marketScannerImg from "@/assets/features/market-scanner-pro.webp";
import riskCalculatorImg from "@/assets/features/risk-calculator-pro.webp";
import performanceAnalyticsImg from "@/assets/features/performance-analytics-pro.webp";
import analyticsHeatmapImg from "@/assets/features/analytics-heatmap-pro.webp";

// Re-use professional images across features for consistent look
// Trading Tools uses: tradingDashboardImg, orderBookImg, marketScannerImg, riskCalculatorImg
// Analytics uses: performanceAnalyticsImg, analyticsHeatmapImg
// AI uses: tradingDashboardImg (for context), performanceAnalyticsImg
// Reports uses: analyticsHeatmapImg, marketScannerImg
// Market Intel uses: tradingDashboardImg, marketScannerImg

import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { CategoryNav } from "@/components/features/CategoryNav";
import { FeatureRow } from "@/components/features/FeatureRow";
import { FeaturesHero } from "@/components/features/FeaturesHero";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { ArrowRight, Brain, CalendarDays, Gauge, ShieldCheck } from "lucide-react";
import { featureFlags } from "@/config/featureFlags";
import { BehaviorDemo, DayViewDemo, DisciplineDemo, ScoreDemo } from "@/components/features/FeatureDemos";
import {
  TrendingUp,
  Zap,
  Building2,
  Crosshair,
  BookOpen,
  BarChart3,
  LineChart,
  Activity,
  Calendar,
  Target,
  Bell,
  MessageSquare,
  PieChart,
  Mail,
  Calculator,
  FileText,
  Import,
  Globe,
  Clock,
  Flame,
  Timer,
} from "lucide-react";

const Features = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const categoryIds = ["discipline", "trading-tools", "analytics", ...(featureFlags.AI_FEATURES ? ["ai"] : []), "reports", "market-intel"];
  const activeCategory = useScrollSpy(categoryIds, 140);

  // SEO: Update document metadata
  useEffect(() => {
    document.title = `${t("features.heroTitle")} | TradeNot.es`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", t("features.heroDescription"));
    }
  }, [t]);

  const handleCategoryClick = (categoryId: string) => {
    const element = document.getElementById(categoryId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Feature data organized by category with individual illustrations
  const featureCategories = [
    {
      id: "discipline",
      name: t("features.categories.discipline"),
      features: [
        {
          icon: <ShieldCheck className="h-6 w-6" />,
          title: t("features.items.discipline.title"),
          description: t("features.items.discipline.description"),
          benefits: t("features.items.discipline.benefits", { returnObjects: true }) as string[],
          visual: <DisciplineDemo />,
        },
        {
          icon: <Brain className="h-6 w-6" />,
          title: t("features.items.behavior.title"),
          description: t("features.items.behavior.description"),
          benefits: t("features.items.behavior.benefits", { returnObjects: true }) as string[],
          visual: <BehaviorDemo />,
        },
        {
          icon: <CalendarDays className="h-6 w-6" />,
          title: t("features.items.dayView.title"),
          description: t("features.items.dayView.description"),
          benefits: t("features.items.dayView.benefits", { returnObjects: true }) as string[],
          visual: <DayViewDemo />,
        },
        {
          icon: <Gauge className="h-6 w-6" />,
          title: t("features.items.score.title"),
          description: t("features.items.score.description"),
          benefits: t("features.items.score.benefits", { returnObjects: true }) as string[],
          visual: <ScoreDemo />,
        },
        {
          icon: <Bell className="h-6 w-6" />,
          title: t("features.items.goalAlerts.title"),
          description: t("features.items.goalAlerts.description"),
          benefits: t("features.items.goalAlerts.benefits", { returnObjects: true }) as string[],
          illustration: tradingDashboardImg,
        },
        {
          icon: <Calculator className="h-6 w-6" />,
          title: t("features.items.riskSimulator.title"),
          description: t("features.items.riskSimulator.description"),
          benefits: t("features.items.riskSimulator.benefits", { returnObjects: true }) as string[],
          illustration: riskCalculatorImg,
        },
      ],
    },
    {
      id: "trading-tools",
      name: t("features.categories.tradingTools"),
      features: [
        {
          icon: <TrendingUp className="h-6 w-6" />,
          title: t("features.items.easyEntry.title"),
          description: t("features.items.easyEntry.description"),
          benefits: t("features.items.easyEntry.benefits", { returnObjects: true }) as string[],
          illustration: tradingDashboardImg,
        },
        {
          icon: <Zap className="h-6 w-6" />,
          title: t("features.items.ninjaTrader.title"),
          description: t("features.items.ninjaTrader.description"),
          benefits: t("features.items.ninjaTrader.benefits", { returnObjects: true }) as string[],
          illustration: orderBookImg,
        },
        {
          icon: <Building2 className="h-6 w-6" />,
          title: t("features.items.propFirm.title"),
          description: t("features.items.propFirm.description"),
          benefits: t("features.items.propFirm.benefits", { returnObjects: true }) as string[],
          illustration: performanceAnalyticsImg,
        },
        {
          icon: <Calculator className="h-6 w-6" />,
          title: t("features.items.positionCalc.title"),
          description: t("features.items.positionCalc.description"),
          benefits: t("features.items.positionCalc.benefits", { returnObjects: true }) as string[],
          illustration: riskCalculatorImg,
        },
        {
          icon: <Import className="h-6 w-6" />,
          title: t("features.items.csvImport.title"),
          description: t("features.items.csvImport.description"),
          benefits: t("features.items.csvImport.benefits", { returnObjects: true }) as string[],
          illustration: marketScannerImg,
        },
      ],
    },
    {
      id: "analytics",
      name: t("features.categories.analytics"),
      features: [
        {
          icon: <Crosshair className="h-6 w-6" />,
          title: t("features.items.mfeMAE.title"),
          description: t("features.items.mfeMAE.description"),
          benefits: t("features.items.mfeMAE.benefits", { returnObjects: true }) as string[],
          illustration: analyticsHeatmapImg,
        },
        {
          icon: <BarChart3 className="h-6 w-6" />,
          title: t("features.items.analytics.title"),
          description: t("features.items.analytics.description"),
          benefits: t("features.items.analytics.benefits", { returnObjects: true }) as string[],
          illustration: performanceAnalyticsImg,
        },
        {
          icon: <LineChart className="h-6 w-6" />,
          title: t("features.items.equityCurve.title"),
          description: t("features.items.equityCurve.description"),
          benefits: t("features.items.equityCurve.benefits", { returnObjects: true }) as string[],
          illustration: performanceAnalyticsImg,
        },
        {
          icon: <Activity className="h-6 w-6" />,
          title: t("features.items.consistency.title"),
          description: t("features.items.consistency.description"),
          benefits: t("features.items.consistency.benefits", { returnObjects: true }) as string[],
          illustration: analyticsHeatmapImg,
        },
        {
          icon: <Calendar className="h-6 w-6" />,
          title: t("features.items.calendar.title"),
          description: t("features.items.calendar.description"),
          benefits: t("features.items.calendar.benefits", { returnObjects: true }) as string[],
          illustration: tradingDashboardImg,
        },
      ],
    },
    ...(featureFlags.AI_FEATURES
      ? [
    {
      id: "ai",
      name: t("features.categories.ai"),
      features: [
        {
          icon: <MessageSquare className="h-6 w-6" />,
          title: t("features.items.aiAssistant.title"),
          description: t("features.items.aiAssistant.description"),
          benefits: t("features.items.aiAssistant.benefits", { returnObjects: true }) as string[],
          illustration: tradingDashboardImg,
        },
        {
          icon: <PieChart className="h-6 w-6" />,
          title: t("features.items.aiCharts.title"),
          description: t("features.items.aiCharts.description"),
          benefits: t("features.items.aiCharts.benefits", { returnObjects: true }) as string[],
          illustration: analyticsHeatmapImg,
        },
        {
          icon: <Mail className="h-6 w-6" />,
          title: t("features.items.dailySummary.title"),
          description: t("features.items.dailySummary.description"),
          benefits: t("features.items.dailySummary.benefits", { returnObjects: true }) as string[],
          illustration: performanceAnalyticsImg,
        },
      ],
    },
        ]
      : []),
    {
      id: "reports",
      name: t("features.categories.reports"),
      features: [
        {
          icon: <FileText className="h-6 w-6" />,
          title: t("features.items.symbolReports.title"),
          description: t("features.items.symbolReports.description"),
          benefits: t("features.items.symbolReports.benefits", { returnObjects: true }) as string[],
          illustration: analyticsHeatmapImg,
        },
        {
          icon: <BookOpen className="h-6 w-6" />,
          title: t("features.items.setupReports.title"),
          description: t("features.items.setupReports.description"),
          benefits: t("features.items.setupReports.benefits", { returnObjects: true }) as string[],
          illustration: marketScannerImg,
        },
        {
          icon: <Clock className="h-6 w-6" />,
          title: t("features.items.hourAnalysis.title"),
          description: t("features.items.hourAnalysis.description"),
          benefits: t("features.items.hourAnalysis.benefits", { returnObjects: true }) as string[],
          illustration: analyticsHeatmapImg,
        },
        {
          icon: <Flame className="h-6 w-6" />,
          title: t("features.items.streakAnalysis.title"),
          description: t("features.items.streakAnalysis.description"),
          benefits: t("features.items.streakAnalysis.benefits", { returnObjects: true }) as string[],
          illustration: performanceAnalyticsImg,
        },
        {
          icon: <Timer className="h-6 w-6" />,
          title: t("features.items.holdingPeriod.title"),
          description: t("features.items.holdingPeriod.description"),
          benefits: t("features.items.holdingPeriod.benefits", { returnObjects: true }) as string[],
          illustration: tradingDashboardImg,
        },
      ],
    },
    {
      id: "market-intel",
      name: t("features.categories.marketIntel"),
      features: [
        {
          icon: <Target className="h-6 w-6" />,
          title: t("features.items.portfolioNews.title"),
          description: t("features.items.portfolioNews.description"),
          benefits: t("features.items.portfolioNews.benefits", { returnObjects: true }) as string[],
          illustration: tradingDashboardImg,
        },
        {
          icon: <Globe className="h-6 w-6" />,
          title: t("features.items.politicalEvents.title"),
          description: t("features.items.politicalEvents.description"),
          benefits: t("features.items.politicalEvents.benefits", { returnObjects: true }) as string[],
          illustration: marketScannerImg,
        },
        {
          icon: <BarChart3 className="h-6 w-6" />,
          title: t("features.items.sectorSentiment.title"),
          description: t("features.items.sectorSentiment.description"),
          benefits: t("features.items.sectorSentiment.benefits", { returnObjects: true }) as string[],
          illustration: analyticsHeatmapImg,
        },
        {
          icon: <Calendar className="h-6 w-6" />,
          title: t("features.items.economicCalendar.title"),
          description: t("features.items.economicCalendar.description"),
          benefits: t("features.items.economicCalendar.benefits", { returnObjects: true }) as string[],
          illustration: tradingDashboardImg,
        },
      ],
    },
  ];

  // Filter features based on search query
  const filterFeatures = (features: typeof featureCategories[0]["features"]) => {
    if (!searchQuery.trim()) return features;
    const query = searchQuery.toLowerCase();
    return features.filter(
      (feature) =>
        feature.title.toLowerCase().includes(query) ||
        feature.description.toLowerCase().includes(query) ||
        feature.benefits.some((b) => b.toLowerCase().includes(query))
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* New Animated Hero Section */}
      <FeaturesHero
        onCategoryClick={handleCategoryClick}
        onSearchChange={handleSearchChange}
      />

      {/* Sticky Category Navigation */}
      <CategoryNav
        activeCategory={activeCategory}
        onCategoryClick={handleCategoryClick}
      />

      {/* Feature Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {featureCategories.map((category) => {
          const filteredFeatures = filterFeatures(category.features);
          if (filteredFeatures.length === 0) return null;
          
          return (
            <section key={category.id} id={category.id} className="mb-16">
              <div className="border-l-4 border-primary pl-4 mb-8">
                <h2 className="text-2xl md:text-3xl font-bold">{category.name}</h2>
              </div>

              {filteredFeatures.map((feature, index) => (
                <FeatureRow
                  key={index}
                  feature={feature}
                  imagePosition={index % 2 === 0 ? "right" : "left"}
                  screenshotUrl={"illustration" in feature ? feature.illustration : undefined}
                  visual={"visual" in feature ? feature.visual : undefined}
                />
              ))}
            </section>
          );
        })}
      </div>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">{t("features.ctaTitle")}</h2>
          <p className="text-xl text-muted-foreground mb-8">
            {t("features.ctaDescription")}
          </p>
          <Button size="lg" variant="premium" asChild className="gap-2">
            <Link to="/auth">
              {t("landing.ctaTrial")}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;
