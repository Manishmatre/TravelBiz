import React from 'react';

const VehicleCard = ({ vehicle }) => {
  if (!vehicle) {
    return (
      <div className="bg-white rounded-xl shadow p-6 mb-6 text-gray-500">
        No vehicle assigned.
      </div>
    );
  }
  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h3 className="text-lg font-semibold mb-2">Assigned Vehicle</h3>
      <div className="font-bold text-gray-800">{vehicle.name} ({vehicle.numberPlate})</div>
      <div className="text-gray-600">Type: {vehicle.vehicleType || '-'}</div>
      <div className="text-gray-600">Capacity: {vehicle.capacity || '-'}</div>
      <div className="text-gray-600">Status: {vehicle.status || '-'}</div>
      {/* Optionally, add a button for more details or documents */}
    </div>
  );
};

export default VehicleCard; 