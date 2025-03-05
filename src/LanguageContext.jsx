// Improved LanguageContext.js with both auto-detection and manual switching

import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // First check localStorage for a saved preference
  const savedLanguage = localStorage.getItem('preferredLanguage');
  
  // Initialize state with saved preference or default
  const [language, setLanguage] = useState(savedLanguage || 'en');

  useEffect(() => {
    // Only auto-detect if no saved preference exists
    if (!savedLanguage) {
      detectUserLanguage();
    }
  }, [savedLanguage]);

  const detectUserLanguage = () => {
    // Get browser language
    const browserLang = navigator.language || navigator.userLanguage;
    
    // Check if the language starts with 'ru'
    if (browserLang && browserLang.toLowerCase().startsWith('ru')) {
      setLanguage('ru');
      localStorage.setItem('preferredLanguage', 'ru');
    } else {
      setLanguage('en'); // Default to English
      localStorage.setItem('preferredLanguage', 'en');
    }
  };

  // Update language and save to localStorage
  const setLanguageWithStorage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: setLanguageWithStorage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);