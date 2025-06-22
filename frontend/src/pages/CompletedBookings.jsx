import React, { useState, useEffect } from 'react';
import { FaCheckDouble, FaSearch, FaFilter, FaCalendarAlt, FaUser, FaCar, FaRoute, FaDollarSign, FaStar, FaDownload } from 'react-icons/fa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Table from '../components/common/Table';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaCheckDouble className="text-blue-600" />
            Completed Bookings
          </h1>
          <p className="text-gray-600 mt-2">A history of all successfully completed bookings</p>
        </div>
        <Button variant="outline">
          <FaDownload className="mr-2" />
          Export History
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedBookings.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaCheckDouble className="text-blue-600" />
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${completedBookings.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaDollarSign className="text-green-600" />
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(completedBookings.reduce((sum, b) => sum + b.rating, 0) / completedBookings.length || 0).toFixed(1)}
                  <span className="text-base"> / 5</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FaStar className="text-yellow-600" />
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
                  placeholder="Search completed bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <div className="flex items-center gap-2">
                <FaFilter className="text-gray-400" />
                <Input
                  type="date"
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                 <Input
                  type="date"
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <Table
            data={filteredBookings}
            columns={columns}
            loading={loading}
            emptyMessage="No completed bookings found"
          />
        </div>
      </Card>
    </div>
  );
}

export default CompletedBookings; 