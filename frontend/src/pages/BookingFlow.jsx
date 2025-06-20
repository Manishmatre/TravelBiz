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
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8 min-h-screen">
      <div className="w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">New Booking</h1>
        {/* Stepper */}
        <Stepper steps={steps} currentStep={step} />
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="w-full max-w-5xl mx-auto">
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
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, idx) => (
        <div key={step.label} className="flex-1 flex flex-col items-center relative">
          <div className={`rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold border-2 ${idx + 1 <= currentStep ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-200 text-gray-500 border-gray-300'}`}>{step.icon}</div>
          <span className={`mt-2 text-xs font-semibold ${idx + 1 <= currentStep ? 'text-blue-700' : 'text-gray-400'}`}>{step.label}</span>
          {idx < steps.length - 1 && (
            <div className={`absolute top-5 right-0 w-full h-1 ${idx + 2 <= currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          )}
        </div>
      ))}
    </div>
  );
}

// Step components
function StepClient({ clients, filteredClients, clientSearch, setClientSearch, selectedClient, setSelectedClient, showAddClient, setShowAddClient, newClient, setNewClient, handleAddClient, loading, setStep, clientErrors, setClientErrors }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 transition-all max-w-2xl mx-auto w-full">
      <h2 className="text-xl font-bold mb-4">Select or Create Client</h2>
      <Input placeholder="Search by name or email..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} />
      <div className="max-h-48 overflow-y-auto my-2">
        {filteredClients.map(c => (
          <div key={c._id} className={`p-3 rounded cursor-pointer hover:bg-blue-100 transition ${selectedClient?._id === c._id ? 'bg-blue-200 font-bold' : ''}`} onClick={() => setSelectedClient(c)}>
            {c.name} ({c.email})
          </div>
        ))}
      </div>
      <Button color="primary" className="w-full mt-2" onClick={() => setShowAddClient(true)}>Add New Client</Button>
      <Button color="secondary" className="w-full mt-2" onClick={() => selectedClient && setStep(2)} disabled={!selectedClient}>Next</Button>
      <Modal open={showAddClient} onClose={() => setShowAddClient(false)}>
        <div className="p-4">
          <h3 className="font-bold mb-2">Add Client</h3>
          <Input label="Name" name="name" value={newClient.name} onChange={e => setNewClient(c => ({ ...c, name: e.target.value }))} />
          {clientErrors.name && <div className="text-red-500 text-xs mb-2">{clientErrors.name}</div>}
          <Input label="Email" name="email" value={newClient.email} onChange={e => setNewClient(c => ({ ...c, email: e.target.value }))} />
          {clientErrors.email && <div className="text-red-500 text-xs mb-2">{clientErrors.email}</div>}
          <Input label="Passport Number" name="passportNumber" value={newClient.passportNumber} onChange={e => setNewClient(c => ({ ...c, passportNumber: e.target.value }))} />
          {clientErrors.passportNumber && <div className="text-red-500 text-xs mb-2">{clientErrors.passportNumber}</div>}
          <Input label="Nationality" name="nationality" value={newClient.nationality} onChange={e => setNewClient(c => ({ ...c, nationality: e.target.value }))} />
          {clientErrors.nationality && <div className="text-red-500 text-xs mb-2">{clientErrors.nationality}</div>}
          <Button color="primary" className="mt-2 w-full" onClick={() => {
            const errors = validateClient(newClient);
            setClientErrors(errors);
            if (Object.keys(errors).length === 0) handleAddClient();
          }} loading={loading}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}
function StepVehicle({ vehicles, selectedVehicle, setSelectedVehicle, setStep, vehicleError, setVehicleError }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 transition-all max-w-2xl mx-auto w-full">
      <h2 className="text-xl font-bold mb-4">Select Vehicle</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto my-2">
        {vehicles.map(v => (
          <div key={v._id} className={`p-4 border rounded-xl cursor-pointer hover:bg-blue-50 transition flex flex-col gap-1 ${selectedVehicle?._id === v._id ? 'border-blue-500 bg-blue-100' : 'border-blue-100'}`} onClick={() => setSelectedVehicle(v)}>
            <div className="font-bold text-lg">{v.name}</div>
            <div className="text-gray-500">{v.numberPlate}</div>
            <div className="text-xs text-gray-400">{v.vehicleType}</div>
          </div>
        ))}
      </div>
      {vehicleError && <div className="text-red-500 text-xs mb-2">{vehicleError}</div>}
      <div className="flex gap-2 mt-4">
        <Button color="secondary" className="flex-1" onClick={() => setStep(1)}>Back</Button>
        <Button color="primary" className="flex-1" onClick={() => {
          if (!selectedVehicle) setVehicleError('Please select a vehicle');
          else setStep(3);
        }}>Next</Button>
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
    <div className="bg-white rounded-2xl shadow-lg p-8 transition-all max-w-2xl mx-auto w-full">
      <h2 className="text-xl font-bold mb-4">Booking Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Dropdown label="Agent" name="agent" value={bookingDetails.agent} onChange={handleBookingInput} options={agentOptions} />
        {detailsErrors.agent && <div className="text-red-500 text-xs mb-2">{detailsErrors.agent}</div>}
        <Input label="Pickup Point/Location" name="pickup" value={bookingDetails.pickup} onChange={handleBookingInput} helperText="Where should the vehicle pick up the client?" />
        {detailsErrors.pickup && <div className="text-red-500 text-xs mb-2">{detailsErrors.pickup}</div>}
        <Input label="Destination" name="destination" value={bookingDetails.destination} onChange={handleBookingInput} helperText="Final drop-off location." />
        {detailsErrors.destination && <div className="text-red-500 text-xs mb-2">{detailsErrors.destination}</div>}
        <Input label="Pickup Date" name="startDate" type="date" value={bookingDetails.startDate} onChange={handleBookingInput} />
        {detailsErrors.startDate && <div className="text-red-500 text-xs mb-2">{detailsErrors.startDate}</div>}
        <Input label="Pickup Time" name="startTime" type="time" value={bookingDetails.startTime} onChange={handleBookingInput} />
        {detailsErrors.startTime && <div className="text-red-500 text-xs mb-2">{detailsErrors.startTime}</div>}
        <Input label="Price" name="price" type="number" value={bookingDetails.price} onChange={handleBookingInput} />
        {detailsErrors.price && <div className="text-red-500 text-xs mb-2">{detailsErrors.price}</div>}
        <Input label="Bags/Luggage" name="bags" value={bookingDetails.bags} onChange={handleBookingInput} helperText="Number of bags/luggage." />
        <Input label="Notes" name="notes" value={bookingDetails.notes} onChange={handleBookingInput} />
      </div>
      <div className="flex gap-2 mt-4">
        <Button color="secondary" className="flex-1" onClick={() => setStep(2)}>Back</Button>
        <Button color="primary" className="flex-1" onClick={() => {
          const errors = validateDetails(bookingDetails);
          setDetailsErrors(errors);
          if (Object.keys(errors).length === 0) setStep(4);
        }}>Next</Button>
      </div>
    </div>
  );
}
function StepPayment({ payment, setPayment, totalAmount, advanceAmount, balanceAmount, setStep, paymentErrors, setPaymentErrors }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 transition-all max-w-2xl mx-auto w-full">
      <h2 className="text-xl font-bold mb-4">Payment</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="font-semibold">Total Payable: <span className="text-blue-700">${totalAmount}</span></div>
        <Dropdown label="Payment Type" name="type" value={payment.type} onChange={e => setPayment(p => ({ ...p, type: e.target.value }))} options={[
          { value: 'full', label: 'Full Payment' },
          { value: 'partial', label: 'Partial Advance' },
        ]} helperText="Choose if client pays full or partial (advance) now." />
        {payment.type === 'partial' && (
          <Input label="Advance %" name="percent" type="number" min={1} max={100} value={payment.percent} onChange={e => setPayment(p => ({ ...p, percent: e.target.value }))} helperText="Advance percentage required for partial payment." />
        )}
        <Dropdown label="Payment Mode" name="mode" value={payment.mode} onChange={e => setPayment(p => ({ ...p, mode: e.target.value }))} options={[
          { value: '', label: 'Select Mode' },
          { value: 'cash', label: 'Cash' },
          { value: 'card', label: 'Card' },
          { value: 'online', label: 'Online' },
        ]} helperText="How is the payment being made?" />
        {paymentErrors.mode && <div className="text-red-500 text-xs mb-2">{paymentErrors.mode}</div>}
        <Input label="Amount Paid" name="amountPaid" type="number" value={payment.amountPaid} onChange={e => setPayment(p => ({ ...p, amountPaid: e.target.value }))} helperText="How much is being paid now?" />
        {paymentErrors.amountPaid && <div className="text-red-500 text-xs mb-2">{paymentErrors.amountPaid}</div>}
        <div className="font-semibold">Advance Required: <span className="text-blue-700">${advanceAmount}</span></div>
        <div className="font-semibold">Balance: <span className="text-red-600">${balanceAmount}</span></div>
      </div>
      <div className="flex gap-2 mt-4">
        <Button color="secondary" className="flex-1" onClick={() => setStep(3)}>Back</Button>
        <Button color="primary" className="flex-1" onClick={() => {
          const errors = validatePayment(payment, advanceAmount);
          setPaymentErrors(errors);
          if (Object.keys(errors).length === 0) setStep(5);
        }}>Next</Button>
      </div>
    </div>
  );
}
function StepReview({ selectedClient, selectedVehicle, agents, bookingDetails, payment, status, setStatus, setStep, handleSubmitBooking, submitting, totalAmount }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 transition-all">
      <h2 className="text-xl font-bold mb-4">Final Review & Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div><b>Client:</b> {selectedClient?.name} ({selectedClient?.email})</div>
        <div><b>Vehicle:</b> {selectedVehicle?.name} ({selectedVehicle?.numberPlate})</div>
        <div><b>Agent:</b> {agents.find(a => a._id === bookingDetails.agent)?.name || '-'}</div>
        <div><b>Pickup:</b> {bookingDetails.pickup}</div>
        <div><b>Destination:</b> {bookingDetails.destination}</div>
        <div><b>Date:</b> {bookingDetails.startDate}</div>
        <div><b>Time:</b> {bookingDetails.startTime}</div>
        <div><b>Price:</b> {bookingDetails.price}</div>
        <div><b>Bags:</b> {bookingDetails.bags}</div>
        <div><b>Notes:</b> {bookingDetails.notes}</div>
        <div><b>Payment Mode:</b> {payment.mode}</div>
        <div><b>Advance Paid:</b> {payment.amountPaid}</div>
        <div><b>Balance:</b> {totalAmount - (Number(payment.amountPaid) || 0)}</div>
      </div>
      <Dropdown label="Status" name="status" value={status} onChange={e => setStatus(e.target.value)} options={[
        { value: 'Pending', label: 'Pending' },
        { value: 'Confirmed', label: 'Confirmed' },
        { value: 'Completed', label: 'Completed' },
        { value: 'Cancelled', label: 'Cancelled' },
      ]} />
      <div className="flex gap-2 mt-4">
        <Button color="secondary" className="flex-1" onClick={() => setStep(4)}>Back</Button>
        <Button color="primary" className="flex-1" onClick={handleSubmitBooking} loading={submitting}>Confirm Booking</Button>
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
    <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center max-w-2xl mx-auto w-full">
      <FaCheckCircle className="text-green-500 text-6xl mb-4" />
      <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
      <p className="mb-4 text-gray-700">Your booking has been successfully created. You will receive a confirmation email shortly.</p>
      <div className="w-full bg-gray-50 rounded-lg p-4 mb-4">
        <div className="font-semibold mb-2">Booking ID: <span className="text-blue-700">{bookingId}</span></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div><b>Pickup:</b> {bookingDetails.pickup}</div>
            <div><b>Destination:</b> {bookingDetails.destination}</div>
            <div><b>Date:</b> {bookingDetails.startDate}</div>
            <div><b>Time:</b> {bookingDetails.startTime}</div>
            <div><b>Bags:</b> {bookingDetails.bags}</div>
            <div><b>Notes:</b> {bookingDetails.notes}</div>
          </div>
          <div>
            <div><b>Payment Type:</b> {payment.type}</div>
            <div><b>Payment Mode:</b> {payment.mode}</div>
            <div><b>Total Amount:</b> ${totalAmount}</div>
            <div><b>Paid:</b> ${paid}</div>
            <div><b>Balance:</b> ${balance}</div>
          </div>
        </div>
        <div className="w-full h-48 mt-4">
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
      <Button color="primary" className="w-full" onClick={() => navigate('/bookings')}>Go to Bookings</Button>
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