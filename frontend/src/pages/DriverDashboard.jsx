import React, { useEffect, useState } from 'react';
import Card from '../components/common/Card';
import { useAuth } from '../contexts/AuthContext';
import { getVehicleById } from '../services/vehicleService';
import { getBookings, updateBookingStatus } from '../services/bookingService';
import VehicleCard from '../components/VehicleCard';
import TripsList from '../components/TripsList';

function DriverDashboard() {
  const { user, token } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch assigned vehicle
  useEffect(() => {
    const fetchVehicle = async () => {
      if (user?.assignedVehicle) {
        try {
          const v = await getVehicleById(user.assignedVehicle, token);
          setVehicle(v);
        } catch (err) {
          setVehicle(null);
        }
      }
    };
    fetchVehicle();
  }, [user, token]);

  // Fetch assigned bookings/trips
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getBookings({ driverId: user?._id }, token);
        setBookings(data);
      } catch (err) {
        setError('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchBookings();
  }, [user, token]);

  const handleTripAction = async (tripId, action) => {
    if (action === 'details') {
      // TODO: Show trip details modal (implement as needed)
      return;
    }
    // For status changes
    await updateBookingStatus(tripId, action, token); // implement this API call
    // Refetch trips after update
    const data = await getBookings({ driverId: user?._id }, token);
    setBookings(data);
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Driver Dashboard</h1>
      {/* Profile Card */}
      <Card className="mb-6">
        <div className="flex items-center gap-6">
          <img src={user.avatarUrl || '/default-avatar.png'} alt="Avatar" className="h-24 w-24 rounded-xl object-cover border-2 border-blue-200" />
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">{user.name}</h2>
            <div className="text-gray-600 mb-1">{user.email}</div>
            <div className="text-gray-600 mb-1">{user.phone}</div>
            <div className="text-gray-600">License: {user.licenseNumber || '-'} | Expiry: {user.licenseExpiry ? new Date(user.licenseExpiry).toLocaleDateString() : '-'}</div>
          </div>
        </div>
      </Card>
      {/* Assigned Vehicle */}
      <VehicleCard vehicle={vehicle} />
      {/* Assigned Trips/Bookings */}
      <Card>
        <h3 className="text-lg font-semibold mb-2">My Trips / Bookings</h3>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="text-gray-500">No trips or bookings assigned.</div>
        ) : (
          <TripsList trips={bookings} onAction={handleTripAction} />
        )}
      </Card>
      {/* Optionally, add live location/map here if available */}
    </div>
  );
}

export default DriverDashboard; 