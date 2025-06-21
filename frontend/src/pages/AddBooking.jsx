import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addBooking } from '../services/bookingService';
import { getClients } from '../services/clientService';
import { getUsers } from '../services/userService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Dropdown from '../components/common/Dropdown';
import { FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/common/Loader';
import Notification from '../components/common/Notification';

const AddBooking = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    client: '',
    agent: user?.role === 'agent' ? user._id : '',
    startDate: '',
    endDate: '',
    destination: '',
    status: 'Pending',
    price: '',
    notes: '',
    vehicle: '',
    driver: ''
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [clients, setClients] = useState([]);
  const [agents, setAgents] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [notification, setNotification] = useState(null);

  // Fetch data for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      setInitialLoading(true);
      try {
        const [clientsData, agentsData, vehiclesData, driversData] = await Promise.all([
          getClients(token),
          user?.role === 'admin' ? getUsers({ role: 'agent' }, token) : Promise.resolve([]),
          // getVehicles(token), // Uncomment when vehicle service is available
          // getDrivers(token), // Uncomment when driver service is available
          Promise.resolve([]),
          Promise.resolve([])
        ]);
        
        setClients(clientsData);
        setAgents(agentsData);
        setVehicles(vehiclesData);
        setDrivers(driversData);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data');
        setNotification({ 
          message: 'Failed to load data: ' + (err.response?.data?.message || err.message), 
          type: 'error' 
        });
      } finally {
        setInitialLoading(false);
      }
    };
    
    if (token) {
      fetchData();
    }
  }, [token, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await addBooking(form, token);
      setNotification({ message: 'Booking created successfully!', type: 'success' });
      setTimeout(() => {
        navigate('/bookings', { state: { refresh: true } });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
      setNotification({ 
        message: 'Failed to create booking: ' + (err.response?.data?.message || err.message), 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  if (initialLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8">
        <Loader className="my-10" />
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create New Booking</h1>
        <Button 
          color="secondary" 
          onClick={() => navigate('/bookings')}
          className="flex items-center gap-2"
        >
          <FaArrowLeft /> Back to Bookings
        </Button>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-full">
            <FaCalendarAlt className="text-blue-600 text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Booking Information</h2>
            <p className="text-gray-600">Create a new booking for a client</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client and Agent Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Dropdown
              label="Client"
              name="client"
              value={form.client}
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
                value={form.agent}
                onChange={handleChange}
                required
                options={[
                  { value: '', label: 'Select an agent' },
                  ...agents.map(agent => ({ value: agent._id, label: agent.name }))
                ]}
              />
            )}
          </div>

          {/* Trip Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Start Date"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
              required
            />

            <Input
              label="End Date"
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleChange}
              required
            />
          </div>

          <Input
            label="Destination"
            name="destination"
            value={form.destination}
            onChange={handleChange}
            required
            placeholder="Enter destination"
          />

          {/* Status and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Dropdown
              label="Status"
              name="status"
              value={form.status}
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
              value={form.price}
              onChange={handleChange}
              placeholder="Enter price"
            />
          </div>

          {/* Vehicle and Driver Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Dropdown
              label="Assigned Vehicle"
              name="vehicle"
              value={form.vehicle}
              onChange={handleChange}
              options={[
                { value: '', label: 'Select a vehicle' },
                ...vehicles.map(vehicle => ({ value: vehicle._id, label: vehicle.name }))
              ]}
            />

            <Dropdown
              label="Assigned Driver"
              name="driver"
              value={form.driver}
              onChange={handleChange}
              options={[
                { value: '', label: 'Select a driver' },
                ...drivers.map(driver => ({ value: driver._id, label: driver.name }))
              ]}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Enter any additional notes..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              rows="4"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              color="primary" 
              loading={loading}
              disabled={!form.client || !form.startDate || !form.endDate || !form.destination}
              className="flex-1"
            >
              Create Booking
            </Button>
            <Button 
              type="button" 
              color="secondary" 
              onClick={() => navigate('/bookings')}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBooking; 