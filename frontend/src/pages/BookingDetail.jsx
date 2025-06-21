import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getBooking, updateBooking, deleteBooking } from '../services/bookingService';
import { getClients } from '../services/clientService';
import { getUsers } from '../services/userService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Dropdown from '../components/common/Dropdown';
import { FaCalendarAlt, FaArrowLeft, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import Loader from '../components/common/Loader';
import Notification from '../components/common/Notification';
import Modal from '../components/common/Modal';

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

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8">
        <Loader className="my-10" />
      </div>
    );
  }

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

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8">
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            color="secondary" 
            onClick={() => navigate('/bookings')}
            className="flex items-center gap-2"
          >
            <FaArrowLeft /> Back
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Booking Details</h1>
            <p className="text-gray-600">Booking #{booking._id?.slice(-8)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button 
                color="primary" 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <FaEdit /> Edit
              </Button>
              <Button 
                color="danger" 
                onClick={() => setDeleteModalOpen(true)}
                className="flex items-center gap-2"
              >
                <FaTrash /> Delete
              </Button>
            </>
          ) : (
            <>
              <Button 
                color="primary" 
                onClick={handleSave}
                loading={saving}
                className="flex items-center gap-2"
              >
                <FaSave /> Save
              </Button>
              <Button 
                color="secondary" 
                onClick={() => {
                  setIsEditing(false);
                  fetchBooking(); // Reset to original data
                }}
                className="flex items-center gap-2"
              >
                <FaTimes /> Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Booking Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaCalendarAlt className="text-blue-600 text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Trip Information</h2>
                <p className="text-gray-600">Booking details and trip information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isEditing ? (
                <>
                  <Dropdown
                    label="Client"
                    name="client"
                    value={booking.client?._id || booking.client || ''}
                    onChange={handleChange}
                    required
                    options={[
                      { value: '', label: 'Select a client' },
                      ...clients.map(client => ({ value: client._id, label: client.name }))
                    ]}
                  />

                  {user?.role === 'admin' && (
                    <Dropdown
                      label="Assigned Agent"
                      name="agent"
                      value={booking.agent?._id || booking.agent || ''}
                      onChange={handleChange}
                      required
                      options={[
                        { value: '', label: 'Select an agent' },
                        ...agents.map(agent => ({ value: agent._id, label: agent.name }))
                      ]}
                    />
                  )}

                  <Input
                    label="Start Date"
                    name="startDate"
                    type="date"
                    value={booking.startDate ? new Date(booking.startDate).toISOString().split('T')[0] : ''}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    label="End Date"
                    name="endDate"
                    type="date"
                    value={booking.endDate ? new Date(booking.endDate).toISOString().split('T')[0] : ''}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    label="Destination"
                    name="destination"
                    value={booking.destination || ''}
                    onChange={handleChange}
                    required
                  />

                  <Dropdown
                    label="Status"
                    name="status"
                    value={booking.status || 'Pending'}
                    onChange={handleChange}
                    options={[
                      { value: 'Pending', label: 'Pending' },
                      { value: 'Confirmed', label: 'Confirmed' },
                      { value: 'Completed', label: 'Completed' },
                      { value: 'Cancelled', label: 'Cancelled' },
                    ]}
                  />

                  <Input
                    label="Price"
                    name="price"
                    type="number"
                    value={booking.price || ''}
                    onChange={handleChange}
                  />
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                    <p className="text-gray-900 font-medium">{booking.client?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-600">{booking.client?.email || ''}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Agent</label>
                    <p className="text-gray-900 font-medium">{booking.agent?.name || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <p className="text-gray-900">{booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <p className="text-gray-900">{booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                    <p className="text-gray-900 font-medium">{booking.destination || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                      booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status || 'Pending'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <p className="text-gray-900 font-medium">{booking.price ? `$${booking.price}` : 'N/A'}</p>
                  </div>
                </>
              )}
            </div>

            {/* Notes */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              {isEditing ? (
                <textarea
                  name="notes"
                  value={booking.notes || ''}
                  onChange={handleChange}
                  placeholder="Enter any additional notes..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                  rows="4"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {booking.notes || 'No notes available'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                  booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  booking.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                  booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {booking.status || 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="text-gray-900">{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="text-gray-900">{booking.updatedAt ? new Date(booking.updatedAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                color="primary" 
                onClick={() => navigate(`/clients/${booking.client?._id}`)}
                className="w-full"
                disabled={!booking.client?._id}
              >
                View Client
              </Button>
              <Button 
                color="secondary" 
                onClick={() => navigate('/bookings')}
                className="w-full"
              >
                Back to Bookings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Booking"
        size="md"
      >
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete this booking? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button 
              color="secondary" 
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              color="danger" 
              onClick={handleDelete}
              loading={deleting}
            >
              Delete Booking
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BookingDetail; 