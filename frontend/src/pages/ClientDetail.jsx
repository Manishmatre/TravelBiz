import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Tab from '../components/common/Tab';
import Loader from '../components/common/Loader';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import { getClients } from '../services/clientService';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { getBookings, addBooking } from '../services/bookingService';

const tabLabels = [
  'General Info',
  'Files',
  'Assigned Vehicle',
  'Trips/Bookings',
  'Payments & Invoices',
  'Notes & Communication',
  'Documents',
  'Activity Log',
];

function ClientDetail() {
  const { id } = useParams();
  const { token } = useAuth ? useAuth() : { token: localStorage.getItem('token') };
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState('');
  const [newBooking, setNewBooking] = useState({ startDate: '', endDate: '', destination: '', status: 'Pending', price: '', notes: '' });
  const [addingBooking, setAddingBooking] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      setLoading(true);
      setError('');
      try {
        // Assuming getClients can fetch by ID if passed an ID
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/clients/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch client');
        const data = await res.json();
        setClient(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch client');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchClient();
  }, [id, token]);

  // Fetch bookings for this client
  useEffect(() => {
    if (!id || !token) return;
    setBookingsLoading(true);
    setBookingsError('');
    getBookings(id, token)
      .then(setBookings)
      .catch(e => setBookingsError(e.response?.data?.message || 'Failed to load bookings'))
      .finally(() => setBookingsLoading(false));
  }, [id, token]);

  const handleBookingInput = e => {
    const { name, value } = e.target;
    setNewBooking(b => ({ ...b, [name]: value }));
  };
  const handleAddBooking = async () => {
    setAddingBooking(true);
    try {
      await addBooking({ ...newBooking, client: id, agent: client.assignedAgent?._id || client.assignedAgent }, token);
      setBookingModalOpen(false);
      setNewBooking({ startDate: '', endDate: '', destination: '', status: 'Pending', price: '', notes: '' });
      // Refresh bookings
      setBookingsLoading(true);
      const updated = await getBookings(id, token);
      setBookings(updated);
      setBookingsLoading(false);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to add booking');
      setAddingBooking(false);
    }
  };

  if (loading) return <Loader className="my-10" />;
  if (error) return <div className="text-red-500 p-6">{error}</div>;
  if (!client) return null;

  // Mock data for demonstration
  const mockBookings = [
    { _id: 'b1', date: '2024-06-01', destination: 'Paris', status: 'Confirmed' },
    { _id: 'b2', date: '2024-07-15', destination: 'London', status: 'Pending' },
  ];
  const mockPayments = [
    { _id: 'p1', date: '2024-05-20', amount: 1200, status: 'Paid' },
    { _id: 'p2', date: '2024-06-10', amount: 800, status: 'Unpaid' },
  ];
  const mockNotes = [
    { _id: 'n1', date: '2024-05-10', author: 'Agent John', note: 'Client prefers window seat.' },
    { _id: 'n2', date: '2024-06-02', author: 'Agent Jane', note: 'Requested vegetarian meal.' },
  ];
  const mockDocuments = [
    { _id: 'd1', type: 'Passport', uploaded: '2024-05-01' },
    { _id: 'd2', type: 'Visa', uploaded: '2024-05-05' },
  ];
  const mockActivity = [
    { _id: 'a1', date: '2024-05-01', action: 'Created client', user: 'Admin' },
    { _id: 'a2', date: '2024-05-10', action: 'Added booking', user: 'Agent John' },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8 min-h-screen">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Client Details</h1>
          <Link to="/clients">
            <Button color="secondary">Back to Clients</Button>
          </Link>
        </div>
        <Tab
          tabs={tabLabels.map(label => ({ label }))}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="mb-6"
        />
        {/* Tab Content */}
        {activeTab === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-600">
                  {client.name?.[0] || '?'}
                </div>
              </div>
              {/* Info */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><span className="font-semibold">Name:</span> {client.name}</div>
                <div><span className="font-semibold">Email:</span> {client.email}</div>
                <div><span className="font-semibold">Phone:</span> {client.phone || '-'}</div>
                <div><span className="font-semibold">Passport #:</span> {client.passportNumber}</div>
                <div><span className="font-semibold">Nationality:</span> {client.nationality}</div>
                <div><span className="font-semibold">Status:</span> {client.status || 'Active'}</div>
                <div><span className="font-semibold">Assigned Agent:</span> {client.assignedAgent?.name || '-'}</div>
                <div><span className="font-semibold">Notes:</span> {client.notes || '-'}</div>
                <div><span className="font-semibold">Emergency Contact:</span> {client.emergencyContact ? `${client.emergencyContact.name} (${client.emergencyContact.relation}) - ${client.emergencyContact.phone}` : '-'}</div>
                <div><span className="font-semibold">Created At:</span> {client.createdAt ? new Date(client.createdAt).toLocaleString() : '-'}</div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {/* Files Table */}
            <h2 className="text-lg font-bold mb-4">Files</h2>
            {client.files && client.files.length > 0 ? (
              <Table
                columns={[
                  { label: 'Title', accessor: 'title' },
                  { label: 'Type', accessor: 'fileType' },
                  { label: 'Uploaded', accessor: 'createdAt', render: v => v ? new Date(v).toLocaleString() : '-' },
                ]}
                data={client.files}
              />
            ) : (
              <div className="text-gray-500">No files found for this client.</div>
            )}
          </div>
        )}
        {activeTab === 2 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {/* Assigned Vehicle */}
            <h2 className="text-lg font-bold mb-4">Assigned Vehicle</h2>
            {client.assignedVehicle ? (
              <div>
                <div><span className="font-semibold">Vehicle Name:</span> {client.assignedVehicle.name}</div>
                <div><span className="font-semibold">Number Plate:</span> {client.assignedVehicle.numberPlate}</div>
                <div><span className="font-semibold">Type:</span> {client.assignedVehicle.vehicleType}</div>
                <div><span className="font-semibold">Status:</span> {client.assignedVehicle.status}</div>
                <Link to={`/vehicles/${client.assignedVehicle._id}`} className="text-blue-600 underline mt-2 inline-block">View Vehicle Details</Link>
              </div>
            ) : (
              <div className="text-gray-500">No vehicle assigned to this client.</div>
            )}
          </div>
        )}
        {activeTab === 3 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Trips / Bookings</h2>
              <Button color="primary" size="sm" onClick={() => setBookingModalOpen(true)}>Add Booking</Button>
            </div>
            {bookingsLoading ? (
              <Loader className="my-6" />
            ) : bookingsError ? (
              <div className="text-red-500">{bookingsError}</div>
            ) : (
              <Table
                columns={[
                  { label: 'Start Date', accessor: 'startDate', render: v => v ? new Date(v).toLocaleDateString() : '-' },
                  { label: 'End Date', accessor: 'endDate', render: v => v ? new Date(v).toLocaleDateString() : '-' },
                  { label: 'Destination', accessor: 'destination' },
                  { label: 'Status', accessor: 'status' },
                  { label: 'Price', accessor: 'price' },
                ]}
                data={bookings}
              />
            )}
            <Modal open={bookingModalOpen} onClose={() => setBookingModalOpen(false)}>
              <div className="p-4">
                <h3 className="font-bold mb-2">Add Booking</h3>
                <Input label="Start Date" name="startDate" type="date" value={newBooking.startDate} onChange={handleBookingInput} />
                <Input label="End Date" name="endDate" type="date" value={newBooking.endDate} onChange={handleBookingInput} />
                <Input label="Destination" name="destination" value={newBooking.destination} onChange={handleBookingInput} />
                <Input label="Status" name="status" value={newBooking.status} onChange={handleBookingInput} />
                <Input label="Price" name="price" type="number" value={newBooking.price} onChange={handleBookingInput} />
                <Input label="Notes" name="notes" value={newBooking.notes} onChange={handleBookingInput} />
                <Button color="primary" className="mt-2 w-full" onClick={handleAddBooking} loading={addingBooking}>Save</Button>
              </div>
            </Modal>
          </div>
        )}
        {activeTab === 4 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Payments & Invoices</h2>
              <Button color="primary" size="sm" onClick={() => setPaymentModalOpen(true)}>Add Payment</Button>
            </div>
            <Table
              columns={[
                { label: 'Date', accessor: 'date' },
                { label: 'Amount', accessor: 'amount' },
                { label: 'Status', accessor: 'status' },
              ]}
              data={mockPayments}
            />
            <Modal open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)}>
              <div className="p-4">
                <h3 className="font-bold mb-2">Add Payment</h3>
                <Input label="Date" name="date" type="date" />
                <Input label="Amount" name="amount" type="number" />
                <Input label="Status" name="status" />
                <Button color="primary" className="mt-2 w-full" onClick={() => setPaymentModalOpen(false)}>Save</Button>
              </div>
            </Modal>
          </div>
        )}
        {activeTab === 5 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Notes & Communication</h2>
              <Button color="primary" size="sm" onClick={() => setNoteModalOpen(true)}>Add Note</Button>
            </div>
            <Table
              columns={[
                { label: 'Date', accessor: 'date' },
                { label: 'Author', accessor: 'author' },
                { label: 'Note', accessor: 'note' },
              ]}
              data={mockNotes}
            />
            <Modal open={noteModalOpen} onClose={() => setNoteModalOpen(false)}>
              <div className="p-4">
                <h3 className="font-bold mb-2">Add Note</h3>
                <Input label="Date" name="date" type="date" />
                <Input label="Author" name="author" />
                <Input label="Note" name="note" />
                <Button color="primary" className="mt-2 w-full" onClick={() => setNoteModalOpen(false)}>Save</Button>
              </div>
            </Modal>
          </div>
        )}
        {activeTab === 6 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Documents</h2>
              <Button color="primary" size="sm" onClick={() => setDocumentModalOpen(true)}>Upload Document</Button>
            </div>
            <Table
              columns={[
                { label: 'Type', accessor: 'type' },
                { label: 'Uploaded', accessor: 'uploaded' },
              ]}
              data={mockDocuments}
            />
            <Modal open={documentModalOpen} onClose={() => setDocumentModalOpen(false)}>
              <div className="p-4">
                <h3 className="font-bold mb-2">Upload Document</h3>
                <Input label="Type" name="type" />
                <Input label="File" name="file" type="file" />
                <Button color="primary" className="mt-2 w-full" onClick={() => setDocumentModalOpen(false)}>Upload</Button>
              </div>
            </Modal>
          </div>
        )}
        {activeTab === 7 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold mb-4">Activity Log</h2>
            <Table
              columns={[
                { label: 'Date', accessor: 'date' },
                { label: 'Action', accessor: 'action' },
                { label: 'User', accessor: 'user' },
              ]}
              data={mockActivity}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ClientDetail; 