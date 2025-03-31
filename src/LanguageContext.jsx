import React, { createContext, useState, useContext, useEffect } from 'react';
import i18n from 'i18next';

// Create the Language Context
const LanguageContext = createContext();

// Language Provider Component
export function LanguageProvider({ children }) {
  // Get the initial language from localStorage or default to 'en'
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    return savedLanguage || 'en';
  });

  // Update localStorage and i18next when language changes
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
    i18n.changeLanguage(language);
  }, [language]);

  // Context value to be provided
  const value = {
    language,
    setLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use the language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}