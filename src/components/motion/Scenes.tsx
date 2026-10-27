// Motion graphics for the marketing pages: how trades get into the journal and what
// the analyses show, as short CSS loops (keyframes in index.css, "Motion scenes").
// Example data only; with reduced motion every scene shows its end state.
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Clock, FileSpreadsheet, FileText, ThumbsDown, ThumbsUp, Upload } from "lucide-react";
import logo from "@/assets/logo.webp";
import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";

const d = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

/** Plays its animations only while visible. */
function Scene({ children, label, className }: { children: ReactNode; label: string; className?: string }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return setPlaying(true);
    const io = new IntersectionObserver(([entry]) => setPlaying(entry.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      data-scene
      data-playing={playing ? "" : undefined}
      role="img"
      aria-label={label}
      className={cn("relative flex h-full w-full flex-col justify-center overflow-hidden bg-card p-5 sm:p-6", className)}
    >
      <span className="absolute right-3 top-3 rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground" aria-hidden>
        {t("features.demoLabel")}
      </span>
      <div aria-hidden className="contents">
        {children}
      </div>
    </div>
  );
}

function TradeChip({ symbol, side, pnl, className, style }: { symbol: string; side: string; pnl: string; className?: string; style?: CSSProperties }) {
  const positive = !pnl.startsWith("-");
  return (
    <div className={cn("flex items-center justify-between gap-3 rounded-lg border bg-background/60 px-3 py-2", className)} style={style}>
      <div className="min-w-0">
        <p className="text-sm font-semibold">{symbol}</p>
        <p className="text-[11px] text-muted-foreground">{side}</p>
      </div>
      <span className={cn("tabular text-sm font-bold", positive ? "text-success" : "text-destructive")}>{pnl}</span>
    </div>
  );
}

/** NinjaTrader add-on: fills travel into tradenot.es and come out as one trade. */
export function SyncScene() {
  const { t } = useTranslation();
  const fills = [
    { text: "BUY 2 ES @ 6850.25", delay: 0 },
    { text: "SELL 1 ES @ 6852.00", delay: 1 },
    { text: "SELL 1 ES @ 6854.00", delay: 2 },
  ];
  return (
    <Scene label={t("motion.sync.label")}>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="rounded-lg border bg-background/60 p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">NinjaTrader</p>
          <ul className="space-y-1.5">
            {fills.map((f) => (
              <li key={f.text} className="scene-row rounded bg-muted/60 px-2 py-1 font-mono text-[11px]" style={d(f.delay)}>
                {f.text}
              </li>
            ))}
          </ul>
        </div>
        {/* the wire with travelling fills */}
        <div className="relative h-1 w-10 rounded-full bg-chart-track sm:w-16">
          {fills.map((f) => (
            <span key={f.text} className="scene-travel absolute -top-1 h-3 w-3 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary))]" style={d(f.delay + 0.3)} />
          ))}
        </div>
        <div className="flex flex-col items-center gap-3">
          <img src={logo} alt="" className="h-12 w-12" />
          <TradeChip className="scene-pop w-full" symbol="ES" side={t("motion.sync.trade")} pnl="+$290" />
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">{t("motion.sync.caption")}</p>
    </Scene>
  );
}

/** Interactive Brokers: the daily Flex report is read and turned into trades. */
export function FlexScene() {
  const { t } = useTranslation();
  return (
    <Scene label={t("motion.flex.label")}>
      <div className="grid grid-cols-[auto_1fr] items-center gap-5">
        <div className="relative w-28 rounded-lg border bg-background/60 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
            <FileText className="h-3.5 w-3.5 text-primary" />
            Flex XML
          </div>
          <div className="space-y-1.5">
            {[90, 70, 85, 60, 75].map((w, i) => (
              <div key={i} className="h-1.5 rounded bg-muted" style={{ width: `${w}%` }} />
            ))}
          </div>
          {/* scan line */}
          <span className="scene-scan absolute inset-x-1 h-0.5 rounded bg-primary shadow-[0_0_10px_hsl(var(--primary))]" />
          <div className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full border bg-card">
            <Clock className="scene-spin h-4 w-4 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <TradeChip className="scene-row" style={d(2.6)} symbol="AAPL" side={`Long · 100 · IBKR`} pnl="+$184" />
          <TradeChip className="scene-row" style={d(3.1)} symbol="MES" side={`Short · 3 · IBKR`} pnl="-$41" />
          <TradeChip className="scene-row" style={d(3.6)} symbol="NVDA" side={`Long · 50 · IBKR`} pnl="+$96" />
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">{t("motion.flex.caption")}</p>
    </Scene>
  );
}

/** TradingView: a CSV export is dropped in; filled orders become trades, cancelled ones are skipped. */
export function CsvScene() {
  const { t } = useTranslation();
  const rows = [
    { text: "MES · Buy 2 · Filled", skip: false, delay: 1.3 },
    { text: "MES · Sell 1 · Filled", skip: false, delay: 1.6 },
    { text: "MES · Sell 1 · Cancelled", skip: true, delay: 1.9 },
    { text: "MES · Sell 1 · Filled", skip: false, delay: 2.2 },
  ];
  return (
    <Scene label={t("motion.csv.label")}>
      <div className="grid grid-cols-[auto_1fr] items-start gap-5">
        <div className="relative flex h-32 w-28 items-center justify-center rounded-lg border-2 border-dashed border-border">
          <Upload className="h-5 w-5 text-muted-foreground/50" />
          <div className="scene-drop absolute inset-3 flex flex-col items-center justify-center gap-1 rounded-md border bg-background">
            <FileSpreadsheet className="h-7 w-7 text-primary" />
            <span className="font-mono text-[10px] text-muted-foreground">export.csv</span>
          </div>
        </div>
        <div className="space-y-1.5">
          {rows.map((r) => (
            <div
              key={r.text + r.delay}
              className={cn("flex items-center gap-2 rounded bg-muted/60 px-2 py-1 font-mono text-[11px]", r.skip ? "scene-skip line-through" : "scene-row")}
              style={d(r.delay)}
            >
              {!r.skip && <CheckCircle2 className="h-3 w-3 shrink-0 text-success" />}
              {r.text}
            </div>
          ))}
          <TradeChip className="scene-pop mt-2" symbol="MES" side={t("motion.csv.result")} pnl="+$63.77" />
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">{t("motion.csv.caption")}</p>
    </Scene>
  );
}

function Count({ to }: { to: number }) {
  return <>{Math.round(useCountUp(to, 1400))}</>;
}

/** Rule adherence: the four fields of process vs. outcome. */
export function AdherenceScene() {
  const { t } = useTranslation();
  const cells = [
    { key: "goodWin", count: 28, style: "border-primary/40 bg-primary/10" },
    { key: "goodLoss", count: 22, style: "border-border bg-muted/40" },
    { key: "badWin", count: 7, style: "border-warning/40 bg-warning/10" },
    { key: "badLoss", count: 8, style: "border-destructive/40 bg-destructive/10" },
  ];
  return (
    <Scene label={t("motion.adherence.label")}>
      <div className="grid grid-cols-2 gap-3">
        {cells.map((c, i) => (
          <div key={c.key} className={cn("scene-focus rounded-lg border p-3", c.style)} style={d(i * 1.5)}>
            <p className="text-xs font-semibold">{t(`adherence.matrix.${c.key}`)}</p>
            <p className="tabular mt-1 text-2xl font-bold">
              <Count to={c.count} />
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">{t("motion.adherence.caption")}</p>
    </Scene>
  );
}

/** What works for you: strongest and weakest groups as bars. */
export function InsightsScene() {
  const { t } = useTranslation();
  const strengths = [
    { label: "Opening Range", value: 100 },
    { label: t("reports.tuesday"), value: 72 },
    { label: "NQ", value: 58 },
  ];
  const weaknesses = [
    { label: t("insights.hourRange", { from: "21", to: "22" }), value: 64 },
    { label: "Breakout", value: 41 },
  ];
  const bar = (b: { label: string; value: number }, i: number, positive: boolean) => (
    <li key={b.label} className="space-y-1">
      <p className="text-xs">{b.label}</p>
      <div className="h-2 rounded-full bg-chart-track">
        <div
          className={cn("h-full origin-left rounded-full animate-grow-x motion-stagger", positive ? "bg-chart-profit" : "bg-chart-loss")}
          style={{ width: `${b.value}%`, "--stagger": i * 3 } as CSSProperties}
        />
      </div>
    </li>
  );
  return (
    <Scene label={t("motion.insights.label")}>
      <div className="grid grid-cols-2 gap-5">
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold">
            <ThumbsUp className="h-3.5 w-3.5 text-success" />
            {t("insights.strengths")}
          </p>
          <ul className="space-y-2.5">{strengths.map((b, i) => bar(b, i, true))}</ul>
        </div>
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold">
            <ThumbsDown className="h-3.5 w-3.5 text-destructive" />
            {t("insights.weaknesses")}
          </p>
          <ul className="space-y-2.5">{weaknesses.map((b, i) => bar(b, i, false))}</ul>
        </div>
      </div>
    </Scene>
  );
}
