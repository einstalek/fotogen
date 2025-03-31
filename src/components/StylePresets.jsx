import React from 'react';
import { Sparkles } from 'lucide-react';
import Tooltip from './Tooltip';

const StylePresets = ({ activePreset, applyPreset, t }) => {
  const presets = [
    { id: 'professional', name: t('presetProfessional') },
    { id: 'vintage', name: t('presetVintage') },
    { id: 'social', name: t('presetSocial') },
    { id: 'custom', name: t('presetCustom') }
  ];

  return (
    <div>
      {/* Section title with tooltip */}
      <div className="flex items-center mb-4">
        <h3 className="text-sm font-medium text-purple-200">
          {t('presetTitle')}
          <Tooltip text={t('presetTip') || 'Choose a preset style for your portrait'} />
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => applyPreset(preset.id)}
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2
              ${activePreset === preset.id
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20 border border-purple-400/50'
                : 'bg-black/20 text-purple-200 hover:bg-black/30 border border-purple-500/30 hover:border-purple-400/50'
              }`}
          >
            {activePreset === preset.id && <Sparkles size={16} className="text-purple-200" />}
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StylePresets; 