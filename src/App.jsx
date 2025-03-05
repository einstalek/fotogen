import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './LanguageContext';
import LandingPage from './components/LandingPage';
import PortraitGenerator from './components/PortraitGenerator';
import './index.css';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/generator" element={<PortraitGenerator />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;