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
    <div className={`mb-3 ${className}`}>
      {label && <label className="block mb-1 font-medium">{label}</label>}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : ''}`}
        {...props}
      />
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
    </div>
  );
}

export default Input; 