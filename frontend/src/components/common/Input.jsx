import React from 'react';

function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  name,
  className = '',
  ...props
}) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && <label className="block mb-2 font-semibold text-gray-700">{label}</label>}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-gray-200 bg-white/70 shadow-sm px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition ${error ? 'border-red-500 focus:ring-red-200 focus:border-red-400' : ''}`}
        {...props}
      />
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </div>
  );
}

export default Input;