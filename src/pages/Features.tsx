import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { CategoryNav } from "@/components/features/CategoryNav";
import { FeatureRow } from "@/components/features/FeatureRow";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { ArrowLeft, ArrowRight } from "lucide-react";
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

  const categoryIds = ["trading-tools", "analytics", "ai", "reports", "market-intel"];
  const activeCategory = useScrollSpy(categoryIds, 140);

  // SEO: Update document metadata
  useEffect(() => {
    document.title = `${t("features.heroTitle")} | TradeNot.es`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", t("features.heroDescription"));
    }
  }, [t]);

  // Feature data organized by category
  const featureCategories = [
    {
      id: "trading-tools",
      name: t("features.categories.tradingTools"),
      features: [
        {
          icon: <TrendingUp className="h-6 w-6" />,
          title: t("features.items.easyEntry.title"),
          description: t("features.items.easyEntry.description"),
          benefits: t("features.items.easyEntry.benefits", { returnObjects: true }) as string[],
        },
        {
          icon: <Zap className="h-6 w-6" />,
          title: t("features.items.ninjaTrader.title"),
          description: t("features.items.ninjaTrader.description"),
          benefits: t("features.items.ninjaTrader.benefits", { returnObjects: true }) as string[],
        },
        {
          icon: <Building2 className="h-6 w-6" />,
          title: t("features.items.propFirm.title"),
          description: t("features.items.propFirm.description"),
          benefits: t("features.items.propFirm.benefits", { returnObjects: true }) as string[],
        },
        {
          icon: <Calculator className="h-6 w-6" />,
          title: t("features.items.positionCalc.title"),
          description: t("features.items.positionCalc.description"),
          benefits: t("features.items.positionCalc.benefits", { returnObjects: true }) as string[],
        },
        {
          icon: <Import className="h-6 w-6" />,
          title: t("features.items.csvImport.title"),
          description: t("features.items.csvImport.description"),
          benefits: t("features.items.csvImport.benefits", { returnObjects: true }) as string[],
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
        },
        {
          icon: <BarChart3 className="h-6 w-6" />,
          title: t("features.items.analytics.title"),
          description: t("features.items.analytics.description"),
          benefits: t("features.items.analytics.benefits", { returnObjects: true }) as string[],
        },
        {
          icon: <LineChart className="h-6 w-6" />,
          title: t("features.items.equityCurve.title"),
          description: t("features.items.equityCurve.description"),
          benefits: t("features.items.equityCurve.benefits", { returnObjects: true }) as string[],
        },
        {
          icon: <Activity className="h-6 w-6" />,
          title: t("features.items.consistency.title"),
          description: t("features.items.consistency.description"),
          benefits: t("features.items.consistency.benefits", { returnObjects: true }) as string[],
        },
        {
          icon: <Calendar className="h-6 w-6" />,
          title: t("features.items.calendar.title"),
          description: t("features.items.calendar.description"),
          benefits: t("features.items.calendar.benefits", { returnObjects: true }) as string[],
        },
      ],
    },
    {
      id: "ai",
      name: t("features.categories.ai"),
      features: [
        {
          icon: <MessageSquare className="h-6 w-6" />,
          title: t("features.items.aiAssistant.title"),
          description: t("features.items.aiAssistant.description"),
          benefits: t("features.items.aiAssistant.benefits", { returnObjects: true }) as string[],
        },
        {
          icon: <PieChart className="h-6 w-6" />,
          title: t("features.items.aiCharts.title"),
          description: t("features.items.aiCharts.description"),
          benefits: t("features.items.aiCharts.benefits", { returnObjects: true }) as string[],
        },
        {
          icon: <Mail className="h-6 w-6" />,
          title: t("features.items.dailySummary.title"),
          description: t("features.items.dailySummary.description"),
          benefits: t("features.items.dailySummary.benefits", { returnObjects: true }) as string[],
        },
        {
          icon: <Bell className="h-6 w-6" />,
          title: t("features.items.goalAlerts.title"),
          description: t("features.items.goalAlerts.description"),
          benefits: t("features.items.goalAlerts.benefits", { returnObjects: true }) as string[],
        },
        {
          icon: <Calculator className="h-6 w-6" />,
          title: t("features.items.riskSimulator.title"),
          description: t("features.items.riskSimulator.description"),
          benefits: t("features.items.riskSimulator.benefits", { returnObjects: true }) as string[],
        },
      ],
    },
    {
      id: "reports",
      name: t("features.categories.reports"),
      features: [
        {
          icon: <FileText className="h-6 w-6" />,
          title: t("features.items.symbolReports.title"),
          description: t("features.items.symbolReports.description"),
          benefits: t("features.items.symbolReports.benefits", { returnObjects: true }) as string[],
        },
        {
          icon: <BookOpen className="h-6 w-6" />,
          title: t("features.items.setupReports.title"),
          description: t("features.items.setupReports.description"),
          benefits: t("features.items.setupReports.benefits", { returnObjects: true }) as string[],
        },
        {
          icon: <Clock className="h-6 w-6" />,
          title: t("features.items.hourAnalysis.title"),
          description: t("features.items.hourAnalysis.description"),
          benefits: t("features.items.hourAnalysis.benefits", { returnObjects: true }) as string[],
        },
        {
          icon: <Flame className="h-6 w-6" />,
          title: t("features.items.streakAnalysis.title"),
          description: t("features.items.streakAnalysis.description"),
          benefits: t("features.items.streakAnalysis.benefits", { returnObjects: true }) as string[],
        },
        {
          icon: <Timer className="h-6 w-6" />,
          title: t("features.items.holdingPeriod.title"),
          description: t("features.items.holdingPeriod.description"),
          benefits: t("features.items.holdingPeriod.benefits", { returnObjects: true }) as string[],
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
        },
        {
          icon: <Globe className="h-6 w-6" />,
          title: t("features.items.politicalEvents.title"),
          description: t("features.items.politicalEvents.description"),
          benefits: t("features.items.politicalEvents.benefits", { returnObjects: true }) as string[],
        },
        {
          icon: <BarChart3 className="h-6 w-6" />,
          title: t("features.items.sectorSentiment.title"),
          description: t("features.items.sectorSentiment.description"),
          benefits: t("features.items.sectorSentiment.benefits", { returnObjects: true }) as string[],
        },
        {
          icon: <Calendar className="h-6 w-6" />,
          title: t("features.items.economicCalendar.title"),
          description: t("features.items.economicCalendar.description"),
          benefits: t("features.items.economicCalendar.benefits", { returnObjects: true }) as string[],
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Button variant="ghost" asChild className="mb-6 gap-2">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              {t("features.backToLanding")}
            </Link>
          </Button>

          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 glow-effect">{t("features.featureCount")}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t("features.heroTitle")}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t("features.heroDescription")}
            </p>
          </div>
        </div>
      </section>

      {/* Sticky Category Navigation */}
      <CategoryNav
        activeCategory={activeCategory}
        onCategoryClick={() => {}}
      />

      {/* Feature Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {featureCategories.map((category) => (
          <section key={category.id} id={category.id} className="mb-16">
            <div className="border-l-4 border-primary pl-4 mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">{category.name}</h2>
            </div>

            {category.features.map((feature, index) => (
              <FeatureRow
                key={index}
                feature={feature}
                imagePosition={index % 2 === 0 ? "right" : "left"}
              />
            ))}
          </section>
        ))}
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
