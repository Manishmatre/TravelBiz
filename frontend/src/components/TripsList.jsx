import React from 'react';

const TripsList = ({ trips, onAction }) => {
  if (!trips || trips.length === 0) {
    return <div className="bg-white rounded-xl shadow p-6 mb-6 text-gray-500">No trips assigned.</div>;
  }
  return (
    <div className="mb-6">
      {trips.map(trip => (
        <div key={trip._id} className="bg-white rounded-xl shadow p-4 mb-4">
          <div className="font-bold text-gray-800 mb-1">
            {trip.pickup} → {trip.destination}
          </div>
          <div className="text-gray-600 text-sm mb-1">
            Client: {trip.clientName || '-'} | Time: {new Date(trip.startDate).toLocaleString()}
          </div>
          <div className="text-gray-600 text-sm mb-1">
            Vehicle: {trip.vehicleNumberPlate || '-'} | Fare: ₹{trip.fare || '-'}
          </div>
          <div className="text-gray-600 text-sm mb-2">
            Status: <span className="font-semibold">{trip.status}</span>
          </div>
          <div className="flex gap-2">
            {trip.status === 'pending' && (
              <>
                <button className="bg-green-500 text-white px-3 py-1 rounded" onClick={() => onAction(trip._id, 'accepted')}>Accept</button>
                <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => onAction(trip._id, 'rejected')}>Reject</button>
              </>
            )}
            {trip.status === 'accepted' && (
              <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => onAction(trip._id, 'started')}>Start Trip</button>
            )}
            {trip.status === 'started' && (
              <button className="bg-purple-500 text-white px-3 py-1 rounded" onClick={() => onAction(trip._id, 'completed')}>Complete Trip</button>
            )}
            {/* Add more actions as needed */}
            <button className="bg-gray-200 text-gray-800 px-3 py-1 rounded" onClick={() => onAction(trip._id, 'details')}>Details</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TripsList; 