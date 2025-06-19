import React from 'react';

function Card({ title, children, className = '', actions = null }) {
  return (
    <div className={`backdrop-blur bg-white/70 border border-gray-100 rounded-2xl shadow-xl p-6 transition-all hover:shadow-2xl ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-2">
          {title && <h3 className="text-xl font-bold text-gray-800">{title}</h3>}
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export default Card;