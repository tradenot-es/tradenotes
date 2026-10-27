import { useTranslation } from "react-i18next";
import { AlertTriangle, CheckCircle2, Gauge, ShieldCheck } from "lucide-react";
import dashboardPreview from "@/assets/dashboard-real-preview.jpg";
import { useCountUp } from "@/hooks/useCountUp";

// Illustration values for the product preview (not user data, not a claim)
const DEMO_CURVE = [0, 120, 80, 260, 210, 340, 300, 460];
const DEMO_SCORE = 78;

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
 * Hero visual: the dashboard screenshot with floating cards that show what the
 * app does today (discipline status, score, pattern warning). Cards enter in a
 * cascade and then drift gently; both stop with reduced motion.
 */
export function HeroShowcase() {
  const { t } = useTranslation();
  const score = useCountUp(DEMO_SCORE, 1400);

  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none" aria-hidden>
      {/* soft glow behind the preview */}
      <div className="absolute -inset-8 -z-10 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.18),transparent_65%)] blur-2xl" />

      <div className="overflow-hidden rounded-2xl border border-primary/20 bg-card/60 shadow-2xl animate-rise-in">
        <img src={dashboardPreview} alt="" className="block h-auto w-full" />
      </div>

      {/* discipline status */}
      <div
        className="absolute -left-4 top-6 w-56 rounded-xl border bg-card/90 p-3 shadow-xl backdrop-blur-md animate-rise-in motion-stagger sm:-left-10"
        style={{ "--stagger": 4 } as React.CSSProperties}
      >
        <div className="hero-float">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              {t("discipline.title")}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
              <CheckCircle2 className="h-3 w-3" />
              {t("discipline.state.ok")}
            </span>
          </div>
          <div className="mt-2 space-y-1.5">
            {[0.4, 0.65].map((w, i) => (
              <div key={i} className="h-1.5 rounded-full bg-chart-track">
                <div
                  className="h-full origin-left rounded-full bg-primary animate-grow-x motion-stagger"
                  style={{ width: `${w * 100}%`, "--stagger": 8 + i * 2 } as React.CSSProperties}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* score */}
      <div
        className="absolute -right-3 bottom-10 w-44 rounded-xl border bg-card/90 p-3 shadow-xl backdrop-blur-md animate-rise-in motion-stagger sm:-right-8"
        style={{ "--stagger": 6 } as React.CSSProperties}
      >
        <div className="hero-float [animation-delay:-2s]">
          <span className="flex items-center gap-1.5 text-xs font-semibold">
            <Gauge className="h-3.5 w-3.5 text-primary" />
            {t("score.title")}
          </span>
          <div className="mt-1 flex items-end justify-between">
            <span className="tabular text-3xl font-bold text-primary">{Math.round(score)}</span>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{t("score.band.good")}</span>
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
