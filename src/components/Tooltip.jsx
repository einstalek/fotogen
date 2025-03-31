import React from 'react';

const Tooltip = ({ text }) => (
  <div className="relative inline-block">
    <span className="relative text-gray-300 bg-gray-700 px-2 py-1 text-xs font-bold rounded-full ml-2 cursor-pointer hover:bg-gray-600 transition group">
      ?
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-800 text-white text-xs rounded-md px-2 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg z-50 text-center break-words">
        {text}
      </div>
    </span>
  </div>
);

export default Tooltip; 