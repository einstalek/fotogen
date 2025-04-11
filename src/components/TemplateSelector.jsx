import React from 'react';
import { Plus, X } from 'lucide-react';
import Tooltip from './Tooltip';

const TemplateSelector = ({
  templateOptions,
  selectedTemplate,
  setSelectedTemplate,
  customTemplate,
  setCustomTemplate,
  customTemplateInputRef,
  handleTemplateUpload,
  t
}) => {
  // Helper function to find a template by ID
  const findTemplateById = (id) => {
    return templateOptions.find(template => template.id === id);
  };

  // Get the selected template object if selectedTemplate is a string ID
  const selectedTemplateObj = typeof selectedTemplate === 'string' 
    ? findTemplateById(selectedTemplate) 
    : selectedTemplate;

  return (
    <div className="mb-5">
      {/* Section title with tooltip */}
      <div className="flex items-center mb-4">
        <h3 className="text-xl font-bold text-white mb-4">2. {t('selectPose')}
          <Tooltip text={t('selectPoseTip')} />
        </h3>
      </div>

      {/* Scrollable container with arrows */}
      <div className="relative group">
        {/* Left scroll arrow */}
        <button 
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-1/2 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-l-md"
          onClick={() => {
            const container = document.getElementById('template-scroller');
            container.scrollBy({ left: -220, behavior: 'smooth' });
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        
        {/* Scrollable container */}
        <div 
          id="template-scroller"
          className="flex gap-5 overflow-x-auto py-2 px-4 scrollbar-hide snap-x"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            scrollSnapType: 'x mandatory'
          }}
        >
          {/* Custom template upload option */}
          <div 
            className="relative cursor-pointer rounded-lg overflow-hidden transition-all flex-shrink-0 w-52 h-52 snap-start border-2 border-dashed border-purple-400/50 bg-gradient-to-br from-white/5 to-purple-500/5 hover:from-white/10 hover:to-purple-500/10"
            onClick={() => customTemplateInputRef.current.click()}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-2">
                <Plus className="w-6 h-6 text-purple-300" />
              </div>
              <p className="text-white text-sm font-medium">{t('uploadCustom')}</p>
              <p className="text-xs text-purple-200">{t('uploadCustomTip')}</p>
              <input 
                type="file"
                accept="image/*"
                className="hidden"
                ref={customTemplateInputRef}
                onChange={handleTemplateUpload}
              />
            </div>
          </div>

          {/* Show custom template if exists */}
          {customTemplate && (
            <div 
              className={`relative cursor-pointer rounded-lg overflow-hidden transition-all flex-shrink-0 w-52 h-52 snap-start ${
                selectedTemplate === 'custom' || (selectedTemplateObj && selectedTemplateObj.id === 'custom')
                  ? 'ring-4 ring-purple-500 shadow-lg shadow-purple-500/200 transform scale-105' 
                  : 'hover:ring-2 hover:ring-purple-300/70'
              }`}
              onClick={() => setSelectedTemplate('custom')}
            >
              <img 
                src={customTemplate.preview} 
                alt={t('uploadCustom')}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-sm p-2">
                {t('uploadCustom')}
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  URL.revokeObjectURL(customTemplate.preview);
                  setCustomTemplate(null);
                  if (selectedTemplate === 'custom' || (selectedTemplateObj && selectedTemplateObj.id === 'custom')) {
                    setSelectedTemplate(templateOptions[0].id);
                  }
                }}
                className="absolute top-2 right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} className="text-white" />
              </button>
            </div>
          )}
          
          {templateOptions.map((template) => (
            <div 
              key={template.id} 
              className={`relative cursor-pointer rounded-lg overflow-hidden transition-all flex-shrink-0 w-52 h-52 snap-start ${
                selectedTemplate === template.id || (selectedTemplateObj && selectedTemplateObj.id === template.id)
                  ? 'ring-4 ring-purple-500 shadow-lg shadow-purple-500/200 transform scale-105' 
                  : 'hover:ring-2 hover:ring-purple-300/70'
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <img 
                src={template.url} 
                alt={template.name}
                className="w-full h-full object-cover"
              />
              {/* <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-sm p-2">
                {template.name}
              </div> */}
            </div>
          ))}
        </div>
        
        {/* Right scroll arrow */}
        <button 
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-1/2 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-r-md"
          onClick={() => {
            const container = document.getElementById('template-scroller');
            container.scrollBy({ left: 220, behavior: 'smooth' });
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
      
      {/* Add scrollbar hiding style */}
      <style>{`
        #template-scroller::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default TemplateSelector;