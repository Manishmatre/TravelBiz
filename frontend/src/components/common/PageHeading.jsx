import React from 'react';

/**
 * PageHeading component for consistent page headings.
 * Props:
 * - icon: React element (icon)
 * - title: string (main heading)
 * - subtitle: string (optional tagline/description)
 * - iconColor: string (Tailwind color class for icon)
 * - children: ReactNode (right-side actions/buttons)
 */
const PageHeading = ({ icon, title, subtitle, iconColor = 'text-blue-600', children }) => (
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2 flex items-center gap-3">
        {icon && React.cloneElement(icon, { className: `${icon.props.className || ''} ${iconColor}`.trim() })}
        {title}
      </h1>
      {subtitle && <p className="text-gray-600">{subtitle}</p>}
    </div>
    {children && <div className="flex gap-2">{children}</div>}
  </div>
);

export default PageHeading; 