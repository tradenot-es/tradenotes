import { useTranslation } from "react-i18next";
import { AlertTriangle, CalendarDays } from "lucide-react";
import { useScreens } from "@/lib/screens";
import { useCountUp } from "@/hooks/useCountUp";

// Illustration values for the product preview (not user data, not a claim)
const DEMO_CURVE = [0, 120, 80, 260, 210, 340, 300, 460];

function DemoCurve() {
  const max = Math.max(...DEMO_CURVE);
  const pts = DEMO_CURVE.map((v, i) => `${(i / (DEMO_CURVE.length - 1)) * 200},${56 - (v / max) * 50}`).join(" ");
  return (
    <svg viewBox="0 0 200 60" className="h-12 w-full" aria-hidden>
      <polyline
        points={pts}
        fill="none"
        className="stroke-chart-profit animate-draw-line"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ strokeDasharray: 400, "--path-length": 400 } as React.CSSProperties}
      />
    </svg>
  );
}

/**
 * Hero visual: a real dashboard screenshot (discipline panel and score) plus two
 * floating cards for what it does not show: the day's P&L curve and a pattern
 * warning. Cards enter in a cascade and drift gently; both stop with reduced motion.
 */
export function HeroShowcase() {
  const { t } = useTranslation();
  const shot = useScreens();
  const today = useCountUp(DEMO_CURVE[DEMO_CURVE.length - 1], 1400);

  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none" aria-hidden>
      {/* soft glow behind the preview */}
      <div className="absolute -inset-8 -z-10 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.18),transparent_65%)] blur-2xl" />

      <div className="overflow-hidden rounded-2xl border border-primary/20 bg-card/60 shadow-2xl animate-rise-in">
        <img src={shot("hero-dashboard")} alt="" width={1800} height={1250} fetchPriority="high" decoding="async" className="block h-auto w-full" />
      </div>

      {/* today's P&L curve: the day view in miniature */}
      <div
        className="absolute -right-3 -top-6 w-52 rounded-xl border bg-card/90 p-3 shadow-xl backdrop-blur-md animate-rise-in motion-stagger sm:-right-8"
        style={{ "--stagger": 5 } as React.CSSProperties}
      >
        <div className="hero-float [animation-delay:-2s]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold">
              <CalendarDays className="h-3.5 w-3.5 text-primary" />
              {t("days.title")}
            </span>
            <span className="tabular text-sm font-bold">+${Math.round(today)}</span>
          </div>
          <DemoCurve />
        </div>
      </div>

      {/* pattern warning */}
      <div
        className="absolute -bottom-6 left-6 hidden w-64 rounded-xl border border-warning/40 bg-card/90 p-3 shadow-xl backdrop-blur-md animate-rise-in motion-stagger sm:block"
        style={{ "--stagger": 8 } as React.CSSProperties}
      >
        <div className="hero-float [animation-delay:-4s]">
          <p className="flex items-start gap-2 text-xs">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
            <span>{t("discipline.revengeToday", { count: 1 })}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
