import React from 'react';

function Loader({ size = 8, className = '' }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-4 border-blue-500 border-t-transparent h-${size} w-${size}`}></div>
    </div>
  );
}

export default Loader; 