import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Image, Sliders, Upload, Check } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { translations } from '../translations';
import Header from './Header';
import Footer from './Footer';

const getShuffledIndices = (length) => {
    const indices = Array.from({ length }, (_, i) => i); // Create array [0, 1, 2, ..., length-1]
    return indices.sort(() => Math.random() - 0.5); // Shuffle the array
  };

const LandingPage = () => {
  const { language } = useLanguage();
  const t = translations[language];
  
  // Example images - replace with your actual example images
  const exampleResults = [
    { 
      before: "https://ai-portrait.s3.eu-central-1.amazonaws.com/input/6MQiOUf67h.webp",
      after: "https://ai-portrait.s3.eu-central-1.amazonaws.com/input/MWBXNEV48Z04SVXGYR0HPVCFZMMR57-20250301_1125391024.webp" 
    },
    { 
      before: "https://ai-portrait.s3.eu-central-1.amazonaws.com/input/3RjE7Vnenj.webp",
      after: "https://ai-portrait.s3.eu-central-1.amazonaws.com/input/VptheWnQHT.webp" 
    },
    { 
      before: "https://ai-portrait.s3.eu-central-1.amazonaws.com/input/mCMIjflkAJ.webp",
      after: "https://ai-portrait.s3.eu-central-1.amazonaws.com/input/TNn9nz0kce.webp" 
    }
  ];

  const shuffledIndices = getShuffledIndices(3);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
      <Header />
      
      {/* Hero Section */}
      <section className="py-10 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-3xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {t.heroTitle || "Transform Selfies Into Professional Portraits"}
            </h1>
            <p className="text-lg md:text-xl text-purple-200 mb-8">
              {t.heroSubtitle || "AI-powered portrait generation for stunning, professional-quality photos in seconds."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/generator" 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-md shadow-lg transform transition-all hover:translate-y-px flex items-center justify-center"
              >
                <Camera className="mr-2" size={20} />
                {t.createNow || "Create Now"}
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 mt-8 md:mt-0">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur-lg opacity-75"></div>
              <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 p-4 rounded-lg grid grid-cols-2 gap-4">
                {/* Before image with label */}
                <div className="relative aspect-w-3 aspect-h-4">
                  <img 
                    src={exampleResults[shuffledIndices[0]].before} 
                    alt="Before" 
                    className="object-cover rounded-md w-full h-full"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    {t.beforeLabel || "Before"}
                  </div>
                </div>
                
                {/* After image with label */}
                <div className="relative aspect-w-3 aspect-h-4">
                  <img 
                    src={exampleResults[shuffledIndices[0]].after} 
                    alt="After" 
                    className="object-cover rounded-md w-full h-full"
                  />
                  <div className="absolute bottom-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full">
                    {t.afterLabel || "After"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Examples Section */}
    <section className="py-8 bg-black/20 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            {t.examplesTitle || "Stunning Transformations"}
          </h2>
          <p className="text-lg text-purple-200 text-center mb-8 max-w-3xl mx-auto">
            {t.examplesSubtitle || "See how our AI transforms ordinary photos into professional-quality portraits."}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {shuffledIndices.slice(-2).map( index => (
              <div key={index} className="bg-black/20 backdrop-blur-sm rounded-lg overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all">
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div className="relative">
                    <img 
                      src={exampleResults[index].before} 
                      alt="Before" 
                      className="w-full aspect-square object-cover rounded-md"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                      {t.beforeLabel || "Before"}
                    </div>
                  </div>
                  <div className="relative">
                    <img 
                      src={exampleResults[index].after} 
                      alt="After" 
                      className="w-full aspect-square object-cover rounded-md"
                    />
                    <div className="absolute bottom-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full">
                      {t.afterLabel || "After"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
        </div>
    </section>

    {/* How It Works Section */}
    <section className="py-8 bg-black/30 backdrop-blur-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
        {t.howItWorksTitle || "How It Works"}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Upload size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
            {t.step1Title || "Upload Your Photos"}
            </h3>
            <p className="text-purple-200">
            {t.step1Description || "Simply upload a few selfies or photos of yourself. The more angles and lighting conditions, the better the results."}
            </p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Sliders size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
            {t.step2Title || "Customize Settings"}
            </h3>
            <p className="text-purple-200">
            {t.step2Description || "Choose a portrait style and adjust settings like resemblance and template strength to get the perfect look."}
            </p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Image size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
            {t.step3Title || "Get Professional Results"}
            </h3>
            <p className="text-purple-200">
            {t.step3Description || "Our AI generates stunning professional portraits from your photos in just seconds."}
            </p>
        </div>
        </div>
    </div>
    </section>
      
      <Footer />
    </div>
  );
};

export default LandingPage;