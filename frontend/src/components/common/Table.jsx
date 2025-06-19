import React from 'react';

function Table({ columns, data, actions, className = '' }) {
  return (
    <div className={`overflow-x-auto rounded-2xl border border-blue-100 bg-white/80 backdrop-blur-md shadow-lg p-0 ${className}`}>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-white/60 sticky top-0 z-10 rounded-t-2xl">
            {columns.map(col => (
              <th key={col.accessor} className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap first:rounded-tl-2xl last:rounded-tr-2xl">
                {col.label}
              </th>
            ))}
            {actions && <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap last:rounded-tr-2xl">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="py-8 px-4 text-center text-gray-400">No data found</td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={row._id || idx} className="hover:bg-blue-50/60 transition-colors border-t border-blue-50">
                {columns.map(col => (
                  <td key={col.accessor} className="py-2 px-4 whitespace-nowrap align-middle">
                    {col.render ? col.render(row[col.accessor], row) : (typeof row[col.accessor] === 'object' && row[col.accessor] !== null ? JSON.stringify(row[col.accessor]) : row[col.accessor])}
                  </td>
                ))}
                {actions && <td className="py-2 px-4 whitespace-nowrap align-middle">{actions(row)}</td>}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;