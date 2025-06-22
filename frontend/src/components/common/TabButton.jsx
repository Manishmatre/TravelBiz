import React from 'react';

/**
 * TabButton Component for individual tab buttons
 * Props:
 * - active: boolean
 * - onClick: function
 * - icon: JSX.Element
 * - label: string
 * - badge: string or number (optional)
 * - tooltip: string (optional)
 * - className: string (optional)
 */
function TabButton({ 
  active = false, 
  onClick, 
  icon, 
  label, 
  badge, 
  tooltip, 
  className = '' 
}) {
  return (
    <button
      className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        active
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-blue-600 border border-gray-200'
      } ${className}`}
      onClick={onClick}
      title={tooltip}
    >
      {icon && <span className="text-base">{icon}</span>}
      <span>{label}</span>
      {badge && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
          active 
            ? 'bg-white text-blue-600' 
            : 'bg-blue-100 text-blue-700'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}

export default TabButton; 