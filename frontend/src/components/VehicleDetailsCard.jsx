import React from 'react';
import { FaCarSide, FaUser, FaMapMarkerAlt, FaPhone, FaSyncAlt } from 'react-icons/fa';

export default function VehicleDetailsCard({ vehicle, location, driver, trip, onBack, onFocus }) {
  if (!vehicle) return null;
  return (
    <div className="bg-white/90 border border-gray-100 rounded-xl shadow-lg px-6 py-4 max-w-md w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FaCarSide className="text-blue-500 text-2xl" />
          <span className="font-bold text-lg text-gray-900">{vehicle.name || vehicle._id}</span>
        </div>
        {onBack && (
          <button className="text-xs text-blue-600 hover:underline" onClick={onBack}>Back to all</button>
        )}
      </div>
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span className="font-semibold">Type:</span> {vehicle.type || 'N/A'}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span className="font-semibold">Number Plate:</span> {vehicle.numberPlate || 'N/A'}
        </div>
        {driver && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <FaUser className="text-blue-400" />
            <span className="font-semibold">Driver:</span> {driver.name || driver._id}
            {driver.phone && (
              <a href={`tel:${driver.phone}`} className="ml-2 text-blue-600 hover:underline flex items-center gap-1"><FaPhone />Call</a>
            )}
          </div>
        )}
        {location && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <FaMapMarkerAlt className="text-green-500" />
            <span className="font-semibold">Status:</span> {location.status || 'N/A'}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold text-white ${location.status === 'moving' ? 'bg-green-500' : 'bg-gray-400'}`}>{location.status}</span>
            <span className="ml-2">Speed: {location.speed} km/h</span>
          </div>
        )}
        {location && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FaSyncAlt /> Last update: {location.updatedAt ? new Date(location.updatedAt).toLocaleString() : 'N/A'}
          </div>
        )}
      </div>
      {trip && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-2">
          <div className="font-semibold text-blue-700 mb-1">Active Trip</div>
          <div className="text-xs text-gray-700">Pickup: {trip.pickup || 'N/A'}</div>
          <div className="text-xs text-gray-700">Dropoff: {trip.dropoff || 'N/A'}</div>
          <div className="text-xs text-gray-700">Client: {trip.clientName || 'N/A'}</div>
        </div>
      )}
      <div className="flex gap-2 mt-2">
        {onFocus && (
          <button className="px-3 py-1 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700" onClick={onFocus}>Focus on Map</button>
        )}
      </div>
    </div>
  );
}