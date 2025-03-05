const renderCropInterface = () => {
    if (!isCropping || !cropImage) return null;
    
    const canvasRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [size, setSize] = useState(0);
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    
    useEffect(() => {
      const img = new Image();
      img.onload = () => {
        // Set the image size
        setImageSize({ width: img.width, height: img.height });
        
        // Calculate the square crop size (smaller of width or height)
        const cropSize = Math.min(img.width, img.height);
        setSize(cropSize);
        
        // Center the crop
        setPosition({
          x: (img.width - cropSize) / 2,
          y: (img.height - cropSize) / 2
        });
        
        // Draw the initial crop preview
        drawCrop();
      };
      img.src = cropImage.preview;
    }, [cropImage]);
    
    const drawCrop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Draw the image at the correct position
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(
          img,
          position.x, position.y, size, size,  // Source rectangle
          0, 0, size, size                     // Destination rectangle
        );
      };
      
      img.src = cropImage.preview;
    };
    
    const handleDragStart = (e) => {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    };
    
    const handleDragMove = (e) => {
      if (!isDragging) return;
      
      let newX = e.clientX - dragStart.x;
      let newY = e.clientY - dragStart.y;
      
      // Limit the position to the image boundaries
      newX = Math.max(0, Math.min(newX, imageSize.width - size));
      newY = Math.max(0, Math.min(newY, imageSize.height - size));
      
      setPosition({ x: newX, y: newY });
      drawCrop();
    };
    
    const handleDragEnd = () => {
      setIsDragging(false);
    };
    
    const completeCrop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      handleCrop(dataUrl);
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-800 rounded-lg max-w-2xl w-full p-6">
          <h3 className="text-xl font-bold text-white mb-4">Crop to Square</h3>
          
          <div className="relative">
            <div 
              className="mb-4 relative cursor-move"
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
            >
              <img 
                src={cropImage.preview} 
                alt="Crop Preview"
                className="w-full h-auto"
                style={{ opacity: 0.5 }}
              />
              <div 
                className="absolute border-2 border-purple-500 pointer-events-none"
                style={{
                  left: position.x,
                  top: position.y,
                  width: size,
                  height: size
                }}
              ></div>
            </div>
            
            <canvas
              ref={canvasRef}
              className="mx-auto mb-4 border border-white"
              style={{ maxWidth: '100%', maxHeight: '300px' }}
            />
          </div>
          
          <p className="text-white text-sm mb-4">Drag to adjust the crop position. Click "Apply Crop" when ready.</p>
          
          <div className="flex justify-end space-x-4">
            <button
              onClick={cancelCrop}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={completeCrop}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded hover:from-purple-700 hover:to-pink-700"
            >
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    );
  };

export default renderCropInterface;