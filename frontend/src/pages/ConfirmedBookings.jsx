import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaSearch, FaFilter, FaCalendarAlt, FaUser, FaCar, FaRoute, FaDollarSign, FaDownload } from 'react-icons/fa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Table from '../components/common/Table';

function ConfirmedBookings() {
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('all');

  // Mock confirmed bookings data
  useEffect(() => {
    const mockBookings = [
      {
        id: 'BK-54321',
        clientName: 'Alice Williams',
        trip: 'Wedding Transport',
        vehicle: 'Rolls Royce Phantom',
        driver: 'James Miller',
        date: '2024-03-05T15:00:00',
        amount: 2500,
        status: 'confirmed'
      },
      {
        id: 'BK-54322',
        clientName: 'Robert Brown',
        trip: 'Airport Pickup - LAX',
        vehicle: 'Lincoln Navigator',
        driver: 'Maria Garcia',
        date: '2024-02-20T11:00:00',
        amount: 350,
        status: 'confirmed'
      },
      {
        id: 'BK-54323',
        clientName: 'Jennifer Jones',
        trip: 'Winery Tour - Napa Valley',
        vehicle: 'Mercedes Sprinter',
        driver: 'David Rodriguez',
        date: '2024-02-25T10:30:00',
        amount: 1800,
        status: 'confirmed'
      }
    ];
    
    setTimeout(() => {
      setConfirmedBookings(mockBookings);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredBookings = confirmedBookings.filter(booking => {
    const matchesSearch = booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.trip.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Date filtering logic would be more complex in a real app
    const matchesDate = filterDate === 'all' || 
                        (filterDate === 'today' && new Date(booking.date).toDateString() === new Date().toDateString()) ||
                        (filterDate === 'upcoming'); // Simplified for mock

    return matchesSearch && matchesDate;
  });

  const columns = [
    { key: 'bookingId', label: 'Booking ID', render: (booking) => (
      <div className="font-semibold text-blue-600">{booking.id}</div>
    )},
    { key: 'client', label: 'Client', render: (booking) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <FaUser className="text-green-600 text-sm" />
        </div>
        <div>
          <div className="font-medium text-gray-900">{booking.clientName}</div>
        </div>
      </div>
    )},
    { key: 'trip', label: 'Trip Details', render: (booking) => (
      <div>
        <div className="font-medium text-gray-900">{booking.trip}</div>
        <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
          <FaCar /> {booking.vehicle}
        </div>
        <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
          <FaUser /> {booking.driver}
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
    { key: 'status', label: 'Status', render: (booking) => (
      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
        Confirmed
      </span>
    )},
    { key: 'actions', label: 'Actions', render: (booking) => (
      <Button size="sm" variant="outline">
        View Details
      </Button>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaCheckCircle className="text-green-600" />
            Confirmed Bookings
          </h1>
          <p className="text-gray-600 mt-2">View all confirmed and scheduled bookings</p>
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
                <p className="text-sm font-medium text-gray-600">Total Confirmed</p>
                <p className="text-2xl font-bold text-gray-900">{confirmedBookings.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaCheckCircle className="text-green-600" />
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {confirmedBookings.filter(b => new Date(b.date).toDateString() === new Date().toDateString()).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaCalendarAlt className="text-blue-600" />
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${confirmedBookings.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaDollarSign className="text-purple-600" />
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
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="upcoming">Upcoming</option>
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
            emptyMessage="No confirmed bookings found"
          />
        </div>
      </Card>
    </div>
  );
}

export default ConfirmedBookings; 