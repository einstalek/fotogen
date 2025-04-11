// 1. First, create the ImageFeedback component (ImageFeedback.jsx)
import React, { useState } from 'react';
import { X } from 'lucide-react';

const ImageFeedback = ({ imageIndex, onSubmitFeedback, onDismiss, t }) => {
  const [selectedRating, setSelectedRating] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const ratings = [
    { value: 'awful', label: t('awful'), icon: '😖' },
    { value: 'okay', label: t('okay'), icon: '😐' },
    { value: 'excellent', label: t('excellent'), icon: '😍' },
  ];

  const handleSubmit = () => {
    if (selectedRating) {
      onSubmitFeedback(imageIndex, selectedRating);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="p-2 bg-purple-900/40 rounded-lg border border-purple-500/30 text-center mt-2">
        <p className="text-purple-200 text-xs">{t('thankYouFeedback')}</p>
      </div>
    );
  }

  return (
    <div className="p-2 rounded-lg mt-2 w-48">
      <div className="flex justify-between gap-1 mb-2">
        {ratings.map((rating) => (
          <button
            key={rating.value}
            onClick={(e) => {
                console.log("Rating left!")
            //   e.stopPropagation();
            //   setSelectedRating(rating.value);
            }}
            className={`flex-1 py-1 px-1 rounded flex flex-col items-center justify-center text-sm transition-all ${
              selectedRating === rating.value
                ? 'bg-purple-600 text-white border-purple-400'
                : 'bg-purple-800/40 text-purple-200 hover:bg-purple-700/40'
            }`}
          >
            <span className="text-sm">{rating.icon}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageFeedback;
