import React, { useState, useEffect } from 'react';
import { FaCalendarDay, FaSearch, FaFilter, FaUser, FaCar, FaClock, FaRoute, FaCheck, FaTimes } from 'react-icons/fa';
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

function TodayBookings() {
  const [todayBookings, setTodayBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock today's bookings data
  useEffect(() => {
    const now = new Date();
    const mockBookings = [
      {
        id: 'BK-T001',
        clientName: 'Jessica White',
        trip: 'Morning Commute',
        vehicle: 'Honda Accord',
        driver: 'Emily White',
        time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 30).toISOString(),
        status: 'upcoming'
      },
      {
        id: 'BK-T002',
        clientName: 'Chris Green',
        trip: 'Lunch Meeting',
        vehicle: 'Cadillac CT5',
        driver: 'Michael Harris',
        time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0).toISOString(),
        status: 'upcoming'
      },
      {
        id: 'BK-T003',
        clientName: 'Patricia Hall',
        trip: 'Airport Transfer - JFK',
        vehicle: 'Chevrolet Suburban',
        driver: 'Chris Martinez',
        time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 0).toISOString(),
        status: 'in_progress'
      },
      {
        id: 'BK-T004',
        clientName: 'Mark Lewis',
        trip: 'Doctor Appointment',
        vehicle: 'Toyota Avalon',
        driver: 'Jessica Davis',
        time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0).toISOString(),
        status: 'completed'
      },
    ];
    
    setTimeout(() => {
      setTodayBookings(mockBookings);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredBookings = todayBookings.filter(booking => {
    const matchesSearch = booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.trip.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusChip = (status) => {
    switch (status) {
      case 'upcoming':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Upcoming</span>;
      case 'in_progress':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">In Progress</span>;
      case 'completed':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Completed</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  const columns = [
    { key: 'time', label: 'Time', render: (booking) => (
      <div className="font-semibold text-gray-800">{new Date(booking.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
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
        <div className="flex items-center gap-2 text-sm mt-1">
          <FaUser className="text-gray-500" /> {booking.driver}
        </div>
      </div>
    )},
    { key: 'status', label: 'Status', render: (booking) => getStatusChip(booking.status) },
    { key: 'actions', label: 'Actions', render: (booking) => (
      <div className="flex gap-2">
        <Button size="sm">
          <FaRoute className="mr-1" /> Track
        </Button>
        <Button size="sm" variant="outline">
          Details
        </Button>
      </div>
    )}
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8 min-h-screen">
      <div className="space-y-6 mb-6">
        <PageHeading
          icon={<FaCalendarDay className="text-indigo-600" />}
          title="Today's Bookings"
          subtitle="A real-time overview of all trips scheduled for today"
          iconColor="text-indigo-600"
        />
      </div>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<FaCalendarDay className="text-indigo-600" />} 
          label="Total Today" 
          value={todayBookings.length} 
          accentColor="indigo"
        />
        <StatCard
          icon={<FaClock className="text-blue-600" />} 
          label="Upcoming" 
          value={todayBookings.filter(b => b.status === 'upcoming').length} 
          accentColor="blue"
        />
        <StatCard
          icon={<FaRoute className="text-yellow-600" />} 
          label="In Progress" 
          value={todayBookings.filter(b => b.status === 'in_progress').length} 
          accentColor="yellow"
        />
        <StatCard
          icon={<FaCheck className="text-green-600" />} 
          label="Completed" 
          value={todayBookings.filter(b => b.status === 'completed').length} 
          accentColor="green"
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
        <div className="p-6 pt-0">
          <Table
            data={filteredBookings}
            columns={columns}
            loading={loading}
            emptyMessage="No bookings found for today"
          />
        </div>
      </Card>
    </div>
  );
}

export default TodayBookings; 