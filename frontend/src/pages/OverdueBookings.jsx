import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaSearch, FaFilter, FaUser, FaCar, FaClock, FaPhone } from 'react-icons/fa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Table from '../components/common/Table';
import PageHeading from '../components/common/PageHeading';

function OverdueBookings() {
  const [overdueBookings, setOverdueBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock overdue bookings data
  useEffect(() => {
    const now = new Date();
    const mockBookings = [
      {
        id: 'BK-O001',
        clientName: 'George King',
        trip: 'Theater District Drop-off',
        vehicle: 'Mercedes E-Class',
        driver: 'Andrew Scott',
        scheduledTime: new Date(now.setDate(now.getDate() - 1)).toISOString(),
        lastStatus: 'In Progress',
      },
      {
        id: 'BK-O002',
        clientName: 'Nancy Allen',
        trip: 'Airport Pickup - LaGuardia',
        vehicle: 'Cadillac Escalade',
        driver: 'Laura Adams',
        scheduledTime: new Date(now.setHours(now.getHours() - 3)).toISOString(),
        lastStatus: 'Driver Dispatched',
      },
    ];
    
    setTimeout(() => {
      setOverdueBookings(mockBookings);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredBookings = overdueBookings.filter(booking => {
    return booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           booking.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
           booking.trip.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getTimeDifference = (dateString) => {
    const diff = new Date() - new Date(dateString);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m ago`;
    return `${minutes}m ago`;
  };

  const columns = [
    { key: 'details', label: 'Overdue Trip Details', render: (booking) => (
      <div>
        <div className="font-bold text-lg text-gray-900">{booking.trip}</div>
        <div className="text-sm text-gray-600">Client: {booking.clientName}</div>
        <div className="text-sm text-gray-600 mt-1">ID: <span className="font-mono text-blue-600">{booking.id}</span></div>
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
    { key: 'overdue', label: 'Time Overdue', render: (booking) => (
      <div className="flex flex-col">
        <span className="font-bold text-red-600">{getTimeDifference(booking.scheduledTime)}</span>
        <span className="text-sm text-gray-500">Scheduled: {new Date(booking.scheduledTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
      </div>
    )},
    { key: 'status', label: 'Last Known Status', render: (booking) => (
       <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
        {booking.lastStatus}
      </span>
    )},
    { key: 'actions', label: 'Actions', render: (booking) => (
      <div className="flex gap-2">
        <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white">
          <FaPhone className="mr-2" /> Contact Driver
        </Button>
        <Button size="sm" variant="outline">
          Update Status
        </Button>
      </div>
    )}
  ];

  return (
    <div className="bg-gradient-to-br from-red-50 via-white to-red-100 py-6 px-2 md:px-8 min-h-screen">
      <div className="space-y-6 mb-6">
        <PageHeading
          icon={<FaExclamationTriangle />}
          title="Overdue Bookings"
          subtitle="Trips that passed their scheduled time without being completed. Immediate action may be required."
          iconColor="text-red-600"
        />
      </div>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card><div className="p-6 flex items-center"><div className="p-3 rounded-full bg-red-100 text-red-600"><FaExclamationTriangle size={24}/></div><div className="ml-4"><p className="text-sm font-medium text-gray-500">Total Overdue</p><p className="text-2xl font-bold text-gray-900">{overdueBookings.length}</p></div></div></Card>
        <Card><div className="p-6 flex items-center"><div className="p-3 rounded-full bg-yellow-100 text-yellow-600"><FaClock size={24}/></div><div className="ml-4"><p className="text-sm font-medium text-gray-500">Most Overdue</p><p className="text-2xl font-bold text-gray-900">{overdueBookings[0] ? getTimeDifference(overdueBookings[0].scheduledTime) : '-'}</p></div></div></Card>
        <Card><div className="p-6 flex items-center"><div className="p-3 rounded-full bg-blue-100 text-blue-600"><FaUser size={24}/></div><div className="ml-4"><p className="text-sm font-medium text-gray-500">Drivers Involved</p><p className="text-2xl font-bold text-gray-900">{[...new Set(overdueBookings.map(b => b.driver))].length}</p></div></div></Card>
      </div>
      {/* Filter/Search Bar */}
      <Card className="p-0 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4 p-6 pb-0">
          <Input
            type="text"
            placeholder="Search by client, driver, or trip..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-[44px]"
            style={{ marginBottom: 0 }}
          />
        </div>
        <div className="p-6 pt-0">
          {/* Table */}
          <Table data={filteredBookings} columns={columns} loading={loading} emptyMessage="No overdue bookings found." />
        </div>
      </Card>
    </div>
  );
}

export default OverdueBookings; 