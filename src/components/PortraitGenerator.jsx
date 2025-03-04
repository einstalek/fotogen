import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Camera, Loader2, ImageIcon, Sliders } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { translations } from '../translations';

const Tooltip = ({ text }) => (
  <div className="relative inline-block" >
      <span className="relative text-gray-300 bg-gray-700 px-2 py-1 text-xs font-bold rounded-full ml-2 cursor-pointer hover:bg-gray-600 transition group">
          ?
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-32 bg-gray-800 text-white text-xs rounded-md px-2 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg z-50 text-center break-words">
              {text}
          </div>
      </span>
  </div>
);

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div className="language-selector">
      <div className="ml-auto flex gap-1">
        <button 
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
            language === 'en' 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
              : 'bg-black/20 backdrop-blur-sm text-purple-200 hover:bg-black/30'
          }`}
        >
          EN
        </button>
        <button 
          onClick={() => setLanguage('ru')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
            language === 'ru' 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
              : 'bg-black/20 backdrop-blur-sm text-purple-200 hover:bg-black/30'
          }`}
        >
          RU
        </button>
      </div>
    </div>
  );
};

const PortraitGenerator = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [strength, setStrength] = useState(0.7);
  const [resemblance, setResemblance] = useState(1.2);
  const [steps, setSteps] = useState(5);
  const [jobId, setJobId] = useState(null);
  const [error, setError] = useState(null);
  const [templateUrl, setTemplateUrl] = useState('');
  const fileInputRef = useRef(null);
  const templateInputRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [progress, setProgress] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const generateButtonRef = useRef(null);

  const toggleSettings = () => {
    setIsSettingsExpanded(!isSettingsExpanded);
  };

  const templateOptions = [
    { id: 1, url: 'https://ai-portrait.s3.eu-central-1.amazonaws.com/input/B9SBQCEPQX8WRGVH5SAZEBTIKC7SCI-20250301_121014.webp', name: 'Professional Headshot' },
    { id: 2, url: 'https://ai-portrait.s3.eu-central-1.amazonaws.com/input/BI4UFONFPEED2SLK2E461AY9IUUP2Z-20250301_121511.webp', name: 'Casual Portrait' },
    { id: 3, url: 'https://ai-portrait.s3.eu-central-1.amazonaws.com/input/MWBXNEV48Z04SVXGYR0HPVCFZMMR57-20250301_112539.webp', name: 'Creative Style' },
    { id: 4, url: 'https://ai-portrait.s3.eu-central-1.amazonaws.com/input/WYPV6LUXZCKCWWWXPSWH2N3W7UCA27-20250301_121251.webp', name: 'Formal Business' },
    { id: 5, url: 'https://ai-portrait.s3.eu-central-1.amazonaws.com/input/WYRV6LUNZCKCWWWXPSWH2N3W7UCA27-20250301_121256.webp', name: 'Artistic Portrait'},
    {id: 6, url: 'https://ai-portrait.s3.eu-central-1.amazonaws.com/input/Z4L9G1WTTMBXOP0454UM1LW8FOJ95D-20250301_120349.webp', name: ''}
  ];

  let backendURI;
  if (import.meta.env.DEV) {
    backendURI = import.meta.env.VITE_BACKEND_URI;
  } 
  else {
    backendURI = '';  // Empty string for relative paths
  }

  useEffect(() => {
    // Set the first template (or any other) as default
    setSelectedTemplate(templateOptions[0]);  // Index 0 for first template
  }, []); // Empty dependency array ensures it runs once on component mount

  useEffect(() => {
    return () => {
      uploadedImages.forEach(image => URL.revokeObjectURL(image.preview));
    };
  }, [uploadedImages]);

  // When photos uploaded, scroll to generate
  useEffect(() => {
    if (uploadedImages.length > 0 && generateButtonRef.current) {
      generateButtonRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [uploadedImages]);

  useEffect(() => {
    if (generatedImages.length > 0 && document.getElementById('gallery-section')) {
      document.getElementById('gallery-section').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [generatedImages]);

  useEffect(() => {
    let timer;
    let startTime;
    
    if (isGenerating) {
      startTime = Date.now();
      // Update every 100ms for smooth animation
      timer = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const totalDuration = 120000; // 2 minutes
        
        // Calculate progress percentage (0-100)
        const newProgress = Math.min(Math.floor((elapsedTime / totalDuration) * 100), 99);
        
        // Don't reach 100% automatically - that will happen when the job completes
        if (newProgress < 100) {
          setProgress(newProgress);
        }
      }, 100);
    } else {
      // Reset progress when generation is complete or cancelled
      setProgress(0);
    }
  
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isGenerating]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const newImages = files.map(file => ({
      file,
      id: Date.now() + Math.random().toString(36).substring(2),
      preview: URL.createObjectURL(file)
    }));
    setUploadedImages(prevImages => [...prevImages, ...newImages]);
    // Clear the input so the same file can be uploaded again if needed
    e.target.value = null;
    };

    // const handleTemplateUpload = (e) => {
    //     const file = e.target.files[0];
    //     if (!file) return;
    
    //     setTemplateUrl({
    //         file: file,  
    //         preview: URL.createObjectURL(file)  // Generate a temporary preview URL
    //     });
    
    //     e.target.value = null;
    // };

  const removeImage = (index) => {
    // Create a copy of the array first
    const updatedImages = [...uploadedImages];
    
    // Remove object URL to prevent memory leaks
    URL.revokeObjectURL(updatedImages[index].preview);
    
    // Remove the image at specified index
    updatedImages.splice(index, 1);
    
    // Set the new array
    setUploadedImages(updatedImages);
  };

  const uploadImageToServer = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${backendURI}/api/upload-image`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Failed to upload image');
      
      const data = await response.json();
      return data.imageUrl;
    } catch (err) {
      throw new Error('Image upload failed: ' + err.message);
    }
  };

  const generatePortrait = async () => {
    // if (uploadedImages.length === 0 || !templateUrl) {
    //   setError("Please upload both reference photos and a template image");
    //   return;
    // }

    if (uploadedImages.length === 0 || !selectedTemplate) {
      setError("Please upload reference photos and select a template");
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // First upload all images to get their URLs
      const uploadPromises = uploadedImages.map(image => uploadImageToServer(image.file));
      // const uploadedTemplatePromise = uploadImageToServer(templateUrl.file);
      
      const selfieUrls = await Promise.all(uploadPromises);
      // const templateUrlOnServer = await uploadedTemplatePromise;
      
      // Now submit the job to RunPod
      const response = await fetch(`${backendURI}/api/submit-runpod-job`, { // Explicit full URL
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            // template_url: templateUrlOnServer,
            template_url: selectedTemplate.url,
            selfie_urls: selfieUrls,
            prompt: prompt || "professional portrait photo, highly detailed",
            negative_prompt: negativePrompt,
            resemblance: resemblance,
            cn_strength: strength,
            steps: steps // Ensure it's an array
        })
        });
      
      if (!response.ok) throw new Error('Failed to submit job');
      
      const data = await response.json();
      setJobId(data.id);
      
      // Poll for job completion
      await checkJobStatus(data.id);
      
    } catch (err) {
      setError(err.message);
      setIsGenerating(false);
    }
  };

  const checkJobStatus = async (id) => {
    try {
        const response = await fetch(`${backendURI}/api/check-runpod-job/${id}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response from backend:', errorText);
            throw new Error(`Failed to check job status: ${errorText}`);
        }

        const data = await response.json();

        if (data.status === 'COMPLETED') {
            const cleanUrl = data.output[0].split('?')[0];
            setGeneratedImages(prev => [cleanUrl, ...prev]); 
            setIsGenerating(false);
            setProgress(100); // Add this line for progress completion
        } else if (data.status === 'FAILED') {
            throw new Error('Job failed: ' + (data.error || 'Unknown error'));
        } else {
            setTimeout(() => checkJobStatus(id), 3000);
        }
    } catch (err) {
        console.error('Error while checking job status:', err.message);
        setError(err.message);
        setIsGenerating(false);
    }
};

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const newImages = files.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setUploadedImages(prevImages => [...prevImages, ...newImages]);
    }
  };

  const renderImagePreview = () => {
    if (uploadedImages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-4 text-purple-200">
          <ImageIcon size={48} className="mb-2 opacity-50" />
          <p className="text-sm text-center">{t.noReferencePhotos}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-2 p-2">
        {uploadedImages.map((image, index) => (
          <div key={image.id} className="relative group">
            <img 
              src={image.preview} 
              alt={`Preview ${index}`}
              className="w-full h-24 rounded-md object-cover border border-purple-300"
            />
            <button 
              onClick={() => removeImage(uploadedImages.indexOf(image))}
              className="absolute top-1 right-1 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} className="text-white" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderTemplateOptions = () => {
    return (
      <div className="mb-5"> 
        {/* Scrollable container with arrows */}
        <div className="relative group">
          {/* Left scroll arrow */}
          <button 
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-20 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-l-md"
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
            className="flex gap-3 overflow-x-auto py-2 px-4 scrollbar-hide snap-x"
            style={{ 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              scrollSnapType: 'x mandatory'
            }}
          >
            {templateOptions.map((template) => (
              <div 
                key={template.id} 
                className={`relative cursor-pointer rounded-lg overflow-hidden transition-all flex-shrink-0 w-52 snap-start ${
                  selectedTemplate && selectedTemplate.id === template.id 
                    ? 'ring-4 ring-purple-500 shadow-lg shadow-purple-500/200 transform scale-105' 
                    : 'hover:ring-2 hover:ring-purple-300/70'
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <img 
                  src={template.url} 
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          
          {/* Right scroll arrow */}
          <button 
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-20 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-r-md"
            onClick={() => {
              const container = document.getElementById('template-scroller');
              container.scrollBy({ left: 220, behavior: 'smooth' });
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
        
        {/* Add scrollbar hiding style */}
        <style jsx>{`
          #template-scroller::-webkit-scrollbar {
            display: none;
          }
        `}</style>

      </div>
    );
  };

    const renderResult = () => {
    if (!resultImage) return null;

    return (
        <div className="mt-6 flex flex-col items-center">
            <h2 className="text-lg font-bold text-white mb-2">Generated Portrait</h2>
            
            {/* Thumbnail Image */}
            <div className="relative group cursor-pointer" onClick={() => setIsModalOpen(true)}>
                <img 
                    src={resultImage} 
                    alt="Generated Portrait"
                    className="w-40 h-40 object-cover rounded-md border border-purple-300 transition-transform transform hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm">{t.clickToView}</p>
                </div>
            </div>

            {/* Modal for Full-Size Image */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
                    <div className="relative bg-white p-4 rounded-lg shadow-lg max-w-4xl w-full">
                        <button 
                            className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-lg"
                            onClick={() => setIsModalOpen(false)}
                        >
                            ✖
                        </button>
                        <img 
                            src={resultImage} 
                            alt="Full-size Generated Portrait"
                            className="w-full max-h-[80vh] object-contain rounded-md"
                        />
                    </div>
                </div>
            )}
        </div>
        );
    };

    const renderGallery = () => {
        if (generatedImages.length === 0) return null;
    
        return (
            <div id="gallery-section" className="mt-6">
                <h2 className="text-lg font-bold text-white mb-2 flex items-center">
                    <ImageIcon className="mr-2 text-purple-300" size={20} />
                    {t.galleryTitle}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {generatedImages.map((img, index) => (
                        <div 
                            key={index} 
                            className="relative group cursor-pointer overflow-hidden rounded-lg"
                            onClick={() => {
                                setSelectedImage(img);
                                setIsModalOpen(true);
                            }}
                        >
                            <img 
                                src={img} 
                                alt={`Generated ${index}`} 
                                className="w-full h-40 object-cover transition-transform duration-500 transform hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3">
                                <p className="text-white text-sm font-medium">View Full Size</p>
                            </div>
                        </div>
                    ))}
                </div>
    
                {/* Modal for Full-Size Image */}
                {isModalOpen && selectedImage && (
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50"
                        onClick={() => setIsModalOpen(false)}
                        onKeyDown={(e) => { if (e.key === "Escape") setIsModalOpen(false); }}
                        tabIndex={0}
                    >
                        <div 
                            className="relative bg-transparent p-0 rounded-lg max-w-4xl w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-center items-center w-full h-full">
                                <img 
                                    src={selectedImage} 
                                    alt="Full-size Generated Portrait"
                                    className="max-h-[70vh] w-auto object-contain rounded-md"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 p-4 absolute top-0 left-0 right-0 bottom-0 overflow-auto">
      <div className="max-w-2xl mx-auto w-full pb-8">
        {/* Header */}
        <header className="flex items-center w-full mb-6 pt-4">
        <div className="flex items-center">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg p-3 rounded-full shadow-lg border border-white border-opacity-20">
            <Camera size={28} className="text-purple-200" />
          </div>
          <h1 className="text-4xl font-bold text-white ml-3 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300">
              FotoGen
            </span>
          </h1>
        </div>
        
        <div className="ml-auto flex gap-1">
          {/* Language buttons */}
        </div>
        <LanguageSelector/>
      </header>

        {/* Main container */}
        <div className="bg-black bg-opacity-30 backdrop-blur-lg rounded-xl shadow-2xl border border-white border-opacity-10 overflow-hidden">
          {/* Top section */}
          <div className="p-6">

            {/* Template selection section */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-white mb-3"> 
                1. {t.selectPose}
                <Tooltip text={t.selectPoseTip} />
                </h3>
              {renderTemplateOptions()}              
            </div>
            
            {/* Reference photos section */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-white mb-3">
                2. {t.uploadPhotos}
              </h3>
            </div>
            
            {/* Upload area */}
            <div 
              className="border-2 border-dashed border-purple-400/50 rounded-lg bg-gradient-to-br from-white/5 to-purple-500/5 p-1 cursor-pointer hover:from-white/10 hover:to-purple-500/10 transition-all"
              onClick={() => fileInputRef.current.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center p-2">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-3">
                  <Upload className="w-8 h-8 text-purple-300" />
                </div>
                <p className="text-white font-medium mb-1"> {t.uploadPhotosTip} </p>
                <p className="text-sm text-purple-200">{t.uploadPhotosTipAdd}</p>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
              </div>
            </div>

            {/* Image previews */}
            <div className="mt-4">
              {renderImagePreview()}

            {/* Remove All Button */}
            {uploadedImages.length > 0 && (
                <button 
                    onClick={() => setUploadedImages([])}
                    className="mt-2 text-white px-4 py-2 rounded-md text-sm font-medium transition bg-gradient-to-r from-purple-600/70 to-pink-600/70 hover:translate-y-px"
                >
                    {t.removeAll}
                </button>
            )}
            
            </div>

            {/* Error message */}
            {error && (
              <div className="mt-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-md">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}
          </div>

         {/* Bottom section - Portrait Settings */}
        <div className="bg-black bg-opacity-40 p-6 border-t border-white border-opacity-10">
          {/* Clickable header */}
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={toggleSettings}
          >
            <h2 className="text-xl font-bold text-white flex items-center">
              <Sliders className="mr-2 text-purple-300" size={20} />
              {t.settings}
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
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">{t.positivePrompt}</label>
                <textarea
                  className="w-full p-3 rounded-md bg-purple-900/30 text-white text-sm border border-purple-500/30 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-600 focus:outline-none transition-all shadow-inner backdrop-blur-sm placeholder-purple-300/50"
                  rows="3"
                  placeholder={t.positivePromptExample}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">{t.negativePrompt}</label>
                <textarea
                  className="w-full p-3 rounded-md bg-purple-900/30 text-white text-sm border border-purple-500/30 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-600 focus:outline-none transition-all shadow-inner backdrop-blur-sm placeholder-purple-300/50"
                  rows="3"
                  placeholder={t.negativePromptExample}
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                />
              </div>
              
              <div className="grid grid-rows-3 gap-4">
                {/* Resemblance slider with descriptive labels */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-purple-200">
                      {t.resemblanceTitle}
                      <Tooltip text={t.resemblanceTip}/>
                    </label>
                    <span className="text-xs bg-purple-500/30 px-3 py-1 rounded-full text-white">
                      {resemblance < 0.7 ? t.resemblanceScaleStart : resemblance < 1.4 ? t.resemblanceScaleLeft : t.resemblanceScaleRight}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.7"
                    step="0.1"
                    value={resemblance}
                    onChange={(e) => setResemblance(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-purple-300">{t.resemblanceLeft}</span>
                    <span className="text-xs text-purple-300">{t.resemblanceRight}</span>
                  </div>
                </div>
                
                {/* Template Strength slider with descriptive labels */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-purple-200">
                      {t.templateTitle}
                      <Tooltip text={t.templateTip} />
                    </label>
                    <span className="text-xs bg-purple-500/30 px-3 py-1 rounded-full text-white">
                      {strength < 0.7 ? t.templateScaleStart : strength < 1.3 ? t.templateScaleLeft : t.templateScaleRight}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={strength}
                    onChange={(e) => setStrength(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-purple-300">{t.templateLeft}</span>
                    <span className="text-xs text-purple-300">{t.templateRight}</span>
                  </div>
                </div>

                {/* Steps slider with descriptive labels */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-purple-200">
                      {t.stepsTitle}
                      <Tooltip text={t.stepsTip}/>
                    </label>
                    <span className="text-xs bg-purple-500/30 px-3 py-1 rounded-full text-white">
                      {steps <= 6 ? t.stepsScaleStart : steps <= 9 ? t.stepsScaleLeft : t.stepsScaleRight}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="12"
                    step="1"
                    value={steps}
                    onChange={(e) => setSteps(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-purple-300">{t.stepsLeft}</span>
                    <span className="text-xs text-purple-300">{t.stepsRight}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Generate button - OUTSIDE the collapsible area */}
          <div ref={generateButtonRef} className="mt-6">
            <button
              className="w-full py-4 px-4 rounded-md text-white font-semibold shadow-lg transition-all backdrop-filter backdrop-blur-sm bg-gradient-to-r from-purple-600/100 to-pink-600/100 hover:from-purple-700/90 hover:to-pink-700/90 transform hover:translate-y-px flex items-center justify-center"
              onClick={generatePortrait}
              disabled={uploadedImages.length === 0 || !selectedTemplate || isGenerating}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center">
                  {/* <Loader2 className="animate-spin mr-2" size={20} /> */}
                  {t.generating}
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  {/* <Camera className="mr-2" size={20} /> */}
                  {t.generateButton}
                </span>
              )}
            </button>
          </div>

          {/* Progress indicator for generation */}
          {isGenerating && (
          <div className="mt-4 bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
            <div className="flex items-center justify-center mb-2">
              <Loader2 className="animate-spin mr-2 text-purple-400" size={24} />
              <p className="text-white font-medium">{t.creating}</p>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          )}

        </div>
      </div>

      {/* Result section */}
      {renderResult()}
      
      {/* Gallery section */}
      {renderGallery()}

      <footer className="mt-8 text-center text-purple-200 text-sm opacity-70">
        {/* Add this divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-400/100 to-transparent mb-6"></div>
        
        <p>© 2025 FotoGen • Created by Alex </p>
        <div className="mt-2 flex justify-center space-x-4">
          <a 
            href="https://www.linkedin.com/in/alexander-arganaidi/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-purple-400 transition flex items-center"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="mr-1" 
              style={{ verticalAlign: 'middle' }}
            >
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
              <rect x="2" y="9" width="4" height="12"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
            Contact
          </a>
        </div>
      </footer>
    </div>
  </div>
  );
};

export default PortraitGenerator;