import React from 'react';

/**
 * Tab Component
 * Props:
 * - tabs: array of { label: string, icon?: JSX.Element }
 * - activeTab: number (index)
 * - onTabChange: function(index)
 * - className?: string
 */
function Tab({ tabs, activeTab = 0, onTabChange, className = '' }) {
  return (
    <div className={`w-full border-b border-gray-200 bg-white/80 flex gap-2 md:gap-6 px-2 md:px-6 ${className}`}>
      {tabs.map((tab, idx) => (
        <button
          key={tab.label}
          className={`relative py-3 px-2 md:px-4 text-sm md:text-base font-semibold transition focus:outline-none
            ${activeTab === idx
              ? 'text-blue-600'
              : 'text-gray-500 hover:text-blue-600'}
          `}
          onClick={() => onTabChange(idx)}
        >
          {tab.icon && <span className="inline-block align-middle mr-2">{tab.icon}</span>}
          <span className="align-middle">{tab.label}</span>
          {activeTab === idx && (
            <span className="absolute left-0 right-0 -bottom-[1px] h-1 bg-blue-600 rounded-t-xl transition-all" />
          )}
        </button>
      ))}
    </div>
  );
}

export default Tab;
