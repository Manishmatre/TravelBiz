import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Tab from '../components/common/Tab';
import Loader from '../components/common/Loader';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Dropdown from '../components/common/Dropdown';
import { getClients, updateClient } from '../services/clientService';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/common/Modal';
import { getBookings, addBooking } from '../services/bookingService';
import { getUsers } from '../services/userService';
import Notification from '../components/common/Notification';

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
  const { token, user } = useAuth ? useAuth() : { token: localStorage.getItem('token') };
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
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [agents, setAgents] = useState([]);
  const [notification, setNotification] = useState(null);
  
  // Files management state
  const [files, setFiles] = useState([]);
  const [newFile, setNewFile] = useState({ title: '', fileType: '', file: null });
  const [uploadingFile, setUploadingFile] = useState(false);
  
  // Notes management state
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ note: '', type: 'General' });
  const [addingNote, setAddingNote] = useState(false);
  
  // Payments management state
  const [payments, setPayments] = useState([]);
  const [newPayment, setNewPayment] = useState({ date: '', amount: '', status: 'Pending', description: '' });
  const [addingPayment, setAddingPayment] = useState(false);

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
        setEditForm({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          passportNumber: data.passportNumber || '',
          nationality: data.nationality || '',
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
          address: data.address || '',
          emergencyContact: data.emergencyContact || '',
          emergencyPhone: data.emergencyPhone || '',
          status: data.status || 'Active'
        });
      } catch (err) {
        setError(err.message || 'Failed to fetch client');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchClient();
  }, [id, token]);

  // Fetch agents for edit mode
  useEffect(() => {
    const fetchAgents = async () => {
      if (user?.role === 'admin' && token) {
        try {
          const agentsData = await getUsers({ role: 'agent' }, token);
          setAgents(agentsData);
        } catch (err) {
          console.error('Failed to fetch agents:', err);
        }
      }
    };
    fetchAgents();
  }, [user, token]);

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

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form to original values
      setEditForm({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        passportNumber: client.passportNumber || '',
        nationality: client.nationality || '',
        dateOfBirth: client.dateOfBirth ? client.dateOfBirth.split('T')[0] : '',
        address: client.address || '',
        emergencyContact: client.emergencyContact || '',
        emergencyPhone: client.emergencyPhone || '',
        status: client.status || 'Active'
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateClient(id, editForm, token);
      // Refresh client data
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/clients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updatedClient = await res.json();
        setClient(updatedClient);
      }
      setIsEditing(false);
      setNotification({ message: 'Client updated successfully!', type: 'success' });
    } catch (err) {
      setNotification({ 
        message: 'Failed to update client: ' + (err.response?.data?.message || err.message), 
        type: 'error' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditFormChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  // File management functions
  const handleFileInput = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setNewFile(prev => ({ ...prev, file: files[0] }));
    } else {
      setNewFile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUploadFile = async () => {
    if (!newFile.title || !newFile.fileType || !newFile.file) {
      setNotification({ message: 'Please fill all file fields', type: 'error' });
      return;
    }

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('title', newFile.title);
      formData.append('fileType', newFile.fileType);
      formData.append('clientId', id);
      formData.append('file', newFile.file);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/files/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload file');

      const uploadedFile = await response.json();
      setFiles(prev => [...prev, uploadedFile]);
      setNewFile({ title: '', fileType: '', file: null });
      setNotification({ message: 'File uploaded successfully!', type: 'success' });
    } catch (err) {
      setNotification({ message: 'Failed to upload file: ' + err.message, type: 'error' });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/files/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete file');

      setFiles(prev => prev.filter(f => f._id !== fileId));
      setNotification({ message: 'File deleted successfully!', type: 'success' });
    } catch (err) {
      setNotification({ message: 'Failed to delete file: ' + err.message, type: 'error' });
    }
  };

  // Notes management functions
  const handleNoteInput = (e) => {
    const { name, value } = e.target;
    setNewNote(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNote = async () => {
    if (!newNote.note.trim()) {
      setNotification({ message: 'Please enter a note', type: 'error' });
      return;
    }

    setAddingNote(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/clients/${id}/notes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(newNote),
      });

      if (!response.ok) throw new Error('Failed to add note');

      const addedNote = await response.json();
      setNotes(prev => [...prev, addedNote]);
      setNewNote({ note: '', type: 'General' });
      setNotification({ message: 'Note added successfully!', type: 'success' });
    } catch (err) {
      setNotification({ message: 'Failed to add note: ' + err.message, type: 'error' });
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/clients/${id}/notes/${noteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete note');

      setNotes(prev => prev.filter(n => n._id !== noteId));
      setNotification({ message: 'Note deleted successfully!', type: 'success' });
    } catch (err) {
      setNotification({ message: 'Failed to delete note: ' + err.message, type: 'error' });
    }
  };

  // Payments management functions
  const handlePaymentInput = (e) => {
    const { name, value } = e.target;
    setNewPayment(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPayment = async () => {
    if (!newPayment.date || !newPayment.amount) {
      setNotification({ message: 'Please fill all required fields', type: 'error' });
      return;
    }

    setAddingPayment(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/clients/${id}/payments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(newPayment),
      });

      if (!response.ok) throw new Error('Failed to add payment');

      const addedPayment = await response.json();
      setPayments(prev => [...prev, addedPayment]);
      setNewPayment({ date: '', amount: '', status: 'Pending', description: '' });
      setNotification({ message: 'Payment added successfully!', type: 'success' });
    } catch (err) {
      setNotification({ message: 'Failed to add payment: ' + err.message, type: 'error' });
    } finally {
      setAddingPayment(false);
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
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Client Details</h1>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button 
                  color="primary" 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  color="secondary" 
                  onClick={handleEditToggle}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button 
                color="primary" 
                onClick={handleEditToggle}
                className="flex items-center gap-2"
              >
                Edit Client
              </Button>
            )}
          <Link to="/clients">
            <Button color="secondary">Back to Clients</Button>
          </Link>
          </div>
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
            {isEditing ? (
              // Edit Form
              <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-600">
                      {editForm.name?.[0] || '?'}
                    </div>
                  </div>
                  {/* Edit Form Fields */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditFormChange}
                      required
                      placeholder="Enter full name"
                    />
                    <Input
                      label="Email Address"
                      name="email"
                      type="email"
                      value={editForm.email}
                      onChange={handleEditFormChange}
                      required
                      placeholder="Enter email address"
                    />
                    <Input
                      label="Phone Number"
                      name="phone"
                      value={editForm.phone}
                      onChange={handleEditFormChange}
                      placeholder="Enter phone number"
                    />
                    <Input
                      label="Date of Birth"
                      name="dateOfBirth"
                      type="date"
                      value={editForm.dateOfBirth}
                      onChange={handleEditFormChange}
                    />
                    <Input
                      label="Passport Number"
                      name="passportNumber"
                      value={editForm.passportNumber}
                      onChange={handleEditFormChange}
                      placeholder="Enter passport number"
                    />
                    <Input
                      label="Nationality"
                      name="nationality"
                      value={editForm.nationality}
                      onChange={handleEditFormChange}
                      placeholder="Enter nationality"
                    />
                    <Dropdown
                      label="Status"
                      name="status"
                      value={editForm.status}
                      onChange={handleEditFormChange}
                      options={[
                        { value: 'Active', label: 'Active' },
                        { value: 'Inactive', label: 'Inactive' },
                      ]}
                    />
                    <Input
                      label="Address"
                      name="address"
                      value={editForm.address}
                      onChange={handleEditFormChange}
                      placeholder="Enter address"
                    />
                    <Input
                      label="Emergency Contact"
                      name="emergencyContact"
                      value={editForm.emergencyContact}
                      onChange={handleEditFormChange}
                      placeholder="Enter emergency contact name"
                    />
                    <Input
                      label="Emergency Phone"
                      name="emergencyPhone"
                      value={editForm.emergencyPhone}
                      onChange={handleEditFormChange}
                      placeholder="Enter emergency phone"
                    />
                  </div>
                </div>
              </form>
            ) : (
              // Read-only Info
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
            )}
          </div>
        )}
        {activeTab === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Files</h2>
              {isEditing && (
                <Button color="primary" size="sm" onClick={() => setDocumentModalOpen(true)}>
                  Upload File
                </Button>
              )}
            </div>
            
            {isEditing ? (
              // Editable Files Interface
              <div className="space-y-4">
                {/* Upload Form */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Upload New File</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="File Title"
                      name="title"
                      value={newFile.title}
                      onChange={handleFileInput}
                      placeholder="Enter file title"
                    />
                    <Dropdown
                      label="File Type"
                      name="fileType"
                      value={newFile.fileType}
                      onChange={handleFileInput}
                      options={[
                        { value: '', label: 'Select type' },
                        { value: 'Passport', label: 'Passport' },
                        { value: 'Visa', label: 'Visa' },
                        { value: 'ID Card', label: 'ID Card' },
                        { value: 'Contract', label: 'Contract' },
                        { value: 'Other', label: 'Other' },
                      ]}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        File
                      </label>
                      <input
                        type="file"
                        name="file"
                        onChange={handleFileInput}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <Button 
                    color="primary" 
                    onClick={handleUploadFile} 
                    loading={uploadingFile}
                    className="mt-3"
                    disabled={!newFile.title || !newFile.fileType || !newFile.file}
                  >
                    Upload File
                  </Button>
                </div>

                {/* Files List */}
                <div>
                  <h3 className="font-semibold mb-3">Uploaded Files</h3>
                  {(client.files && client.files.length > 0) ? (
                    <div className="space-y-2">
                      {client.files.map(file => (
                        <div key={file._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">{file.title}</div>
                            <div className="text-sm text-gray-600">{file.fileType} • {file.createdAt ? new Date(file.createdAt).toLocaleString() : '-'}</div>
                          </div>
                          <div className="flex gap-2">
                            <Button color="secondary" size="sm" onClick={() => window.open(file.fileUrl, '_blank')}>
                              View
                            </Button>
                            <Button color="danger" size="sm" onClick={() => handleDeleteFile(file._id)}>
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-8">No files uploaded yet.</div>
                  )}
                </div>
              </div>
            ) : (
              // Read-only Files
              (client.files && client.files.length > 0) ? (
              <Table
                columns={[
                  { label: 'Title', accessor: 'title' },
                  { label: 'Type', accessor: 'fileType' },
                  { label: 'Uploaded', accessor: 'createdAt', render: v => v ? new Date(v).toLocaleString() : '-' },
                    { 
                      label: 'Actions', 
                      accessor: 'actions',
                      render: (_, file) => (
                        <Button color="secondary" size="sm" onClick={() => window.open(file.fileUrl, '_blank')}>
                          View
                        </Button>
                      )
                    }
                ]}
                data={client.files}
              />
            ) : (
              <div className="text-gray-500">No files found for this client.</div>
              )
            )}

            {/* File Upload Modal */}
            <Modal open={documentModalOpen} onClose={() => setDocumentModalOpen(false)}>
              <div className="p-4">
                <h3 className="font-bold mb-4">Upload File</h3>
                <div className="space-y-4">
                  <Input
                    label="File Title"
                    name="title"
                    value={newFile.title}
                    onChange={handleFileInput}
                    placeholder="Enter file title"
                  />
                  <Dropdown
                    label="File Type"
                    name="fileType"
                    value={newFile.fileType}
                    onChange={handleFileInput}
                    options={[
                      { value: '', label: 'Select type' },
                      { value: 'Passport', label: 'Passport' },
                      { value: 'Visa', label: 'Visa' },
                      { value: 'ID Card', label: 'ID Card' },
                      { value: 'Contract', label: 'Contract' },
                      { value: 'Other', label: 'Other' },
                    ]}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      File
                    </label>
                    <input
                      type="file"
                      name="file"
                      onChange={handleFileInput}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <Button 
                    color="primary" 
                    className="w-full" 
                    onClick={handleUploadFile} 
                    loading={uploadingFile}
                    disabled={!newFile.title || !newFile.fileType || !newFile.file}
                  >
                    Upload
                  </Button>
                </div>
              </div>
            </Modal>
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
              {isEditing && (
                <Button color="primary" size="sm" onClick={() => setBookingModalOpen(true)}>
                  Add Booking
                </Button>
              )}
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
              {isEditing && (
                <Button color="primary" size="sm" onClick={() => setPaymentModalOpen(true)}>
                  Add Payment
                </Button>
              )}
            </div>
            
            {isEditing ? (
              // Editable Payments Interface
              <div className="space-y-4">
                {/* Add Payment Form */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Add New Payment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Payment Date"
                      name="date"
                      type="date"
                      value={newPayment.date}
                      onChange={handlePaymentInput}
                    />
                    <Input
                      label="Amount"
                      name="amount"
                      type="number"
                      value={newPayment.amount}
                      onChange={handlePaymentInput}
                      placeholder="Enter amount"
                    />
                    <Dropdown
                      label="Status"
                      name="status"
                      value={newPayment.status}
                      onChange={handlePaymentInput}
                      options={[
                        { value: 'Pending', label: 'Pending' },
                        { value: 'Paid', label: 'Paid' },
                        { value: 'Overdue', label: 'Overdue' },
                        { value: 'Cancelled', label: 'Cancelled' },
                      ]}
                    />
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={newPayment.description}
                        onChange={handlePaymentInput}
                        placeholder="Enter payment description..."
                        className="w-full p-3 border border-gray-300 rounded-md resize-none"
                        rows="2"
                      />
                    </div>
                  </div>
                  <Button 
                    color="primary" 
                    onClick={handleAddPayment} 
                    loading={addingPayment}
                    className="mt-3"
                    disabled={!newPayment.date || !newPayment.amount}
                  >
                    Add Payment
                  </Button>
                </div>

                {/* Payments List */}
                <div>
                  <h3 className="font-semibold mb-3">Payment History</h3>
                  {(client.payments && client.payments.length > 0) ? (
                    <div className="space-y-3">
                      {client.payments.map(payment => (
                        <div key={payment._id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  payment.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                  payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                  payment.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {payment.status}
                                </span>
                                <span className="font-semibold">${payment.amount}</span>
                              </div>
                              <div className="text-sm text-gray-600">
                                {payment.date ? new Date(payment.date).toLocaleDateString() : '-'}
                                {payment.description && ` • ${payment.description}`}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-8">No payments recorded yet.</div>
                  )}
                </div>
              </div>
            ) : (
              // Read-only Payments
              (client.payments && client.payments.length > 0) ? (
                <div className="space-y-3">
                  {client.payments.map(payment => (
                    <div key={payment._id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'Paid' ? 'bg-green-100 text-green-800' :
                          payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          payment.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {payment.status}
                        </span>
                        <span className="font-semibold">${payment.amount}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {payment.date ? new Date(payment.date).toLocaleDateString() : '-'}
                        {payment.description && ` • ${payment.description}`}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">No payments found for this client.</div>
              )
            )}

            {/* Payment Modal */}
            <Modal open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)}>
              <div className="p-4">
                <h3 className="font-bold mb-4">Add Payment</h3>
                <div className="space-y-4">
                  <Input 
                    label="Payment Date" 
                    name="date" 
                    type="date" 
                    value={newPayment.date}
                    onChange={handlePaymentInput}
                  />
                  <Input 
                    label="Amount" 
                    name="amount" 
                    type="number" 
                    value={newPayment.amount}
                    onChange={handlePaymentInput}
                  />
                  <Dropdown
                    label="Status"
                    name="status"
                    value={newPayment.status}
                    onChange={handlePaymentInput}
                    options={[
                      { value: 'Pending', label: 'Pending' },
                      { value: 'Paid', label: 'Paid' },
                      { value: 'Overdue', label: 'Overdue' },
                      { value: 'Cancelled', label: 'Cancelled' },
                    ]}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={newPayment.description}
                      onChange={handlePaymentInput}
                      placeholder="Enter payment description..."
                      className="w-full p-3 border border-gray-300 rounded-md resize-none"
                      rows="3"
                    />
                  </div>
                  <Button 
                    color="primary" 
                    className="w-full" 
                    onClick={handleAddPayment} 
                    loading={addingPayment}
                    disabled={!newPayment.date || !newPayment.amount}
                  >
                    Add Payment
                  </Button>
                </div>
              </div>
            </Modal>
          </div>
        )}
        {activeTab === 5 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Notes & Communication</h2>
              {isEditing && (
                <Button color="primary" size="sm" onClick={() => setNoteModalOpen(true)}>
                  Add Note
                </Button>
              )}
            </div>
            
            {isEditing ? (
              // Editable Notes Interface
              <div className="space-y-4">
                {/* Add Note Form */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Add New Note</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Dropdown
                      label="Note Type"
                      name="type"
                      value={newNote.type}
                      onChange={handleNoteInput}
                      options={[
                        { value: 'General', label: 'General' },
                        { value: 'Important', label: 'Important' },
                        { value: 'Follow-up', label: 'Follow-up' },
                        { value: 'Issue', label: 'Issue' },
                        { value: 'Reminder', label: 'Reminder' },
                      ]}
                    />
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Note Content
                      </label>
                      <textarea
                        name="note"
                        value={newNote.note}
                        onChange={handleNoteInput}
                        placeholder="Enter your note here..."
                        className="w-full p-3 border border-gray-300 rounded-md resize-none"
                        rows="3"
                      />
                    </div>
                  </div>
                  <Button 
                    color="primary" 
                    onClick={handleAddNote} 
                    loading={addingNote}
                    className="mt-3"
                    disabled={!newNote.note.trim()}
                  >
                    Add Note
                  </Button>
                </div>

                {/* Notes List */}
                <div>
                  <h3 className="font-semibold mb-3">Client Notes</h3>
                  {(client.notes && client.notes.length > 0) ? (
                    <div className="space-y-3">
                      {client.notes.map(note => (
                        <div key={note._id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  note.type === 'Important' ? 'bg-red-100 text-red-800' :
                                  note.type === 'Follow-up' ? 'bg-yellow-100 text-yellow-800' :
                                  note.type === 'Issue' ? 'bg-orange-100 text-orange-800' :
                                  note.type === 'Reminder' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {note.type}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {note.createdAt ? new Date(note.createdAt).toLocaleString() : '-'}
                                </span>
                              </div>
                              <p className="text-gray-900">{note.note}</p>
                              {note.author && (
                                <p className="text-sm text-gray-600 mt-1">- {note.author}</p>
                              )}
                            </div>
                            <Button 
                              color="danger" 
                              size="sm" 
                              onClick={() => handleDeleteNote(note._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-8">No notes added yet.</div>
                  )}
                </div>
              </div>
            ) : (
              // Read-only Notes
              (client.notes && client.notes.length > 0) ? (
                <div className="space-y-3">
                  {client.notes.map(note => (
                    <div key={note._id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          note.type === 'Important' ? 'bg-red-100 text-red-800' :
                          note.type === 'Follow-up' ? 'bg-yellow-100 text-yellow-800' :
                          note.type === 'Issue' ? 'bg-orange-100 text-orange-800' :
                          note.type === 'Reminder' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {note.type}
                        </span>
                        <span className="text-sm text-gray-500">
                          {note.createdAt ? new Date(note.createdAt).toLocaleString() : '-'}
                        </span>
                      </div>
                      <p className="text-gray-900">{note.note}</p>
                      {note.author && (
                        <p className="text-sm text-gray-600 mt-1">- {note.author}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">No notes found for this client.</div>
              )
            )}

            {/* Note Modal */}
            <Modal open={noteModalOpen} onClose={() => setNoteModalOpen(false)}>
              <div className="p-4">
                <h3 className="font-bold mb-4">Add Note</h3>
                <div className="space-y-4">
                  <Dropdown
                    label="Note Type"
                    name="type"
                    value={newNote.type}
                    onChange={handleNoteInput}
                    options={[
                      { value: 'General', label: 'General' },
                      { value: 'Important', label: 'Important' },
                      { value: 'Follow-up', label: 'Follow-up' },
                      { value: 'Issue', label: 'Issue' },
                      { value: 'Reminder', label: 'Reminder' },
                    ]}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Note Content
                    </label>
                    <textarea
                      name="note"
                      value={newNote.note}
                      onChange={handleNoteInput}
                      placeholder="Enter your note here..."
                      className="w-full p-3 border border-gray-300 rounded-md resize-none"
                      rows="4"
                    />
                  </div>
                  <Button 
                    color="primary" 
                    className="w-full" 
                    onClick={handleAddNote} 
                    loading={addingNote}
                    disabled={!newNote.note.trim()}
                  >
                    Add Note
                  </Button>
                </div>
              </div>
            </Modal>
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
                <Button color="primary" className="mt-2 w-full" onClick={handleUploadFile} loading={uploadingFile}>Upload</Button>
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