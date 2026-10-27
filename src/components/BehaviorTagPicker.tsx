import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface BehaviorTagPickerProps {
  label: string;
  hint?: string;
  options: readonly string[];
  /** i18n prefix, e.g. "behavior.mistakes" → t("behavior.mistakes.fomo") */
  i18nPrefix: string;
  value: string[];
  onChange: (value: string[]) => void;
  tone?: "negative" | "neutral";
}

/** Toggleable chips for tagging a trade with mistakes or emotions. */
export function BehaviorTagPicker({ label, hint, options, i18nPrefix, value, onChange, tone = "neutral" }: BehaviorTagPickerProps) {
  const { t } = useTranslation();
  const toggle = (key: string) =>
    onChange(value.includes(key) ? value.filter((v) => v !== key) : [...value, key]);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium leading-none">{label}</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((key) => {
          const active = value.includes(key);
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(key)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium",
                "transition-[background-color,border-color,color,transform] duration-150 active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? tone === "negative"
                    ? "border-destructive/60 bg-destructive/15 text-foreground"
                    : "border-primary/60 bg-primary/15 text-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
              )}
            >
              {active && <Check className="h-3 w-3" aria-hidden />}
              {t(`${i18nPrefix}.${key}`)}
            </button>
          );
        })}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
