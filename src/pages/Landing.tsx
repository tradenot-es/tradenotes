import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import dashboardPreview from "@/assets/dashboard-real-preview.jpg";
import { 
  TrendingUp, 
  BarChart3, 
  BookOpen, 
  LineChart, 
  Calendar,
  Check,
  Star,
  Import,
  FileText,
  Activity,
  Target,
  MessageSquare
} from "lucide-react";

const Landing = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: t("landing.features.journal.title"),
      description: t("landing.features.journal.description")
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: t("landing.features.analytics.title"),
      description: t("landing.features.analytics.description")
    },
    {
      icon: <LineChart className="h-6 w-6" />,
      title: t("landing.features.equity.title"),
      description: t("landing.features.equity.description")
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: t("landing.features.consistency.title"),
      description: t("landing.features.consistency.description")
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: t("landing.features.calendar.title"),
      description: t("landing.features.calendar.description")
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: t("landing.features.news.title"),
      description: t("landing.features.news.description")
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: t("landing.features.ai.title"),
      description: t("landing.features.ai.description")
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: t("landing.features.reports.title"),
      description: t("landing.features.reports.description")
    },
    {
      icon: <Import className="h-6 w-6" />,
      title: t("landing.features.import.title"),
      description: t("landing.features.import.description")
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: t("landing.features.weekly.title"),
      description: t("landing.features.weekly.description")
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: t("landing.features.pnl.title"),
      description: t("landing.features.pnl.description")
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: t("landing.features.prep.title"),
      description: t("landing.features.prep.description")
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: t("landing.features.glossary.title"),
      description: t("landing.features.glossary.description")
    }
  ];

  const allFeatures = [
    t("landing.allFeatures.unlimited"),
    t("landing.allFeatures.fullAnalytics"),
    t("landing.allFeatures.journal"),
    t("landing.allFeatures.equity"),
    t("landing.allFeatures.consistency"),
    t("landing.allFeatures.news"),
    t("landing.allFeatures.ai"),
    t("landing.allFeatures.winLoss"),
    t("landing.allFeatures.calendar"),
    t("landing.allFeatures.pnlCharts"),
    t("landing.allFeatures.csvImport"),
    t("landing.allFeatures.setupReports"),
    t("landing.allFeatures.hourAnalysis"),
    t("landing.allFeatures.symbolReports"),
    t("landing.allFeatures.streakAnalysis"),
    t("landing.allFeatures.holdingPeriod"),
    t("landing.allFeatures.weeklyTracking"),
    t("landing.allFeatures.dailyPrep"),
    t("landing.allFeatures.glossary"),
    t("landing.allFeatures.darkMode"),
    t("landing.allFeatures.multiLanguage"),
    t("landing.allFeatures.futureFeatures"),
    t("landing.allFeatures.freeTrial")
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge className="w-fit glow-effect">
                {t("landing.badge")}
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                {t("landing.heroTitle")}
                <span className="gradient-text block mt-2">
                  {t("landing.heroTitleHighlight")}
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                {t("landing.heroDescription")}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" variant="premium" asChild>
                  <Link to="/auth">{t("landing.ctaStart")}</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#features">{t("landing.ctaFeatures")}</a>
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <Star className="h-5 w-5 fill-primary text-primary" />
                </div>
                <span>{t("landing.rating")}</span>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-2xl border border-primary/20 elegant-shadow overflow-hidden">
                <img 
                  src={dashboardPreview} 
                  alt={t("landing.dashboardAlt")}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4">{t("landing.featuresBadge")}</Badge>
            <h2 className="text-4xl font-bold mb-4">{t("landing.featuresTitle")}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("landing.featuresDescription")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="smooth-transition hover:scale-105">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 glow-effect">{t("landing.pricingBadge")}</Badge>
            <h2 className="text-4xl font-bold mb-4">{t("landing.pricingTitle")}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("landing.pricingDescription")}
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="border-primary glow-effect">
              <CardHeader className="text-center pb-8">
                <div className="inline-block mx-auto mb-4">
                  <Badge className="text-lg px-4 py-2">{t("landing.trialBadge")}</Badge>
                </div>
                <CardTitle className="text-3xl mb-2">{t("landing.premiumTitle")}</CardTitle>
                <CardDescription className="text-lg">
                  {t("landing.premiumDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  {/* Monthly Plan */}
                  <div className="text-center p-6 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-2">{t("landing.monthlyPlan")}</p>
                    <div className="mb-4">
                      <span className="text-5xl font-bold">{t("landing.monthlyPrice")}</span>
                      <span className="text-muted-foreground ml-2">{t("landing.monthlyPeriod")}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{t("landing.monthlyCancel")}</p>
                  </div>
                  
                  {/* Yearly Plan */}
                  <div className="text-center p-6 rounded-lg bg-primary/10 border-2 border-primary relative">
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                      {t("landing.yearlyBadge")}
                    </Badge>
                    <p className="text-sm text-muted-foreground mb-2">{t("landing.yearlyPlan")}</p>
                    <div className="mb-4">
                      <span className="text-5xl font-bold">{t("landing.yearlyPrice")}</span>
                      <span className="text-muted-foreground ml-2">{t("landing.yearlyPeriod")}</span>
                    </div>
                    <p className="text-sm text-primary font-medium">{t("landing.yearlyDiscount")}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="font-semibold text-lg mb-4 text-center">{t("landing.allFeaturesTitle")}</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {allFeatures.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Button className="w-full" size="lg" variant="premium" asChild>
                    <Link to="/auth">{t("landing.ctaTrial")}</Link>
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    {t("landing.trialNotice")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            {t("landing.ctaTitle")}
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            {t("landing.ctaDescription")}
          </p>
          <Button size="lg" variant="premium" asChild>
            <Link to="/auth">{t("landing.ctaTrial")}</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">{t("landing.footerTitle")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("landing.footerDescription")}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t("landing.footerProduct")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary">{t("landing.footerFeatures")}</a></li>
                <li><a href="#pricing" className="hover:text-primary">{t("landing.footerPricing")}</a></li>
                <li><Link to="/auth" className="hover:text-primary">{t("landing.footerLogin")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t("landing.footerSupport")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">{t("landing.footerHelp")}</a></li>
                <li><a href="#" className="hover:text-primary">{t("landing.footerContact")}</a></li>
                <li><a href="#" className="hover:text-primary">{t("landing.footerStatus")}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t("landing.footerLegal")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">{t("landing.footerPrivacy")}</a></li>
                <li><a href="#" className="hover:text-primary">{t("landing.footerTerms")}</a></li>
                <li><a href="#" className="hover:text-primary">{t("landing.footerImprint")}</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            {t("landing.footerCopyright")}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
