import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import dashboardPreview from "@/assets/dashboard-real-preview.jpg";
import heroLogo from "@/assets/tradenotes-logo-hero.png";
import { TrendingUp, BarChart3, BookOpen, LineChart, Calendar, Check, Star, Import, FileText, Activity, Target, MessageSquare, ScanLine, Bell, Globe } from "lucide-react";
const Landing = () => {
  const {
    t
  } = useTranslation();
  const features = [{
    icon: <TrendingUp className="h-6 w-6" />,
    title: t("landing.features.easyEntry.title"),
    description: t("landing.features.easyEntry.description")
  }, {
    icon: <ScanLine className="h-6 w-6" />,
    title: t("landing.features.chartAnalysis.title"),
    description: t("landing.features.chartAnalysis.description")
  }, {
    icon: <BookOpen className="h-6 w-6" />,
    title: t("landing.features.journal.title"),
    description: t("landing.features.journal.description")
  }, {
    icon: <BarChart3 className="h-6 w-6" />,
    title: t("landing.features.analytics.title"),
    description: t("landing.features.analytics.description")
  }, {
    icon: <LineChart className="h-6 w-6" />,
    title: t("landing.features.equity.title"),
    description: t("landing.features.equity.description")
  }, {
    icon: <Activity className="h-6 w-6" />,
    title: t("landing.features.consistency.title"),
    description: t("landing.features.consistency.description")
  }, {
    icon: <Calendar className="h-6 w-6" />,
    title: t("landing.features.calendar.title"),
    description: t("landing.features.calendar.description")
  }, {
    icon: <Target className="h-6 w-6" />,
    title: t("landing.features.news.title"),
    description: t("landing.features.news.description")
  }, {
    icon: <Bell className="h-6 w-6" />,
    title: t("landing.features.politicalEvents.title"),
    description: t("landing.features.politicalEvents.description")
  }, {
    icon: <Globe className="h-6 w-6" />,
    title: t("landing.features.newsTranslation.title"),
    description: t("landing.features.newsTranslation.description")
  }, {
    icon: <MessageSquare className="h-6 w-6" />,
    title: t("landing.features.ai.title"),
    description: t("landing.features.ai.description")
  }, {
    icon: <FileText className="h-6 w-6" />,
    title: t("landing.features.reports.title"),
    description: t("landing.features.reports.description")
  }, {
    icon: <Import className="h-6 w-6" />,
    title: t("landing.features.import.title"),
    description: t("landing.features.import.description")
  }, {
    icon: <Activity className="h-6 w-6" />,
    title: t("landing.features.weekly.title"),
    description: t("landing.features.weekly.description")
  }, {
    icon: <TrendingUp className="h-6 w-6" />,
    title: t("landing.features.pnl.title"),
    description: t("landing.features.pnl.description")
  }, {
    icon: <Target className="h-6 w-6" />,
    title: t("landing.features.prep.title"),
    description: t("landing.features.prep.description")
  }, {
    icon: <BookOpen className="h-6 w-6" />,
    title: t("landing.features.glossary.title"),
    description: t("landing.features.glossary.description")
  }];
  const allFeatures = [t("landing.allFeatures.unlimited"), t("landing.allFeatures.fullAnalytics"), t("landing.allFeatures.journal"), t("landing.allFeatures.equity"), t("landing.allFeatures.consistency"), t("landing.allFeatures.news"), t("landing.allFeatures.politicalEvents"), t("landing.allFeatures.sectorSentiment"), t("landing.allFeatures.ai"), t("landing.allFeatures.winLoss"), t("landing.allFeatures.calendar"), t("landing.allFeatures.pnlCharts"), t("landing.allFeatures.csvImport"), t("landing.allFeatures.setupReports"), t("landing.allFeatures.hourAnalysis"), t("landing.allFeatures.symbolReports"), t("landing.allFeatures.streakAnalysis"), t("landing.allFeatures.holdingPeriod"), t("landing.allFeatures.weeklyTracking"), t("landing.allFeatures.dailyPrep"), t("landing.allFeatures.glossary"), t("landing.allFeatures.darkMode"), t("landing.allFeatures.multiLanguage"), t("landing.allFeatures.futureFeatures"), t("landing.allFeatures.freeTrial")];
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
                <span className="flex items-start gap-6 md:gap-8 mt-2 flex-wrap">
                  <span className="gradient-text leading-tight">
                    {t("landing.heroTitleHighlight")}
                  </span>
                  
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
              <div className="aspect-video rounded-2xl border border-primary/20 elegant-shadow overflow-hidden bg-background/50">
                <img src={dashboardPreview} alt={t("landing.dashboardAlt")} className="w-full h-full object-contain" />
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
            {features.map((feature, index) => <Card key={index} className="smooth-transition hover:scale-105">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Video Tutorials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4">{t("landing.videosBadge")}</Badge>
            <h2 className="text-4xl font-bold mb-4">{t("landing.videosTitle")}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("landing.videosDescription")}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Trade Entry Video */}
            <Card className="overflow-hidden smooth-transition hover:scale-102">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <CardTitle>{t("landing.videoTradeEntry")}</CardTitle>
                <CardDescription>{t("landing.videoTradeEntryDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-lg bg-muted/50 border border-border p-6 group cursor-pointer overflow-hidden relative">
                  {/* Trade Entry Form Animation */}
                  <style>{`
                    @keyframes fillField {
                      0% { width: 0%; opacity: 0; }
                      100% { width: 100%; opacity: 1; }
                    }
                    @keyframes selectChip {
                      0% { transform: scale(1); background-color: hsl(var(--muted)); }
                      50% { transform: scale(1.1); }
                      100% { transform: scale(1); background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); }
                    }
                    @keyframes toggleSwitch {
                      0% { transform: translateX(0); }
                      100% { transform: translateX(100%); }
                    }
                    @keyframes countUp {
                      0% { opacity: 0; }
                      100% { opacity: 1; }
                    }
                    .trade-form-anim {
                      animation-play-state: paused;
                    }
                    .group:hover .trade-form-anim {
                      animation-play-state: running;
                    }
                  `}</style>
                  
                  <div className="space-y-3 text-xs">
                    {/* Symbol Input */}
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Symbol</div>
                      <div className="h-8 rounded border border-border bg-background/50 px-2 flex items-center">
                        <span className="trade-form-anim" style={{animation: 'fillField 0.5s ease-out 0.2s both'}}>AAPL</span>
                      </div>
                    </div>
                    
                    {/* Quick Chips */}
                    <div className="flex gap-2">
                      <div className="trade-form-anim h-6 px-3 rounded-full bg-muted text-muted-foreground flex items-center text-[10px]" style={{animation: 'selectChip 0.6s ease-out 0.8s both'}}>
                        NQ
                      </div>
                      <div className="h-6 px-3 rounded-full bg-muted text-muted-foreground flex items-center text-[10px]">ES</div>
                      <div className="h-6 px-3 rounded-full bg-muted text-muted-foreground flex items-center text-[10px]">TSLA</div>
                    </div>
                    
                    {/* Long/Short Toggle */}
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Side</div>
                      <div className="flex gap-2">
                        <div className="h-8 flex-1 rounded border border-primary bg-primary text-primary-foreground flex items-center justify-center">
                          Long
                        </div>
                        <div className="h-8 flex-1 rounded border border-border bg-background/50 flex items-center justify-center">
                          Short
                        </div>
                      </div>
                    </div>
                    
                    {/* Entry Price */}
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Entry Price</div>
                      <div className="h-8 rounded border border-border bg-background/50 px-2 flex items-center">
                        <span className="trade-form-anim" style={{animation: 'fillField 0.5s ease-out 1.4s both'}}>185.50</span>
                      </div>
                    </div>
                    
                    {/* Live P&L */}
                    <div className="trade-form-anim rounded border border-success/20 bg-success/10 p-2" style={{animation: 'countUp 0.5s ease-out 2s both'}}>
                      <div className="text-success font-semibold">+$127.50 (+2.3%)</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chart Analysis Video */}
            <Card className="overflow-hidden smooth-transition hover:scale-102">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <ScanLine className="h-6 w-6" />
                </div>
                <CardTitle>{t("landing.videoChartAnalysis")}</CardTitle>
                <CardDescription>{t("landing.videoChartAnalysisDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-lg bg-muted/50 border border-border p-6 group cursor-pointer overflow-hidden relative">
                  {/* Chart Analysis Animation */}
                  <style>{`
                    @keyframes drawLine {
                      0% { stroke-dashoffset: 1000; }
                      100% { stroke-dashoffset: 0; }
                    }
                    @keyframes fadeInBadge {
                      0% { opacity: 0; transform: translateY(10px); }
                      100% { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes drawCandle {
                      0% { transform: scaleY(0); }
                      100% { transform: scaleY(1); }
                    }
                    .chart-anim {
                      animation-play-state: paused;
                    }
                    .group:hover .chart-anim {
                      animation-play-state: running;
                    }
                  `}</style>
                  
                  <div className="relative h-full">
                    {/* SVG Chart */}
                    <svg className="w-full h-full" viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">
                      {/* Grid lines */}
                      <line x1="0" y1="30" x2="300" y2="30" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3"/>
                      <line x1="0" y1="60" x2="300" y2="60" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3"/>
                      <line x1="0" y1="90" x2="300" y2="90" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3"/>
                      <line x1="0" y1="120" x2="300" y2="120" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3"/>
                      
                      {/* Candlesticks */}
                      <g className="chart-anim" style={{animation: 'drawCandle 0.3s ease-out 0.5s both', transformOrigin: '25px 80px'}}>
                        <rect x="20" y="70" width="10" height="30" fill="hsl(var(--destructive))" rx="1"/>
                        <line x1="25" y1="60" x2="25" y2="100" stroke="hsl(var(--destructive))" strokeWidth="1"/>
                      </g>
                      <g className="chart-anim" style={{animation: 'drawCandle 0.3s ease-out 0.7s both', transformOrigin: '55px 65px'}}>
                        <rect x="50" y="50" width="10" height="30" fill="hsl(var(--success))" rx="1"/>
                        <line x1="55" y1="45" x2="55" y2="80" stroke="hsl(var(--success))" strokeWidth="1"/>
                      </g>
                      <g className="chart-anim" style={{animation: 'drawCandle 0.3s ease-out 0.9s both', transformOrigin: '85px 55px'}}>
                        <rect x="80" y="40" width="10" height="30" fill="hsl(var(--success))" rx="1"/>
                        <line x1="85" y1="35" x2="85" y2="70" stroke="hsl(var(--success))" strokeWidth="1"/>
                      </g>
                      
                      {/* Trend Line */}
                      <path 
                        d="M 10 100 Q 80 80, 150 60 T 290 30" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth="2" 
                        fill="none"
                        strokeDasharray="1000"
                        strokeDashoffset="1000"
                        className="chart-anim"
                        style={{animation: 'drawLine 2s ease-out 0.2s both'}}
                      />
                    </svg>
                    
                    {/* AI Analysis Badge */}
                    <div className="chart-anim absolute top-2 right-2 bg-primary/20 border border-primary/40 px-3 py-1 rounded-full text-[10px] text-primary font-medium" style={{animation: 'fadeInBadge 0.5s ease-out 2.5s both'}}>
                      AI: Bullish Pattern
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dashboard Video */}
            <Card className="overflow-hidden smooth-transition hover:scale-102">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <CardTitle>{t("landing.videoDashboard")}</CardTitle>
                <CardDescription>{t("landing.videoDashboardDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-lg bg-muted/50 border border-border p-4 group cursor-pointer overflow-hidden relative">
                  {/* Dashboard Animation */}
                  <style>{`
                    @keyframes slideInCard {
                      0% { opacity: 0; transform: translateY(20px); }
                      100% { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes drawEquity {
                      0% { stroke-dashoffset: 500; }
                      100% { stroke-dashoffset: 0; }
                    }
                    @keyframes numberCount {
                      0% { opacity: 0; }
                      100% { opacity: 1; }
                    }
                    .dashboard-anim {
                      animation-play-state: paused;
                    }
                    .group:hover .dashboard-anim {
                      animation-play-state: running;
                    }
                  `}</style>
                  
                  <div className="space-y-3">
                    {/* KPI Cards Row */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="dashboard-anim rounded border border-border bg-background/50 p-2" style={{animation: 'slideInCard 0.4s ease-out 0.2s both'}}>
                        <div className="text-[8px] text-muted-foreground">Win Rate</div>
                        <div className="dashboard-anim text-success text-sm font-bold" style={{animation: 'numberCount 0.3s ease-out 0.6s both'}}>67%</div>
                      </div>
                      <div className="dashboard-anim rounded border border-border bg-background/50 p-2" style={{animation: 'slideInCard 0.4s ease-out 0.4s both'}}>
                        <div className="text-[8px] text-muted-foreground">P&L</div>
                        <div className="dashboard-anim text-success text-sm font-bold" style={{animation: 'numberCount 0.3s ease-out 0.8s both'}}>+$2.4k</div>
                      </div>
                      <div className="dashboard-anim rounded border border-border bg-background/50 p-2" style={{animation: 'slideInCard 0.4s ease-out 0.6s both'}}>
                        <div className="text-[8px] text-muted-foreground">Trades</div>
                        <div className="dashboard-anim text-foreground text-sm font-bold" style={{animation: 'numberCount 0.3s ease-out 1s both'}}>42</div>
                      </div>
                    </div>
                    
                    {/* Equity Curve */}
                    <div className="dashboard-anim rounded border border-border bg-background/50 p-3 h-28" style={{animation: 'slideInCard 0.4s ease-out 0.8s both'}}>
                      <div className="text-[9px] text-muted-foreground mb-2">Equity Curve</div>
                      <svg className="w-full h-16" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
                        {/* Grid */}
                        <line x1="0" y1="15" x2="200" y2="15" stroke="hsl(var(--border))" strokeWidth="0.3" opacity="0.3"/>
                        <line x1="0" y1="30" x2="200" y2="30" stroke="hsl(var(--border))" strokeWidth="0.3" opacity="0.3"/>
                        <line x1="0" y1="45" x2="200" y2="45" stroke="hsl(var(--border))" strokeWidth="0.3" opacity="0.3"/>
                        
                        {/* Equity Line */}
                        <path 
                          d="M 0 50 L 20 48 L 40 45 L 60 47 L 80 42 L 100 38 L 120 35 L 140 30 L 160 25 L 180 20 L 200 15" 
                          stroke="hsl(var(--success))" 
                          strokeWidth="2" 
                          fill="none"
                          strokeDasharray="500"
                          strokeDashoffset="500"
                          className="dashboard-anim"
                          style={{animation: 'drawEquity 2s ease-out 1.2s both'}}
                        />
                        
                        {/* Gradient Fill */}
                        <defs>
                          <linearGradient id="equityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{stopColor: 'hsl(var(--success))', stopOpacity: 0.2}} />
                            <stop offset="100%" style={{stopColor: 'hsl(var(--success))', stopOpacity: 0}} />
                          </linearGradient>
                        </defs>
                        <path 
                          d="M 0 50 L 20 48 L 40 45 L 60 47 L 80 42 L 100 38 L 120 35 L 140 30 L 160 25 L 180 20 L 200 15 L 200 60 L 0 60 Z" 
                          fill="url(#equityGradient)"
                          className="dashboard-anim"
                          style={{animation: 'numberCount 0.5s ease-out 2s both'}}
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Journal & Reports Video */}
            <Card className="overflow-hidden smooth-transition hover:scale-102">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <FileText className="h-6 w-6" />
                </div>
                <CardTitle>{t("landing.videoJournal")}</CardTitle>
                <CardDescription>{t("landing.videoJournalDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-lg bg-muted/50 border border-border p-4 group cursor-pointer overflow-hidden relative">
                  {/* Journal Animation */}
                  <style>{`
                    @keyframes fillDay {
                      0% { transform: scale(0.8); opacity: 0; }
                      100% { transform: scale(1); opacity: 1; }
                    }
                    @keyframes slideInTrade {
                      0% { transform: translateX(-20px); opacity: 0; }
                      100% { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes typeText {
                      0% { width: 0; }
                      100% { width: 100%; }
                    }
                    .journal-anim {
                      animation-play-state: paused;
                    }
                    .group:hover .journal-anim {
                      animation-play-state: running;
                    }
                  `}</style>
                  
                  <div className="space-y-3">
                    {/* Mini Calendar */}
                    <div>
                      <div className="text-[9px] text-muted-foreground mb-2">Trading Calendar</div>
                      <div className="grid grid-cols-7 gap-1">
                        {[...Array(21)].map((_, i) => {
                          const isWinDay = [2, 5, 8, 12, 15].includes(i);
                          const isLossDay = [3, 9, 14].includes(i);
                          const delay = i * 0.05;
                          
                          return (
                            <div 
                              key={i}
                              className={`journal-anim h-5 rounded border ${
                                isWinDay ? 'bg-success/20 border-success' : 
                                isLossDay ? 'bg-destructive/20 border-destructive' : 
                                'bg-muted border-border'
                              }`}
                              style={{animation: `fillDay 0.3s ease-out ${delay + 0.2}s both`}}
                            />
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Trade List */}
                    <div className="space-y-1">
                      <div className="text-[9px] text-muted-foreground mb-1">Recent Trades</div>
                      <div className="journal-anim flex justify-between items-center text-[10px] p-2 rounded bg-background/50 border border-border" style={{animation: 'slideInTrade 0.4s ease-out 1.5s both'}}>
                        <span className="text-foreground font-medium">AAPL</span>
                        <span className="text-success">+$127</span>
                      </div>
                      <div className="journal-anim flex justify-between items-center text-[10px] p-2 rounded bg-background/50 border border-border" style={{animation: 'slideInTrade 0.4s ease-out 1.7s both'}}>
                        <span className="text-foreground font-medium">TSLA</span>
                        <span className="text-destructive">-$43</span>
                      </div>
                      <div className="journal-anim flex justify-between items-center text-[10px] p-2 rounded bg-background/50 border border-border" style={{animation: 'slideInTrade 0.4s ease-out 1.9s both'}}>
                        <span className="text-foreground font-medium">NQ</span>
                        <span className="text-success">+$215</span>
                      </div>
                    </div>
                    
                    {/* Journal Note */}
                    <div className="journal-anim rounded border border-border bg-background/50 p-2" style={{animation: 'slideInTrade 0.4s ease-out 2.1s both'}}>
                      <div className="text-[9px] text-muted-foreground mb-1">Today's Note</div>
                      <div className="text-[9px] text-foreground overflow-hidden whitespace-nowrap">
                        <span className="journal-anim inline-block" style={{animation: 'typeText 1.5s steps(40) 2.5s both'}}>
                          Stuck to my plan, avoided FOMO trades...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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

      {/* Footer */}
      <footer className="border-t py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-1 space-y-4">
              <img src={heroLogo} alt="TradeNot.es Logo" className="h-20 w-auto" />
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
                <li><a href="#" className="hover:text-primary">{t("landing.footerImprint")}</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            {t("landing.footerCopyright")}
          </div>
        </div>
      </footer>
    </div>;
};
export default Landing;