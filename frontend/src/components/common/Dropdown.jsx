import React from 'react';

function Dropdown({ label, options, value, onChange, className = '', ...props }) {
  return (
    <div className={`mb-2 ${className}`}>
      {label && <label className="block mb-1 font-semibold text-gray-700">{label}</label>}
      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-gray-200 bg-white/70 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export default Dropdown; 