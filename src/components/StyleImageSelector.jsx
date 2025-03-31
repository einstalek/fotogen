// StyleImageSelector.jsx
import React from 'react';
import { Plus, X } from 'lucide-react';
import Tooltip from './Tooltip';

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
  return (
    <div className="mb-5">
      <div className="flex items-center mb-4">
        <h3 className="text-xl font-bold text-white mb-4">3. {t('selectStyle')}
        <Tooltip text={t('selectStyleTip')} />
        </h3>
      </div>

      <div className="flex flex-col gap-4">
        {/* Style Image Uploader */}
        {!styleImage ? (
          <div 
            className="relative cursor-pointer rounded-lg overflow-hidden transition-all flex-shrink-0 w-52 h-52 snap-start border-2 border-dashed border-purple-400/50 bg-gradient-to-br from-white/5 to-purple-500/5 hover:from-white/10 hover:to-purple-500/10"
            onClick={() => styleImageInputRef.current.click()}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-2">
                <Plus className="w-6 h-6 text-purple-300" />
              </div>
              <p className="text-white text-sm font-medium">{t('uploadStyle')}</p>
              <input 
                type="file"
                accept="image/*"
                className="hidden"
                ref={styleImageInputRef}
                onChange={handleStyleImageUpload}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="relative w-52">
              <img 
                src={styleImage.preview} 
                alt={t('styleImage')}
                className="w-52 h-52 object-cover rounded-lg"
              />
              <button 
                onClick={removeStyleImage}
                className="absolute top-2 right-2 bg-red-500 rounded-full p-1"
              >
                <X size={12} className="text-white" />
              </button>
            </div>
            
            {/* Style Weight Slider */}
            <div className="w-52">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={styleWeight}
                onChange={(e) => setStyleWeight(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-xs text-purple-300 mt-1">
                <span>{t('lessStyle')}</span>
                <span>{t('moreStyle')}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StyleImageSelector;