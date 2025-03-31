import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './LanguageContext';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import PortraitGenerator from './components/PortraitGenerator';
import './index.css';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/generator" element={<PortraitGenerator />} />
          </Routes>
        </Layout>
      </Router>
    </LanguageProvider>
  );
}

export default App;