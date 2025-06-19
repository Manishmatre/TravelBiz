import React from 'react';

function Table({ columns, data, actions, className = '' }) {
  return (
    <div className={`overflow-x-auto bg-white rounded shadow p-4 ${className}`}>
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-100">
            {columns.map(col => (
              <th key={col.accessor} className="py-2 px-4 text-left">{col.label}</th>
            ))}
            {actions && <th className="py-2 px-4 text-left">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row._id || idx}>
              {columns.map(col => (
                <td key={col.accessor} className="py-2 px-4">{row[col.accessor]}</td>
              ))}
              {actions && <td className="py-2 px-4">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table; 