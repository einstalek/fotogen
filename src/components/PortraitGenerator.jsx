import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import TemplateSelector from './TemplateSelector';
import ImageUploader from './ImageUploader';
import StylePresets from './StylePresets';
import PortraitSettings from './PortraitSettings';
import ImageGallery from './ImageGallery';
import CropInterface from './CropInterface';
import usePortraitGenerator from '../hooks/usePortraitGenerator';
import templateOptions from './templateOptions';
import StyleImageSelector from './StyleImageSelector';
import Footer from './Footer';

const PortraitGenerator = () => {
  const { t } = useTranslation();
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const [activePreset, setActivePreset] = useState('professional');

  const {
    // State
    uploadedImages,
    prompt,
    negativePrompt,
    resemblance,
    strength,
    steps,
    usePoseControl,
    selectedTemplate,
    customTemplate,
    generatedImages,
    selectedImage,
    isModalOpen,
    isCropping,
    cropImage,
    isGenerating,
    progress,
    error,

    // Refs
    fileInputRef,
    customTemplateInputRef,
    generateButtonRef,

    // Setters
    setPrompt,
    setNegativePrompt,
    setResemblance,
    setStrength,
    setSteps,
    setUsePoseControl,
    setSelectedTemplate,
    setCustomTemplate,
    setSelectedImage,
    setIsModalOpen,
    setIsCropping,
    setCropImage,

    styleImage,
    setStyleImage,
    styleWeight,
    setStyleWeight,
    styleImageInputRef,
    handleStyleImageUpload,
    removeStyleImage,

    // Functions
    handleFileUpload,
    handleDrop,
    removeImage,
    handleRemoveAll,
    handleTemplateUpload,
    handleCropConfirm,
    cancelCrop,
    generatePortrait,
    clearGeneratedImages,

    modelVersion,
    setModelVersion
  } = usePortraitGenerator(templateOptions);

  const applyPreset = (preset) => {
    setActivePreset(preset);
    switch (preset) {
      case 'professional':
        setPrompt('professional headshot, high quality, sharp focus, studio lighting');
        setNegativePrompt('blurry, low quality, distorted, deformed');
        setResemblance(1.0);
        setStrength(0.2);
        setSteps(13);
        setUsePoseControl(true);
        break;
      case 'vintage':
        setPrompt('vintage portrait, film grain, muted colors, 1970s style');
        setNegativePrompt('digital, modern, sharp, high contrast');
        setResemblance(1.2);
        setStrength(0.2);
        setSteps(11);
        setUsePoseControl(true);
        break;
      case 'social':
        setPrompt('casual social media portrait, natural lighting, candid style');
        setNegativePrompt('formal, posed, artificial lighting, studio');
        setResemblance(1.1);
        setStrength(0.1);
        setSteps(5);
        setUsePoseControl(true);
        break;
      case 'custom':
        // Keep current settings
        break;
      default:
        break;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Image Upload */}
      <div className="mb-8">
        <ImageUploader
          fileInputRef={fileInputRef}
          handleFileUpload={handleFileUpload}
          handleDrop={handleDrop}
          uploadedImages={uploadedImages}
          removeImage={removeImage}
          handleRemoveAll={handleRemoveAll}
          t={t}
        />
      </div>

      {/* Template Selection */}
      <div className="mb-8">
        {/* <h2 className="text-xl font-bold text-white mb-4">2. {t('selectPose')}</h2> */}
        <TemplateSelector
          templateOptions={templateOptions}
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
          customTemplate={customTemplate}
          setCustomTemplate={setCustomTemplate}
          customTemplateInputRef={customTemplateInputRef}
          handleTemplateUpload={handleTemplateUpload}
          isCropping={isCropping}
          setIsCropping={setIsCropping}
          cropImage={cropImage}
          setCropImage={setCropImage}
          handleCropConfirm={handleCropConfirm}
          cancelCrop={cancelCrop}
          t={t}
        />
      </div>

      {/* Style Image Selection */}
      <div className="mb-8">
        <StyleImageSelector
          styleImage={styleImage}
          setStyleImage={setStyleImage}
          styleWeight={styleWeight}
          setStyleWeight={setStyleWeight}
          styleImageInputRef={styleImageInputRef}
          handleStyleImageUpload={handleStyleImageUpload}
          removeStyleImage={removeStyleImage}
          t={t}
        />
      </div>

      {/* Style Presets */}
      {/* <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">3. {t('presetTitle')}</h2>
        <StylePresets
          activePreset={activePreset}
          applyPreset={applyPreset}
          t={t}
        />
      </div> */}

      {/* Portrait Settings */}
      <div className="mb-8">
        <PortraitSettings
          isSettingsExpanded={isSettingsExpanded}
          setIsSettingsExpanded={setIsSettingsExpanded}
          prompt={prompt}
          setPrompt={setPrompt}
          negativePrompt={negativePrompt}
          setNegativePrompt={setNegativePrompt}
          resemblance={resemblance}
          setResemblance={setResemblance}
          strength={strength}
          setStrength={setStrength}
          steps={steps}
          setSteps={setSteps}
          usePoseControl={usePoseControl}
          setUsePoseControl={setUsePoseControl}
          generatePortrait={generatePortrait}
          isGenerating={isGenerating}
          progress={progress}
          uploadedImages={uploadedImages}
          selectedTemplate={selectedTemplate}
          generateButtonRef={generateButtonRef}
          modelVersion={modelVersion}
          setModelVersion={setModelVersion}
          t={t}
        />
      </div>

      {/* Generated Images Gallery */}
      {generatedImages.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">{t('galleryTitle')}</h2>
          <ImageGallery
            generatedImages={[...generatedImages].reverse()}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            t={t}
          />
          <div className="flex justify-center mt-6">
            <button
              onClick={clearGeneratedImages}
              className="px-6 py-2.5 text-sm font-medium text-purple-200 bg-purple-900/30 hover:bg-purple-800/30 
                rounded-lg border border-purple-500/20 hover:border-purple-400/30 transition-all duration-200
                flex items-center gap-2 hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {t('clearGallery')}
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-8">
          {error}
        </div>
      )}

      {/* Crop Interface */}
      <CropInterface
        isCropping={isCropping}
        setIsCropping={setIsCropping}
        cropImage={cropImage}
        setCropImage={setCropImage}
        handleCropConfirm={handleCropConfirm}
        cancelCrop={cancelCrop}
        t={t}
      />
    </div>
  );
};

export default PortraitGenerator;
