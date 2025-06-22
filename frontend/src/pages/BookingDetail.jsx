import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getBooking, updateBooking, deleteBooking } from '../services/bookingService';
import { getClients } from '../services/clientService';
import { getUsers, getUserById } from '../services/userService';
import Button from '../components/common/Button';
import { FaCalendarAlt, FaArrowLeft, FaEdit, FaTrash, FaSave, FaTimes, FaUser, FaCar, FaMoneyBillWave, FaMapMarkerAlt } from 'react-icons/fa';
import Loader from '../components/common/Loader';
import Notification from '../components/common/Notification';
import Modal from '../components/common/Modal';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import Card from '../components/common/Card';
import ClientDetailsCard from '../components/ClientDetailsCard';
import VehicleCard from '../components/VehicleCard';
import DriverDetailsCard from '../components/DriverDetailsCard';

const libraries = ['places'];

const DetailItem = ({ icon, label, value, to }) => (
  <div>
    <div className="flex items-center text-sm text-gray-500">
      {icon}
      <span className="ml-2">{label}</span>
    </div>
    {to ? (
      <Link to={to} className="mt-1 text-lg font-semibold text-blue-700 hover:underline">
        {value}
      </Link>
    ) : (
      <p className="mt-1 text-lg font-semibold text-gray-900">{value}</p>
    )}
  </div>
);

const BookingDetail = () => {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [agents, setAgents] = useState([]);
  const [driverDetails, setDriverDetails] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    fetchBooking();
    fetchDropdownData();
    if (booking && booking.driver && typeof booking.driver === 'string' && token) {
      getUserById(booking.driver, token).then(setDriverDetails).catch(() => setDriverDetails(null));
    } else if (booking && booking.driver && typeof booking.driver === 'object') {
      setDriverDetails(booking.driver);
    } else {
      setDriverDetails(null);
    }
  }, [id, token]);

  const fetchBooking = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getBooking(id, token);
      setBooking(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch booking');
      setNotification({ 
        message: 'Failed to fetch booking: ' + (err.response?.data?.message || err.message), 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [clientsData, agentsData] = await Promise.all([
        getClients(token),
        user?.role === 'admin' ? getUsers({ role: 'agent' }, token) : Promise.resolve([])
      ]);
      setClients(clientsData);
      setAgents(agentsData);
    } catch (err) {
      console.error('Failed to fetch dropdown data:', err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBooking(id, booking, token);
      setIsEditing(false);
      setNotification({ message: 'Booking updated successfully!', type: 'success' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update booking');
      setNotification({ 
        message: 'Failed to update booking: ' + (err.response?.data?.message || err.message), 
        type: 'error' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBooking(id, token);
      setDeleteModalOpen(false);
      setNotification({ message: 'Booking deleted successfully!', type: 'success' });
      setTimeout(() => {
        navigate('/bookings');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete booking');
      setNotification({ 
        message: 'Failed to delete booking: ' + (err.response?.data?.message || err.message), 
        type: 'error' 
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleChange = (e) => {
    setBooking({
      ...booking,
      [e.target.name]: e.target.value
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loadError) return <div>Error loading maps</div>;
  if (loading || (!isLoaded && !loadError)) return <div className="p-8"><Loader /></div>;

  if (!booking) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8">
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-4">The booking you're looking for doesn't exist.</p>
          <Button color="primary" onClick={() => navigate('/bookings')}>
            Back to Bookings
          </Button>
        </div>
      </div>
    );
  }

  const hasCoordinates = booking.pickupCoordinates?.lat && booking.destinationCoordinates?.lat;
  const mapCenter = hasCoordinates ? {
      lat: (booking.pickupCoordinates.lat + booking.destinationCoordinates.lat) / 2,
      lng: (booking.pickupCoordinates.lng + booking.destinationCoordinates.lng) / 2,
  } : { lat: 25.2048, lng: 55.2708 }; // Default to Dubai

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen">
      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
      <div className="p-4 md:p-8">
        {/* Header */}
        <Card className="mb-8 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Button color="secondary" onClick={() => navigate('/bookings')} size="sm" className="!p-2"><FaArrowLeft /></Button>
            {booking.client?.avatarUrl ? (
              <img src={booking.client.avatarUrl} alt={booking.client.name} className="w-10 h-10 rounded-full object-cover border-2 border-blue-200 shadow-sm" />
            ) : (
              <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base border-2 border-blue-200 shadow-sm">{booking.client?.name?.[0] || <FaUser />}</span>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-bold text-gray-900 truncate">Trip to {booking.destination?.name || 'Unknown'}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>{booking.status}</span>
              </div>
              <div className="text-xs text-gray-500 font-mono truncate">Booking ID: {booking._id}</div>
            </div>
          </div>
          <div className="flex flex-row gap-2 items-center ml-4">
            <Button size="sm" color="primary" onClick={() => setIsEditing(true)}><FaEdit /> Edit</Button>
            <Button size="sm" color="danger" onClick={() => setDeleteModalOpen(true)}><FaTrash /> Delete</Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Map Card */}
            <Card className="p-0 overflow-hidden">
              <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-2 bg-white/80">
                <FaMapMarkerAlt className="text-blue-500" />
                <span className="font-semibold text-gray-800">Trip Route</span>
              </div>
              <div className="h-80">
                {isLoaded && (
                  <GoogleMap
                    mapContainerStyle={{ height: '100%', width: '100%' }}
                    center={mapCenter}
                    zoom={10}
                  >
                    {hasCoordinates && (
                      <>
                        <Marker position={booking.pickupCoordinates} />
                        <Marker position={booking.destinationCoordinates} />
                      </>
                    )}
                  </GoogleMap>
                )}
              </div>
            </Card>
            {/* Trip Details Card */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2"><FaCalendarAlt className="text-blue-500" /> Trip Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem icon={<FaMapMarkerAlt />} label="From" value={booking.pickup?.name} />
                <DetailItem icon={<FaMapMarkerAlt />} label="To" value={booking.destination?.name} />
                <DetailItem icon={<FaCalendarAlt />} label="Start Date" value={new Date(booking.startDate).toLocaleString()} />
                <DetailItem icon={<FaCalendarAlt />} label="End Date" value={booking.endDate ? new Date(booking.endDate).toLocaleString() : 'N/A'} />
                <DetailItem icon={<FaMoneyBillWave />} label="Price" value={`$${booking.price}`} />
                <DetailItem icon={<FaUser />} label="Agent" value={booking.agent?.name} to={booking.agent?._id ? `/users/${booking.agent._id}` : undefined} />
              </div>
            </Card>
          </div>
          {/* Right Column */}
          <div className="space-y-8">
            {/* Client Card */}
            <Card className="p-4">
              <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2"><FaUser className="text-blue-500" /> Client</h3>
              <div className="flex items-center gap-3 mb-2">
                {booking.client?.avatarUrl ? (
                  <img src={booking.client.avatarUrl} alt={booking.client.name} className="w-12 h-12 rounded-full object-cover border-2 border-blue-200 shadow-sm" />
                ) : (
                  <span className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg border-2 border-blue-200 shadow-sm">{booking.client?.name?.[0] || <FaUser />}</span>
                )}
                <div>
                  <div className="font-semibold text-gray-900">{booking.client?.name}</div>
                  <div className="text-xs text-gray-500">{booking.client?.email}</div>
                  <div className="text-xs text-gray-500">{booking.client?.phone}</div>
                  <div className="text-xs text-gray-400">{booking.client?.status}</div>
                </div>
              </div>
              <Button size="sm" color="primary" onClick={() => navigate(`/clients/${booking.client?._id}`)} className="w-full mt-2"><FaUser /> View Client</Button>
            </Card>
            {/* Vehicle Card */}
            {booking.vehicle && <VehicleCard vehicle={booking.vehicle} />}
            {/* Driver Card */}
            {driverDetails && (
              <Card className="p-4">
                <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2"><FaUser className="text-purple-500" /> Driver</h3>
                <div className="flex items-center gap-3 mb-2">
                  {driverDetails.avatarUrl ? (
                    <img src={driverDetails.avatarUrl} alt={driverDetails.name} className="w-12 h-12 rounded-full object-cover border-2 border-purple-200 shadow-sm" />
                  ) : (
                    <span className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg border-2 border-purple-200 shadow-sm">{driverDetails.name?.[0] || <FaUser />}</span>
                  )}
                  <div>
                    <div className="font-semibold text-gray-900">{driverDetails.name}</div>
                    <div className="text-xs text-gray-500">{driverDetails.email}</div>
                    <div className="text-xs text-gray-500">{driverDetails.phone}</div>
                    <div className="text-xs text-gray-400">{driverDetails.status}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-700 mb-1"><b>License #:</b> {driverDetails.licenseNumber || '-'}</div>
                <div className="text-xs text-gray-700 mb-1"><b>License Expiry:</b> {driverDetails.licenseExpiry || '-'}</div>
                <div className="text-xs text-gray-700 mb-1"><b>Assignment:</b> {driverDetails.assignedVehicle?.numberPlate || driverDetails.assignedVehicle?.name || 'Unassigned'}</div>
                <Button size="sm" color="primary" onClick={() => navigate(`/users/${driverDetails._id}`)} className="w-full mt-2"><FaUser /> View Driver</Button>
              </Card>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Deletion">
          <p className="text-gray-600 mb-6">Are you sure you want to permanently delete this booking? This action cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <Button color="secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button color="danger" onClick={handleDelete} loading={deleting}>
              {deleting ? 'Deleting...' : 'Delete Booking'}
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default BookingDetail; 