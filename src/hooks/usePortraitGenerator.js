import { useState, useRef, useEffect } from 'react';

const usePortraitGenerator = (templateOptions = []) => {
  const defaultTemplate = templateOptions && templateOptions.length > 0 
    ? templateOptions[0] 
    : null;
  // State
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedUrls, setUploadedUrls] = useState({}); // Cache for uploaded URLs
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [resemblance, setResemblance] = useState(1.1);
  const [strength, setStrength] = useState(0.15);
  const [steps, setSteps] = useState(11);
  const [usePoseControl, setUsePoseControl] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(defaultTemplate);
  const [customTemplate, setCustomTemplate] = useState(null);
  const [styleImage, setStyleImage] = useState(null);
  const [styleWeight, setStyleWeight] = useState(0.7); // Default weight
  const styleImageInputRef = useRef(null);
  const [modelVersion, setModelVersion] = useState(0);
  const [generatedImages, setGeneratedImages] = useState(() => {
    // Load saved images from localStorage on initial render
    const savedImages = localStorage.getItem('portraitGenerator_generatedImages');
    return savedImages ? JSON.parse(savedImages) : [];
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  let backendURI;
  if (import.meta.env.DEV) {
    backendURI = import.meta.env.VITE_BACKEND_URI;
  } 
  else {
    backendURI = '';  // Empty string for relative paths
  }

  // Refs
  const fileInputRef = useRef(null);
  const customTemplateInputRef = useRef(null);
  const generateButtonRef = useRef(null);

  // Functions
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview: URL.createObjectURL(file)
      }));

    if (newImages.length > 0) {
      setUploadedImages(prevImages => [...prevImages, ...newImages]);
    }
    
    // Reset the file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const newImages = files
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview: URL.createObjectURL(file)
      }));

    if (newImages.length > 0) {
      setUploadedImages(prevImages => [...prevImages, ...newImages]);
    }
  };

  const handleStyleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const preview = URL.createObjectURL(file);
      setStyleImage({ 
        id: `style-${Date.now()}`,
        file, 
        preview 
      });
    }
  };
  
  const removeStyleImage = () => {
    if (styleImage?.preview) {
      URL.revokeObjectURL(styleImage.preview);
    }
    setStyleImage(null);
    setStyleWeight(0); // Reset weight when no style image is selected
  };

  const removeImage = (index) => {
    setUploadedImages(prev => {
      const imageToRemove = prev[index];
      if (imageToRemove?.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      // Remove the cached URL for this image
      if (imageToRemove?.file) {
        const fileKey = imageToRemove.file.name + imageToRemove.file.size;
        setUploadedUrls(prev => {
          const newUrls = { ...prev };
          delete newUrls[fileKey];
          return newUrls;
        });
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleRemoveAll = () => {
    // First revoke all object URLs
    uploadedImages.forEach(image => {
      if (image?.preview) {
        URL.revokeObjectURL(image.preview);
      }
      // Remove cached URLs for all images
      if (image?.file) {
        const fileKey = image.file.name + image.file.size;
        setUploadedUrls(prev => {
          const newUrls = { ...prev };
          delete newUrls[fileKey];
          return newUrls;
        });
      }
    });
    
    // Clear the states
    setUploadedImages([]);
    setUploadedUrls({});
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTemplateUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const preview = URL.createObjectURL(file);
      setCropImage(preview);
      setIsCropping(true);
      setCustomTemplate({ file, preview });
      setSelectedTemplate('custom');
    }
  };

  // const handleCropConfirm = () => {
  //   if (cropImage) {
  //     // Here you would implement the actual cropping logic
  //     // For now, we'll just close the cropping interface
  //     setIsCropping(false);
  //     setCropImage(null);
  //   }
  // };

  // Update only the handleCropConfirm function in your parent component
  const handleCropConfirm = () => {
    // Create a canvas element for cropping
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Create an image element to draw from
    const img = new Image();
    img.onload = () => {
      // Determine the square crop size (use the smaller dimension)
      const size = Math.min(img.width, img.height);
      
      // Set canvas size to the square dimensions
      canvas.width = size;
      canvas.height = size;
      
      // Calculate crop position (center of the image)
      const offsetX = (img.width - size) / 2;
      const offsetY = (img.height - size) / 2;
      
      // Draw the cropped (square) image to the canvas
      ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);
      
      // Get the cropped image data
      const croppedImageUrl = canvas.toDataURL('image/png');
      
      // Convert the canvas data to a File object
      canvas.toBlob((blob) => {
        // Create a File object from the blob
        const file = new File([blob], "custom_template.png", { type: 'image/png' });
        
        // Set the cropped image as custom template
        setCustomTemplate({
          id: 'custom',
          name: 'Custom Template',
          file: file,  // Important: Add the file property
          preview: croppedImageUrl
        });
        
        setSelectedTemplate('custom');
        
        // Clean up
        URL.revokeObjectURL(cropImage);
        setIsCropping(false);
        setCropImage(null);
      }, 'image/png');
    };
    
    // Load the image to trigger the onload handler
    img.src = cropImage;
  };

  const cancelCrop = () => {
    setIsCropping(false);
    setCropImage(null);
  };

  const uploadImageToServer = async (file) => {
    // Check if we already have a URL for this file
    const fileKey = file.name + file.size; // Create a unique key for the file
    if (uploadedUrls[fileKey]) {
      return uploadedUrls[fileKey];
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${backendURI}/api/upload-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      // Cache the URL
      setUploadedUrls(prev => ({
        ...prev,
        [fileKey]: data.imageUrl
      }));
      
      return data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const generatePortrait = async () => {
    if (uploadedImages.length === 0 || !selectedTemplate) {
      setError('Please upload images and select a template');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setError(null);

    try {
      // Upload all images first
      const uploadedUrls = await Promise.all(
        uploadedImages.map(async (image) => {
          const url = await uploadImageToServer(image.file);
          return url;
        })
      );

      let templateUrl;
      if (selectedTemplate === 'custom' && customTemplate) {
        templateUrl = await uploadImageToServer(customTemplate.file);
      } else if (typeof selectedTemplate === 'object' && selectedTemplate !== null) {
        templateUrl = selectedTemplate.url;
      } else if (typeof selectedTemplate === 'string' && selectedTemplate !== 'custom') {
        const template = templateOptions.find(t => t.id === selectedTemplate);
        if (template) {
          templateUrl = template.url;
        }
      }

      if (!templateUrl) {
        console.error('Template selection error:', { 
          selectedTemplate, 
          isCustom: selectedTemplate === 'custom', 
          hasCustomTemplate: !!customTemplate,
          templateOptionsLength: templateOptions?.length
        });
        throw new Error('Invalid template selected');
      }

      let styleImageUrl = null;
      if (styleImage) {
        styleImageUrl = await uploadImageToServer(styleImage.file);
      }

      // Submit job to backend
      const requestBody = {
        template_url: templateUrl,
        selfie_urls: uploadedUrls,
        positive_prompt: prompt,
        negative_prompt: negativePrompt,
        ip_weight: resemblance,
        cn_strength: resemblance,
        control_pose: usePoseControl,
        template_denoise: 1 - strength,
        steps: steps,
        style_image: styleImageUrl || templateUrl,
        style_weight: styleImage ? styleWeight : 0,
        method: modelVersion
      };
      // console.log('Request body:', requestBody); // Debug log

      const response = await fetch(`${backendURI}/api/submit-runpod-job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Generation failed');
      }

      const data = await response.json();
      
      // Poll for job completion
      const jobId = data.id;
      if (!jobId) {
        throw new Error('No job ID received from RunPod');
      }

      let jobStatus = 'pending';
      let result = null;
      let startTime = Date.now();
      const totalDuration = 120000; // 90 seconds in milliseconds

      while (jobStatus === 'pending') {
        const statusResponse = await fetch(`${backendURI}/api/check-runpod-job/${jobId}`);
        if (!statusResponse.ok) {
          throw new Error('Failed to check job status');
        }
        const statusData = await statusResponse.json();

        if (statusData.status === 'COMPLETED') {
          // Clean the URLs by removing query parameters
          result = statusData.output.map(url => url.split('?')[0]);
          break;
        } else if (statusData.status === 'FAILED') {
          throw new Error('Job failed: ' + (statusData.error || 'Unknown error'));
        }
        
        // Calculate progress based on elapsed time
        const elapsedTime = Date.now() - startTime;
        const calculatedProgress = Math.min(Math.floor((elapsedTime / totalDuration) * 100), 95);
        setProgress(calculatedProgress);
        
        // Wait for 2 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      if (result && Array.isArray(result) && result.length > 0) {
        setGeneratedImages(prevImages => [...result, ...prevImages]);
        setProgress(100); // Set to 100% when complete
      } else {
        throw new Error('No images in result');
      }
    } catch (error) {
      console.error('Error generating portrait:', error);
      setError(error.message || 'Failed to generate portrait. Please try again.');
    } finally {
      setIsGenerating(false);
      setProgress(100);
    }
  };

  // Save generated images to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('portraitGenerator_generatedImages', JSON.stringify(generatedImages));
  }, [generatedImages]);

  // Cleanup effect for when component unmounts
  useEffect(() => {
    return () => {
      uploadedImages.forEach(image => {
        if (image?.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });
      if (customTemplate?.preview) {
        URL.revokeObjectURL(customTemplate.preview);
      }
    };
  }, []); // Empty dependency array since we only want this on unmount

  // Function to clear saved images
  const clearGeneratedImages = () => {
    setGeneratedImages([]);
    localStorage.removeItem('portraitGenerator_generatedImages');
  };

  return {
    // State
    uploadedImages,
    uploadedUrls,
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
  };
};

export default usePortraitGenerator;
