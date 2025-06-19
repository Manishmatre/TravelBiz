import React from 'react';

const COLORS = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
};

const SIZES = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
};

function Button({
  children,
  type = 'button',
  color = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`rounded font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${COLORS[color] || COLORS.primary} ${SIZES[size] || SIZES.md} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button; 