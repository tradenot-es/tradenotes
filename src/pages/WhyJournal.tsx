import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { 
  TrendingUp, 
  Brain, 
  Target, 
  BarChart3, 
  Shield, 
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  LineChart,
  Users,
  Quote
} from "lucide-react";

const WhyJournal = () => {
  const { t } = useTranslation();

  const benefits = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: t("whyJournal.benefits.psychology.title"),
      description: t("whyJournal.benefits.psychology.description"),
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: t("whyJournal.benefits.patterns.title"),
      description: t("whyJournal.benefits.patterns.description"),
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: t("whyJournal.benefits.discipline.title"),
      description: t("whyJournal.benefits.discipline.description"),
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: t("whyJournal.benefits.statistics.title"),
      description: t("whyJournal.benefits.statistics.description"),
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: t("whyJournal.benefits.risk.title"),
      description: t("whyJournal.benefits.risk.description"),
    },
    {
      icon: <Lightbulb className="h-8 w-8" />,
      title: t("whyJournal.benefits.learning.title"),
      description: t("whyJournal.benefits.learning.description"),
    },
  ];

  const famousTraders = [
    {
      name: "Paul Tudor Jones",
      quote: t("whyJournal.quotes.jones"),
    },
    {
      name: "Ray Dalio",
      quote: t("whyJournal.quotes.dalio"),
    },
    {
      name: "Jesse Livermore",
      quote: t("whyJournal.quotes.livermore"),
    },
  ];

  const journalElements = [
    t("whyJournal.elements.entryExit"),
    t("whyJournal.elements.positionSize"),
    t("whyJournal.elements.stopLoss"),
    t("whyJournal.elements.emotions"),
    t("whyJournal.elements.marketConditions"),
    t("whyJournal.elements.setup"),
    t("whyJournal.elements.screenshot"),
    t("whyJournal.elements.notes"),
  ];

  const faqItems = [
    {
      question: t("whyJournal.faq.digital.question"),
      answer: t("whyJournal.faq.digital.answer"),
    },
    {
      question: t("whyJournal.faq.time.question"),
      answer: t("whyJournal.faq.time.answer"),
    },
    {
      question: t("whyJournal.faq.beginners.question"),
      answer: t("whyJournal.faq.beginners.answer"),
    },
    {
      question: t("whyJournal.faq.review.question"),
      answer: t("whyJournal.faq.review.answer"),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 glow-effect">{t("whyJournal.badge")}</Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            {t("whyJournal.heroTitle")}
            <span className="gradient-text block mt-2">{t("whyJournal.heroTitleHighlight")}</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("whyJournal.heroDescription")}
          </p>
          <Button size="lg" variant="premium" asChild>
            <Link to="/auth">{t("whyJournal.ctaStart")}</Link>
          </Button>
        </div>
      </section>

      {/* Key Takeaways */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            {t("whyJournal.keyTakeaways.title")}
          </h2>
          <ul className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{t(`whyJournal.keyTakeaways.point${i}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Main Benefits */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("whyJournal.benefitsTitle")}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("whyJournal.benefitsDescription")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="glossy-card border-primary/10 hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section 1 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{t("whyJournal.cta1Title")}</h2>
          <p className="text-muted-foreground mb-6">{t("whyJournal.cta1Description")}</p>
          <Button size="lg" variant="premium" asChild>
            <Link to="/auth" className="gap-2">
              {t("whyJournal.cta1Button")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* What to Track */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("whyJournal.elementsTitle")}</h2>
            <p className="text-lg text-muted-foreground">{t("whyJournal.elementsDescription")}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {journalElements.map((element, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-primary/10"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                  {index + 1}
                </div>
                <span className="font-medium">{element}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Famous Traders */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Users className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("whyJournal.tradersTitle")}</h2>
            <p className="text-lg text-muted-foreground">{t("whyJournal.tradersDescription")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {famousTraders.map((trader, index) => (
              <Card key={index} className="glossy-card">
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-primary/50 mb-4" />
                  <p className="text-muted-foreground italic mb-4">"{trader.quote}"</p>
                  <p className="font-semibold text-primary">— {trader.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <LineChart className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("whyJournal.statsTitle")}</h2>
            <p className="text-lg text-muted-foreground">{t("whyJournal.statsDescription")}</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-xl bg-primary/5 border border-primary/20">
              <div className="text-4xl font-bold text-primary mb-2">90%</div>
              <p className="text-sm text-muted-foreground">{t("whyJournal.stats.failRate")}</p>
            </div>
            <div className="p-6 rounded-xl bg-primary/5 border border-primary/20">
              <div className="text-4xl font-bold text-primary mb-2">3x</div>
              <p className="text-sm text-muted-foreground">{t("whyJournal.stats.improvement")}</p>
            </div>
            <div className="p-6 rounded-xl bg-primary/5 border border-primary/20">
              <div className="text-4xl font-bold text-primary mb-2">73%</div>
              <p className="text-sm text-muted-foreground">{t("whyJournal.stats.emotional")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("whyJournal.faqTitle")}</h2>
          </div>

          <div className="space-y-6">
            {faqItems.map((item, index) => (
              <div key={index} className="p-6 rounded-xl bg-background border border-primary/10">
                <h3 className="text-lg font-semibold mb-3">{item.question}</h3>
                <p className="text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("whyJournal.finalCtaTitle")}</h2>
          <p className="text-xl text-muted-foreground mb-8">{t("whyJournal.finalCtaDescription")}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="premium" asChild>
              <Link to="/auth">{t("whyJournal.finalCtaButton")}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/#features">{t("whyJournal.finalCtaFeatures")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">← {t("whyJournal.backToHome")}</Link>
        </div>
      </footer>
    </div>
  );
};

export default WhyJournal;
