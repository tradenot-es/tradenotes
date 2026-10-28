// Motion graphics for the marketing pages: how trades get into the journal and what
// the analyses show, as short CSS loops (keyframes in index.css, "Motion scenes").
// Example data only; with reduced motion every scene shows its end state.
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Clock, FileSpreadsheet, FileText, ThumbsDown, ThumbsUp, Upload } from "lucide-react";
import logo from "@/assets/logo.webp";
import trumpHead from "@/assets/trump-head.webp";
import { useCountUp } from "@/hooks/useCountUp";
import { utcToZoned, zonedToUtc, zoneAbbreviation } from "@/lib/timezone";
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
  return <>{Math.round(useCountUp(to, 1400)).toLocaleString("en-US")}</>;
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

/** Economic calendar: events pop into the week, the Fed decision's time switches between zones. */
export function CalendarScene() {
  const { t, i18n } = useTranslation();
  // FOMC 28.10.2026 14:00 New York, shown as a viewer in three places would see it
  const instant = zonedToUtc("2026-10-28", "14:00", "America/New_York");
  const places = [
    { city: "New York", zone: "America/New_York" },
    { city: "Berlin", zone: "Europe/Berlin" },
    { city: t("motion.calendar.tokyo"), zone: "Asia/Tokyo" },
  ].map((p) => {
    const local = utcToZoned(instant, p.zone);
    return { ...p, time: local.time, nextDay: local.date !== "2026-10-28", abbr: zoneAbbreviation(instant, p.zone, i18n.language) };
  });
  const weekday = new Intl.DateTimeFormat(i18n.language, { weekday: "short" });
  const days: { day: number; icons: ReactNode[] }[] = [
    { day: 26, icons: [<img key="t" src={trumpHead} alt="" className="h-5 w-5 rounded-full bg-white ring-1 ring-border" />] },
    { day: 27, icons: [<span key="n">👥</span>] },
    { day: 28, icons: [<span key="f">🏛️</span>, <img key="t" src={trumpHead} alt="" className="h-5 w-5 rounded-full bg-white ring-1 ring-border" />] },
    { day: 29, icons: [<span key="e">🇪🇺</span>, <span key="g">📈</span>] },
    { day: 30, icons: [<span key="j">🇯🇵</span>] },
  ];
  return (
    <Scene label={t("motion.calendar.label")}>
      <div className="mt-5 grid grid-cols-5 gap-1.5">
        {days.map((d0, i) => (
          <div key={d0.day} className={cn("rounded-lg border bg-background/60 p-2", d0.day === 28 && "scene-focus")} style={d(3.2)}>
            <p className="text-[10px] uppercase text-muted-foreground">{weekday.format(new Date(2026, 9, d0.day))}</p>
            <p className="text-sm font-semibold">{d0.day}</p>
            <div className="mt-1 flex h-6 items-center gap-0.5 text-sm">
              {d0.icons.map((icon, j) => (
                <span key={j} className="scene-row inline-flex" style={d(0.3 + i * 0.35 + j * 0.15)}>
                  {icon}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3 rounded-lg border bg-background/60 px-3 py-2">
        <span className="text-lg">🏛️</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">FOMC Rate Decision</p>
          <p className="text-[11px] text-muted-foreground">28.10.</p>
        </div>
        {/* the same moment in three zones, taking turns */}
        <div className="relative h-9 w-36 text-right">
          {places.map((p, i) => (
            <div key={p.zone} className="scene-cycle absolute inset-0" style={d(i * 2)}>
              <p className="tabular text-sm font-bold">
                {p.time} {p.abbr}
                {p.nextDay && <sup className="ml-0.5 text-[10px] text-primary">+1</sup>}
              </p>
              <p className="text-[11px] text-muted-foreground">{p.city}</p>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">{t("motion.calendar.caption")}</p>
    </Scene>
  );
}

const EQUITY = "0.0,110.0 21.4,96.7 42.9,101.1 64.3,81.1 85.7,86.7 107.1,67.8 128.6,72.2 150.0,76.7 171.4,52.2 192.9,57.8 214.3,38.9 235.7,43.3 257.1,25.6 278.6,30.0 300.0,10.0";

/** Equity curve: the line draws itself while the net P&L counts up. */
export function EquityScene() {
  const { t } = useTranslation();
  return (
    <Scene label={t("motion.equity.label")}>
      <div className="mt-5 flex items-baseline justify-between">
        <p className="text-xs font-semibold text-muted-foreground">{t("features.items.equityCurve.title")}</p>
        <p className="tabular text-xl font-bold text-success">
          +$<Count to={7408} />
        </p>
      </div>
      <svg viewBox="0 0 300 120" className="mt-2 h-auto w-full overflow-visible">
        {[30, 60, 90].map((y) => (
          <line key={y} x1="0" x2="300" y1={y} y2={y} className="stroke-border" strokeDasharray="2 4" />
        ))}
        <polygon points={`0,120 ${EQUITY} 300,120`} className="scene-pop fill-chart-profit/15" />
        <polyline
          points={EQUITY}
          pathLength={1}
          strokeDasharray="1"
          className="scene-draw fill-none stroke-chart-profit"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </svg>
      <p className="mt-3 text-center text-xs text-muted-foreground">{t("motion.equity.caption")}</p>
    </Scene>
  );
}

const SIMULATED = ["0.0,88.6 10.0,87.4 20.0,83.1 30.0,81.8 40.0,80.8 50.0,82.3 60.0,80.9 70.0,74.2 80.0,70.2 90.0,63.9 100.0,60.6 110.0,56.8 120.0,53.8 130.0,58.2 140.0,52.6 150.0,48.3 160.0,44.1 170.0,48.6 180.0,53.3 190.0,54.6 200.0,54.2 210.0,50.7 220.0,48.7 230.0,44.4 240.0,44.7 250.0,41.2 260.0,37.4 270.0,37.8 280.0,28.7 290.0,24.2 300.0,17.2", "0.0,88.6 10.0,89.6 20.0,91.1 30.0,91.0 40.0,89.9 50.0,85.9 60.0,83.4 70.0,83.7 80.0,86.0 90.0,86.6 100.0,80.2 110.0,81.9 120.0,79.4 130.0,76.2 140.0,80.7 150.0,79.0 160.0,72.3 170.0,78.8 180.0,78.6 190.0,77.6 200.0,79.3 210.0,75.8 220.0,74.6 230.0,78.9 240.0,74.1 250.0,70.0 260.0,64.7 270.0,57.4 280.0,54.5 290.0,52.5 300.0,56.2", "0.0,88.6 10.0,85.3 20.0,86.9 30.0,87.8 40.0,92.0 50.0,95.0 60.0,96.2 70.0,90.2 80.0,97.4 90.0,102.4 100.0,100.6 110.0,93.9 120.0,90.7 130.0,97.5 140.0,106.6 150.0,104.3 160.0,106.4 170.0,110.0 180.0,105.2 190.0,100.0 200.0,98.5 210.0,96.6 220.0,94.0 230.0,86.8 240.0,83.4 250.0,80.5 260.0,77.4 270.0,82.8 280.0,76.8 290.0,72.1 300.0,69.1", "0.0,88.6 10.0,95.3 20.0,96.6 30.0,91.9 40.0,97.9 50.0,97.4 60.0,92.1 70.0,96.1 80.0,88.4 90.0,85.0 100.0,84.3 110.0,81.8 120.0,77.9 130.0,76.2 140.0,70.4 150.0,71.8 160.0,72.2 170.0,66.8 180.0,65.4 190.0,67.7 200.0,62.7 210.0,55.6 220.0,56.1 230.0,60.3 240.0,59.6 250.0,59.0 260.0,58.9 270.0,52.1 280.0,54.9 290.0,48.6 300.0,52.5", "0.0,88.6 10.0,91.4 20.0,88.5 30.0,83.6 40.0,79.8 50.0,78.1 60.0,77.1 70.0,76.2 80.0,73.5 90.0,73.8 100.0,72.3 110.0,69.7 120.0,69.3 130.0,65.9 140.0,63.2 150.0,54.8 160.0,53.2 170.0,54.5 180.0,55.6 190.0,55.3 200.0,51.2 210.0,52.2 220.0,50.3 230.0,42.6 240.0,52.4 250.0,56.5 260.0,55.2 270.0,53.2 280.0,51.9 290.0,53.3 300.0,50.3", "0.0,88.6 10.0,87.6 20.0,89.8 30.0,80.3 40.0,79.0 50.0,81.3 60.0,81.8 70.0,82.9 80.0,83.2 90.0,94.3 100.0,96.3 110.0,92.4 120.0,97.2 130.0,97.6 140.0,93.9 150.0,90.6 160.0,84.8 170.0,91.7 180.0,93.3 190.0,94.7 200.0,92.4 210.0,88.1 220.0,99.0 230.0,94.8 240.0,100.7 250.0,98.1 260.0,104.1 270.0,103.6 280.0,98.9 290.0,99.6 300.0,99.0", "0.0,88.6 10.0,83.6 20.0,81.2 30.0,79.6 40.0,71.6 50.0,65.6 60.0,64.9 70.0,52.1 80.0,54.8 90.0,49.2 100.0,48.4 110.0,46.0 120.0,41.3 130.0,38.6 140.0,34.2 150.0,38.4 160.0,42.5 170.0,38.2 180.0,40.2 190.0,42.4 200.0,46.4 210.0,39.5 220.0,34.6 230.0,26.9 240.0,28.8 250.0,26.9 260.0,29.6 270.0,24.6 280.0,16.4 290.0,18.1 300.0,10.0"];

/** Risk simulator: many possible futures of the same trades fan out. */
export function SimulatorScene() {
  const { t } = useTranslation();
  return (
    <Scene label={t("motion.simulator.label")}>
      <p className="text-xs font-semibold text-muted-foreground">{t("riskSimulator.monteCarlo")}</p>
      <svg viewBox="0 0 300 120" className="mt-2 h-auto w-full overflow-visible">
        <line x1="0" x2="300" y1="88.6" y2="88.6" className="stroke-border" strokeDasharray="2 4" />
        {SIMULATED.map((points, i) => (
          <polyline
            key={i}
            points={points}
            pathLength={1}
            strokeDasharray="1"
            className={cn("scene-draw fill-none", i === 4 ? "stroke-primary" : "stroke-muted-foreground/40")}
            strokeWidth={i === 4 ? 2.5 : 1.2}
            style={d(i * 0.15)}
          />
        ))}
      </svg>
      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
        {[
          { label: t("riskSimulator.worstCase"), value: "-$1,940", tone: "text-destructive" },
          { label: t("riskSimulator.median"), value: "+$3,120", tone: "text-foreground" },
          { label: t("riskSimulator.bestCase"), value: "+$7,860", tone: "text-success" },
        ].map((s, i) => (
          <div key={s.label} className="scene-pop rounded-md bg-muted/50 px-2 py-1.5" style={d(i * 0.2)}>
            <p className="truncate text-[10px] text-muted-foreground">{s.label}</p>
            <p className={cn("tabular text-sm font-bold", s.tone)}>{s.value}</p>
          </div>
        ))}
      </div>
    </Scene>
  );
}

/** Position size calculator: inputs appear, the size comes out. */
export function PositionScene() {
  const { t } = useTranslation();
  const inputs = [
    { label: t("positionCalculator.accountSize"), value: "$50,000" },
    { label: t("positionCalculator.riskPercent"), value: "1 %" },
    { label: t("positionCalculator.stopDistance"), value: "10 pts · MES" },
  ];
  return (
    <Scene label={t("motion.position.label")}>
      <div className="space-y-1.5">
        {inputs.map((row, i) => (
          <div key={row.label} className="scene-row flex items-center justify-between rounded-md border bg-background/60 px-3 py-2" style={d(i * 0.5)}>
            <span className="text-xs text-muted-foreground">{row.label}</span>
            <span className="tabular text-sm font-semibold">{row.value}</span>
          </div>
        ))}
      </div>
      <div className="scene-pop mt-3 grid grid-cols-2 gap-2" style={d(-1.2)}>
        <div className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-2">
          <p className="text-[11px] text-muted-foreground">{t("positionCalculator.riskAmount")}</p>
          <p className="tabular text-lg font-bold">$500</p>
        </div>
        <div className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-2">
          <p className="text-[11px] text-muted-foreground">{t("positionCalculator.calculatedSize")}</p>
          <p className="tabular text-lg font-bold">10 MES</p>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">{t("motion.position.caption")}</p>
    </Scene>
  );
}
