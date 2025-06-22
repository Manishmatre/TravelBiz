import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addBooking } from '../services/bookingService';
import { getClients, addClient } from '../services/clientService';
import { getUsers } from '../services/userService';
import { getVehicles } from '../services/vehicleService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Dropdown from '../components/common/Dropdown';
import { FaCalendarAlt, FaArrowLeft, FaPlus, FaUser, FaSearch, FaCheckCircle, FaExclamationTriangle, FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/common/Loader';
import Notification from '../components/common/Notification';
import Modal from '../components/common/Modal';
import Card from '../components/common/Card';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import PageHeading from '../components/common/PageHeading';

const libraries = ['places'];

const AddBooking = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    client: '',
    agent: user?.role === 'agent' ? user._id : '',
    startDate: '',
    endDate: '',
    destination: { name: '', coordinates: { lat: null, lng: null } },
    pickup: { name: '', coordinates: { lat: null, lng: null } },
    status: 'Pending',
    price: '',
    notes: '',
    vehicle: '',
    driver: '',
    bags: '',
    passengers: '',
    specialRequirements: ''
  });

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Refs for autocomplete instances
  const pickupAutocompleteRef = useRef(null);
  const destinationAutocompleteRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [clients, setClients] = useState([]);
  const [agents, setAgents] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [notification, setNotification] = useState(null);
  const [clientSearch, setClientSearch] = useState('');
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', passportNumber: '' });
  const [addingClient, setAddingClient] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch data for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      setInitialLoading(true);
      try {
        const [clientsData, agentsData, vehiclesData, driversData] = await Promise.all([
          getClients(token),
          user?.role === 'admin' ? getUsers({ role: 'agent' }, token) : Promise.resolve([]),
          getVehicles(token),
          getUsers({ role: 'driver' }, token)
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

  // Filter clients based on search
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    client.email.toLowerCase().includes(clientSearch.toLowerCase()) ||
    client.phone?.includes(clientSearch)
  );

  // Validation function
  const validateForm = () => {
    const errors = {};
    
    if (!form.client) errors.client = 'Client is required';
    if (!form.startDate) errors.startDate = 'Start date is required';
    if (!form.endDate) errors.endDate = 'End date is required';
    if (!form.destination.name) errors.destination = 'Destination is required';
    if (!form.pickup.name) errors.pickup = 'Pickup location is required';
    if (!form.price || form.price <= 0) errors.price = 'Valid price is required';
    
    if (form.startDate && form.endDate) {
      const startDate = new Date(form.startDate);
      const endDate = new Date(form.endDate);
      if (endDate <= startDate) {
        errors.endDate = 'End date must be after start date';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fix the validation errors below');
      return;
    }
    
    setLoading(true);
    setError('');

    const bookingData = {
      ...form,
      pickup: form.pickup.name,
      destination: form.destination.name,
      pickupCoordinates: form.pickup.coordinates,
      destinationCoordinates: form.destination.coordinates,
    };

    try {
      await addBooking(bookingData, token);
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
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handlePlaceChanged = (autocomplete, fieldName) => {
    const place = autocomplete.getPlace();
    if (place && place.geometry) {
      setForm(prev => ({
        ...prev,
        [fieldName]: {
          name: place.formatted_address,
          coordinates: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          }
        }
      }));
       if (validationErrors[fieldName]) {
        setValidationErrors(prev => ({...prev, [fieldName]: ''}));
      }
    }
  };

  const handleAddClient = async () => {
    setAddingClient(true);
    try {
      const client = await addClient(newClient, token);
      setClients([client, ...clients]);
      setForm({ ...form, client: client._id });
      setShowAddClient(false);
      setNewClient({ name: '', email: '', phone: '', passportNumber: '' });
      setNotification({ message: 'Client added successfully!', type: 'success' });
    } catch (err) {
      setNotification({ 
        message: 'Failed to add client: ' + (err.response?.data?.message || err.message), 
        type: 'error' 
      });
    } finally {
      setAddingClient(false);
    }
  };

  if (loadError) {
    return <div>Error loading maps. Please check your API key and network connection.</div>;
  }
  
  if (!isLoaded || initialLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8 min-h-screen">
        <Loader className="my-10" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8 min-h-screen">
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      {/* Header */}
      <div className="space-y-6 mb-6">
        <PageHeading
          icon={<FaCalendarAlt />}
          title="Add New Booking"
          subtitle="Create a new trip booking for a client"
          iconColor="text-blue-600"
        >
          <Button color="secondary" onClick={() => navigate('/bookings')} className="flex items-center gap-2">
            <FaArrowLeft /> Back to Bookings
          </Button>
        </PageHeading>
      </div>
      {/* Form Card */}
      <Card className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-full">
            <FaCalendarAlt className="text-blue-600 text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Booking Information</h2>
            <p className="text-gray-600">Fill in the details below to create a new booking</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <FaExclamationTriangle className="text-red-600" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Client Selection */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Client Information</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Client
                  </label>
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      placeholder="Search by name, email, or phone..."
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Client *
                  </label>
                  <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg">
                    {filteredClients.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        {clientSearch ? 'No clients found' : 'No clients available'}
                      </div>
                    ) : (
                      filteredClients.map(client => (
                        <div
                          key={client._id}
                          onClick={() => setForm({ ...form, client: client._id })}
                          className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                            form.client === client._id ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                        >
                          <div className="font-medium text-gray-900">{client.name}</div>
                          <div className="text-sm text-gray-600">{client.email}</div>
                          {client.phone && (
                            <div className="text-sm text-gray-500">{client.phone}</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  {validationErrors.client && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.client}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium text-gray-900">Quick Actions</h4>
                  <Button
                    type="button"
                    color="secondary"
                    onClick={() => setShowAddClient(true)}
                    className="flex items-center gap-2"
                  >
                    <FaPlus /> Add New Client
                  </Button>
                </div>
                
                {form.client && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-600" />
                      <span className="text-green-700 font-medium">Client Selected</span>
                    </div>
                    <p className="text-green-600 text-sm mt-1">
                      {clients.find(c => c._id === form.client)?.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Location Information</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label htmlFor="pickup" className="block text-sm font-medium text-gray-700 mb-2">Pickup Location</label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Autocomplete
                    onLoad={(ref) => pickupAutocompleteRef.current = ref}
                    onPlaceChanged={() => handlePlaceChanged(pickupAutocompleteRef.current, 'pickup')}
                  >
                    <Input
                      name="pickup_name_temp"
                      id="pickup"
                      placeholder="Enter pickup location"
                      className="pl-10"
                      error={validationErrors.pickup}
                    />
                  </Autocomplete>
                </div>
                {validationErrors.pickup && <p className="text-red-500 text-xs mt-1">{validationErrors.pickup}</p>}
              </div>
              <div>
                <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">Destination Location</label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Autocomplete
                    onLoad={(ref) => destinationAutocompleteRef.current = ref}
                    onPlaceChanged={() => handlePlaceChanged(destinationAutocompleteRef.current, 'destination')}
                  >
                    <Input
                      name="destination_name_temp"
                      id="destination"
                      placeholder="Enter destination location"
                      className="pl-10"
                      error={validationErrors.destination}
                    />
                  </Autocomplete>
                </div>
                {validationErrors.destination && <p className="text-red-500 text-xs mt-1">{validationErrors.destination}</p>}
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Trip Details</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Start Date *"
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                    error={validationErrors.startDate}
                  />

                  <Input
                    label="End Date *"
                    name="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={handleChange}
                    required
                    error={validationErrors.endDate}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  label="Price *"
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  required
                  placeholder="Enter price"
                  error={validationErrors.price}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Number of Passengers"
                    name="passengers"
                    type="number"
                    value={form.passengers}
                    onChange={handleChange}
                    placeholder="Number of passengers"
                  />

                  <Input
                    label="Number of Bags"
                    name="bags"
                    type="number"
                    value={form.bags}
                    onChange={handleChange}
                    placeholder="Number of bags"
                  />
                </div>

                <Dropdown
                  label="Status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  options={[
                    { value: 'Pending', label: 'Pending' },
                    { value: 'Confirmed', label: 'Confirmed' },
                    { value: 'In Progress', label: 'In Progress' },
                    { value: 'Completed', label: 'Completed' },
                    { value: 'Cancelled', label: 'Cancelled' },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Assignment Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Assignment Details</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

              <Dropdown
                label="Vehicle"
                name="vehicle"
                value={form.vehicle}
                onChange={handleChange}
                options={[
                  { value: '', label: 'Select a vehicle' },
                  ...vehicles.map(vehicle => ({ value: vehicle._id, label: `${vehicle.name} (${vehicle.numberPlate})` }))
                ]}
              />

              <Dropdown
                label="Driver"
                name="driver"
                value={form.driver}
                onChange={handleChange}
                options={[
                  { value: '', label: 'Select a driver' },
                  ...drivers.map(driver => ({ value: driver._id, label: driver.name }))
                ]}
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Additional Information</h3>
            <div className="space-y-4">
              <Input
                label="Special Requirements"
                name="specialRequirements"
                value={form.specialRequirements}
                onChange={handleChange}
                placeholder="Any special requirements or notes"
              />

              <Input
                label="Notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Additional notes about the booking"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <Button 
              type="button"
              color="secondary" 
              onClick={() => navigate('/bookings')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              color="primary" 
              loading={loading}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <FaCalendarAlt /> Create Booking
            </Button>
          </div>
        </form>
      </Card>

      {/* Add Client Modal */}
      <Modal
        isOpen={showAddClient}
        onClose={() => setShowAddClient(false)}
        title="Add New Client"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={newClient.name}
            onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
            placeholder="Enter full name"
            required
          />
          <Input
            label="Email"
            type="email"
            value={newClient.email}
            onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
            placeholder="Enter email address"
            required
          />
          <Input
            label="Phone"
            value={newClient.phone}
            onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
            placeholder="Enter phone number"
          />
          <Input
            label="Passport Number"
            value={newClient.passportNumber}
            onChange={(e) => setNewClient({ ...newClient, passportNumber: e.target.value })}
            placeholder="Enter passport number"
          />
        </div>
        <div className="flex gap-4 mt-6">
          <Button
            type="button"
            color="secondary"
            onClick={() => setShowAddClient(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            color="primary"
            onClick={handleAddClient}
            loading={addingClient}
            className="flex-1"
          >
            Add Client
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AddBooking; 