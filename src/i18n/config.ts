import i18n, { type BackendModule } from 'i18next';
import { initReactI18next } from 'react-i18next';

const supportedLanguages = ['en', 'de', 'fr', 'es', 'nl', 'it'];

// each language is its own chunk (about 130 kB), so only the one in use is downloaded
const locales = import.meta.glob<Record<string, unknown>>('./locales/*.json', { import: 'default' });

const lazyLocales: BackendModule = {
  type: 'backend',
  init() {},
  read(language, _namespace, callback) {
    const load = locales[`./locales/${language}.json`];
    if (!load) return callback(null, {});
    load().then((data) => callback(null, data), (error) => callback(error, null));
  },
};

// Detect browser language
const getBrowserLanguage = (): string => {
  const browserLang = navigator.language.split('-')[0]; // Get language code without region
  return supportedLanguages.includes(browserLang) ? browserLang : 'en';
};

// resolves once the current language (and the English fallback) is loaded; main.tsx renders after it
export const i18nReady = i18n
  .use(lazyLocales)
  .use(initReactI18next)
  .init({
    lng: getBrowserLanguage(),
    supportedLngs: supportedLanguages,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    // in development, report texts the code asks for but no language file has
    saveMissing: import.meta.env.DEV,
    missingKeyHandler: (_languages, _namespace, key) => console.warn(`[i18n] missing key: ${key}`),
    returnEmptyString: false,
    returnNull: false,
    keySeparator: '.',
    react: {
      useSuspense: false,
    },
  });

export default i18n;
