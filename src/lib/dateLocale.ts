import { de, enUS, es, fr, it, nl, type Locale } from "date-fns/locale";

const LOCALES: Record<string, Locale> = { de, en: enUS, es, fr, it, nl };

/** date-fns locale for an i18next language code like "de" or "de-DE". */
export const dateLocale = (language: string | undefined): Locale => LOCALES[(language ?? "en").slice(0, 2)] ?? enUS;
