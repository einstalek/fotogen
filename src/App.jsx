import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './LanguageContext';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import PortraitGenerator from './components/PortraitGenerator';
import './index.css';
import Footer from './components/Footer';
import DonationsPage from './components/DonationsPage';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/generator" element={<PortraitGenerator />} />
            <Route path="/donate" element={<DonationsPage />} />
          </Routes>
          <Footer />
        </Layout>
      </Router>
    </LanguageProvider>
  );
}

export default App;