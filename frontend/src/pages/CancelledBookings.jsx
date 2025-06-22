import React, { useState, useEffect } from 'react';
import { FaTimesCircle, FaSearch, FaFilter, FaCalendarAlt, FaUser, FaCar, FaDollarSign, FaUndo, FaDownload } from 'react-icons/fa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Table from '../components/common/Table';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaTimesCircle className="text-red-600" />
            Cancelled Bookings
          </h1>
          <p className="text-gray-600 mt-2">A log of all bookings that have been cancelled</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cancelled</p>
                <p className="text-2xl font-bold text-gray-900">{cancelledBookings.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <FaTimesCircle className="text-red-600" />
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Client Cancellations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cancelledBookings.filter(b => b.reason === 'Client Request').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaUser className="text-blue-600" />
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lost Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${cancelledBookings.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <FaDollarSign className="text-gray-600" />
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
                  placeholder="Search by ID or client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <div className="flex items-center gap-2">
                <FaFilter className="text-gray-400" />
                <select
                  value={filterReason}
                  onChange={(e) => setFilterReason(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Reasons</option>
                  <option value="ClientRequest">Client Request</option>
                  <option value="VehicleUnavailable">Vehicle Unavailable</option>
                  <option value="ClientNo-Show">Client No-Show</option>
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
            emptyMessage="No cancelled bookings found"
          />
        </div>
      </Card>
    </div>
  );
}

export default CancelledBookings; 