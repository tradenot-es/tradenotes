import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import nl from './locales/nl.json';
import it from './locales/it.json';

// Detect browser language
const getBrowserLanguage = (): string => {
  const browserLang = navigator.language.split('-')[0]; // Get language code without region
  const supportedLanguages = ['en', 'de', 'fr', 'es', 'nl', 'it'];
  return supportedLanguages.includes(browserLang) ? browserLang : 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
      fr: { translation: fr },
      es: { translation: es },
      nl: { translation: nl },
      it: { translation: it },
    },
    lng: getBrowserLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    returnEmptyString: false,
    returnNull: false,
    keySeparator: '.',
    react: {
      useSuspense: false,
    },
  })
  .then(() => {
    console.log('i18n initialized:', i18n.isInitialized);
    console.log('Current language:', i18n.language);
    console.log('Available resources:', Object.keys(i18n.store.data));
    console.log('Test translation:', i18n.t('dashboard.maxDrawdown'));
  });

export default i18n;
