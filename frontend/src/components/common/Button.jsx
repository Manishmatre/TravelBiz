import React from 'react';

const VARIANTS = {
  solid: {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 border-transparent',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
    success: 'bg-green-600 hover:bg-green-700 text-white border-transparent',
  },
  outline: {
    primary: 'bg-transparent hover:bg-blue-50 text-blue-700 border-blue-500',
    secondary: 'bg-transparent hover:bg-gray-100 text-gray-700 border-gray-300',
    danger: 'bg-transparent hover:bg-red-50 text-red-700 border-red-500',
    success: 'bg-transparent hover:bg-green-50 text-green-700 border-green-500',
  }
};

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

function Button({
  children,
  type = 'button',
  color = 'primary',
  variant = 'solid',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) {
  const variantClasses = VARIANTS[variant] || VARIANTS.solid;
  const colorClasses = variantClasses[color] || variantClasses.primary;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`rounded-lg font-semibold transition-all duration-200 border-2 inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 ${colorClasses} ${SIZES[size] || SIZES.md} ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {loading ? <span className="loader mr-2 inline-block align-middle" /> : null}
      {children}
    </button>
  );
}

export default Button; 