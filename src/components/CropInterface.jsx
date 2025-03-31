import React from 'react';
import { X } from 'lucide-react';

const CropInterface = ({
  isCropping,
  setIsCropping,
  cropImage,
  setCropImage,
  handleCropConfirm,
  cancelCrop,
  t
}) => {
  if (!isCropping || !cropImage) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative max-w-4xl w-full bg-purple-900/30 rounded-lg p-6 border border-purple-500/30">
        <button
          className="absolute top-4 right-4 text-white hover:text-purple-300 transition-colors"
          onClick={cancelCrop}
          aria-label={t('cancel')}
        >
          <X size={24} />
        </button>
        
        <h3 className="text-xl font-bold text-white mb-4">{t('cropTitle')}</h3>
        
        <div className="relative w-full max-w-lg mx-auto">
          <div className="relative aspect-square">
            <img
              src={cropImage}
              alt={t('imageToCrop')}
              className="w-full h-full object-contain"
            />
            {/* Semi-transparent overlay outside the crop area */}
            <div className="absolute inset-0 bg-black/50">
              {/* Transparent center area */}
              <div className="absolute inset-[0%] bg-transparent border-2 border-white/50 rounded-lg">
                {/* Corner guides */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/50 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/50 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/50 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/50 rounded-br-lg"></div>
              </div>
            </div>
          </div>
          <div className="mt-2 text-sm text-purple-200 text-center">
            {t('cropTip')}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-4">
          <button
            className="px-4 py-2 rounded-md text-white bg-purple-900/50 hover:bg-purple-800/50 transition-colors"
            onClick={cancelCrop}
          >
            {t('cancel')}
          </button>
          <button
            className="px-4 py-2 rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-colors"
            onClick={handleCropConfirm}
          >
            {t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CropInterface;