import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaSearch, FaFilter, FaUser, FaCar, FaClock, FaPhone } from 'react-icons/fa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Table from '../components/common/Table';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
        <div>
          <h1 className="text-3xl font-bold text-red-800 flex items-center gap-3">
            <FaExclamationTriangle />
            Overdue Bookings
          </h1>
          <p className="text-red-700 mt-2">Trips that passed their scheduled time without being completed. Immediate action may be required.</p>
        </div>
      </div>

       <Card>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by client, driver, or trip..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-72"
                />
              </div>
            </div>
            <div className="text-lg font-bold">
              <span className="text-red-600">{overdueBookings.length}</span>
              <span className="text-gray-600"> Overdue Trip(s)</span>
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
            emptyMessage="No overdue bookings found."
          />
        </div>
      </Card>
    </div>
  );
}

export default OverdueBookings; 