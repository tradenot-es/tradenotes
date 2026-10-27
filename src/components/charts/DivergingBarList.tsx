import { cn } from "@/lib/utils";

export interface DivergingBarItem {
  key: string;
  label: string;
  value: number;
  /** secondary line under the label, e.g. "12 Trades · 33 % Trefferquote" */
  detail?: string;
}

interface DivergingBarListProps {
  items: DivergingBarItem[];
  formatValue: (v: number) => string;
  /** accessible name of the list */
  label: string;
}

/**
 * Horizontal bars around a zero baseline: losses grow left in the loss color,
 * profits grow right in the profit color. Sign, side of the baseline and the
 * signed value label carry the meaning too, so it never relies on red/green alone.
 */
export function DivergingBarList({ items, formatValue, label }: DivergingBarListProps) {
  const max = Math.max(1, ...items.map((i) => Math.abs(i.value)));

  return (
    <ul className="space-y-3" aria-label={label}>
      {items.map((item, i) => {
        const share = (Math.abs(item.value) / max) * 50;
        const negative = item.value < 0;
        return (
          <li
            key={item.key}
            className="grid grid-cols-[minmax(7rem,11rem)_1fr_auto] items-center gap-3 animate-rise-in motion-stagger"
            style={{ "--stagger": i } as React.CSSProperties}
            title={`${item.label}: ${formatValue(item.value)}${item.detail ? ` · ${item.detail}` : ""}`}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{item.label}</p>
              {item.detail && <p className="truncate text-xs text-muted-foreground">{item.detail}</p>}
            </div>
            <div className="relative h-3 rounded-full bg-chart-track" aria-hidden>
              {/* zero baseline */}
              <div className="absolute inset-y-[-3px] left-1/2 w-px bg-muted-foreground/40" />
              <div
                className={cn(
                  "absolute inset-y-0 rounded-full animate-grow-x motion-stagger",
                  negative ? "right-1/2 origin-right bg-chart-loss" : "left-1/2 origin-left bg-chart-profit",
                )}
                style={{ width: `${share}%`, "--stagger": i } as React.CSSProperties}
              />
            </div>
            <span className="tabular w-24 text-right text-sm font-semibold">
              {item.value > 0 ? "+" : ""}
              {formatValue(item.value)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
