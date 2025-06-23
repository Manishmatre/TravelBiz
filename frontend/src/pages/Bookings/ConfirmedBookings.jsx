import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaSearch, FaFilter, FaCalendarAlt, FaUser, FaCar, FaRoute, FaDollarSign, FaDownload } from 'react-icons/fa';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';
import PageHeading from '../../components/common/PageHeading';
import StatCard from '../../components/common/StatCard';
import { useAuth } from '../../contexts/AuthContext';
import { getBookings } from '../../services/bookingService';
import Loader from '../../components/common/Loader';
import Notification from '../../components/common/Notification';

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
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8 min-h-screen">
      <div className="space-y-6 mb-6">
        <PageHeading
          icon={<FaCheckCircle />}
          title="Confirmed Bookings"
          subtitle="View all confirmed and scheduled bookings"
          iconColor="text-green-600"
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
          icon={<FaCheckCircle className="text-green-600" />} 
          label="Total Confirmed" 
          value={confirmedBookings.length} 
          accentColor="green"
        />
        <StatCard
          icon={<FaCalendarAlt className="text-blue-600" />} 
          label="Upcoming Today" 
          value={confirmedBookings.filter(b => new Date(b.date).toDateString() === new Date().toDateString()).length} 
          accentColor="blue"
        />
        <StatCard
          icon={<FaDollarSign className="text-purple-600" />} 
          label="Confirmed Value" 
          value={`$${confirmedBookings.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}`} 
          accentColor="purple"
        />
      </div>
      {/* Filter/Search Bar */}
      <Card className="p-0 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4 p-6 pb-0">
          <Input
            type="text"
            placeholder="Search by ID, client, or trip..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-[44px]"
            style={{ marginBottom: 0 }}
          />
          <select
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="min-w-[200px] h-[44px] w-full md:w-auto mb-0 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ marginBottom: 0 }}
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="upcoming">Upcoming</option>
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

export default ConfirmedBookings; 