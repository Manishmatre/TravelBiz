import React from 'react';

function ClientDetailsCard({ client, onBack, isFloating, onToggleFloating }) {
  if (!client) return <div className="text-gray-500">Client not found.</div>;
  const safeName = typeof client.name === 'string' ? client.name : '-';
  const safeEmail = typeof client.email === 'string' ? client.email : '-';
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center gap-4 mb-4">
        {client.avatarUrl ? (
          <img src={client.avatarUrl} alt={safeName} className="w-16 h-16 rounded-full object-cover shadow" />
        ) : (
          <span className="w-16 h-16 rounded-full bg-green-200 text-green-700 flex items-center justify-center font-bold text-2xl shadow">{safeName[0]}</span>
        )}
        <div>
          <div className="text-xl font-bold text-gray-900">{safeName}</div>
          <div className="text-sm text-gray-500">{safeEmail}</div>
        </div>
      </div>
      <div className="text-sm text-gray-700 mb-1"><b>Phone:</b> {typeof client.phone === 'string' ? client.phone : '-'}</div>
      <div className="text-sm text-gray-700 mb-1"><b>Status:</b> {typeof client.status === 'string' ? client.status : '-'}</div>
      <div className="flex gap-2 mt-4">
        <button className="px-3 py-1 bg-green-100 text-green-700 rounded font-bold hover:bg-green-200 transition" onClick={onBack}>Back</button>
        {typeof isFloating === 'boolean' && onToggleFloating && (
          <button className="px-3 py-1 bg-green-100 text-green-700 rounded font-bold hover:bg-green-200 transition" onClick={onToggleFloating}>{isFloating ? 'Dock Card' : 'Float Card'}</button>
        )}
      </div>
    </div>
  );
}

export default ClientDetailsCard; 