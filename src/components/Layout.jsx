import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Camera, Menu, X } from 'lucide-react';
import LanguageSelector from './LanguageSelector';

const Layout = ({ children }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <div className="bg-white bg-opacity-10 backdrop-blur-lg p-3 rounded-full shadow-lg border border-white border-opacity-20 group-hover:bg-opacity-20 transition-all">
                <Camera size={28} className="text-purple-200" />
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-white ml-3 tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300">
                  FotoGen
                </span>
              </h1>
            </Link>

            {/* Desktop Navigation and Language Selector */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Navigation Links */}
              <Link
                to="/"
                className={`text-lg font-medium transition ${
                  location.pathname === '/'
                    ? 'text-white'
                    : 'text-purple-200 hover:text-white'
                }`}
              >
                {t('home')}
              </Link>
              <Link
                to="/generator"
                className={`text-lg font-medium transition ${
                  location.pathname === '/generator'
                    ? 'text-white'
                    : 'text-purple-200 hover:text-white'
                }`}
              >
                {t('createPortrait')}
              </Link>
              <Link
                to="/donate"
                className={`text-lg font-medium transition ${
                  location.pathname === '/donate'
                    ? 'text-white'
                    : 'text-purple-200 hover:text-white'
                }`}
              >
                Donate
              </Link>

              {/* Language Selector */}
              <LanguageSelector />
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <LanguageSelector />
              <button
                onClick={toggleMobileMenu}
                className="ml-2 p-2 rounded-md text-purple-200 hover:text-white focus:outline-none"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/40 backdrop-blur-md border-t border-white/10">
            <div className="px-4 pt-2 pb-4 space-y-1 sm:px-6">
              <Link
                to="/"
                className={`block py-2 px-4 text-base font-medium rounded-md ${
                  location.pathname === '/'
                    ? 'bg-purple-800/50 text-white'
                    : 'text-purple-200 hover:bg-purple-800/30 hover:text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('home')}
              </Link>
              <Link
                to="/generator"
                className={`block py-2 px-4 text-base font-medium rounded-md ${
                  location.pathname === '/generator'
                    ? 'bg-purple-800/50 text-white'
                    : 'text-purple-200 hover:bg-purple-800/30 hover:text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('createPortrait')}
              </Link>
              <Link
                to="/donate"
                className={`block py-2 px-4 text-base font-medium rounded-md ${
                  location.pathname === '/donate'
                    ? 'bg-purple-800/50 text-white'
                    : 'text-purple-200 hover:bg-purple-800/30 hover:text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Donate
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout;