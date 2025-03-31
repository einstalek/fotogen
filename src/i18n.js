import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from './translations';

// Get initial language from localStorage or default to 'en'
const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: translations.en
      },
      ru: {
        translation: translations.ru
      }
    },
    lng: savedLanguage, // Use saved language or default to 'en'
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 