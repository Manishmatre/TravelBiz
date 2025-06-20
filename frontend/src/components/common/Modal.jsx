import React from 'react';

function Modal({ open, onClose, title, children, className = '', overlayClassName = '', cardClassName = '' }) {
  if (!open) return null;
  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 transition-all ${overlayClassName || 'bg-black/10 backdrop-blur-sm'}`}>
      <div className={`bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative ${cardClassName} ${className}`}>
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl">&times;</button>
        {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  );
}

export default Modal; 