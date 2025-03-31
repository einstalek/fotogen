import React from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import Tooltip from './Tooltip';

const ImageUploader = ({
  fileInputRef,
  handleFileUpload,
  handleDrop,
  uploadedImages,
  removeImage,
  handleRemoveAll,
  t
}) => {
  const renderImagePreview = () => {
    if (uploadedImages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-4 text-purple-200">
          <ImageIcon size={48} className="mb-2 opacity-50" />
          <p className="text-sm text-center">{t('uploadPhotosTip')}</p>
          <p className="text-sm text-center mt-1">{t('uploadPhotosTipAdd')}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-2 p-2">
        {uploadedImages.map((image, index) => (
          <div key={image.id || index} className="relative group">
            <img 
              src={image.preview} 
              alt={`Preview ${index}`}
              className="w-full h-24 rounded-md object-cover border border-purple-300"
            />
            <button 
              onClick={(e) => {
                e.stopPropagation();
                removeImage(index);
              }}
              className="absolute top-1 right-1 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} className="text-white" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* Section title with tooltip */}
      <div className="flex items-center mb-4">
        <h3 className="text-xl font-bold text-white mb-4">
          1. {t('uploadPhotos')}
          <Tooltip text={t('uploadPhotosTip')} />
        </h3>
      </div>

      {/* Upload area */}
      <div
        className={`relative border-2 border-dashed rounded-lg transition-all cursor-pointer ${
          uploadedImages.length === 0
            ? 'border-purple-400/50 bg-gradient-to-br from-white/5 to-purple-500/5 hover:from-white/10 hover:to-purple-500/10'
            : 'border-purple-500/50 bg-black/20'
        }`}
        onClick={() => fileInputRef.current.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {renderImagePreview()}
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileUpload}
        />
      </div>

      {/* Remove all button */}
      {uploadedImages.length > 0 && (
        <button
          onClick={handleRemoveAll}
          className="mt-2 text-sm text-red-400 hover:text-red-300 transition-colors flex items-center"
        >
          <X size={16} className="mr-1" />
          {t('removeAll')}
        </button>
      )}
    </div>
  );
};

export default ImageUploader; 