import React from 'react';

function DriverDetailsCard({ driver, vehicle, location, onBack, onFocus, isFloating, onToggleFloating }) {
  if (!driver) return <div className="text-gray-500">Driver not found.</div>;
  const safeName = typeof driver.name === 'string' ? driver.name : '-';
  const safeEmail = typeof driver.email === 'string' ? driver.email : '-';
    let assignmentText = 'Unassigned';

  const assignedVehicleForDisplay = vehicle || driver.assignedVehicle;

  if (
    assignedVehicleForDisplay &&
    (typeof assignedVehicleForDisplay.numberPlate === 'string' && assignedVehicleForDisplay.numberPlate.trim() !== '' ||
     typeof assignedVehicleForDisplay.name === 'string' && assignedVehicleForDisplay.name.trim() !== '')
  ) {
    assignmentText = `Assigned: ${assignedVehicleForDisplay.numberPlate || assignedVehicleForDisplay.name}`;
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center gap-4 mb-4">
        {driver.avatarUrl ? (
          <img src={driver.avatarUrl} alt={safeName} className="w-16 h-16 rounded-full object-cover shadow" />
        ) : (
          <span className="w-16 h-16 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center font-bold text-2xl shadow">{safeName[0]}</span>
        )}
        <div>
          <div className="text-xl font-bold text-gray-900">{safeName}</div>
          <div className="text-sm text-gray-500">{safeEmail}</div>
          <div className="text-xs text-gray-400">{assignmentText}</div>
        </div>
      </div>
      <div className="text-sm text-gray-700 mb-1"><b>Phone:</b> {typeof driver.phone === 'string' ? driver.phone : '-'}</div>
      <div className="text-sm text-gray-700 mb-1"><b>Status:</b> {typeof driver.status === 'string' ? driver.status : '-'}</div>
      <div className="text-sm text-gray-700 mb-1"><b>License #:</b> {typeof driver.licenseNumber === 'string' ? driver.licenseNumber : '-'}</div>
      <div className="text-sm text-gray-700 mb-1"><b>License Expiry:</b> {typeof driver.licenseExpiry === 'string' ? driver.licenseExpiry : '-'}</div>
      <div className="text-sm text-gray-700 mb-1"><b>Last Location:</b> {
        location && typeof location.latitude === 'number' && typeof location.longitude === 'number'
          ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
          : '-'
      }</div>
      <div className="flex gap-2 mt-4">
        <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded font-bold hover:bg-purple-200 transition" onClick={onBack}>Back</button>
        {onFocus && <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded font-bold hover:bg-purple-200 transition" onClick={onFocus}>Focus</button>}
        {typeof isFloating === 'boolean' && onToggleFloating && (
          <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded font-bold hover:bg-purple-200 transition" onClick={onToggleFloating}>{isFloating ? 'Dock Card' : 'Float Card'}</button>
        )}
      </div>
    </div>
  );
}

export default DriverDetailsCard; 