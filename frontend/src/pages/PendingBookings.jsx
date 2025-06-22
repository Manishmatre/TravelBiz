import React, { useState, useEffect } from 'react';
import { FaClock, FaCheckCircle, FaTimesCircle, FaSearch, FaFilter, FaCalendarAlt, FaUser, FaCar, FaRoute, FaDollarSign, FaDownload } from 'react-icons/fa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Table from '../components/common/Table';

function PendingBookings() {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');

  // Mock pending bookings data
  useEffect(() => {
    const mockBookings = [
      {
        id: 'BK-12345',
        clientName: 'John Smith',
        clientEmail: 'john.smith@email.com',
        trip: 'Airport Transfer - JFK',
        vehicle: 'Toyota Camry',
        driver: 'Not Assigned',
        date: '2024-02-10T10:00:00',
        amount: 150,
        status: 'pending',
        priority: 'high'
      },
      {
        id: 'BK-12346',
        clientName: 'Sarah Johnson',
        clientEmail: 'sarah.j@email.com',
        trip: 'City Tour - Manhattan',
        vehicle: 'Mercedes Sprinter',
        driver: 'Mike Chen',
        date: '2024-02-12T14:30:00',
        amount: 450,
        status: 'pending',
        priority: 'medium'
      },
      {
        id: 'BK-12347',
        clientName: 'Michael Brown',
        clientEmail: 'michael.b@email.com',
        trip: 'Corporate Event',
        vehicle: 'Cadillac Escalade',
        driver: 'Not Assigned',
        date: '2024-02-15T09:00:00',
        amount: 850,
        status: 'pending',
        priority: 'high'
      },
      {
        id: 'BK-12348',
        clientName: 'Emily Davis',
        clientEmail: 'emily.d@email.com',
        trip: 'Day Trip - Hamptons',
        vehicle: 'Chevrolet Suburban',
        driver: 'Lisa Rodriguez',
        date: '2024-02-18T08:00:00',
        amount: 1200,
        status: 'pending',
        priority: 'low'
      }
    ];
    
    setTimeout(() => {
      setPendingBookings(mockBookings);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredBookings = pendingBookings.filter(booking => {
    const matchesSearch = booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.trip.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || booking.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleConfirm = (bookingId) => {
    setPendingBookings(prev => prev.filter(b => b.id !== bookingId));
    // Here you would typically make an API call to confirm the booking
  };

  const handleCancel = (bookingId) => {
    setPendingBookings(prev => prev.filter(b => b.id !== bookingId));
    // Here you would typically make an API call to cancel the booking
  };

  const columns = [
    { key: 'bookingId', label: 'Booking ID', render: (booking) => (
      <div className="font-semibold text-blue-600">{booking.id}</div>
    )},
    { key: 'client', label: 'Client', render: (booking) => (
      <div>
        <div className="font-medium text-gray-900">{booking.clientName}</div>
        <div className="text-sm text-gray-500">{booking.clientEmail}</div>
      </div>
    )},
    { key: 'trip', label: 'Trip Details', render: (booking) => (
      <div>
        <div className="font-medium text-gray-900">{booking.trip}</div>
        <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
          <FaCar /> {booking.vehicle}
        </div>
      </div>
    )},
    { key: 'date', label: 'Date', render: (booking) => (
      <div className="text-sm">
        <div className="font-medium">{new Date(booking.date).toLocaleDateString()}</div>
        <div className="text-gray-500">{new Date(booking.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    )},
    { key: 'amount', label: 'Amount', render: (booking) => (
      <div className="font-semibold text-green-600">${booking.amount.toLocaleString()}</div>
    )},
    { key: 'priority', label: 'Priority', render: (booking) => (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(booking.priority)}`}>
        {booking.priority.charAt(0).toUpperCase() + booking.priority.slice(1)}
      </span>
    )},
    { key: 'actions', label: 'Actions', render: (booking) => (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => handleConfirm(booking.id)} className="bg-green-500 hover:bg-green-600 text-white">
          <FaCheckCircle className="mr-1" /> Confirm
        </Button>
        <Button size="sm" onClick={() => handleCancel(booking.id)} variant="outline" className="text-red-600">
          <FaTimesCircle className="mr-1" /> Cancel
        </Button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaClock className="text-yellow-600" />
            Pending Bookings
          </h1>
          <p className="text-gray-600 mt-2">Manage all bookings awaiting confirmation</p>
        </div>
        <Button>
          <FaCalendarAlt className="mr-2" />
          New Booking
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingBookings.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FaClock className="text-yellow-600" />
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingBookings.filter(b => b.priority === 'high').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <FaClock className="text-red-600" />
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${pendingBookings.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaDollarSign className="text-green-600" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by ID, client, or trip..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <div className="flex items-center gap-2">
                <FaFilter className="text-gray-400" />
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <Button variant="outline">
              <FaDownload className="mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <Table
            data={filteredBookings}
            columns={columns}
            loading={loading}
            emptyMessage="No pending bookings found"
          />
        </div>
      </Card>
    </div>
  );
}

export default PendingBookings; 