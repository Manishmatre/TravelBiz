import React from 'react';

function AgentDetailsCard({ agent, onBack, isFloating, onToggleFloating }) {
  if (!agent) return <div className="text-gray-500">Agent not found.</div>;
  const safeName = typeof agent.name === 'string' ? agent.name : '-';
  const safeEmail = typeof agent.email === 'string' ? agent.email : '-';
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center gap-4 mb-4">
        {agent.avatarUrl ? (
          <img src={agent.avatarUrl} alt={safeName} className="w-16 h-16 rounded-full object-cover shadow" />
        ) : (
          <span className="w-16 h-16 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center font-bold text-2xl shadow">{safeName[0]}</span>
        )}
        <div>
          <div className="text-xl font-bold text-gray-900">{safeName}</div>
          <div className="text-sm text-gray-500">{safeEmail}</div>
        </div>
      </div>
      <div className="text-sm text-gray-700 mb-1"><b>Phone:</b> {typeof agent.phone === 'string' ? agent.phone : '-'}</div>
      <div className="text-sm text-gray-700 mb-1"><b>Status:</b> {typeof agent.status === 'string' ? agent.status : '-'}</div>
      <div className="flex gap-2 mt-4">
        <button className="px-3 py-1 bg-orange-100 text-orange-700 rounded font-bold hover:bg-orange-200 transition" onClick={onBack}>Back</button>
        {typeof isFloating === 'boolean' && onToggleFloating && (
          <button className="px-3 py-1 bg-orange-100 text-orange-700 rounded font-bold hover:bg-orange-200 transition" onClick={onToggleFloating}>{isFloating ? 'Dock Card' : 'Float Card'}</button>
        )}
      </div>
    </div>
  );
}

export default AgentDetailsCard; 