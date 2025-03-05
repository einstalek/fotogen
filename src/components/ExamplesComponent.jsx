import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { translations } from '../translations';
import Header from './Header';
import Footer from './Footer';

const ExamplesPage = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [selectedExample, setSelectedExample] = useState(null);
  
  // Example categories with before/after images
  const exampleCategories = [
    {
      name: t.professionalCategory || "Professional",
      description: t.professionalDescription || "Perfect for LinkedIn, corporate websites, and professional applications",
      examples: [
        {
          id: 1,
          before: "https://ai-portrait.s3.eu-central-1.amazonaws.com/input/B9SBQCEPQX8WRGVH5SAZEBTIKC7SCI-20250301_121014.webp",
          after: "https://ai-portrait.s3.eu-central-1.amazonaws.com/input/MWBXNEV48Z04SVXGYR0HPVCFZMMR57-20250301_112539.webp",
          style: t.professionalHeadshot || "Professional Headshot"
        },
        {
          id: 2,
          before: "https://ai-portrait.s3.eu-central-1.amazonaws.com/input/WYPV6LUXZCKCWWWXPSWH2N3W7UCA27-20250301_121251.webp",
          after: "https://ai-portrait.s3.eu-central-1.amazonaws.com/input/Z4L9G1WTTMBXOP0454UM1LW8FOJ95D-20250301_120349.webp",
          style: t.businessFormal || "Business Formal"
        }
      ]
    },
    {
      name: t.casualCategory || "Casual",
      description: t.casualDescription || "Relaxed, natural-looking portraits for social media and personal use",
      examples: [
        {
          id: 3,
          before: "https://ai-portrait.s3.eu-central-1.amazonaws.com/input/BI4UFONFPEED2SLK2E461AY9IUUP2Z-20250301_121511.webp",
          after: "https://ai-portrait.s3.eu-central-1.amazonaws.com/input/WYRV6LUNZCKCWWWXPSWH2N3W7UCA27-20250301_121256.webp",
          style: t.casualPortrait || "Casual Portrait"
        }
      ]
    },
    {
      name: t.creativeCategory || "Creative",
      description: t.creativeDescription || "Artistic and unique portrait styles for standing out",
      examples: [
        {
          id: 4,
          before: "https://ai-portrait.s3.eu-central-1.amazonaws.com/input/MWBXNEV48Z04SVXGYR0HPVCFZMMR57-20250301_112539.webp",
          after: "https://ai-portrait.s3.eu-central-1.amazonaws.com/input/WYPV6LUXZCKCWWWXPSWH2N3W7UCA27-20250301_121251.webp",
          style: t.creativeStyle || "Creative Style"
        }
      ]
    }
  ];

  // Flatten all examples for the full gallery view
  const allExamples = exampleCategories.flatMap(category => category.examples);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
      <Header />
      
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t.examplesPageTitle || "Transform Your Photos"}
            </h1>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto mb-8">
              {t.examplesPageSubtitle || "See what FotoGen can do with these before and after transformations."}
            </p>
            <Link 
              to="/generator" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-md shadow-lg transform transition-all hover:translate-y-px inline-flex items-center"
            >
              <Camera className="mr-2" size={20} />
              {t.createYourPortrait || "Create Your Portrait"}
            </Link>
          </div>
          
          {/* Category Sections */}
          {exampleCategories.map((category) => (
            <section key={category.name} className="mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                {category.name}
              </h2>
              <p className="text-purple-200 mb-6">
                {category.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.examples.map((example) => (
                  <div 
                    key={example.id} 
                    className="bg-black/20 backdrop-blur-sm rounded-lg overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer"
                    onClick={() => setSelectedExample(example)}
                  >
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="relative">
                          <img 
                            src={example.before} 
                            alt={`Before ${example.style}`} 
                            className="w-full aspect-square object-cover rounded-md"
                          />
                          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                            {t.beforeLabel || "Before"}
                          </div>
                        </div>
                        <div className="relative">
                          <img 
                            src={example.after} 
                            alt={`After ${example.style}`} 
                            className="w-full aspect-square object-cover rounded-md"
                          />
                          <div className="absolute bottom-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full">
                            {t.afterLabel || "After"}
                          </div>
                        </div>
                      </div>
                      <p className="text-white font-medium">{example.style}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
          
          {/* Modal for viewing full-size before/after comparison */}
          {selectedExample && (
            <div 
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedExample(null)}
            >
              <div 
                className="bg-black/40 backdrop-blur-md border border-white/20 rounded-lg p-6 max-w-4xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">{selectedExample.style}</h3>
                  <button 
                    className="bg-white/10 hover:bg-white/20 rounded-full p-2 text-white transition-all"
                    onClick={() => setSelectedExample(null)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <img 
                      src={selectedExample.before} 
                      alt={`Before ${selectedExample.style}`} 
                      className="w-full rounded-md"
                    />
                    <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full">
                      {t.beforeLabel || "Before"}
                    </div>
                  </div>
                  <div className="relative">
                    <img 
                      src={selectedExample.after} 
                      alt={`After ${selectedExample.style}`} 
                      className="w-full rounded-md"
                    />
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full">
                      {t.afterLabel || "After"}
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <Link 
                    to="/generator" 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-md shadow-lg transform transition-all hover:translate-y-px inline-flex items-center"
                  >
                    <Camera className="mr-2" size={20} />
                    {t.createYourPortrait || "Create Your Portrait"}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ExamplesPage;