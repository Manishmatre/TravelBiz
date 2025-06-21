import React, { useState, useEffect } from 'react';

const Notification = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';

  return (
    <div className={`fixed top-4 right-4 z-50 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in`}>
      <span className="text-lg">{icon}</span>
      <span>{message}</span>
      <button 
        onClick={() => {
          setIsVisible(false);
          if (onClose) onClose();
        }}
        className="ml-2 text-white hover:text-gray-200"
      >
        ✕
      </button>
    </div>
  );
};

export default Notification; 