import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClients, addClient } from '../services/clientService';
import { getUsers } from '../services/userService';
import { getBookings, addBooking } from '../services/bookingService';
import { getVehicles } from '../services/vehicleService';
import Input from '../components/common/Input';
import Dropdown from '../components/common/Dropdown';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaCar, FaInfoCircle, FaMoneyBillWave, FaClipboardCheck, FaCheckCircle } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

function BookingFlow() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', passportNumber: '', nationality: '' });
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({ agent: '', pickup: '', destination: '', startDate: '', startTime: '', price: '', bags: '', notes: '' });
  const [payment, setPayment] = useState({ mode: '', type: 'full', amountPaid: '', percent: 20 });
  const [status, setStatus] = useState('Pending');
  const [bookingId, setBookingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [clientErrors, setClientErrors] = useState({});
  const [detailsErrors, setDetailsErrors] = useState({});
  const [vehicleError, setVehicleError] = useState('');
  const [paymentErrors, setPaymentErrors] = useState({});

  // Load clients, vehicles, agents
  useEffect(() => {
    if (token) {
      getClients(token).then(setClients);
      getVehicles(token).then(setVehicles);
      getUsers({ role: 'agent' }, token).then(setAgents);
    }
  }, [token]);

  useEffect(() => {
    if (user && user.role === 'agent') {
      setBookingDetails(d => ({ ...d, agent: user.id }));
    } else if (user && user.role === 'admin' && !bookingDetails.agent) {
      setBookingDetails(d => ({ ...d, agent: user.id }));
    }
    // eslint-disable-next-line
  }, [user]);

  // Step 1: Select or Create Client
  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(clientSearch.toLowerCase())
  );
  const handleAddClient = async () => {
    setLoading(true);
    try {
      const client = await addClient(newClient, token);
      setClients([client, ...clients]);
      setSelectedClient(client);
      setShowAddClient(false);
      setStep(2);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to add client');
    }
    setLoading(false);
  };

  // Step 2: Select Vehicle
  // (For demo, show all vehicles. In production, filter by availability and dates)

  // Step 3: Booking Details
  const handleBookingInput = e => {
    const { name, value } = e.target;
    setBookingDetails(d => ({ ...d, [name]: value }));
  };

  // Step 4: Payment
  const totalAmount = Number(bookingDetails.price) || 0;
  const advanceAmount = payment.type === 'partial' ? Math.round((payment.percent / 100) * totalAmount) : totalAmount;
  const balanceAmount = totalAmount - (Number(payment.amountPaid) || 0);

  // Step 5: Review & Confirm
  const handleSubmitBooking = async () => {
    setSubmitting(true);
    try {
      const booking = await addBooking({
        ...bookingDetails,
        client: selectedClient._id,
        vehicle: selectedVehicle?._id,
        agent: bookingDetails.agent || user.id,
        payment,
        status,
      }, token);
      setBookingId(booking._id);
      setStep(6);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create booking');
    }
    setSubmitting(false);
  };

  // Stepper steps config
  const steps = [
    { label: 'Client', icon: <FaUser /> },
    { label: 'Vehicle', icon: <FaCar /> },
    { label: 'Details', icon: <FaInfoCircle /> },
    { label: 'Payment', icon: <FaMoneyBillWave /> },
    { label: 'Review', icon: <FaClipboardCheck /> },
    { label: 'Success', icon: <FaCheckCircle /> },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Booking</h1>
              <p className="text-gray-600 mt-1">Step-by-step booking creation process</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Step {step} of {steps.length}</div>
              <div className="text-lg font-semibold text-blue-600">{steps[step - 1]?.label}</div>
            </div>
          </div>
        </div>
      </div>

        {/* Stepper */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Stepper steps={steps} currentStep={step} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        <div className="w-full">
          {step === 1 && (
            <StepClient
              clients={clients}
              filteredClients={filteredClients}
              clientSearch={clientSearch}
              setClientSearch={setClientSearch}
              selectedClient={selectedClient}
              setSelectedClient={setSelectedClient}
              showAddClient={showAddClient}
              setShowAddClient={setShowAddClient}
              newClient={newClient}
              setNewClient={setNewClient}
              handleAddClient={handleAddClient}
              loading={loading}
              setStep={setStep}
              clientErrors={clientErrors}
              setClientErrors={setClientErrors}
            />
          )}
          {step === 2 && (
            <StepVehicle
              vehicles={vehicles}
              selectedVehicle={selectedVehicle}
              setSelectedVehicle={setSelectedVehicle}
              setStep={setStep}
              vehicleError={vehicleError}
              setVehicleError={setVehicleError}
            />
          )}
          {step === 3 && (
            <StepDetails
              agents={agents}
              bookingDetails={bookingDetails}
              handleBookingInput={handleBookingInput}
              setStep={setStep}
              detailsErrors={detailsErrors}
              setDetailsErrors={setDetailsErrors}
            />
          )}
          {step === 4 && (
            <StepPayment
              payment={payment}
              setPayment={setPayment}
              totalAmount={totalAmount}
              advanceAmount={advanceAmount}
              balanceAmount={balanceAmount}
              setStep={setStep}
              paymentErrors={paymentErrors}
              setPaymentErrors={setPaymentErrors}
            />
          )}
          {step === 5 && (
            <StepReview
              selectedClient={selectedClient}
              selectedVehicle={selectedVehicle}
              agents={agents}
              bookingDetails={bookingDetails}
              payment={payment}
              status={status}
              setStatus={setStatus}
              setStep={setStep}
              handleSubmitBooking={handleSubmitBooking}
              submitting={submitting}
              totalAmount={totalAmount}
            />
          )}
          {step === 6 && (
            <StepSuccess bookingId={bookingId} navigate={navigate} bookingDetails={bookingDetails} payment={payment} totalAmount={totalAmount} />
          )}
        </div>
      </div>
    </div>
  );
}

// Add a visual stepper/progress bar at the top
function Stepper({ steps, currentStep }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
      {steps.map((step, idx) => (
        <div key={step.label} className="flex-1 flex flex-col items-center relative">
            {/* Step Circle */}
            <div className={`relative z-10 rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold border-2 transition-all duration-300 ${
              idx + 1 < currentStep 
                ? 'bg-green-500 text-white border-green-500 shadow-lg' 
                : idx + 1 === currentStep 
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-110' 
                : 'bg-gray-100 text-gray-400 border-gray-300'
            }`}>
              {idx + 1 < currentStep ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                step.icon
              )}
            </div>
            
            {/* Step Label */}
            <span className={`mt-3 text-sm font-medium transition-colors duration-300 ${
              idx + 1 <= currentStep ? 'text-blue-700' : 'text-gray-400'
            }`}>
              {step.label}
            </span>
            
            {/* Progress Line */}
          {idx < steps.length - 1 && (
              <div className="absolute top-6 left-1/2 w-full h-0.5 bg-gray-200">
                <div 
                  className={`h-full transition-all duration-500 ease-out ${
                    idx + 1 < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                  style={{ width: idx + 1 < currentStep ? '100%' : '0%' }}
                />
              </div>
          )}
        </div>
      ))}
      </div>
    </div>
  );
}

// Step components
function StepClient({ clients, filteredClients, clientSearch, setClientSearch, selectedClient, setSelectedClient, showAddClient, setShowAddClient, newClient, setNewClient, handleAddClient, loading, setStep, clientErrors, setClientErrors }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Client Selection */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-full">
            <FaUser className="text-blue-600 text-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Select Client</h2>
            <p className="text-gray-600">Choose an existing client or create a new one</p>
      </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Clients</label>
            <Input 
              placeholder="Search by name or email..." 
              value={clientSearch} 
              onChange={e => setClientSearch(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            {filteredClients.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {clientSearch ? 'No clients found matching your search' : 'No clients available'}
              </div>
            ) : (
              filteredClients.map(c => (
                <div 
                  key={c._id} 
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-all ${
                    selectedClient?._id === c._id ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''
                  }`} 
                  onClick={() => setSelectedClient(c)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{c.name}</div>
                      <div className="text-sm text-gray-600">{c.email}</div>
                      {c.passportNumber && (
                        <div className="text-xs text-gray-500">Passport: {c.passportNumber}</div>
                      )}
                    </div>
                    {selectedClient?._id === c._id && (
                      <div className="text-blue-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <Button 
            color="primary" 
            className="w-full" 
            onClick={() => setShowAddClient(true)}
          >
            <FaUser className="mr-2" />
            Add New Client
          </Button>
        </div>
      </div>

      {/* Selected Client Preview */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Selected Client</h3>
        
        {selectedClient ? (
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {selectedClient.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{selectedClient.name}</h4>
                <p className="text-gray-600">{selectedClient.email}</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              {selectedClient.passportNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Passport:</span>
                  <span className="font-medium">{selectedClient.passportNumber}</span>
                </div>
              )}
              {selectedClient.nationality && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Nationality:</span>
                  <span className="font-medium">{selectedClient.nationality}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center">
            <FaUser className="text-gray-400 text-4xl mx-auto mb-3" />
            <p className="text-gray-500">No client selected</p>
            <p className="text-sm text-gray-400">Search and select a client to continue</p>
          </div>
        )}

        <div className="mt-6">
          <Button 
            color="primary" 
            className="w-full" 
            onClick={() => selectedClient && setStep(2)} 
            disabled={!selectedClient}
          >
            Continue to Vehicle Selection
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Add Client Modal */}
      <Modal open={showAddClient} onClose={() => setShowAddClient(false)}>
        <div className="bg-white rounded-2xl p-8 max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-full">
              <FaUser className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Add New Client</h3>
          </div>
          
          <div className="space-y-4">
            <Input 
              label="Full Name" 
              name="name" 
              value={newClient.name} 
              onChange={e => setNewClient(c => ({ ...c, name: e.target.value }))}
              error={clientErrors.name}
            />
            <Input 
              label="Email Address" 
              name="email" 
              type="email"
              value={newClient.email} 
              onChange={e => setNewClient(c => ({ ...c, email: e.target.value }))}
              error={clientErrors.email}
            />
            <Input 
              label="Passport Number" 
              name="passportNumber" 
              value={newClient.passportNumber} 
              onChange={e => setNewClient(c => ({ ...c, passportNumber: e.target.value }))}
              error={clientErrors.passportNumber}
            />
            <Input 
              label="Nationality" 
              name="nationality" 
              value={newClient.nationality} 
              onChange={e => setNewClient(c => ({ ...c, nationality: e.target.value }))}
              error={clientErrors.nationality}
            />
          </div>

          <div className="flex gap-3 mt-6">
            <Button 
              color="secondary" 
              className="flex-1" 
              onClick={() => setShowAddClient(false)}
            >
              Cancel
            </Button>
            <Button 
              color="primary" 
              className="flex-1" 
              onClick={() => {
            const errors = validateClient(newClient);
            setClientErrors(errors);
            if (Object.keys(errors).length === 0) handleAddClient();
              }} 
              loading={loading}
            >
              Save Client
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
function StepVehicle({ vehicles, selectedVehicle, setSelectedVehicle, setStep, vehicleError, setVehicleError }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Vehicle Selection */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 rounded-full">
            <FaCar className="text-green-600 text-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Select Vehicle</h2>
            <p className="text-gray-600">Choose the vehicle for this booking</p>
          </div>
        </div>

        <div className="space-y-4">
          {vehicles.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 text-center">
              <FaCar className="text-gray-400 text-4xl mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No vehicles available</p>
              <p className="text-sm text-gray-400">Please add vehicles to your fleet first</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {vehicles.map(v => (
                <div 
                  key={v._id} 
                  className={`p-6 border-2 rounded-xl cursor-pointer hover:shadow-lg transition-all ${
                    selectedVehicle?._id === v._id 
                      ? 'border-green-500 bg-green-50 shadow-lg' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`} 
                  onClick={() => setSelectedVehicle(v)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        selectedVehicle?._id === v._id ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <FaCar className="text-lg" />
                      </div>
                      <div>
                        <div className="font-bold text-lg text-gray-900">{v.name}</div>
                        <div className="text-sm text-gray-600">{v.vehicleType}</div>
                      </div>
                    </div>
                    {selectedVehicle?._id === v._id && (
                      <div className="text-green-600">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plate Number:</span>
                      <span className="font-medium">{v.numberPlate}</span>
                    </div>
                    {v.capacity && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="font-medium">{v.capacity} passengers</span>
                      </div>
                    )}
                    {v.fuelType && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fuel:</span>
                        <span className="font-medium">{v.fuelType}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="text-green-600 font-medium">Available</span>
                    </div>
                  </div>
          </div>
        ))}
      </div>
          )}

          {vehicleError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{vehicleError}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Vehicle Preview */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Selected Vehicle</h3>
        
        {selectedVehicle ? (
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white">
                <FaCar className="text-xl" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{selectedVehicle.name}</h4>
                <p className="text-gray-600">{selectedVehicle.vehicleType}</p>
              </div>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Plate Number:</span>
                <span className="font-medium">{selectedVehicle.numberPlate}</span>
              </div>
              {selectedVehicle.capacity && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Capacity:</span>
                  <span className="font-medium">{selectedVehicle.capacity} passengers</span>
                </div>
              )}
              {selectedVehicle.fuelType && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Fuel Type:</span>
                  <span className="font-medium">{selectedVehicle.fuelType}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-medium">Available</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center">
            <FaCar className="text-gray-400 text-4xl mx-auto mb-3" />
            <p className="text-gray-500">No vehicle selected</p>
            <p className="text-sm text-gray-400">Choose a vehicle to continue</p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <Button 
            color="secondary" 
            className="flex-1" 
            onClick={() => setStep(1)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
          <Button 
            color="primary" 
            className="flex-1" 
            onClick={() => {
              if (!selectedVehicle) {
                setVehicleError('Please select a vehicle');
              } else {
                setVehicleError('');
                setStep(3);
              }
            }}
          >
            Continue to Details
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
function StepDetails({ agents, bookingDetails, handleBookingInput, setStep, detailsErrors, setDetailsErrors }) {
  const { user } = useAuth();
  // Build agent options for admin: first option is a placeholder 'Select Agent', then 'Myself (Admin)', then all agents
  let agentOptions = [];
  if (user.role === 'admin') {
    agentOptions = [
      { value: '', label: 'Select Agent' },
      { value: user.id, label: 'Myself (Admin)' },
      ...agents.filter(a => a._id !== user.id).map(a => ({ value: a._id, label: a.name }))
    ];
  }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Booking Details Form */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-100 rounded-full">
            <FaInfoCircle className="text-purple-600 text-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
            <p className="text-gray-600">Fill in the trip information</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Agent Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Agent</label>
            <select 
              name="agent" 
              value={bookingDetails.agent} 
              onChange={handleBookingInput}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {agentOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {detailsErrors.agent && (
              <div className="text-red-500 text-sm mt-1">{detailsErrors.agent}</div>
            )}
          </div>

          {/* Location Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location</label>
              <input
                type="text"
                name="pickup"
                value={bookingDetails.pickup}
                onChange={handleBookingInput}
                placeholder="Enter pickup address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Where should the vehicle pick up the client?</p>
              {detailsErrors.pickup && (
                <div className="text-red-500 text-sm mt-1">{detailsErrors.pickup}</div>
              )}
      </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
              <input
                type="text"
                name="destination"
                value={bookingDetails.destination}
                onChange={handleBookingInput}
                placeholder="Enter destination address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Final drop-off location</p>
              {detailsErrors.destination && (
                <div className="text-red-500 text-sm mt-1">{detailsErrors.destination}</div>
              )}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Date</label>
              <input
                type="date"
                name="startDate"
                value={bookingDetails.startDate}
                onChange={handleBookingInput}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {detailsErrors.startDate && (
                <div className="text-red-500 text-sm mt-1">{detailsErrors.startDate}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Time</label>
              <input
                type="time"
                name="startTime"
                value={bookingDetails.startTime}
                onChange={handleBookingInput}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {detailsErrors.startTime && (
                <div className="text-red-500 text-sm mt-1">{detailsErrors.startTime}</div>
              )}
            </div>
          </div>

          {/* Price and Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
              <input
                type="number"
                name="price"
                value={bookingDetails.price}
                onChange={handleBookingInput}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {detailsErrors.price && (
                <div className="text-red-500 text-sm mt-1">{detailsErrors.price}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bags/Luggage</label>
              <input
                type="text"
                name="bags"
                value={bookingDetails.bags}
                onChange={handleBookingInput}
                placeholder="e.g., 2 large bags"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Number and type of luggage</p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
            <textarea
              name="notes"
              value={bookingDetails.notes}
              onChange={handleBookingInput}
              placeholder="Any special instructions or notes..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Booking Summary */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Booking Summary</h3>
        
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Trip Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">From:</span>
                <span className="font-medium">{bookingDetails.pickup || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">To:</span>
                <span className="font-medium">{bookingDetails.destination || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{bookingDetails.startDate || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{bookingDetails.startTime || 'Not specified'}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Financial Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-medium text-lg text-blue-600">
                  ${bookingDetails.price || '0.00'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bags:</span>
                <span className="font-medium">{bookingDetails.bags || 'Not specified'}</span>
              </div>
            </div>
          </div>

          {bookingDetails.notes && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Notes</h4>
              <p className="text-sm text-gray-700">{bookingDetails.notes}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button 
            color="secondary" 
            className="flex-1" 
            onClick={() => setStep(2)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
          <Button 
            color="primary" 
            className="flex-1" 
            onClick={() => {
          const errors = validateDetails(bookingDetails);
          setDetailsErrors(errors);
          if (Object.keys(errors).length === 0) setStep(4);
            }}
          >
            Continue to Payment
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
function StepPayment({ payment, setPayment, totalAmount, advanceAmount, balanceAmount, setStep, paymentErrors, setPaymentErrors }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Payment Form */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-yellow-100 rounded-full">
            <FaMoneyBillWave className="text-yellow-600 text-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
            <p className="text-gray-600">Configure payment information</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Payment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
            <select 
              name="type" 
              value={payment.type} 
              onChange={e => setPayment(p => ({ ...p, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="full">Full Payment</option>
              <option value="partial">Partial Advance</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Choose if client pays full or partial (advance) now</p>
          </div>

          {/* Advance Percentage for Partial Payment */}
        {payment.type === 'partial' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Advance Percentage (%)</label>
              <input
                type="number"
                name="percent"
                min="1"
                max="100"
                value={payment.percent}
                onChange={e => setPayment(p => ({ ...p, percent: e.target.value }))}
                placeholder="e.g., 50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Advance percentage required for partial payment</p>
            </div>
          )}

          {/* Payment Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
            <select 
              name="mode" 
              value={payment.mode} 
              onChange={e => setPayment(p => ({ ...p, mode: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Payment Mode</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="online">Online Transfer</option>
              <option value="check">Check</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">How is the payment being made?</p>
            {paymentErrors.mode && (
              <div className="text-red-500 text-sm mt-1">{paymentErrors.mode}</div>
            )}
      </div>

          {/* Amount Paid */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount Paid ($)</label>
            <input
              type="number"
              name="amountPaid"
              value={payment.amountPaid}
              onChange={e => setPayment(p => ({ ...p, amountPaid: e.target.value }))}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">How much is being paid now?</p>
            {paymentErrors.amountPaid && (
              <div className="text-red-500 text-sm mt-1">{paymentErrors.amountPaid}</div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Summary</h3>
        
        <div className="space-y-4">
          {/* Total Amount */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-3">Total Amount</h4>
            <div className="text-3xl font-bold text-blue-600">${totalAmount}</div>
            <p className="text-sm text-gray-600">Total booking amount</p>
          </div>

          {/* Payment Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Payment Breakdown</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-medium text-green-600">${Number(payment.amountPaid) || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Balance Due:</span>
                <span className="font-medium text-red-600">${balanceAmount}</span>
              </div>
              {payment.type === 'partial' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Advance Required:</span>
                  <span className="font-medium text-blue-600">${advanceAmount}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-gray-900 mb-3">Payment Status</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium capitalize">{payment.type || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mode:</span>
                <span className="font-medium capitalize">{payment.mode || 'Not selected'}</span>
              </div>
              {payment.type === 'partial' && payment.percent && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Advance %:</span>
                  <span className="font-medium">{payment.percent}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Validation Messages */}
          {Object.keys(paymentErrors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc list-inside">
                      {Object.values(paymentErrors).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button 
            color="secondary" 
            className="flex-1" 
            onClick={() => setStep(3)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
          <Button 
            color="primary" 
            className="flex-1" 
            onClick={() => {
          const errors = validatePayment(payment, advanceAmount);
          setPaymentErrors(errors);
          if (Object.keys(errors).length === 0) setStep(5);
            }}
          >
            Continue to Review
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
function StepReview({ selectedClient, selectedVehicle, agents, bookingDetails, payment, status, setStatus, setStep, handleSubmitBooking, submitting, totalAmount }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Review Form */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-100 rounded-full">
            <FaClipboardCheck className="text-indigo-600 text-xl" />
      </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Final Review</h2>
            <p className="text-gray-600">Review and confirm booking details</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Booking Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Booking Status</label>
            <select 
              name="status" 
              value={status} 
              onChange={e => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Set the initial status for this booking</p>
          </div>

          {/* Confirmation Message */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Ready to Confirm</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Please review all the details on the right before confirming this booking. Once confirmed, the booking will be created and you'll receive a confirmation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Summary */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Complete Booking Summary</h3>
        
        <div className="space-y-4">
          {/* Client & Vehicle */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Client & Vehicle</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Client:</span>
                <span className="font-medium">{selectedClient?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{selectedClient?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vehicle:</span>
                <span className="font-medium">{selectedVehicle?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Plate:</span>
                <span className="font-medium">{selectedVehicle?.numberPlate}</span>
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-3">Trip Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">From:</span>
                <span className="font-medium">{bookingDetails.pickup}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">To:</span>
                <span className="font-medium">{bookingDetails.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{bookingDetails.startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{bookingDetails.startTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Agent:</span>
                <span className="font-medium">{agents.find(a => a._id === bookingDetails.agent)?.name || '-'}</span>
              </div>
            </div>
          </div>

          {/* Financial Details */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-gray-900 mb-3">Financial Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Price:</span>
                <span className="font-medium text-lg text-green-600">${bookingDetails.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Mode:</span>
                <span className="font-medium capitalize">{payment.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-medium text-green-600">${Number(payment.amountPaid) || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Balance:</span>
                <span className="font-medium text-red-600">${totalAmount - (Number(payment.amountPaid) || 0)}</span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {(bookingDetails.bags || bookingDetails.notes) && (
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h4 className="font-semibold text-gray-900 mb-3">Additional Information</h4>
              <div className="space-y-2 text-sm">
                {bookingDetails.bags && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bags/Luggage:</span>
                    <span className="font-medium">{bookingDetails.bags}</span>
                  </div>
                )}
                {bookingDetails.notes && (
                  <div>
                    <span className="text-gray-600">Notes:</span>
                    <p className="font-medium mt-1">{bookingDetails.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button 
            color="secondary" 
            className="flex-1" 
            onClick={() => setStep(4)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
          <Button 
            color="primary" 
            className="flex-1" 
            onClick={handleSubmitBooking} 
            loading={submitting}
          >
            <FaCheckCircle className="mr-2" />
            Confirm Booking
          </Button>
        </div>
      </div>
    </div>
  );
}
function StepSuccess({ bookingId, navigate, bookingDetails, payment, totalAmount }) {
  const paid = Number(payment.amountPaid) || 0;
  const balance = totalAmount - paid;
  const data = [
    { name: 'Paid', value: paid },
    { name: 'Balance', value: balance > 0 ? balance : 0 },
  ];
  const COLORS = ['#22c55e', '#f87171'];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Success Message */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="text-green-600 text-4xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
          <p className="text-lg text-gray-600 mb-6">Your booking has been successfully created. You will receive a confirmation email shortly.</p>
          
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 mb-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Booking ID</div>
              <div className="text-2xl font-bold text-blue-600">{bookingId}</div>
          </div>
        </div>

          <div className="space-y-3">
            <Button 
              color="primary" 
              className="w-full" 
              onClick={() => navigate('/bookings')}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              View All Bookings
            </Button>
            <Button 
              color="secondary" 
              className="w-full" 
              onClick={() => navigate('/bookings/add')}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Another Booking
            </Button>
          </div>
        </div>
      </div>

      {/* Booking Details */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Booking Details</h3>
        
        <div className="space-y-4">
          {/* Trip Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Trip Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Pickup:</span>
                <span className="font-medium">{bookingDetails.pickup}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Destination:</span>
                <span className="font-medium">{bookingDetails.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{bookingDetails.startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{bookingDetails.startTime}</span>
              </div>
              {bookingDetails.bags && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Bags:</span>
                  <span className="font-medium">{bookingDetails.bags}</span>
                </div>
              )}
              {bookingDetails.notes && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Notes:</span>
                  <span className="font-medium">{bookingDetails.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-3">Payment Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Type:</span>
                <span className="font-medium capitalize">{payment.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Mode:</span>
                <span className="font-medium capitalize">{payment.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium text-lg text-blue-600">${totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-medium text-green-600">${paid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Balance:</span>
                <span className="font-medium text-red-600">${balance}</span>
              </div>
            </div>
          </div>

          {/* Payment Chart */}
          {balance > 0 && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Payment Breakdown</h4>
              <div className="w-full h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                {data.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Validation helpers
function validateClient(client) {
  const errors = {};
  if (!client.name) errors.name = 'Name is required';
  if (!client.email) errors.email = 'Email is required';
  else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(client.email)) errors.email = 'Invalid email';
  if (!client.passportNumber) errors.passportNumber = 'Passport number is required';
  if (!client.nationality) errors.nationality = 'Nationality is required';
  return errors;
}
function validateDetails(details) {
  const errors = {};
  if (!details.agent) errors.agent = 'Agent is required';
  if (!details.pickup) errors.pickup = 'Pickup location is required';
  if (!details.destination) errors.destination = 'Destination is required';
  if (!details.startDate) errors.startDate = 'Pickup date is required';
  if (!details.startTime) errors.startTime = 'Pickup time is required';
  if (!details.price) errors.price = 'Price is required';
  if (Number(details.price) <= 0) errors.price = 'Price must be positive';
  return errors;
}
function validatePayment(payment, advanceAmount) {
  const errors = {};
  if (!payment.mode) errors.mode = 'Payment mode is required';
  if (!payment.amountPaid) errors.amountPaid = 'Amount paid is required';
  if (payment.type === 'partial' && Number(payment.amountPaid) < advanceAmount) errors.amountPaid = `At least $${advanceAmount} required as advance`;
  return errors;
}

export default BookingFlow; 