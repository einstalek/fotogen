import React, { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Language options configuration
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ru', label: 'Русский' }
  ];
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Get current language label
  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium
          bg-black/30 hover:bg-black/50 text-white ring-1 ring-white/10 
          transition-all duration-200 hover:ring-purple-400/50"
        aria-label="Select language"
      >
        <Globe size={16} className="text-purple-300" />
        <span>{currentLanguage.code.toUpperCase()}</span>
      </button>
      
      {isOpen && (
        <div className="fixed right-auto mt-2 py-1 bg-black/30 backdrop-blur-md rounded-lg 
          shadow-xl border border-purple-500/20 z-[9999] w-25
          animate-in fade-in duration-200">
          <div className="flex flex-col">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-2 text-sm transition-all duration-150
                  ${language === lang.code 
                    ? 'bg-gradient-to-r from-purple-600 to-purple-400 text-white font-medium' 
                    : 'text-gray-200 hover:bg-white/10 hover:text-purple-200'
                  }`}
              >
                <span>{lang.label}</span>
                {language === lang.code && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white ml-2"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;