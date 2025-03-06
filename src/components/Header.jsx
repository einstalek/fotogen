import React, { useState } from 'react';
import { Camera, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { translations } from '../translations';
import LanguageSelector from './LanguageSelector';

const Header = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className="w-full p-4 border-b border-white/10 bg-black/20 backdrop-blur-lg" style={{ position: 'relative', zIndex: 1000 }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center group">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg p-3 rounded-full shadow-lg border border-white border-opacity-20 group-hover:bg-opacity-20 transition-all">
            <Camera size={28} className="text-purple-200" />
          </div>
          <h1 className="text-4xl font-bold text-white ml-3 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300">
              FotoGen
            </span>
          </h1>
        </Link>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
          >
            {mobileMenuOpen ? (
              <X size={24} className="text-purple-200" />
            ) : (
              <Menu size={24} className="text-purple-200" />
            )}
          </button>
        </div>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-6" style={{ position: 'relative', zIndex: 1001 }}>
          <nav className="flex space-x-6">
            <Link to="/" className="text-purple-200 hover:text-white transition-colors font-medium">
              {t.home || "Home"}
            </Link>
            <Link to="/generator" className="text-purple-200 hover:text-white transition-colors font-medium">
              {t.createPortrait || "Create Portrait"}
            </Link>
          </nav>
          <LanguageSelector />
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="absolute top-[72px] left-0 right-0 bg-black/80 backdrop-blur-lg md:hidden border-b border-white/10" style={{ zIndex: 1000 }}>
            <nav className="flex flex-col p-4">
              <Link 
                to="/" 
                className="text-purple-200 hover:text-white py-3 border-b border-white/10 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.home || "Home"}
              </Link>
              <Link 
                to="/generator" 
                className="text-purple-200 hover:text-white py-3 border-b border-white/10 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.createPortrait || "Create Portrait"}
              </Link>
              <div className="mt-4 flex justify-end" style={{ position: 'relative', zIndex: 1001 }}>
                <LanguageSelector />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;