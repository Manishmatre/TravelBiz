import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
import Card from '../components/common/Card';
import {
  FaUser, FaEnvelope, FaPhone, FaPassport, FaGlobe, FaBirthdayCake, FaMapMarkerAlt,
  FaUserShield, FaPhoneAlt, FaEdit, FaSave, FaTimes, FaPlus, FaUpload, FaTrash, FaFilePdf,
  FaFileImage, FaFileWord, FaFileExcel, FaFileAlt, FaPlaneDeparture, FaMoneyBillWave,
  FaStickyNote, FaHistory, FaCar, FaRegCalendarAlt, FaDollarSign, FaCheckCircle, FaEye
} from 'react-icons/fa';
import StatCard from '../components/common/StatCard';
import { getClientById } from '../services/clientService';
import { getBookingsForClient } from '../services/bookingService';
import { getFilesForClient, uploadFileForClient, deleteFile as deleteClientFile } from '../services/fileService';
import { getPaymentsForClient, createPayment, deletePayment } from '../services/paymentService';

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
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    upcomingBookings: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
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
  const [newFile, setNewFile] = useState({ title: '', fileType: 'Passport', file: null });
  const [uploadingFile, setUploadingFile] = useState(false);
  
  // Notes management state
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ note: '', type: 'General' });
  const [addingNote, setAddingNote] = useState(false);
  
  // Payments management state
  const [payments, setPayments] = useState([]);
  const [newPayment, setNewPayment] = useState({ paymentDate: '', amount: '', status: 'Pending', description: '' });
  const [addingPayment, setAddingPayment] = useState(false);
  const [filesLoading, setFilesLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [activityLog, setActivityLog] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    const fetchClientData = async () => {
      if (!id || !token) return;
      setLoading(true);
      setBookingsLoading(true);
      setFilesLoading(true);
      setError('');
      try {
        const clientData = await getClientById(id, token);
        setClient(clientData);
        setEditForm({
          name: clientData.name || '',
          email: clientData.email || '',
          phone: clientData.phone || '',
          passportNumber: clientData.passportNumber || '',
          nationality: clientData.nationality || '',
          dateOfBirth: clientData.dateOfBirth ? clientData.dateOfBirth.split('T')[0] : '',
          address: clientData.address || '',
          emergencyContact: clientData.emergencyContact || '',
          emergencyPhone: clientData.emergencyPhone || '',
          status: clientData.status || 'Active',
          gender: clientData.gender || '',
          occupation: clientData.occupation || '',
          company: clientData.company || '',
          preferredLanguage: clientData.preferredLanguage || 'English',
        });
        
        const bookingsData = await getBookingsForClient(id, token);
        setBookings(bookingsData);
        
        const filesData = await getFilesForClient(id, token);
        setFiles(filesData);
        
        setPaymentsLoading(true);
        const paymentsRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/payments/client/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!paymentsRes.ok) throw new Error('Failed to fetch payments');
        const paymentsData = await paymentsRes.json();
        setPayments(paymentsData);
        
        setActivityLoading(true);
        const activityRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/activity?entityType=Client&entityId=${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (activityRes.ok) {
            const activityData = await activityRes.json();
            setActivityLog(activityData);
        } else {
            console.error('Failed to fetch activity log');
        }
        setActivityLoading(false);

        const totalBookings = bookingsData.length;
        const completedBookings = bookingsData.filter(b => b.status === 'Completed').length;
        const upcomingBookings = bookingsData.filter(b => new Date(b.startDate) > new Date() && b.status !== 'Cancelled').length;
        const totalSpent = bookingsData.reduce((acc, b) => b.status !== 'Cancelled' ? acc + (b.price || 0) : acc, 0);
        setStats({ totalBookings, completedBookings, upcomingBookings, totalSpent });

      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to load client data.';
        setError(errorMessage);
        setNotification({ message: errorMessage, type: 'error' });
      } finally {
        setLoading(false);
        setBookingsLoading(false);
        setFilesLoading(false);
        setPaymentsLoading(false);
        setActivityLoading(false);
      }
    };
    fetchClientData();
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
       // Reset form on cancel
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
        status: client.status || 'Active',
        gender: client.gender || '',
        occupation: client.occupation || '',
        company: client.company || '',
        preferredLanguage: client.preferredLanguage || 'English',
      });
    }
    setIsEditing(prev => !prev);
  };

  const handleInputChange = (e) => {
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!editForm) return;
    setSaving(true);
    try {
      const updatedClient = await updateClient(id, editForm, token);
      setClient(updatedClient);
      setIsEditing(false);
      setNotification({ message: 'Client details updated successfully!', type: 'success' });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update client.';
      setError(errorMessage);
      setNotification({ message: errorMessage, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // File management functions
  const handleFileInput = (e) => {
    const { name, value, files: inputFiles } = e.target;
    if (name === 'file') {
      setNewFile(prev => ({ ...prev, file: inputFiles[0] }));
    } else {
      setNewFile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUploadFile = async (e) => {
    e.preventDefault();
    if (!newFile.title || !newFile.fileType || !newFile.file) {
      setNotification({ message: 'Please provide a title, type, and select a file.', type: 'error' });
      return;
    }

    setUploadingFile(true);
    try {
      const uploadedFile = await uploadFileForClient(id, newFile.title, newFile.fileType, newFile.file, token);
      setFiles(prev => [uploadedFile, ...prev]);
      setNewFile({ title: '', fileType: 'Passport', file: null });
      document.getElementById('file-input').value = null; // Clear file input
      setNotification({ message: 'File uploaded successfully!', type: 'success' });
    } catch (err) {
      setNotification({ message: err.response?.data?.message || 'Failed to upload file.', type: 'error' });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) return;
    
    try {
      await deleteClientFile(fileId, token);
      setFiles(prev => prev.filter(f => f._id !== fileId));
      setNotification({ message: 'File deleted successfully.', type: 'success' });
    } catch (err) {
      setNotification({ message: err.response?.data?.message || 'Failed to delete file.', type: 'error' });
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
    if (!newPayment.paymentDate || !newPayment.amount) {
      setNotification({ message: 'Please fill all required fields', type: 'error' });
      return;
    }

    setAddingPayment(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/payments/client/${id}`, {
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
      setNewPayment({ paymentDate: '', amount: '', status: 'Pending', description: '' });
      setNotification({ message: 'Payment added successfully!', type: 'success' });
      setPaymentModalOpen(false);
    } catch (err) {
      setNotification({ message: 'Failed to add payment: ' + err.message, type: 'error' });
    } finally {
      setAddingPayment(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/payments/${paymentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete payment');
      setPayments(prev => prev.filter(p => p._id !== paymentId));
      setNotification({ message: 'Payment deleted successfully.', type: 'success' });
    } catch (err) {
      setNotification({ message: 'Failed to delete payment: ' + err.message, type: 'error' });
    }
  };

  if (loading) return <Loader className="my-10" />;
  if (error) return <div className="text-red-500 p-6">{error}</div>;
  if (!client) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaUser /> },
    { id: 'bookings', label: 'Bookings', icon: <FaPlaneDeparture /> },
    { id: 'documents', label: 'Documents', icon: <FaFileAlt /> },
    { id: 'payments', label: 'Payments', icon: <FaMoneyBillWave /> },
    { id: 'notes', label: 'Notes', icon: <FaStickyNote /> },
    { id: 'activity', label: 'Activity', icon: <FaHistory /> },
  ];

  const bookingColumns = [
    {
      label: 'Destination',
      key: 'destination',
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-800">{typeof row.destination === 'string' ? row.destination : (row.destination?.name || 'N/A')}</p>
          <p className="text-xs text-gray-500">Booking ID: {typeof row._id === 'string' ? row._id.slice(-6) : (row._id?.toString ? row._id.toString().slice(-6) : 'N/A')}</p>
        </div>
      )
    },
    {
      label: 'Dates',
      key: 'dates',
      render: (row) => (
        <div>
          <p>{new Date(row.startDate).toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">to {new Date(row.endDate).toLocaleDateString()}</p>
        </div>
      )
    },
    {
      label: 'Vehicle',
      key: 'vehicle',
      render: (row) => row.vehicle ? (
        <div className="flex items-center gap-2">
           <img src={
             Array.isArray(row.vehicle.imageUrls) && row.vehicle.imageUrls.length > 0
               ? row.vehicle.imageUrls[0]
               : `https://ui-avatars.com/api/?name=${row.vehicle.make}&background=random`
           } alt={row.vehicle.make} className="w-10 h-10 rounded-md object-cover" />
          <div>
            <p className="font-semibold">{row.vehicle.make} {row.vehicle.model}</p>
            <p className="text-xs text-gray-500">{row.vehicle.licensePlate}</p>
          </div>
        </div>
      ) : <span className="text-gray-500">Not Assigned</span>
    },
    {
      label: 'Status',
      key: 'status',
      render: (row) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          row.status === 'Completed' ? 'bg-green-100 text-green-800' :
          row.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
          row.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
          row.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      label: 'Price',
      key: 'price',
      render: (row) => <span className="font-medium text-gray-800">${(row.price || 0).toFixed(2)}</span>
    },
    {
      label: 'Actions',
      key: 'actions',
      render: (row) => (
        <Button size="sm" onClick={() => navigate(`/bookings/${row._id}`)}>
          View
        </Button>
      )
    }
  ];

  const fileColumns = [
    {
      label: 'File Name',
      key: 'title',
      render: (row) => (
        <div className="flex items-center gap-3">
          <FileIcon mimeType={row.mimeType} />
          <div>
            <p className="font-semibold text-gray-800">{row.title}</p>
            <p className="text-xs text-gray-500">{row.originalName}</p>
          </div>
        </div>
      )
    },
    { label: 'Type', key: 'fileType' },
    { 
      label: 'Date Uploaded', 
      key: 'createdAt',
      render: (row) => new Date(row.createdAt).toLocaleDateString()
    },
    { 
      label: 'Size', 
      key: 'size',
      render: (row) => `${(row.size / 1024).toFixed(2)} KB`
    },
    {
      label: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <a href={row.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 p-1" title="View/Download">
            <FaEye size={16}/>
          </a>
          <button onClick={() => handleDeleteFile(row._id)} className="text-red-600 hover:text-red-800 p-1" title="Delete File">
            <FaTrash size={16}/>
          </button>
        </div>
      )
    }
  ];

  const paymentColumns = [
    { label: 'Date', key: 'date', render: (row) => new Date(row.date).toLocaleDateString() },
    { label: 'Amount', key: 'amount', render: (row) => `$${(row.amount || 0).toFixed(2)}` },
    {
      label: 'Status',
      key: 'status',
      render: (row) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          row.status === 'Completed' ? 'bg-green-100 text-green-800' :
          row.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
          row.status === 'Failed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {row.status}
        </span>
      )
    },
    { label: 'Description', key: 'description' },
    {
      label: 'Actions',
      key: 'actions',
      render: (row) => (
        <button onClick={() => handleDeletePayment(row._id)} className="text-red-600 hover:text-red-800 p-1" title="Delete Payment">
          <FaTrash size={16}/>
        </button>
      )
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen p-4 md:p-8">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <Card className="mb-8 p-6 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src={client.avatarUrl || `https://ui-avatars.com/api/?name=${client.name}&background=0D8ABC&color=fff&size=64`} 
              alt={client.name}
              className="w-16 h-16 rounded-full border-4 border-white shadow-md"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{client.name}</h1>
              <p className="text-gray-500 flex items-center gap-2 mt-1">
                <FaEnvelope /> {client.email}
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            {isEditing ? (
              <>
                <Button color="secondary" onClick={handleEditToggle} className="flex items-center gap-2"><FaTimes /> Cancel</Button>
                <Button color="primary" onClick={handleSave} loading={saving} className="flex items-center gap-2"><FaSave /> Save</Button>
              </>
            ) : (
              <Button color="primary" onClick={handleEditToggle} className="flex items-center gap-2"><FaEdit /> Edit Client</Button>
            )}
            <Button color="success" onClick={() => navigate(`/bookings/add?clientId=${id}`)} className="flex items-center gap-2"><FaPlus /> New Booking</Button>
          </div>
        </div>
      </Card>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<FaRegCalendarAlt className="text-blue-500" />} title="Total Bookings" value={stats.totalBookings} />
        <StatCard icon={<FaCheckCircle className="text-green-500" />} title="Completed Trips" value={stats.completedBookings} />
        <StatCard icon={<FaPlaneDeparture className="text-purple-500" />} title="Upcoming Trips" value={stats.upcomingBookings} />
        <StatCard icon={<FaDollarSign className="text-yellow-500" />} title="Total Spent" value={`$${stats.totalSpent.toFixed(2)}`} />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Personal Information */}
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <h3 className="font-bold text-lg mb-4 text-gray-800">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <InfoField icon={<FaUser />} label="Full Name" value={client.name} editingValue={editForm?.name} name="name" onChange={handleInputChange} isEditing={isEditing} />
                    <InfoField icon={<FaEnvelope />} label="Email Address" value={client.email} editingValue={editForm?.email} name="email" onChange={handleInputChange} isEditing={isEditing} type="email" />
                    <InfoField icon={<FaPhone />} label="Phone Number" value={client.phone} editingValue={editForm?.phone} name="phone" onChange={handleInputChange} isEditing={isEditing} />
                    <InfoField icon={<FaBirthdayCake />} label="Date of Birth" value={client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString() : 'N/A'} editingValue={editForm?.dateOfBirth} name="dateOfBirth" onChange={handleInputChange} isEditing={isEditing} type="date" />
                    <InfoField icon={<FaGlobe />} label="Nationality" value={client.nationality} editingValue={editForm?.nationality} name="nationality" onChange={handleInputChange} isEditing={isEditing} />
                    <InfoField icon={<FaPassport />} label="Passport Number" value={client.passportNumber} editingValue={editForm?.passportNumber} name="passportNumber" onChange={handleInputChange} isEditing={isEditing} />
                    <InfoField icon={<FaUser />} label="Gender" value={client.gender} editingValue={editForm?.gender} name="gender" onChange={handleInputChange} isEditing={isEditing} />
                    <InfoField icon={<FaMapMarkerAlt />} label="Address" value={client.address} editingValue={editForm?.address} name="address" onChange={handleInputChange} isEditing={isEditing} fullWidth />
                  </div>
                </Card>

                <Card>
                  <h3 className="font-bold text-lg mb-4 text-gray-800">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <InfoField icon={<FaUserShield />} label="Contact Name" value={client.emergencyContact} editingValue={editForm?.emergencyContact} name="emergencyContact" onChange={handleInputChange} isEditing={isEditing} />
                    <InfoField icon={<FaPhoneAlt />} label="Contact Phone" value={client.emergencyPhone} editingValue={editForm?.emergencyPhone} name="emergencyPhone" onChange={handleInputChange} isEditing={isEditing} />
                  </div>
                </Card>
              </div>

              {/* Status and Agent */}
              <div className="space-y-6">
                <Card>
                  <h3 className="font-bold text-lg mb-4 text-gray-800">Status</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {client.status}
                    </span>
                  </div>
                </Card>
                <Card>
                  <h3 className="font-bold text-lg mb-4 text-gray-800">Assigned Agent</h3>
                  {client.assignedAgent ? (
                    <div className="flex items-center gap-3">
                      <img src={`https://ui-avatars.com/api/?name=${client.assignedAgent.name}&background=random`} alt={client.assignedAgent.name} className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="font-semibold text-gray-900">{client.assignedAgent.name}</p>
                        <p className="text-sm text-gray-500">{client.assignedAgent.email}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No agent assigned.</p>
                  )}
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Client Bookings</h3>
              {bookingsLoading ? (
                <Loader />
              ) : bookings.length > 0 ? (
                <Table columns={bookingColumns} data={bookings} />
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-gray-500">This client has no bookings yet.</p>
                  <Button onClick={() => navigate(`/bookings/add?clientId=${id}`)} className="mt-4">Create First Booking</Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Client Documents</h3>
                {filesLoading ? (
                  <Loader />
                ) : files.length > 0 ? (
                  <Table columns={fileColumns} data={files} />
                ) : (
                  <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-gray-500">This client has no documents yet.</p>
                  </div>
                )}
              </div>
              <div>
                <Card>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Upload New Document</h3>
                  <form onSubmit={handleUploadFile} className="space-y-4">
                    <Input
                      label="Document Title"
                      name="title"
                      value={newFile.title}
                      onChange={handleFileInput}
                      placeholder="e.g., Passport Scan"
                      required
                    />
                    <Dropdown
                      label="Document Type"
                      name="fileType"
                      value={newFile.fileType}
                      onChange={handleFileInput}
                      options={[
                        { value: '', label: 'Select type...' },
                        { value: 'Passport', label: 'Passport' },
                        { value: 'Visa', label: 'Visa' },
                        { value: 'Ticket', label: 'Ticket' },
                        { value: 'ID Card', label: 'ID Card' },
                        { value: 'Other', label: 'Other' }
                      ]}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                      <input
                        id="file-input"
                        type="file"
                        name="file"
                        onChange={handleFileInput}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        required
                      />
                    </div>
                    <Button type="submit" color="primary" loading={uploadingFile} className="w-full flex justify-center items-center gap-2">
                      <FaUpload /> Upload File
                    </Button>
                  </form>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Payments & Invoices</h3>
                <Button onClick={() => setPaymentModalOpen(true)} color="primary" icon={<FaPlus />}>Add Payment</Button>
              </div>
              {paymentsLoading ? (
                <Loader />
              ) : payments.length > 0 ? (
                <Table columns={paymentColumns} data={payments} />
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-gray-500">No payments found for this client.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Notes & Communication</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <div className="space-y-4">
                    {notes && notes.length > 0 ? (
                      notes.map(note => (
                        <Card key={note._id} className="relative p-4">
                          <p className="text-gray-700 mb-2">{note.note}</p>
                          <div className="text-xs text-gray-400 flex items-center justify-between">
                            <span>Type: <span className="font-semibold">{note.type}</span></span>
                            <span>{new Date(note.createdAt).toLocaleString()}</span>
                          </div>
                          <button onClick={() => handleDeleteNote(note._id)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors">
                            <FaTrash />
                          </button>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                        <p className="text-gray-500">No notes for this client yet.</p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Card>
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Add New Note</h4>
                    <div className="space-y-4">
                      <textarea
                        name="note"
                        value={newNote.note}
                        onChange={handleNoteInput}
                        placeholder="Type your note here..."
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        rows="4"
                      ></textarea>
                      <Dropdown
                        label="Note Type"
                        name="type"
                        value={newNote.type}
                        onChange={handleNoteInput}
                        options={[
                          { value: 'General', label: 'General' },
                          { value: 'Call', label: 'Call' },
                          { value: 'Meeting', label: 'Meeting' },
                          { value: 'Email', label: 'Email' }
                        ]}
                      />
                      <Button onClick={handleAddNote} loading={addingNote} color="primary" className="w-full">
                        Add Note
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Activity Log</h3>
              {activityLoading ? (
                <Loader />
              ) : activityLog.length > 0 ? (
                <div className="space-y-4">
                  {activityLog.map(activity => (
                    <div key={activity._id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <FaHistory className="text-gray-400" />
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm text-gray-800">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          by {activity.user?.name || 'System'} on {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-gray-500">No activity recorded for this client.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} title="Add New Payment">
        <div className="space-y-4">
          <Input label="Date" type="date" name="paymentDate" value={newPayment.paymentDate} onChange={handlePaymentInput} required/>
          <Input label="Amount" type="number" name="amount" value={newPayment.amount} onChange={handlePaymentInput} placeholder="0.00" required/>
          <Dropdown 
            label="Status"
            name="status"
            value={newPayment.status}
            onChange={handlePaymentInput}
            options={[
              { value: 'Pending', label: 'Pending' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Failed', label: 'Failed' }
            ]}
          />
          <Input label="Description" name="description" value={newPayment.description} onChange={handlePaymentInput} placeholder="e.g., Payment for booking #123" />
          <Button onClick={handleAddPayment} loading={addingPayment} color="primary" className="w-full">
            Save Payment
          </Button>
        </div>
      </Modal>
    </div>
  );
}

const FileIcon = ({ mimeType }) => {
  if (mimeType.includes('pdf')) return <FaFilePdf className="text-red-500 text-2xl" />;
  if (mimeType.includes('image')) return <FaFileImage className="text-blue-500 text-2xl" />;
  if (mimeType.includes('word')) return <FaFileWord className="text-blue-700 text-2xl" />;
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return <FaFileExcel className="text-green-700 text-2xl" />;
  return <FaFileAlt className="text-gray-500 text-2xl" />;
};

const InfoField = ({ icon, label, value, isEditing, editingValue, name, onChange, type = 'text', fullWidth = false }) => (
  <div className={fullWidth ? 'md:col-span-2' : ''}>
    <label className="text-xs font-semibold text-gray-500 flex items-center gap-2 mb-1">{icon} {label}</label>
    {isEditing ? (
      <Input
        type={type}
        name={name}
        value={editingValue || ''}
        onChange={onChange}
        className="w-full text-sm p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
      />
    ) : (
      <p className="text-gray-800 font-medium break-words pt-2">{value || 'N/A'}</p>
    )}
  </div>
);

export default ClientDetail; 