import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getBooking, updateBooking, deleteBooking } from '../services/bookingService';
import { getClients } from '../services/clientService';
import { getUsers } from '../services/userService';
import Button from '../components/common/Button';
import { FaCalendarAlt, FaArrowLeft, FaEdit, FaTrash, FaSave, FaTimes, FaUser, FaCar, FaMoneyBillWave, FaMapMarkerAlt } from 'react-icons/fa';
import Loader from '../components/common/Loader';
import Notification from '../components/common/Notification';
import Modal from '../components/common/Modal';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

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

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    fetchBooking();
    fetchDropdownData();
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
    <div className="bg-gray-50 min-h-screen">
      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <Button color="secondary" onClick={() => navigate('/bookings')} className="!p-2">
                    <FaArrowLeft />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Trip to {booking.destination?.name || 'Unknown'}
                    </h1>
                    <p className="text-gray-500 font-mono text-sm">
                        Booking ID: {booking._id}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                    {booking.status}
                </span>
                <Button color="primary" onClick={() => setIsEditing(true)}><FaEdit /> Edit</Button>
                <Button color="danger" onClick={() => setDeleteModalOpen(true)}><FaTrash /> Delete</Button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
                {/* Map */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="h-96">
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
                </div>
                {/* Other details can go here */}
            </div>
            {/* Right Column */}
            <div className="space-y-8">
                {/* Trip Info */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                     <h3 className="text-xl font-bold mb-4 text-gray-800">Trip Details</h3>
                     <div className="space-y-4">
                        <DetailItem icon={<FaMapMarkerAlt />} label="From" value={booking.pickup?.name} />
                        <DetailItem icon={<FaMapMarkerAlt />} label="To" value={booking.destination?.name} />
                        <DetailItem icon={<FaCalendarAlt />} label="Start Date" value={new Date(booking.startDate).toLocaleString()} />
                        <DetailItem icon={<FaCalendarAlt />} label="End Date" value={booking.endDate ? new Date(booking.endDate).toLocaleString() : 'N/A'} />
                     </div>
                </div>

                {/* Client Info */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                     <h3 className="text-xl font-bold mb-4 text-gray-800">Client Details</h3>
                     <div className="space-y-4">
                        <DetailItem icon={<FaUser />} label="Name" value={booking.client?.name} to={`/clients/${booking.client?._id}`} />
                        <DetailItem icon={<FaUser />} label="Email" value={booking.client?.email} />
                     </div>
                </div>
                 {/* Vehicle & Payment */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-gray-800">Additional Info</h3>
                     <div className="space-y-4">
                        <DetailItem icon={<FaCar />} label="Vehicle" value={booking.vehicle?.name || 'Not Assigned'} to={`/vehicles/${booking.vehicle?._id}`} />
                        <DetailItem icon={<FaMoneyBillWave />} label="Price" value={`$${booking.price}`} />
                        <DetailItem icon={<FaUser />} label="Agent" value={booking.agent?.name} to={`/users/${booking.agent?._id}`} />
                     </div>
                </div>
            </div>
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
  );
};

export default BookingDetail; 