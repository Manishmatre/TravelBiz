import React, { useState, useEffect } from 'react';
import { FaCheckDouble, FaSearch, FaFilter, FaCalendarAlt, FaUser, FaCar, FaRoute, FaDollarSign, FaStar, FaDownload } from 'react-icons/fa';
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

function CompletedBookings() {
  const [completedBookings, setCompletedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('all');

  // Mock completed bookings data
  useEffect(() => {
    const mockBookings = [
      {
        id: 'BK-98765',
        clientName: 'Charles Davis',
        trip: 'Business Trip - Downtown',
        vehicle: 'BMW 7 Series',
        driver: 'John Anderson',
        date: '2024-01-20T12:00:00',
        amount: 650,
        status: 'completed',
        rating: 5
      },
      {
        id: 'BK-98764',
        clientName: 'Linda Wilson',
        trip: 'Shopping Spree - 5th Ave',
        vehicle: 'Lexus ES',
        driver: 'Patricia Martinez',
        date: '2024-01-18T11:30:00',
        amount: 400,
        status: 'completed',
        rating: 4
      },
      {
        id: 'BK-98763',
        clientName: 'Thomas Moore',
        trip: 'Airport Dropoff - EWR',
        vehicle: 'Toyota Sienna',
        driver: 'Robert Taylor',
        date: '2024-01-15T18:00:00',
        amount: 220,
        status: 'completed',
        rating: 5
      }
    ];
    
    setTimeout(() => {
      setCompletedBookings(mockBookings);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredBookings = completedBookings.filter(booking => {
    const matchesSearch = booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.trip.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Simplified date filtering for mock
    return matchesSearch;
  });

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
    { key: 'date', label: 'Date', render: (booking) => (
      <div className="text-sm">
        <div className="font-medium">{new Date(booking.date).toLocaleDateString()}</div>
      </div>
    )},
    { key: 'amount', label: 'Amount', render: (booking) => (
      <div className="font-semibold text-green-600">${booking.amount.toLocaleString()}</div>
    )},
    { key: 'rating', label: 'Rating', render: (booking) => (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className={i < booking.rating ? 'text-yellow-400' : 'text-gray-300'} />
        ))}
      </div>
    )},
    { key: 'actions', label: 'Actions', render: (booking) => (
      <Button size="sm" variant="outline">
        View Invoice
      </Button>
    )}
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8 min-h-screen">
      <div className="space-y-6 mb-6">
        <PageHeading
          icon={<FaCheckDouble />}
          title="Completed Bookings"
          subtitle="A history of all successfully completed bookings"
          iconColor="text-blue-600"
        >
          <Button variant="outline">
            <FaDownload className="mr-2" />
            Export History
          </Button>
        </PageHeading>
      </div>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<FaCheckDouble className="text-blue-600" />} 
          label="Total Completed" 
          value={completedBookings.length} 
          accentColor="blue"
        />
        <StatCard
          icon={<FaDollarSign className="text-green-600" />} 
          label="Total Revenue" 
          value={`$${completedBookings.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}`} 
          accentColor="green"
        />
        <StatCard
          icon={<FaStar className="text-yellow-600" />} 
          label="Average Rating" 
          value={`${(completedBookings.reduce((sum, b) => sum + b.rating, 0) / completedBookings.length || 0).toFixed(1)} / 5`} 
          accentColor="yellow"
        />
      </div>
      {/* Filter/Search Bar */}
      <Card className="p-0 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4 p-6 pb-0">
          <Input
            type="text"
            placeholder="Search completed bookings..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-[44px]"
            style={{ marginBottom: 0 }}
          />
          <Input
            type="date"
            className="min-w-[200px] h-[44px] w-full md:w-auto mb-0"
            style={{ marginBottom: 0 }}
          />
          <Input
            type="date"
            className="min-w-[200px] h-[44px] w-full md:w-auto mb-0"
            style={{ marginBottom: 0 }}
          />
        </div>
        <div className="p-6 pt-0">
          {/* Table */}
          <Table columns={columns} data={filteredBookings} loading={loading} />
        </div>
      </Card>
    </div>
  );
}

export default CompletedBookings; 