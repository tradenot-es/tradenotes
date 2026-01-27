import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { TrustBadges } from "@/components/TrustBadges";
import { RotatingWord } from "@/components/RotatingWord";
import { AttentionCTA } from "@/components/AttentionCTA";
import dashboardPreview from "@/assets/dashboard-real-preview.jpg";
import { 
  BarChart3, 
  BookOpen, 
  Check, 
  Star, 
  Target, 
  MessageSquare, 
  Crosshair, 
  ArrowRight,
  Calculator,
  TrendingUp
} from "lucide-react";

const Landing = () => {
  const { t } = useTranslation();

  // Top 6 Features for landing page (reduced from 23)
  const topFeatures = [
    {
      icon: <Crosshair className="h-6 w-6" />,
      title: t("landing.features.mfeMAE.title"),
      description: t("landing.features.mfeMAE.description"),
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: t("landing.features.journal.title"),
      description: t("landing.features.journal.description"),
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: t("landing.features.analytics.title"),
      description: t("landing.features.analytics.description"),
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: t("landing.features.ai.title"),
      description: t("landing.features.ai.description"),
    },
    {
      icon: <Calculator className="h-6 w-6" />,
      title: t("landing.features.riskSimulator.title"),
      description: t("landing.features.riskSimulator.description"),
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: t("landing.features.news.title"),
      description: t("landing.features.news.description"),
    },
  ];

  // Reduced allFeatures list for pricing section
  const allFeatures = [
    t("landing.allFeatures.unlimited"),
    t("landing.allFeatures.fullAnalytics"),
    t("landing.allFeatures.mfeMaeTracking"),
    t("landing.allFeatures.ai"),
    t("landing.allFeatures.aiCharts"),
    t("landing.allFeatures.dailySummary"),
    t("landing.allFeatures.goalAlerts"),
    t("landing.allFeatures.riskSimulator"),
    t("landing.allFeatures.ninjaTraderSync"),
    t("landing.allFeatures.propFirmDetection"),
    t("landing.allFeatures.news"),
    t("landing.allFeatures.freeTrial"),
  ];
  return <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge className="w-fit glow-effect">
                {t("landing.badge")}
              </Badge>
              <div className="flex justify-center lg:justify-start my-8">
                
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                {t("landing.heroTitle")}
                <span className="flex items-start gap-2 mt-2 flex-wrap">
                  <span className="leading-tight">
                    <RotatingWord 
                      words={t("landing.heroTitleHighlightWords", { returnObjects: true }) as string[]}
                      intervalMs={3000}
                      className="gradient-text"
                    />
                    {t("landing.heroTitleHighlightSuffix") && (
                      <span className="gradient-text"> {t("landing.heroTitleHighlightSuffix")}</span>
                    )}
                  </span>
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                {t("landing.heroDescription")}
              </p>
              <div className="flex flex-wrap gap-4">
                <AttentionCTA intervalMs={13000}>
                  <Button size="lg" variant="premium" asChild>
                    <Link to="/auth">{t("landing.ctaStart")}</Link>
                  </Button>
                </AttentionCTA>
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
              <div className="aspect-video rounded-2xl border border-primary/20 elegant-shadow overflow-hidden bg-background/50">
                <img src={dashboardPreview} alt={t("landing.dashboardAlt")} className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Section - SEO optimiert */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-5xl mx-auto text-center">
          <Badge className="mb-4">{t("landing.whySection.badge")}</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("landing.whySection.title")}
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            {t("landing.whySection.description")}
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{t("landing.whySection.benefit1Title")}</h3>
              <p className="text-muted-foreground text-sm">{t("landing.whySection.benefit1Desc")}</p>
            </div>
            
            <div className="space-y-3">
              <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{t("landing.whySection.benefit2Title")}</h3>
              <p className="text-muted-foreground text-sm">{t("landing.whySection.benefit2Desc")}</p>
            </div>
            
            <div className="space-y-3">
              <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{t("landing.whySection.benefit3Title")}</h3>
              <p className="text-muted-foreground text-sm">{t("landing.whySection.benefit3Desc")}</p>
            </div>
          </div>
          
          <div className="mt-10">
            <Button variant="outline" asChild className="gap-2">
              <Link to="/warum-trading-journal">
                {t("whyJournal.readMore")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section - Reduced to Top 6 */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4">{t("landing.featuresBadge")}</Badge>
            <h2 className="text-4xl font-bold mb-4">{t("landing.topFeaturesTitle")}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("landing.topFeaturesDescription")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topFeatures.map((feature, index) => (
              <Card key={index} className="group smooth-transition hover:scale-[1.03] hover:shadow-glow cursor-pointer">
                <CardHeader className="relative overflow-hidden">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{feature.description}</CardDescription>
                  <ArrowRight className="absolute bottom-4 right-4 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                </CardHeader>
              </Card>
            ))}
          </div>
          
          {/* CTA to Features Page */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" asChild className="gap-2">
              <Link to="/features">
                {t("landing.discoverAllFeatures")}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <TrustBadges />


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
                    {allFeatures.map((feature, idx) => <div key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>)}
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

      <Footer />
    </div>;
};
export default Landing;