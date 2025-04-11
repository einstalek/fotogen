// ToastNotification.jsx
import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ToastNotification = ({ 
  show, 
  message, 
  type = 'warning', // warning, success, error
  duration = 0, // 0 means it stays until closed manually
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      
      // If duration is provided, automatically hide after that time
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          if (onClose) onClose();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [show, duration, onClose]);
  
  // Don't render if not visible
  if (!isVisible) return null;
  
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full animate-slide-down">
      <div className="flex items-center justify-between px-4 py-3 shadow-lg rounded-lg bg-black/80 backdrop-blur-md border border-purple-500/50 text-white">
        <div className="flex items-center">
          <AlertTriangle size={16} className="text-purple-300 flex-shrink-0" />
          <span className="ml-2 font-medium text-purple-100">{message}</span>
        </div>
        <button 
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
          className="ml-4 p-1 rounded-full hover:bg-purple-500/30 transition-colors text-purple-300 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;