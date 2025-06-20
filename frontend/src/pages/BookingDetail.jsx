import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getBookings, updateBooking, deleteBooking } from '../services/bookingService';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Dropdown from '../components/common/Dropdown';
import { useAuth } from '../contexts/AuthContext';

function BookingDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    getBookings(null, token)
      .then(data => {
        const found = data.find(b => b._id === id);
        setBooking(found);
      })
      .catch(e => setError(e.response?.data?.message || 'Failed to load booking'))
      .finally(() => setLoading(false));
  }, [id, token]);

  const handleEdit = () => {
    setEditData({ ...booking });
    setEditModalOpen(true);
  };
  const handleEditInput = e => {
    const { name, value } = e.target;
    setEditData(d => ({ ...d, [name]: value }));
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBooking(id, editData, token);
      setBooking(editData);
      setEditModalOpen(false);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update booking');
    }
    setSaving(false);
  };
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    setDeleting(true);
    try {
      await deleteBooking(id, token);
      navigate('/bookings');
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to delete booking');
    }
    setDeleting(false);
  };

  if (loading) return <Loader className="my-10" />;
  if (error || !booking) return <div className="text-red-500 p-6">{error || 'Booking not found'}</div>;

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Booking Details</h1>
        <Link to="/bookings">
          <Button color="secondary">Back to Bookings</Button>
        </Link>
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><span className="font-semibold">Client:</span> {booking.client?.name || '-'}</div>
          <div><span className="font-semibold">Agent:</span> {booking.agent?.name || '-'}</div>
          <div><span className="font-semibold">Vehicle:</span> {booking.vehicle?.name || '-'}</div>
          <div><span className="font-semibold">Start Date:</span> {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : '-'}</div>
          <div><span className="font-semibold">End Date:</span> {booking.endDate ? new Date(booking.endDate).toLocaleDateString() : '-'}</div>
          <div><span className="font-semibold">Destination:</span> {booking.destination}</div>
          <div><span className="font-semibold">Status:</span> {booking.status}</div>
          <div><span className="font-semibold">Price:</span> {booking.price}</div>
          <div><span className="font-semibold">Notes:</span> {booking.notes}</div>
          <div><span className="font-semibold">Created At:</span> {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : '-'}</div>
        </div>
        <div className="flex gap-2 mt-6">
          <Button color="primary" onClick={handleEdit}>Edit</Button>
          <Button color="danger" onClick={handleDelete} loading={deleting}>Delete</Button>
        </div>
      </div>
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <div className="p-4">
          <h3 className="font-bold mb-2">Edit Booking</h3>
          <Input label="Start Date" name="startDate" type="date" value={editData?.startDate?.slice(0,10) || ''} onChange={handleEditInput} />
          <Input label="End Date" name="endDate" type="date" value={editData?.endDate?.slice(0,10) || ''} onChange={handleEditInput} />
          <Input label="Destination" name="destination" value={editData?.destination || ''} onChange={handleEditInput} />
          <Dropdown
            label="Status"
            name="status"
            value={editData?.status || 'Pending'}
            onChange={handleEditInput}
            options={[
              { value: 'Pending', label: 'Pending' },
              { value: 'Confirmed', label: 'Confirmed' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Cancelled', label: 'Cancelled' },
            ]}
          />
          <Input label="Price" name="price" type="number" value={editData?.price || ''} onChange={handleEditInput} />
          <Input label="Notes" name="notes" value={editData?.notes || ''} onChange={handleEditInput} />
          <Button color="primary" className="mt-2 w-full" onClick={handleSave} loading={saving}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}

export default BookingDetail; 