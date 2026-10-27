// Screenshots of the app per UI language (src/assets/screens/<lang>/<name>.webp,
// made by scripts/screenshots.mjs). Only the URLs are bundled; images load when shown.
import { useTranslation } from "react-i18next";

const SHOTS = import.meta.glob<string>("/src/assets/screens/*/*.webp", { eager: true, import: "default" });

export type ScreenName =
  | "hero-dashboard"
  | "discipline-score"
  | "equity"
  | "calendar"
  | "trades"
  | "trade-dialog"
  | "position-calc"
  | "days"
  | "import"
  | "rules"
  | "reports-overview"
  | "reports-accounts"
  | "reports-setup"
  | "reports-time"
  | "reports-behavior"
  | "reports-symbols"
  | "reports-risk"
  | "reports-simulator"
  | "reports-rules"
  | "consistency"
  | "streaks"
  | "holding";

export function screenUrl(name: ScreenName, lang: string): string {
  return SHOTS[`/src/assets/screens/${lang}/${name}.webp`] ?? SHOTS[`/src/assets/screens/en/${name}.webp`];
}

/** Returns a lookup for the current UI language, falling back to English. */
export function useScreens() {
  const { i18n } = useTranslation();
  const lang = (i18n.resolvedLanguage ?? i18n.language ?? "en").slice(0, 2);
  return (name: ScreenName) => screenUrl(name, lang);
}
