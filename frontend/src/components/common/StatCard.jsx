import React from 'react';

/**
 * Professional stat card for dashboard analytics.
 * Props:
 *  - icon: JSX icon
 *  - label: string
 *  - value: string | number
 *  - trend?: { direction: 'up'|'down', percent: number, color: string }
 *  - className?: string
 *  - accentColor?: string (tailwind color, e.g. 'blue', 'green')
 */
function StatCard({ icon, label, value, trend, className = '', accentColor = 'blue' }) {
  const accentBg = `bg-${accentColor}-100`;
  const accentText = `text-${accentColor}-600`;
  return (
    <div
      className={`flex items-center justify-between rounded-2xl bg-gradient-to-br from-white via-gray-50 to-blue-50 border border-gray-100 shadow-lg px-6 py-5 min-h-[100px] group hover:shadow-2xl transition-all ${className}`}
    >
      {/* Icon */}
      <div className={`flex items-center justify-center rounded-xl p-3 mr-5 ${accentBg} ${accentText} text-3xl shadow-sm`}>{icon}</div>
      {/* Value & Label */}
      <div className="flex-1 flex flex-col items-start min-w-0">
        <div className="text-3xl font-bold text-gray-900 leading-tight truncate">{value}</div>
        <div className="text-base text-gray-500 font-medium truncate mt-1">{label}</div>
      </div>
      {/* Trend */}
      {trend && (
        <div className={`ml-5 text-sm font-semibold flex items-center gap-1 ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}
          style={{marginTop: 4}}>
          {trend.direction === 'up' ? '▲' : '▼'} {trend.percent}%
        </div>
      )}
    </div>
  );
}

export default StatCard;
