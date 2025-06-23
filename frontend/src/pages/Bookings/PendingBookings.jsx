import React, { useState, useEffect } from 'react';
import { FaClock, FaCheckCircle, FaTimesCircle, FaSearch, FaFilter, FaCalendarAlt, FaUser, FaCar, FaRoute, FaDollarSign, FaDownload } from 'react-icons/fa';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';
import PageHeading from '../../components/common/PageHeading';
import StatCard from '../../components/common/StatCard';

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
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8 min-h-screen">
      <div className="space-y-6 mb-6">
        <PageHeading
          icon={<FaClock />}
          title="Pending Bookings"
          subtitle="Manage all bookings awaiting confirmation"
          iconColor="text-yellow-600"
        >
          <Button>
            <FaCalendarAlt className="mr-2" />
            New Booking
          </Button>
        </PageHeading>
      </div>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<FaClock className="text-yellow-600" />} 
          label="Total Pending" 
          value={pendingBookings.length} 
          accentColor="yellow"
        />
        <StatCard
          icon={<FaClock className="text-red-600" />} 
          label="High Priority" 
          value={pendingBookings.filter(b => b.priority === 'high').length} 
          accentColor="red"
        />
        <StatCard
          icon={<FaDollarSign className="text-green-600" />} 
          label="Total Value" 
          value={`$${pendingBookings.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}`} 
          accentColor="green"
        />
      </div>
      {/* Filter/Search Bar */}
      <Card className="p-0 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4 p-6 pb-0">
          <Input
            type="text"
            placeholder="Search pending bookings..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-[44px]"
            style={{ marginBottom: 0 }}
          />
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="min-w-[200px] h-[44px] w-full md:w-auto mb-0 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ marginBottom: 0 }}
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="p-6 pt-0">
          {/* Table */}
          <Table columns={columns} data={filteredBookings} loading={loading} />
        </div>
      </Card>
    </div>
  );
}

export default PendingBookings; 