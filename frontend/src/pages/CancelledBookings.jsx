import React, { useState, useEffect } from 'react';
import { FaTimesCircle, FaSearch, FaFilter, FaCalendarAlt, FaUser, FaCar, FaDollarSign, FaUndo, FaDownload } from 'react-icons/fa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Table from '../components/common/Table';
import StatCard from '../components/common/StatCard';
import PageHeading from '../components/common/PageHeading';

function CancelledBookings() {
  const [cancelledBookings, setCancelledBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReason, setFilterReason] = useState('all');

  // Mock cancelled bookings data
  useEffect(() => {
    const mockBookings = [
      {
        id: 'BK-C1234',
        clientName: 'Daniel Harris',
        trip: 'Concert Transportation',
        vehicle: 'Ford Transit',
        date: '2024-01-22T19:00:00',
        amount: 300,
        status: 'cancelled',
        reason: 'Client Request'
      },
      {
        id: 'BK-C1235',
        clientName: 'Karen Jackson',
        trip: 'Day Trip to Mountains',
        vehicle: 'Jeep Grand Cherokee',
        date: '2024-01-25T08:00:00',
        amount: 950,
        status: 'cancelled',
        reason: 'Vehicle Unavailable'
      },
      {
        id: 'BK-C1236',
        clientName: 'Steven Clark',
        trip: 'Airport Transfer - LGA',
        vehicle: 'Tesla Model S',
        date: '2024-01-28T14:00:00',
        amount: 280,
        status: 'cancelled',
        reason: 'Client No-Show'
      }
    ];
    
    setTimeout(() => {
      setCancelledBookings(mockBookings);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredBookings = cancelledBookings.filter(booking => {
    const matchesSearch = booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesReason = filterReason === 'all' || booking.reason.replace(/\s+/g, '') === filterReason;
    return matchesSearch && matchesReason;
  });

  const getReasonChipStyle = (reason) => {
    switch (reason) {
      case 'Client Request':
        return 'bg-blue-100 text-blue-800';
      case 'Vehicle Unavailable':
        return 'bg-yellow-100 text-yellow-800';
      case 'Client No-Show':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    { key: 'bookingId', label: 'Booking ID', render: (booking) => (
      <div className="font-semibold text-gray-600">{booking.id}</div>
    )},
    { key: 'client', label: 'Client', render: (booking) => (
      <div className="font-medium text-gray-900">{booking.clientName}</div>
    )},
    { key: 'trip', label: 'Trip Details', render: (booking) => (
      <div>
        <div className="font-medium text-gray-900">{booking.trip}</div>
        <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
          <FaCar /> {booking.vehicle}
        </div>
      </div>
    )},
    { key: 'date', label: 'Original Date', render: (booking) => (
      <div className="text-sm">
        <div className="font-medium">{new Date(booking.date).toLocaleDateString()}</div>
      </div>
    )},
    { key: 'amount', label: 'Amount', render: (booking) => (
      <div className="font-semibold text-red-600">${booking.amount.toLocaleString()}</div>
    )},
    { key: 'reason', label: 'Reason for Cancellation', render: (booking) => (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getReasonChipStyle(booking.reason)}`}>
        {booking.reason}
      </span>
    )},
    { key: 'actions', label: 'Actions', render: (booking) => (
      <Button size="sm" variant="outline">
        <FaUndo className="mr-2" />
        Attempt Re-book
      </Button>
    )}
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8 min-h-screen">
      <div className="space-y-6 mb-6">
        <PageHeading
          icon={<FaTimesCircle className="text-red-600" />}
          title="Cancelled Bookings"
          subtitle="A log of all bookings that have been cancelled"
          iconColor="text-red-600"
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
          icon={<FaTimesCircle className="text-red-600" />} 
          label="Total Cancelled" 
          value={cancelledBookings.length} 
          accentColor="red"
        />
        <StatCard
          icon={<FaUser className="text-blue-600" />} 
          label="Client Cancellations" 
          value={cancelledBookings.filter(b => b.reason === 'Client Request').length} 
          accentColor="blue"
        />
        <StatCard
          icon={<FaDollarSign className="text-gray-600" />} 
          label="Lost Revenue" 
          value={`$${cancelledBookings.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}`} 
          accentColor="gray"
        />
      </div>
      {/* Filter/Search Bar + Table in one Card */}
      <Card className="p-0">
        <div className="flex flex-col md:flex-row md:items-center gap-4 p-6 pb-0">
          <Input
            type="text"
            placeholder="Search by ID or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 h-[44px]"
            style={{ marginBottom: 0 }}
          />
          <select
            value={filterReason}
            onChange={(e) => setFilterReason(e.target.value)}
            className="min-w-[200px] h-[44px] w-full md:w-auto mb-0 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ marginBottom: 0 }}
          >
            <option value="all">All Reasons</option>
            <option value="ClientRequest">Client Request</option>
            <option value="VehicleUnavailable">Vehicle Unavailable</option>
            <option value="ClientNo-Show">Client No-Show</option>
          </select>
          <Button variant="outline" className="h-[44px]">
            <FaDownload className="mr-2" />
            Export
          </Button>
        </div>
        <div className="p-6 pt-0">
          <Table
            data={filteredBookings}
            columns={columns}
            loading={loading}
            emptyMessage="No cancelled bookings found"
          />
        </div>
      </Card>
    </div>
  );
}

export default CancelledBookings; 