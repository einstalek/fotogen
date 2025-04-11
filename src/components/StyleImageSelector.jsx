// StyleImageSelector.jsx
import React from 'react';
import { Plus, X } from 'lucide-react';
import Tooltip from './Tooltip';
import styleOptions from './styleImageOptions';

import { useLanguage } from '../LanguageContext';
import { translations } from '../translations';

const StyleImageSelector = ({
  styleImage,
  setStyleImage,
  styleWeight,
  setStyleWeight,
  styleImageInputRef,
  handleStyleImageUpload,
  removeStyleImage,
  t
}) => {
  const { language } = useLanguage();
  const tl = translations[language];

  // Helper function to select or deselect a predefined style
  const togglePredefinedStyle = (style) => {
    // If this style is already selected, deselect it
    if (styleImage?.id === style.id) {
      // Reset the style image
      setStyleImage(null);
      // Reset style weight
      setStyleWeight(0.8);
      return;
    }
    
    // Otherwise, select the new style
    // First remove any existing custom style image
    if (styleImage?.preview) {
      URL.revokeObjectURL(styleImage.preview);
    }
    
    // Set the selected style
    setStyleImage({
      id: style.id,
      preview: style.url,
      isPredefined: true // Flag to indicate this is a predefined style
    });
    
    // Reset style weight to a good default
    setStyleWeight(0.8);
  };

  // Find if a predefined style is selected
  const isStyleSelected = (styleId) => {
    return styleImage?.id === styleId;
  };

  return (
    <div className="mb-5">
      <div className="flex items-center mb-4">
        <h3 className="text-xl font-bold text-white mb-4">3. {tl.selectStyle || "Select Style"}
          <Tooltip text={tl.selectStyleTip || "Choose a style for your portrait"} />
        </h3>
      </div>

      {/* Scrollable container with arrows - similar to TemplateSelector */}
      <div className="relative group">
        {/* Left scroll arrow */}
        <button 
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-1/2 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-l-md"
          onClick={() => {
            const container = document.getElementById('style-scroller');
            container.scrollBy({ left: -220, behavior: 'smooth' });
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        
        {/* Scrollable container */}
        <div 
          id="style-scroller"
          className="flex gap-5 overflow-x-auto py-2 px-4 scrollbar-hide snap-x"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            scrollSnapType: 'x mandatory'
          }}
        >
          {/* Custom style upload option */}
          <div 
            className="relative cursor-pointer rounded-lg overflow-hidden transition-all flex-shrink-0 w-52 h-52 snap-start border-2 border-dashed border-purple-400/50 bg-gradient-to-br from-white/5 to-purple-500/5 hover:from-white/10 hover:to-purple-500/10"
            onClick={() => styleImageInputRef.current.click()}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-2">
                <Plus className="w-6 h-6 text-purple-300" />
              </div>
              <p className="text-white text-sm font-medium">{tl.uploadStyle || "Upload Style"}</p>
              {/* <p className="text-xs text-purple-200">{tl.uploadStyleTip || "Use your own style reference"}</p> */}
              <input 
                type="file"
                accept="image/*"
                className="hidden"
                ref={styleImageInputRef}
                onChange={handleStyleImageUpload}
              />
            </div>
          </div>

          {/* Show custom uploaded style if it exists and isn't a predefined one */}
          {styleImage && !styleImage.isPredefined && (
            <div className="relative cursor-pointer rounded-lg overflow-hidden transition-all flex-shrink-0 w-52 h-52 snap-start ring-4 ring-purple-500">
              <img 
                src={styleImage.preview} 
                alt="Custom Style"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-sm p-2">
                {tl.customStyle || "Custom Style"}
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  removeStyleImage();
                }}
                className="absolute top-2 right-2 bg-red-500 rounded-full p-1"
              >
                <X size={12} className="text-white" />
              </button>
            </div>
          )}
          
          {/* Predefined style options */}
          {styleOptions.map((style) => (
            <div 
              key={style.id} 
              className={`relative cursor-pointer rounded-lg overflow-hidden transition-all flex-shrink-0 w-52 h-52 snap-start ${
                isStyleSelected(style.id)
                  ? 'ring-4 ring-purple-500 shadow-lg shadow-purple-500/200 transform scale-105' 
                  : 'hover:ring-2 hover:ring-purple-300/70'
              }`}
              onClick={() => togglePredefinedStyle(style)}
            >
              <img 
                src={style.url} 
                alt={style.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-sm p-2">
                {style.name}
              </div>
              {/* {isStyleSelected(style.id) && (
                <div className="absolute inset-0 bg-purple-500/10 flex items-center justify-center">
                  <div className="bg-purple-500/80 rounded-full p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                </div>
              )} */}
            </div>
          ))}
          
        </div>
        
        {/* Right scroll arrow */}
        <button 
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-1/2 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-r-md"
          onClick={() => {
            const container = document.getElementById('style-scroller');
            container.scrollBy({ left: 220, behavior: 'smooth' });
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
      
      {/* Style Weight Slider - only show when a style is selected */}
      {/* {styleImage && (
        <div className="mt-6 max-w-md">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-purple-200">
              {tl.styleStrength || "Style Strength"}
              <Tooltip text={tl.styleStrengthTip || "Adjust how strongly the style affects your portrait"} />
            </label>
            <span className="text-xs bg-purple-500/30 px-3 py-1 rounded-full text-white">
              {styleWeight < 0.4 ? "Subtle" : styleWeight < 0.8 ? "Balanced" : "Strong"}
            </span>
          </div>
          
          <input
            type="range"
            min="0.2"
            max="1"
            step="0.05"
            value={styleWeight}
            onChange={(e) => setStyleWeight(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-xs text-purple-300 mt-1">
            <span>{tl.lessStyle || "Subtle Effect"}</span>
            <span>{tl.moreStyle || "Strong Effect"}</span>
          </div>
        </div>
      )} */}
      
      {/* Add scrollbar hiding style */}
      <style>{`
        #style-scroller::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default StyleImageSelector;