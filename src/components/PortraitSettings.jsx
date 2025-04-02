import React from 'react';
import { Sliders, Camera } from 'lucide-react';
import Tooltip from './Tooltip';

const PortraitSettings = ({
  isSettingsExpanded,
  setIsSettingsExpanded,
  prompt,
  setPrompt,
  negativePrompt,
  setNegativePrompt,
  resemblance,
  setResemblance,
  strength,
  setStrength,
  steps,
  setSteps,
  usePoseControl,
  setUsePoseControl,
  modelVersion,
  setModelVersion,
  generatePortrait,
  isGenerating,
  progress,
  uploadedImages,
  selectedTemplate,
  generateButtonRef,
  t
}) => {
  return (
    <div>
      {/* Clickable header */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
      >
        <h2 className="text-xl font-bold text-white flex items-center">
          <Sliders className="mr-2 text-purple-300" size={20} />
          4. {t('settings')}
        </h2>
        <div className="p-2 rounded-full hover:bg-white/10 transition-colors">
          {isSettingsExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
              <path d="m18 15-6-6-6 6"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          )}
        </div>
      </div>
      
      {/* Collapsible content */}
      {isSettingsExpanded && (
        <div className="mt-4 bg-black/20 rounded-lg p-4 border border-purple-500/30">
          {/* Text inputs */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-1">
                {t('positivePrompt')}
                <Tooltip text={t('positivePromptTip') || 'Describe what you want to see in your portrait'} />
              </label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t('positivePromptExample')}
                className="w-full bg-black/30 text-white border border-purple-500/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-1">
                {t('negativePrompt')}
                <Tooltip text={t('negativePromptTip') || 'Describe what you want to avoid in your portrait'} />
              </label>
              <input
                type="text"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder={t('negativePromptExample')}
                className="w-full bg-black/30 text-white border border-purple-500/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent placeholder-gray-500"
              />
            </div>
          </div>

          {/* Model Version Toggle */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-purple-200 mb-2">
              {t('modelVersionTitle') || 'Model Version'}
              <Tooltip text={t('modelVersionTip')} />
            </label>
            <div className="flex bg-black/30 rounded-lg p-1 border border-purple-500/30">
              <button
                onClick={() => setModelVersion(0)}
                className={`flex-1 py-2 rounded-md transition-colors text-sm font-medium ${
                  modelVersion === 0
                    ? 'bg-purple-500 text-white' 
                    : 'text-purple-200 hover:bg-purple-500/20'
                }`}
              >
                V1
              </button>
              <button
                onClick={() => setModelVersion(1)}
                className={`flex-1 py-2 rounded-md transition-colors text-sm font-medium ${
                  modelVersion === 1
                    ? 'bg-purple-500 text-white' 
                    : 'text-purple-200 hover:bg-purple-500/20'
                }`}
              >
                V2
              </button>
            </div>
          </div>

          {/* Sliders */}
          <div className="grid grid-rows-3 gap-4">
            {/* Resemblance slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-purple-200">
                  {t('resemblanceTitle')}
                  <Tooltip text={t('resemblanceTip')} />
                </label>
                <span className="text-xs bg-purple-500/30 px-3 py-1 rounded-full text-white">
                  {resemblance < 1. ? t('resemblanceScaleStart') : resemblance < 1.3 ? t('resemblanceScaleLeft') : t('resemblanceScaleRight')}
                </span>
              </div>
              <input
                type="range"
                min="0.9"
                max="1.6"
                step="0.05"
                value={resemblance}
                onChange={(e) => setResemblance(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-purple-300">{t('resemblanceLeft')}</span>
                <span className="text-xs text-purple-300">{t('resemblanceRight')}</span>
              </div>
            </div>
            
            {/* Template Strength slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-purple-200">
                  {t('templateTitle')}
                  <Tooltip text={t('templateTip')} />
                </label>
                <span className="text-xs bg-purple-500/30 px-3 py-1 rounded-full text-white">
                  {strength < 0.1 ? t('templateScaleStart') : strength < 0.3 ? t('templateScaleLeft') : t('templateScaleRight')}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="0.3"
                step="0.05"
                value={strength}
                onChange={(e) => setStrength(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-purple-300">{t('templateScaleLeft')}</span>
                <span className="text-xs text-purple-300">{t('templateScaleRight')}</span>
              </div>
            </div>

            {/* Steps slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-purple-200">
                  {t('stepsTitle')}
                  <Tooltip text={t('stepsTip')} />
                </label>
                <span className="text-xs bg-purple-500/30 px-3 py-1 rounded-full text-white">
                  {steps <= 7 ? t('stepsScaleStart') : steps <= 12 ? t('stepsScaleLeft') : t('stepsScaleRight')}
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="15"
                step="1"
                value={steps}
                onChange={(e) => setSteps(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-purple-300">{t('stepsLeft')}</span>
                <span className="text-xs text-purple-300">{t('stepsRight')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate button - always visible */}
      <div className="mt-6">
        <button
          ref={generateButtonRef}
          onClick={generatePortrait}
          disabled={!selectedTemplate || uploadedImages.length === 0 || isGenerating}
          className={`w-full py-5 px-4 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all
            ${(!selectedTemplate || uploadedImages.length === 0)
              ? 'bg-purple-900/100 cursor-not-allowed'
              : isGenerating
              ? 'bg-purple-600/50 cursor-wait'
              : 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-400 hover:via-pink-400 hover:to-purple-500 transform hover:translate-y-px shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50'
            }`}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white" />
              {t('generating')} {progress}%
            </>
          ) : (
            <>
              <Camera size={20} />
              {t('generateButton')}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PortraitSettings; 