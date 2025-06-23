import React, { useState, useEffect } from 'react';
import { FaCalendar, FaSearch, FaFilter, FaUser, FaCar, FaRegClock, FaUsers } from 'react-icons/fa';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';
import StatCard from '../../components/common/StatCard';
import PageHeading from '../../components/common/PageHeading';
import { useAuth } from '../../contexts/AuthContext';
import { getBookings } from '../../services/bookingService';
import Loader from '../../components/common/Loader';
import Notification from '../../components/common/Notification';

function UpcomingBookings() {
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRange, setFilterRange] = useState('week');

  useEffect(() => {
    const today = new Date();
    const mockBookings = [
      {
        id: 'BK-U001',
        clientName: 'Olivia Martinez',
        trip: 'Corporate Roadshow',
        vehicle: 'Mercedes S-Class',
        driver: 'Daniel Lee',
        date: new Date(today.setDate(today.getDate() + 2)).toISOString(),
        pax: 3,
      },
      {
        id: 'BK-U002',
        clientName: 'William Garcia',
        trip: 'Family Vacation Transfer',
        vehicle: 'Ford Expedition',
        driver: 'Sophia Hernandez',
        date: new Date(today.setDate(today.getDate() + 5)).toISOString(),
        pax: 6,
      },
      {
        id: 'BK-U003',
        clientName: 'Ava Rodriguez',
        trip: 'Prom Night',
        vehicle: 'Lincoln Stretch Limo',
        driver: 'Not Assigned',
        date: new Date(today.setDate(today.getDate() + 10)).toISOString(),
        pax: 8,
      },
      {
        id: 'BK-U004',
        clientName: 'James Wilson',
        trip: 'Anniversary Dinner',
        vehicle: 'Bentley Flying Spur',
        driver: 'William Clark',
        date: new Date(today.setDate(today.getDate() + 1)).toISOString(),
        pax: 2,
      },
    ];
    
    setTimeout(() => {
      setUpcomingBookings(mockBookings.sort((a, b) => new Date(a.date) - new Date(b.date)));
      setLoading(false);
    }, 1000);
  }, []);

  const filteredBookings = upcomingBookings.filter(booking => {
    const matchesSearch = booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.trip.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Simplified date range filtering for mock
    // In a real app, this would involve more complex date comparisons
    const matchesRange = filterRange === 'all' || (filterRange === 'week' && (new Date(booking.date) < new Date(new Date().setDate(new Date().getDate() + 7))));

    return matchesSearch && matchesRange;
  });

  const columns = [
    { key: 'date', label: 'Date', render: (booking) => (
      <div className="flex flex-col">
        <span className="font-semibold text-gray-800">{new Date(booking.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        <span className="text-sm text-gray-500">{new Date(booking.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    )},
    { key: 'trip', label: 'Trip Details', render: (booking) => (
      <div>
        <div className="font-medium text-gray-900">{booking.trip}</div>
        <div className="text-sm text-gray-500">{booking.clientName}</div>
      </div>
    )},
    { key: 'assignment', label: 'Assignment', render: (booking) => (
      <div>
        <div className="flex items-center gap-2 text-sm">
          <FaCar className="text-gray-500" /> {booking.vehicle}
        </div>
        <div className={`flex items-center gap-2 text-sm mt-1 ${booking.driver === 'Not Assigned' ? 'text-red-500' : ''}`}>
          <FaUser className="text-gray-500" /> {booking.driver}
        </div>
      </div>
    )},
    { key: 'pax', label: 'Pax', render: (booking) => (
      <div className="flex items-center gap-2">
        <FaUsers className="text-gray-500" />
        <span className="font-medium">{booking.pax}</span>
      </div>
    )},
    { key: 'actions', label: 'Actions', render: (booking) => (
      <div className="flex gap-2">
        <Button size="sm" variant="outline">
          Manage
        </Button>
      </div>
    )}
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8 min-h-screen">
      <div className="space-y-6 mb-6">
        <PageHeading
          icon={<FaCalendar className="text-teal-600" />}
          title="Upcoming Bookings"
          subtitle="Plan ahead with a view of future confirmed trips"
          iconColor="text-teal-600"
        >
          <Button>
            <FaCalendar className="mr-2" />
            Add Future Booking
          </Button>
        </PageHeading>
      </div>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<FaCalendar className="text-teal-600" />} 
          label="Upcoming (7 days)" 
          value={upcomingBookings.length} 
          accentColor="teal"
        />
        <StatCard
          icon={<FaUser className="text-red-600" />} 
          label="Unassigned Drivers" 
          value={upcomingBookings.filter(b => b.driver === 'Not Assigned').length} 
          accentColor="red"
        />
        <StatCard
          icon={<FaUsers className="text-blue-600" />} 
          label="Total Passengers" 
          value={upcomingBookings.reduce((sum, b) => sum + b.pax, 0)} 
          accentColor="blue"
        />
      </div>
      {/* Filter/Search Bar + Table in one Card */}
      <Card className="p-0">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-6 pb-0">
          <div className="flex gap-4 items-center">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by client or trip..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <select
                value={filterRange}
                onChange={(e) => setFilterRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">Next 7 Days</option>
                <option value="month">Next 30 Days</option>
                <option value="all">All Upcoming</option>
              </select>
            </div>
          </div>
        </div>
        <div className="p-6 pt-0">
          <Table
            data={filteredBookings}
            columns={columns}
            loading={loading}
            emptyMessage="No upcoming bookings found"
          />
        </div>
      </Card>
    </div>
  );
}

export default UpcomingBookings; 