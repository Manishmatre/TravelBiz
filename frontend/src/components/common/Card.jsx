import React from 'react';

function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-white rounded shadow p-4 ${className}`}>
      {title && <h3 className="text-lg font-bold mb-2">{title}</h3>}
      {children}
    </div>
  );
}

export default Card; 