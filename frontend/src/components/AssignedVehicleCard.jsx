import React from 'react';
import { FaCar, FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Card from './common/Card';
import Button from './common/Button';

const AssignedVehicleCard = ({ vehicle, driver }) => {
  if (!vehicle) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'On-Trip': return 'bg-yellow-100 text-yellow-800';
      case 'Maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
          <FaCar className="text-blue-500" /> Assigned Vehicle
        </h3>
        <div className="flex items-center gap-4 mb-4">
          <img 
            src={vehicle.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(vehicle.name || 'V')}&background=e0e7ff&color=4f46e5&size=96`} 
            alt={vehicle.name} 
            className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
          />
          <div>
            <h4 className="text-xl font-bold text-gray-900">{vehicle.name}</h4>
            <p className="text-sm text-gray-500 font-mono">{vehicle.numberPlate}</p>
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span className="font-semibold">{vehicle.vehicleType || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Capacity:</span>
            <span className="font-semibold">{vehicle.capacity || 'N/A'} passengers</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Status:</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(vehicle.status)}`}>
              {vehicle.status || 'N/A'}
            </span>
          </div>
        </div>

        {driver && (
          <>
            <hr className="my-4" />
            <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
              <FaUser className="text-purple-500" /> Assigned Driver
            </h3>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg border-2 border-purple-200">
                {driver.name?.[0] || 'D'}
              </span>
              <div>
                <p className="font-semibold text-gray-900">{driver.name}</p>
                <p className="text-xs text-gray-500">{driver.email}</p>
              </div>
            </div>
          </>
        )}

        <Link to={`/vehicles/${vehicle._id}`}>
          <Button variant="secondary" className="w-full mt-4">
            View Vehicle Details
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default AssignedVehicleCard; 