import { useId, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";

export interface IntradayPoint {
  time: string;
  /** cumulative P&L after this trade */
  value: number;
  label: string;
}

interface IntradayPnlChartProps {
  points: IntradayPoint[];
  formatValue: (v: number) => string;
  height?: number;
  ariaLabel: string;
}

const W = 600;
const PAD = { top: 10, right: 8, bottom: 6, left: 8 };

/**
 * Cumulative P&L through one trading day: a 2px line from 0 at the first trade,
 * area above the zero baseline in the profit color and below it in the loss color.
 * Hovering shows a crosshair with the trade and running total.
 */
export function IntradayPnlChart({ points, formatValue, height = 120, ariaLabel }: IntradayPnlChartProps) {
  const id = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);

  const geo = useMemo(() => {
    const series = [{ time: points[0]?.time, value: 0, label: "" }, ...points];
    const values = series.map((p) => p.value);
    const min = Math.min(0, ...values);
    const max = Math.max(0, ...values);
    const span = max - min || 1;
    const innerW = W - PAD.left - PAD.right;
    const innerH = height - PAD.top - PAD.bottom;
    const x = (i: number) => PAD.left + (series.length === 1 ? innerW / 2 : (i / (series.length - 1)) * innerW);
    const y = (v: number) => PAD.top + ((max - v) / span) * innerH;
    const coords = series.map((p, i) => [x(i), y(p.value)] as const);
    const line = coords.map(([cx, cy], i) => `${i ? "L" : "M"}${cx.toFixed(1)},${cy.toFixed(1)}`).join("");
    const zeroY = y(0);
    const area = `${line}L${coords[coords.length - 1][0].toFixed(1)},${zeroY.toFixed(1)}L${coords[0][0].toFixed(1)},${zeroY.toFixed(1)}Z`;
    return { series, coords, line, area, zeroY };
  }, [points, height]);

  if (points.length === 0) return null;

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0;
    geo.coords.forEach(([cx], i) => {
      if (Math.abs(cx - px) < Math.abs(geo.coords[best][0] - px)) best = i;
    });
    // index 0 is the synthetic start at 0
    setHover(best === 0 ? null : best);
  };

  const hovered = hover !== null ? geo.series[hover] : null;
  const [hx, hy] = hover !== null ? geo.coords[hover] : [0, 0];

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${height}`}
        preserveAspectRatio="none"
        className="block h-auto w-full touch-none"
        style={{ height }}
        role="img"
        aria-label={ariaLabel}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <clipPath id={`above-${id}`}>
            <rect x="0" y="0" width={W} height={geo.zeroY} />
          </clipPath>
          <clipPath id={`below-${id}`}>
            <rect x="0" y={geo.zeroY} width={W} height={height - geo.zeroY} />
          </clipPath>
        </defs>
        <path d={geo.area} clipPath={`url(#above-${id})`} className="fill-chart-profit/20" />
        <path d={geo.area} clipPath={`url(#below-${id})`} className="fill-chart-loss/20" />
        <line x1={PAD.left} x2={W - PAD.right} y1={geo.zeroY} y2={geo.zeroY} className="stroke-muted-foreground/50" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
        <path d={geo.line} clipPath={`url(#above-${id})`} fill="none" className="stroke-chart-profit" strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <path d={geo.line} clipPath={`url(#below-${id})`} fill="none" className="stroke-chart-loss" strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {hovered && (
          <line x1={hx} x2={hx} y1={PAD.top} y2={height - PAD.bottom} className="stroke-foreground/40" vectorEffect="non-scaling-stroke" />
        )}
      </svg>
      {hovered && (
        <>
          {/* marker drawn in HTML so it stays round despite the stretched viewBox */}
          <span
            className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground"
            style={{ left: `${(hx / W) * 100}%`, top: hy }}
          />
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-md border bg-popover px-2.5 py-1.5 text-xs shadow-md"
            style={{ left: `${Math.min(85, Math.max(15, (hx / W) * 100))}%`, top: -8, transform: "translate(-50%, -100%)" }}
          >
            <p className="font-medium">{hovered.label}</p>
            <p className="tabular text-muted-foreground">
              {format(parseISO(hovered.time), "HH:mm")} · Σ {formatValue(hovered.value)}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
