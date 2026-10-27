import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { TrustBadges } from "@/components/TrustBadges";
import { RotatingWord } from "@/components/RotatingWord";
import { AttentionCTA } from "@/components/AttentionCTA";
import { HeroShowcase } from "@/components/landing/HeroShowcase";
import { Reveal } from "@/components/motion/Reveal";
import { usePageSeo } from "@/hooks/useSeo";
import { SyncScene } from "@/components/motion/Scenes";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CalendarDays,
  Check,
  CheckCircle2,
  Crosshair,
  EyeOff,
  Flame,
  Gauge,
  ListChecks,
  PenLine,
  ShieldCheck,
  Target,
  TrendingUp,
  Upload,
} from "lucide-react";

const Landing = () => {
  usePageSeo("landing", "/");
  const { t } = useTranslation();
  const location = useLocation();

  // Scroll to hash section (e.g. /#free from another page)
  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }
  }, [location.hash]);

  const topFeatures = [
    { icon: ShieldCheck, key: "discipline" },
    { icon: Brain, key: "behavior" },
    { icon: CalendarDays, key: "dayView" },
    { icon: Gauge, key: "analytics" },
    { icon: BookOpen, key: "journal" },
    { icon: Crosshair, key: "mfeMAE" },
  ];

  // the costly habits a journal should catch, each paired with the tool that catches it
  const habits = [
    { icon: TrendingUp, key: "overtrading" },
    { icon: Flame, key: "revenge" },
    { icon: ListChecks, key: "rules" },
    { icon: EyeOff, key: "emotions" },
  ];

  const steps = [
    { icon: Upload, key: "capture" },
    { icon: Target, key: "rules" },
    { icon: BarChart3, key: "review" },
  ];

  const allFeatures = [
    "unlimited",
    "fullAnalytics",
    "discipline",
    "behavior",
    "dayView",
    "score",
    "templates",
    "mfeMaeTracking",
    "goalAlerts",
    "riskSimulator",
    "ninjaTraderSync",
    "propFirmDetection",
  ].map((key) => t(`landing.allFeatures.${key}`));

  const heroFacts = t("landing.heroFacts", { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Navigation />

      {/* Hero */}
      <section className="relative px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(60%_50%_at_20%_10%,hsl(var(--primary)/0.12),transparent)]" />
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_1fr]">
            <div className="space-y-7">
              <Badge className="w-fit animate-rise-in">{t("landing.badge")}</Badge>
              <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl animate-rise-in motion-stagger" style={{ "--stagger": 1 } as React.CSSProperties}>
                {t("landing.heroTitle")}{" "}
                <RotatingWord
                  words={t("landing.heroTitleHighlightWords", { returnObjects: true }) as string[]}
                  intervalMs={3000}
                  className="gradient-text"
                />
                {t("landing.heroTitleHighlightSuffix") && <span className="gradient-text"> {t("landing.heroTitleHighlightSuffix")}</span>}
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground sm:text-xl animate-rise-in motion-stagger" style={{ "--stagger": 2 } as React.CSSProperties}>
                {t("landing.heroDescription")}
              </p>
              <div className="flex flex-wrap gap-3 animate-rise-in motion-stagger" style={{ "--stagger": 3 } as React.CSSProperties}>
                <AttentionCTA intervalMs={13000}>
                  <Button size="lg" variant="premium" asChild>
                    <Link to="/auth?mode=signup" className="group gap-2">
                      {t("landing.ctaStart")}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                </AttentionCTA>
                <Button size="lg" variant="outline" asChild>
                  <a href="#features">{t("landing.ctaFeatures")}</a>
                </Button>
              </div>
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground animate-rise-in motion-stagger" style={{ "--stagger": 4 } as React.CSSProperties}>
                {heroFacts.map((fact) => (
                  <li key={fact} className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-primary" aria-hidden />
                    {fact}
                  </li>
                ))}
              </ul>
            </div>
            <HeroShowcase />
          </div>
        </div>
      </section>

      {/* Costly habits → what catches them */}
      <section className="bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <Badge className="mb-4">{t("landing.habits.badge")}</Badge>
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">{t("landing.habits.title")}</h2>
            <p className="text-lg text-muted-foreground">{t("landing.habits.description")}</p>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {habits.map(({ icon: Icon, key }, i) => (
              <Reveal key={key} index={i}>
                <Card className="h-full hover-lift">
                  <CardHeader className="space-y-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <CardTitle className="text-lg">{t(`landing.habits.items.${key}.title`)}</CardTitle>
                    <CardDescription>{t(`landing.habits.items.${key}.description`)}</CardDescription>
                    <p className="flex items-start gap-1.5 border-t pt-3 text-sm">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span>{t(`landing.habits.items.${key}.fix`)}</span>
                    </p>
                  </CardHeader>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-14 text-center">
            <Badge className="mb-4">{t("landing.featuresBadge")}</Badge>
            <h2 className="mb-4 text-4xl font-bold tracking-tight">{t("landing.topFeaturesTitle")}</h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">{t("landing.topFeaturesDescription")}</p>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {topFeatures.map(({ icon: Icon, key }, index) => (
              <Reveal key={key} index={index % 3}>
                <Link to="/features" className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Card className="relative h-full overflow-hidden hover-lift">
                    <CardHeader>
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-[background-color,transform] duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                        <Icon className="h-6 w-6" aria-hidden />
                      </div>
                      <CardTitle className="text-lg">{t(`landing.features.${key}.title`)}</CardTitle>
                      <CardDescription className="line-clamp-3">{t(`landing.features.${key}.description`)}</CardDescription>
                      <ArrowRight className="absolute bottom-4 right-4 h-5 w-5 -translate-x-1 text-primary opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
                    </CardHeader>
                  </Card>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-12 text-center">
            <Button variant="outline" size="lg" asChild className="gap-2">
              <Link to="/features">
                {t("landing.discoverAllFeatures")}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* Automatic import: the main chore of a journal, shown as motion */}
      <section id="import" className="scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <Badge className="mb-4">{t("landing.importSection.badge")}</Badge>
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">{t("landing.importSection.title")}</h2>
            <p className="mb-6 text-lg text-muted-foreground">{t("landing.importSection.description")}</p>
            <ul className="space-y-3">
              {(t("landing.importSection.points", { returnObjects: true }) as string[]).map((point) => (
                <li key={point} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal index={1} className="overflow-hidden rounded-xl border shadow-lg">
            <SyncScene />
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Reveal className="mb-12 text-center">
            <Badge className="mb-4">{t("landing.howItWorks.badge")}</Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("landing.howItWorks.title")}</h2>
          </Reveal>
          <ol className="grid gap-8 md:grid-cols-3">
            {steps.map(({ icon: Icon, key }, i) => (
              <Reveal as="li" key={key} index={i} className="relative text-center">
                {i < steps.length - 1 && (
                  <span className="absolute left-[calc(50%+2.5rem)] top-6 hidden h-px w-[calc(100%-5rem)] bg-gradient-to-r from-primary/50 to-transparent md:block" aria-hidden />
                )}
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("landing.howItWorks.step", { n: i + 1 })}</p>
                <h3 className="mt-1 text-lg font-semibold">{t(`landing.howItWorks.steps.${key}.title`)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t(`landing.howItWorks.steps.${key}.description`)}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Why a journal */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <Reveal>
            <Badge className="mb-4">{t("landing.whySection.badge")}</Badge>
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">{t("landing.whySection.title")}</h2>
            <p className="mx-auto mb-12 max-w-2xl text-lg text-muted-foreground">{t("landing.whySection.description")}</p>
          </Reveal>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: TrendingUp, n: 1 },
              { icon: Target, n: 2 },
              { icon: BarChart3, n: 3 },
            ].map(({ icon: Icon, n }, i) => (
              <Reveal key={n} index={i} className="space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold">{t(`landing.whySection.benefit${n}Title`)}</h3>
                <p className="text-sm text-muted-foreground">{t(`landing.whySection.benefit${n}Desc`)}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10">
            <Button variant="outline" asChild className="gap-2">
              <Link to="/warum-trading-journal">
                {t("whyJournal.readMore")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      <TrustBadges />

      {/* Free */}
      <section id="free" className="bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Reveal className="mb-12 text-center">
            <Badge className="mb-4">{t("landing.free.badge")}</Badge>
            <h2 className="mb-4 text-4xl font-bold tracking-tight">{t("landing.free.title")}</h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">{t("landing.free.description")}</p>
          </Reveal>
          <Reveal>
            <Card className="border-primary/50 p-6 sm:p-8">
              <ul className="mb-8 grid gap-3 md:grid-cols-2">
                {allFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" size="lg" variant="premium" asChild>
                <Link to="/auth?mode=signup">{t("landing.free.cta")}</Link>
              </Button>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <PenLine className="mx-auto mb-6 h-10 w-10 text-primary" aria-hidden />
          <h2 className="mb-6 text-4xl font-bold tracking-tight">{t("landing.ctaTitle")}</h2>
          <p className="mb-8 text-xl text-muted-foreground">{t("landing.ctaDescription")}</p>
          <Button size="lg" variant="premium" asChild>
            <Link to="/auth?mode=signup">{t("landing.free.cta")}</Link>
          </Button>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
