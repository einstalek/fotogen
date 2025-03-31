import React from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';

const ImageGallery = ({
  generatedImages,
  selectedImage,
  setSelectedImage,
  isModalOpen,
  setIsModalOpen,
  t
}) => {
  return (
    <>
      {/* Gallery */}
      <div className="relative">
        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
          {generatedImages.map((image, index) => (
            <div
              key={index}
              className="relative flex-shrink-0 group cursor-pointer"
              onClick={() => {
                setSelectedImage(image);
                setIsModalOpen(true);
              }}
            >
              <img
                src={image}
                alt={`Generated portrait ${index + 1}`}
                className="w-48 h-48 object-cover rounded-lg shadow-lg transition-transform duration-200 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
        
        {/* Scroll buttons */}
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-purple-900/80 hover:bg-purple-800/80 text-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          onClick={(e) => {
            e.stopPropagation();
            const container = e.currentTarget.parentElement.querySelector('.overflow-x-auto');
            container.scrollBy({ left: -200, behavior: 'smooth' });
          }}
        >
          <ChevronLeft size={20} />
        </button>
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-purple-900/80 hover:bg-purple-800/80 text-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          onClick={(e) => {
            e.stopPropagation();
            const container = e.currentTarget.parentElement.querySelector('.overflow-x-auto');
            container.scrollBy({ left: 200, behavior: 'smooth' });
          }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Full-size modal */}
      {isModalOpen && selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative max-w-2xl w-full bg-black/30 rounded-lg p-4">
            <img
              src={selectedImage}
              alt="Full-size generated portrait"
              className="w-full h-auto rounded-lg shadow-xl"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery; 