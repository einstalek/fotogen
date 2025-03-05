import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Camera, Loader2, ImageIcon, Sliders, Plus } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { translations } from '../translations';
import Header from '../components/Header';
import Footer from '../components/Footer';

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

const PortraitGenerator = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [strength, setStrength] = useState(0.7);
  const [resemblance, setResemblance] = useState(1.2);
  const [steps, setSteps] = useState(5);
  const [jobId, setJobId] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [progress, setProgress] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const [customTemplate, setCustomTemplate] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const fileInputRef = useRef(null);
  const customTemplateInputRef = useRef(null);
  const generateButtonRef = useRef(null);
  const [uploadedUrlsCache, setUploadedUrlsCache] = useState({});

  const toggleSettings = () => {
    setIsSettingsExpanded(!isSettingsExpanded);
  };

  const templateOptions = [
    { id: 1, url: 'https://ai-portrait.s3.eu-central-1.amazonaws.com/input/B9SBQCEPQX8WRGVH5SAZEBTIKC7SCI-20250301_121014.webp', name: 'Professional Headshot' },
    { id: 2, url: 'https://ai-portrait.s3.eu-central-1.amazonaws.com/input/BI4UFONFPEED2SLK2E461AY9IUUP2Z-20250301_121511.webp', name: 'Casual Portrait' },
    { id: 3, url: 'https://ai-portrait.s3.eu-central-1.amazonaws.com/input/MWBXNEV48Z04SVXGYR0HPVCFZMMR57-20250301_112539.webp', name: 'Creative Style' },
    { id: 4, url: 'https://ai-portrait.s3.eu-central-1.amazonaws.com/input/WYPV6LUXZCKCWWWXPSWH2N3W7UCA27-20250301_121251.webp', name: 'Formal Business' },
    { id: 5, url: 'https://ai-portrait.s3.eu-central-1.amazonaws.com/input/WYRV6LUNZCKCWWWXPSWH2N3W7UCA27-20250301_121256.webp', name: 'Artistic Portrait'},
    { id: 6, url: 'https://ai-portrait.s3.eu-central-1.amazonaws.com/input/Z4L9G1WTTMBXOP0454UM1LW8FOJ95D-20250301_120349.webp', name: ''}
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
      
      // Clean up custom template and crop image previews
      if (customTemplate && customTemplate.preview) {
        URL.revokeObjectURL(customTemplate.preview);
      }
      if (cropImage && cropImage.preview) {
        URL.revokeObjectURL(cropImage.preview);
      }
    };
  }, [uploadedImages, customTemplate, cropImage]);

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

  const handleTemplateUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      
      if (img.width === img.height) {
        // Already square, use directly
        const preview = URL.createObjectURL(file);
        setCustomTemplate({
          file,
          id: 'custom-' + Date.now(),
          preview,
          name: 'Custom Template'
        });
        
        // Auto-select the template
        setSelectedTemplate({
          id: 'custom-' + Date.now(),
          url: preview,
          name: 'Custom Template'
        });
      } else {
        // Not square, needs cropping
        setCropImage({
          file,
          preview: URL.createObjectURL(file)
        });
        setIsCropping(true);
      }
    };
    
    img.src = URL.createObjectURL(file);
    e.target.value = null; // Reset the input
  };

  const createSquareCrop = (src, callback) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Determine the size of the square (minimum of width or height)
      const size = Math.min(img.width, img.height);
      
      // Set canvas to the desired square size
      canvas.width = size;
      canvas.height = size;
      
      // Calculate position to center the crop
      const offsetX = (img.width - size) / 2;
      const offsetY = (img.height - size) / 2;
      
      // Draw the image with the calculated crop
      ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);
      
      // Convert to data URL and invoke callback
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      callback(dataUrl);
    };
    
    img.src = src;
  };

  const handleCropConfirm = () => {
    if (!cropImage) return;
    
    createSquareCrop(cropImage.preview, (croppedImageUrl) => {
      // Convert data URL to File
      fetch(croppedImageUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "cropped-template.jpg", { type: "image/jpeg" });
          
          const templateId = 'custom-' + Date.now();
          setCustomTemplate({
            file,
            id: templateId,
            preview: croppedImageUrl,
            name: 'Custom Template'
          });
          
          // Auto-select the custom template
          setSelectedTemplate({
            id: templateId,
            url: croppedImageUrl,
            name: 'Custom Template'
          });
          
          // Clean up
          URL.revokeObjectURL(cropImage.preview);
          setCropImage(null);
          setIsCropping(false);
        });
    });
  };

  const cancelCrop = () => {
    if (cropImage && cropImage.preview) {
      URL.revokeObjectURL(cropImage.preview);
    }
    setCropImage(null);
    setIsCropping(false);
  };

  const removeImage = (index) => {
    const updatedImages = [...uploadedImages];
    const imageToRemove = updatedImages[index];
  
    URL.revokeObjectURL(imageToRemove.preview);

    const newCache = {...uploadedUrlsCache};
    delete newCache[imageToRemove.id];
    setUploadedUrlsCache(newCache);
    
    updatedImages.splice(index, 1);
    
    setUploadedImages(updatedImages);
  };

  const handleRemoveAll = () => {
    uploadedImages.forEach(image => URL.revokeObjectURL(image.preview));
    
    // Clear the cache for all these images
    const imageIds = uploadedImages.map(img => img.id);
    const newCache = {...uploadedUrlsCache};
    imageIds.forEach(id => delete newCache[id]);
    setUploadedUrlsCache(newCache);
    
    setUploadedImages([]);
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
    if (uploadedImages.length === 0 || !selectedTemplate) {
      setError("Please upload reference photos and select a template");
      return;
    }
    
    setIsSettingsExpanded(false);
    setIsGenerating(true);
    setError(null);
    
    try {
      // First upload all reference images to get their URLs
      const uploadPromises = uploadedImages.map(image => uploadImageToServer(image.file));
      const selfieUrls = await Promise.all(
        uploadedImages.map(async (image) => {
          // Create a hash of the file to use as a cache key
          const fileId = image.id;

          // Check if we already have this image URL cached
          if (uploadedUrlsCache[fileId]) {
            return uploadedUrlsCache[fileId];
          } else {
            const imageUrl = await uploadImageToServer(image.file);
            setUploadedUrlsCache(prevCache => ({
              ...prevCache,
              [fileId]: imageUrl
            }));
            return imageUrl;
          }                    
        })
      );      
      
      // Determine template URL - upload custom template if needed
      let templateUrl = selectedTemplate.url;
      
      // If this is a custom template (not one of the predefined ones)
      if (customTemplate && selectedTemplate.id === customTemplate.id) {
        // Upload the custom template to S3
        templateUrl = await uploadImageToServer(customTemplate.file);
      }
      
      // Now submit the job to RunPod
      const response = await fetch(`${backendURI}/api/submit-runpod-job`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            template_url: templateUrl,
            selfie_urls: selfieUrls,
            prompt: prompt || "professional portrait photo, highly detailed",
            negative_prompt: negativePrompt,
            resemblance: resemblance,
            cn_strength: strength,
            steps: steps
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
            setProgress(100);
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
        id: Date.now() + Math.random().toString(36).substring(2),
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
              onClick={() => removeImage(index)}
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
            className="flex gap-3 overflow-x-auto py-2 px-4 scrollbar-hide snap-x"
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
                <p className="text-white text-sm font-medium"> {t.uploadCustom} </p>
                <p className="text-xs text-purple-200"> {t.uploadCustomTip} </p>
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
                  selectedTemplate && selectedTemplate.id === customTemplate.id 
                    ? 'ring-4 ring-purple-500 shadow-lg shadow-purple-500/200 transform scale-105' 
                    : 'hover:ring-2 hover:ring-purple-300/70'
                }`}
                onClick={() => setSelectedTemplate({
                  id: customTemplate.id,
                  url: customTemplate.preview,
                  name: 'Custom Template'
                })}
              >
                <img 
                  src={customTemplate.preview} 
                  alt="Custom Template"
                  className="w-full h-full object-cover"
                />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    URL.revokeObjectURL(customTemplate.preview);
                    setCustomTemplate(null);
                    if (selectedTemplate && selectedTemplate.id === customTemplate.id) {
                      setSelectedTemplate(templateOptions[0]);
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
        <style jsx>{`
          #template-scroller::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    );
  };

  const renderCropInterface = () => {
    if (!isCropping || !cropImage) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 my-4">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Crop to Square</h3>
          
          <div className="relative mb-6 max-h-[50vh] overflow-hidden flex items-center justify-center">
            <div className="relative">
              <img 
                src={cropImage.preview} 
                alt="Preview" 
                className="max-w-full max-h-[45vh] object-contain rounded-md"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-purple-500 bg-transparent rounded-sm aspect-square w-4/5 max-w-[80%] max-h-[80%]">
                  <div className="w-full h-full bg-purple-500 bg-opacity-20"></div>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-white text-sm mb-8 text-center">
            This image will be cropped to a square from the center. 
            The highlighted area shows an approximate preview.
          </p>
          
          <div className="flex justify-center space-x-6">
            <button
              onClick={cancelCrop}
              className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors min-w-[120px]"
            >
              Cancel
            </button>
            <button
              onClick={handleCropConfirm}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-colors min-w-[120px]"
            >
              Crop & Use
            </button>
          </div>
        </div>
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

            {/* Horizontal Scrollable Gallery */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {generatedImages.map((img, index) => (
                    <div 
                        key={index} 
                        className="relative group cursor-pointer overflow-hidden rounded-lg flex-shrink-0 w-40 h-40"
                        onClick={() => {
                            setSelectedImage(img);
                            setIsModalOpen(true);
                        }}
                    >
                        <img 
                            src={img} 
                            alt={`Generated ${index}`} 
                            className="w-full h-full object-cover transition-transform duration-500 transform hover:scale-110 rounded-lg"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3">
                            <p className="text-white text-sm font-medium">View Full Size</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal for Full-Size Image */}
            {/* {isModalOpen && selectedImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4 overflow-y-auto"
                    onClick={() => setIsModalOpen(false)}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") setIsModalOpen(false);
                    }}
                    tabIndex={0}
                >
                    <div
                        className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-70 transition-all z-10"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <X size={24} />
                        </button>
                        <div className="flex items-center justify-center">
                            <img
                                src={selectedImage || "/placeholder.svg"}
                                alt="Full-size Generated Portrait"
                                className="max-w-full max-h-[80vh] object-contain rounded-md"
                            />
                        </div>
                    </div>
                </div>
            )} */}
        </div>
    );
};

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-2xl mx-auto w-full px-4 pb-8">
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
                    <p className="text-white font-medium mb-1">{t.uploadPhotosTip}</p>
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
              </div>
              {/* Image previews */}
              <div className="mt-4">
                {renderImagePreview()}
                {/* Remove All Button */}
                {uploadedImages.length > 0 && (
                <div className="flex justify-center w-full">
                  <button 
                      // onClick={() => setUploadedImages([])}
                      onClick={() => setUploadedImages([])}
                      className="mt-2 text-white px-4 py-2 rounded-md text-sm font-medium transition bg-gradient-to-r from-purple-600/70 to-pink-600/70 hover:translate-y-px flex items-center justify-center"
                  >
                      {t.removeAll}
                  </button>
                </div>
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
                        onChange={(e) => setSteps(parseInt(e.target.value))}
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
                      {t.generating}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Camera className="mr-2" size={20} />
                      {t.generateButton}
                    </span>
                  )}
                </button>
              </div>

              {/* Progress indicator for generation */}
              {isGenerating && (
              <div className="mt-4 bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
                <div className="flex items-center justify-center mb-2">
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300 ease-out" 
                    style={{ width: `${progress}%` }}
                    ></div>
                </div>
              </div>
              )}
            {renderGallery()}
            </div>
          </div>
        </div>
      </main>
      {/* Crop interface */}
      
      {/* {renderGallery()} */}

      {isModalOpen && selectedImage && (
          <div
              className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4 overflow-y-auto"
              onClick={() => setIsModalOpen(false)}
              onKeyDown={(e) => {
                  if (e.key === "Escape") setIsModalOpen(false);
              }}
              tabIndex={0}
          >
              <div
                  className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
              >
                  <button
                      className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-70 transition-all z-10"
                      onClick={() => setIsModalOpen(false)}
                  >
                      <X size={24} />
                  </button>
                  <div className="flex items-center justify-center">
                      <img
                          src={selectedImage || "/placeholder.svg"}
                          alt="Full-size Generated Portrait"
                          className="max-w-full max-h-[80vh] object-contain rounded-md"
                      />
                  </div>
              </div>
          </div>
        )}

      {isCropping && renderCropInterface()}

      <Footer />

    </div>
  );
};

export default PortraitGenerator;
