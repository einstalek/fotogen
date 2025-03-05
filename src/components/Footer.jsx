import React from 'react';
import { useLanguage } from '../LanguageContext';
import { translations } from '../translations';

const Footer = () => {
  const { language } = useLanguage();
  const t = translations[language];
  
  return (
    <footer className="w-full py-8 px-6 bg-black/30 backdrop-blur-lg border-t border-white/10">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Gradient divider */}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
          <div className="flex flex-col items-center">
            <h3 className="text-white text-base font-bold mb-2">{t.quickLinks || "Links"}</h3>
            <ul className="flex space-x-4">
              <li>
                <a href="/" className="text-purple-200 hover:text-white transition-colors text-sm">
                  {t.home || "Home"}
                </a>
              </li>
              <li>
                <a href="/generator" className="text-purple-200 hover:text-white transition-colors text-sm">
                  {t.createPortrait || "Create Portrait"}
                </a>
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col items-center">
            <h3 className="text-white text-base font-bold mb-2">{t.contact || "Contact"}</h3>
            <a 
              href="https://www.linkedin.com/in/alexander-arganaidi/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-purple-200 hover:text-white transition-colors flex items-center text-sm"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="mr-2"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
              LinkedIn
            </a>
          </div>
        </div>
        
        <div className="mt-3 text-center text-purple-200 text-xs opacity-70">
          <p>© 2025 FotoGen </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;