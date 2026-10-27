import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useScreens } from "@/lib/screens";
import { useSeo } from "@/hooks/useSeo";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { CategoryNav } from "@/components/features/CategoryNav";
import { FeatureRow } from "@/components/features/FeatureRow";
import { FeaturesHero } from "@/components/features/FeaturesHero";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { ArrowRight, Brain, CalendarDays, ClipboardCheck, Coffee, FileSpreadsheet, Gauge, Landmark, Lightbulb, Share2, ShieldCheck } from "lucide-react";
import { featureFlags } from "@/config/featureFlags";
import { BehaviorDemo, CooldownDemo, DayViewDemo, DisciplineDemo, MentorDemo, ScoreDemo } from "@/components/features/FeatureDemos";
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
  const { t, i18n } = useTranslation();
  // feature illustrations: real screenshots of the app in the current language
  const shot = useScreens();
  const [searchQuery, setSearchQuery] = useState("");

  const categoryIds = ["discipline", "import", "trading-tools", "analytics", ...(featureFlags.AI_FEATURES ? ["ai"] : []), "reports", "market-intel"];
  const activeCategory = useScrollSpy(categoryIds, 140);

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
          icon: <ClipboardCheck className="h-6 w-6" />,
          title: t("features.items.ruleAdherence.title"),
          description: t("features.items.ruleAdherence.description"),
          benefits: t("features.items.ruleAdherence.benefits", { returnObjects: true }) as string[],
          illustration: shot("reports-rules"),
        },
        {
          icon: <Coffee className="h-6 w-6" />,
          title: t("features.items.cooldown.title"),
          description: t("features.items.cooldown.description"),
          benefits: t("features.items.cooldown.benefits", { returnObjects: true }) as string[],
          visual: <CooldownDemo />,
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
          illustration: shot("rules"),
        },
        {
          icon: <Calculator className="h-6 w-6" />,
          title: t("features.items.riskSimulator.title"),
          description: t("features.items.riskSimulator.description"),
          benefits: t("features.items.riskSimulator.benefits", { returnObjects: true }) as string[],
          illustration: shot("reports-simulator"),
        },
      ],
    },
    {
      id: "import",
      name: t("features.categories.import"),
      features: [
        {
          icon: <Zap className="h-6 w-6" />,
          title: t("features.items.ninjaTrader.title"),
          description: t("features.items.ninjaTrader.description"),
          benefits: t("features.items.ninjaTrader.benefits", { returnObjects: true }) as string[],
          illustration: shot("import"),
        },
        {
          icon: <Landmark className="h-6 w-6" />,
          title: t("features.items.ibkr.title"),
          description: t("features.items.ibkr.description"),
          benefits: t("features.items.ibkr.benefits", { returnObjects: true }) as string[],
          illustration: shot("import-ibkr"),
        },
        {
          icon: <FileSpreadsheet className="h-6 w-6" />,
          title: t("features.items.tradingView.title"),
          description: t("features.items.tradingView.description"),
          benefits: t("features.items.tradingView.benefits", { returnObjects: true }) as string[],
          illustration: shot("import-tradingview"),
        },
        {
          icon: <Import className="h-6 w-6" />,
          title: t("features.items.csvImport.title"),
          description: t("features.items.csvImport.description"),
          benefits: t("features.items.csvImport.benefits", { returnObjects: true }) as string[],
          illustration: shot("trades"),
        },
      ],
    },
    {
      id: "trading-tools",
      name: t("features.categories.tradingTools"),
      features: [
        {
          icon: <Share2 className="h-6 w-6" />,
          title: t("features.items.mentor.title"),
          description: t("features.items.mentor.description"),
          benefits: t("features.items.mentor.benefits", { returnObjects: true }) as string[],
          visual: <MentorDemo />,
        },
        {
          icon: <TrendingUp className="h-6 w-6" />,
          title: t("features.items.easyEntry.title"),
          description: t("features.items.easyEntry.description"),
          benefits: t("features.items.easyEntry.benefits", { returnObjects: true }) as string[],
          illustration: shot("trade-dialog"),
        },
        {
          icon: <Building2 className="h-6 w-6" />,
          title: t("features.items.propFirm.title"),
          description: t("features.items.propFirm.description"),
          benefits: t("features.items.propFirm.benefits", { returnObjects: true }) as string[],
          illustration: shot("reports-accounts"),
        },
        {
          icon: <Calculator className="h-6 w-6" />,
          title: t("features.items.positionCalc.title"),
          description: t("features.items.positionCalc.description"),
          benefits: t("features.items.positionCalc.benefits", { returnObjects: true }) as string[],
          illustration: shot("position-calc"),
        },
      ],
    },
    {
      id: "analytics",
      name: t("features.categories.analytics"),
      features: [
        {
          icon: <Lightbulb className="h-6 w-6" />,
          title: t("features.items.insights.title"),
          description: t("features.items.insights.description"),
          benefits: t("features.items.insights.benefits", { returnObjects: true }) as string[],
          illustration: shot("insights"),
        },
        {
          icon: <Crosshair className="h-6 w-6" />,
          title: t("features.items.mfeMAE.title"),
          description: t("features.items.mfeMAE.description"),
          benefits: t("features.items.mfeMAE.benefits", { returnObjects: true }) as string[],
          illustration: shot("reports-risk"),
        },
        {
          icon: <BarChart3 className="h-6 w-6" />,
          title: t("features.items.analytics.title"),
          description: t("features.items.analytics.description"),
          benefits: t("features.items.analytics.benefits", { returnObjects: true }) as string[],
          illustration: shot("reports-overview"),
        },
        {
          icon: <LineChart className="h-6 w-6" />,
          title: t("features.items.equityCurve.title"),
          description: t("features.items.equityCurve.description"),
          benefits: t("features.items.equityCurve.benefits", { returnObjects: true }) as string[],
          illustration: shot("equity"),
        },
        {
          icon: <Activity className="h-6 w-6" />,
          title: t("features.items.consistency.title"),
          description: t("features.items.consistency.description"),
          benefits: t("features.items.consistency.benefits", { returnObjects: true }) as string[],
          illustration: shot("consistency"),
        },
        {
          icon: <Calendar className="h-6 w-6" />,
          title: t("features.items.calendar.title"),
          description: t("features.items.calendar.description"),
          benefits: t("features.items.calendar.benefits", { returnObjects: true }) as string[],
          illustration: shot("calendar"),
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
          illustration: shot("reports-overview"),
        },
        {
          icon: <PieChart className="h-6 w-6" />,
          title: t("features.items.aiCharts.title"),
          description: t("features.items.aiCharts.description"),
          benefits: t("features.items.aiCharts.benefits", { returnObjects: true }) as string[],
          illustration: shot("reports-overview"),
        },
        {
          icon: <Mail className="h-6 w-6" />,
          title: t("features.items.dailySummary.title"),
          description: t("features.items.dailySummary.description"),
          benefits: t("features.items.dailySummary.benefits", { returnObjects: true }) as string[],
          illustration: shot("days"),
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
          illustration: shot("reports-symbols"),
        },
        {
          icon: <BookOpen className="h-6 w-6" />,
          title: t("features.items.setupReports.title"),
          description: t("features.items.setupReports.description"),
          benefits: t("features.items.setupReports.benefits", { returnObjects: true }) as string[],
          illustration: shot("reports-setup"),
        },
        {
          icon: <Clock className="h-6 w-6" />,
          title: t("features.items.hourAnalysis.title"),
          description: t("features.items.hourAnalysis.description"),
          benefits: t("features.items.hourAnalysis.benefits", { returnObjects: true }) as string[],
          illustration: shot("reports-time"),
        },
        {
          icon: <Flame className="h-6 w-6" />,
          title: t("features.items.streakAnalysis.title"),
          description: t("features.items.streakAnalysis.description"),
          benefits: t("features.items.streakAnalysis.benefits", { returnObjects: true }) as string[],
          illustration: shot("streaks"),
        },
        {
          icon: <Timer className="h-6 w-6" />,
          title: t("features.items.holdingPeriod.title"),
          description: t("features.items.holdingPeriod.description"),
          benefits: t("features.items.holdingPeriod.benefits", { returnObjects: true }) as string[],
          illustration: shot("holding"),
        },
      ],
    },
    {
      id: "market-intel",
      name: t("features.categories.marketIntel"),
      features: [
        // needs the Marketaux news integration
        ...(featureFlags.NEWS_FEATURES
          ? [
        {
          icon: <Target className="h-6 w-6" />,
          title: t("features.items.portfolioNews.title"),
          description: t("features.items.portfolioNews.description"),
          benefits: t("features.items.portfolioNews.benefits", { returnObjects: true }) as string[],
          illustration: shot("trades"),
        },
            ]
          : []),
        {
          icon: <Globe className="h-6 w-6" />,
          title: t("features.items.politicalEvents.title"),
          description: t("features.items.politicalEvents.description"),
          benefits: t("features.items.politicalEvents.benefits", { returnObjects: true }) as string[],
          illustration: shot("trades"),
        },
        // needs the Marketaux news integration
        ...(featureFlags.NEWS_FEATURES
          ? [
        {
          icon: <BarChart3 className="h-6 w-6" />,
          title: t("features.items.sectorSentiment.title"),
          description: t("features.items.sectorSentiment.description"),
          benefits: t("features.items.sectorSentiment.benefits", { returnObjects: true }) as string[],
          illustration: shot("trades"),
        },
            ]
          : []),
        {
          icon: <Calendar className="h-6 w-6" />,
          title: t("features.items.economicCalendar.title"),
          description: t("features.items.economicCalendar.description"),
          benefits: t("features.items.economicCalendar.benefits", { returnObjects: true }) as string[],
          illustration: shot("trades"),
        },
      ],
    },
  ];

  // Filter features based on search query
  const faq = t("features.faq.items", { returnObjects: true }) as { q: string; a: string }[];

  // search engines: page meta, the app with its feature list, the FAQ and the breadcrumb
  useSeo({
    title: t("features.seo.title"),
    description: t("features.seo.description"),
    path: "/features",
    language: i18n.language,
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "TradeNot.es",
        url: "https://tradenot.es/features",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        description: t("features.seo.description"),
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        featureList: featureCategories.flatMap((c) => c.features.map((f) => f.title)),
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "TradeNot.es", item: "https://tradenot.es/" },
          { "@type": "ListItem", position: 2, name: t("features.seo.breadcrumb"), item: "https://tradenot.es/features" },
        ],
      },
    ],
  });

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

      {/* FAQ (also as FAQPage structured data above) */}
      <section id="faq" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-3xl font-bold md:text-4xl">{t("features.faq.title")}</h2>
          <Accordion type="single" collapsible className="w-full">
            {faq.map((item, i) => (
              <AccordionItem key={item.q} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-base font-semibold">{item.q}</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

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
