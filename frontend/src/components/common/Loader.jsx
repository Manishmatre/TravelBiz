import React from 'react';

function Loader({ size = 32, className = '' }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <span
        style={{ width: size, height: size }}
        className="inline-block bg-white/60 rounded-full p-2"
      >
        <svg
          className="animate-spin"
          style={{ width: size - 8, height: size - 8 }}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="#3B82F6"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="#3B82F6"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      </span>
    </div>
  );
}

export default Loader;