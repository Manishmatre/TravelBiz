import React, { useEffect, useState } from 'react';
import { getClients } from '../services/clientService';
import { getVehicles } from '../services/vehicleService';
import { getFiles } from '../services/fileService';
import { getBookings } from '../services/bookingService';
import { getUsers } from '../services/userService';
import { getAllLocations } from '../services/locationService';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import { FaUsers, FaCar, FaFileAlt, FaPlus, FaSyncAlt, FaCalendarAlt, FaMoneyBillWave, FaUserTie, FaMapMarkerAlt, FaClock, FaCheckCircle, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa';
import {
  AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend, BarChart, Bar, LineChart, Line
} from 'recharts';
import { Link } from 'react-router-dom';

// Mock data for analytics
const mockTrendsData = [
  { month: 'Jan', clients: 20, vehicles: 8, files: 12 },
  { month: 'Feb', clients: 25, vehicles: 10, files: 14 },
  { month: 'Mar', clients: 30, vehicles: 12, files: 17 },
  { month: 'Apr', clients: 35, vehicles: 15, files: 19 },
  { month: 'May', clients: 40, vehicles: 14, files: 21 },
  { month: 'Jun', clients: 50, vehicles: 18, files: 25 },
  { month: 'Jul', clients: 55, vehicles: 20, files: 28 },
  { month: 'Aug', clients: 60, vehicles: 22, files: 30 },
  { month: 'Sep', clients: 65, vehicles: 25, files: 32 },
  { month: 'Oct', clients: 70, vehicles: 28, files: 35 },
  { month: 'Nov', clients: 75, vehicles: 30, files: 38 },
  { month: 'Dec', clients: 80, vehicles: 33, files: 40 },
];
const mockPieData = [
  { name: 'Clients', value: 80 },
  { name: 'Vehicles', value: 33 },
  { name: 'Files', value: 40 },
];
const pieColors = ['#3B82F6', '#22C55E', '#A21CAF'];

function Dashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState({
    clients: 0,
    vehicles: 0,
    files: 0,
    bookings: 0,
    drivers: 0,
    agents: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    onlineVehicles: 0,
    availableVehicles: 0,
    onTripVehicles: 0,
    maintenanceVehicles: 0
  });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentClients, setRecentClients] = useState([]);
  const [liveLocations, setLiveLocations] = useState([]);
  const [timeRange, setTimeRange] = useState('month'); // week, month, quarter, year

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const [
          clients, 
          vehicles, 
          files, 
          bookings, 
          users, 
          locations
        ] = await Promise.all([
          getClients(token),
          getVehicles(token),
          getFiles(token),
          getBookings(token),
          getUsers(token),
          getAllLocations(token)
        ]);

        // Filter users by role
        const drivers = users.filter(u => u.role === 'driver');
        const agents = users.filter(u => u.role === 'agent');

        // Calculate comprehensive stats
        const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);
        const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
        const completedBookings = bookings.filter(b => b.status === 'Completed').length;
        const cancelledBookings = bookings.filter(b => b.status === 'Cancelled').length;
        
        const onlineVehicles = vehicles.filter(v => {
          const location = locations.find(l => l.vehicleId === v._id);
          if (!location) return false;
          const now = new Date();
          const lastUpdate = new Date(location.updatedAt);
          return (now - lastUpdate) / (1000 * 60) < 5; // Online if updated within 5 minutes
        }).length;

        const availableVehicles = vehicles.filter(v => v.status === 'available').length;
        const onTripVehicles = vehicles.filter(v => v.status === 'on-trip').length;
        const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;

        setStats({
          clients: clients.length,
          vehicles: vehicles.length,
          files: files.length,
          bookings: bookings.length,
          drivers: drivers.length,
          agents: agents.length,
          totalRevenue,
          pendingBookings,
          completedBookings,
          cancelledBookings,
          onlineVehicles,
          availableVehicles,
          onTripVehicles,
          maintenanceVehicles
        });

        // Build recent activity feed
        const recentClients = clients
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3)
          .map(c => ({
            type: 'Client',
            name: c.name,
            date: c.createdAt,
            detail: c.email,
            icon: 'FaUsers',
            color: 'blue'
          }));

        const recentVehicles = vehicles
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3)
          .map(v => ({
            type: 'Vehicle',
            name: v.name,
            date: v.createdAt,
            detail: v.numberPlate,
            icon: 'FaCar',
            color: 'green'
          }));

        const recentBookingsData = bookings
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(b => ({
            type: 'Booking',
            name: b.client?.name || 'Unknown Client',
            date: b.createdAt,
            detail: b.destination,
            status: b.status,
            icon: 'FaCalendarAlt',
            color: b.status === 'Completed' ? 'green' : b.status === 'Pending' ? 'yellow' : 'red'
          }));

        const recentFiles = files
          .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
          .slice(0, 2)
          .map(f => ({
            type: 'File',
            name: f.title,
            date: f.uploadDate,
            detail: f.fileType,
            icon: 'FaFileAlt',
            color: 'purple'
          }));

        // Merge and sort by date
        const merged = [...recentClients, ...recentVehicles, ...recentBookingsData, ...recentFiles]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 8);
        setActivity(merged);
        setRecentBookings(recentBookingsData);
        setRecentClients(recentClients);
        setLiveLocations(locations);

      } catch (err) {
        setError('Failed to load dashboard stats');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchStats();
  }, [token]);

  // Filter data based on time range
  const getFilteredData = (data, dateField = 'createdAt') => {
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }
    
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= startDate && itemDate <= now;
    });
  };

  // Calculate statistics
  const totalBookings = stats.bookings;
  const totalClients = stats.clients;
  const totalVehicles = stats.vehicles;
  const totalUsers = stats.drivers + stats.agents;
  
  // Analytics data
  const revenueData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 55000 },
    { month: 'Jun', revenue: 67000 },
  ];

  const bookingStatusData = [
    { name: 'Completed', value: stats.completedBookings, color: '#10b981' },
    { name: 'Pending', value: stats.pendingBookings, color: '#f59e0b' },
    { name: 'Cancelled', value: stats.cancelledBookings, color: '#ef4444' },
  ];

  const vehicleStatusData = [
    { name: 'Available', value: stats.availableVehicles, color: '#10b981' },
    { name: 'On Trip', value: stats.onTripVehicles, color: '#3b82f6' },
    { name: 'Maintenance', value: stats.maintenanceVehicles, color: '#f59e0b' },
  ];

  const quickActions = [
    { label: 'Add Client', icon: <FaUsers />, link: '/clients/add', color: 'blue' },
    { label: 'Add Vehicle', icon: <FaCar />, link: '/vehicles/add', color: 'green' },
    { label: 'New Booking', icon: <FaCalendarAlt />, link: '/bookings/add', color: 'purple' },
    { label: 'Live Tracking', icon: <FaMapMarkerAlt />, link: '/tracking', color: 'red' },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900 tracking-tight">
            Welcome back, {user?.name || 'Admin'}!
          </h1>
          <p className="text-gray-600">Here's what's happening with your business today</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <FaSyncAlt className="text-gray-600" />
          <span className="text-gray-700 font-medium">Refresh</span>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className={`flex items-center gap-3 p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all bg-white hover:scale-105 ${
              action.color === 'blue' ? 'hover:border-blue-300' :
              action.color === 'green' ? 'hover:border-green-300' :
              action.color === 'purple' ? 'hover:border-purple-300' :
              'hover:border-red-300'
            }`}
          >
            <div className={`p-2 rounded-lg ${
              action.color === 'blue' ? 'bg-blue-100 text-blue-600' :
              action.color === 'green' ? 'bg-green-100 text-green-600' :
              action.color === 'purple' ? 'bg-purple-100 text-purple-600' :
              'bg-red-100 text-red-600'
            }`}>
              {action.icon}
            </div>
            <span className="font-medium text-gray-700">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<FaUsers />}
          label="Total Clients"
          value={loading ? '--' : stats.clients}
          trend={{ direction: 'up', percent: 12.5 }}
          accentColor="blue"
        />
        <StatCard
          icon={<FaCar />}
          label="Total Vehicles"
          value={loading ? '--' : stats.vehicles}
          trend={{ direction: 'up', percent: 8.2 }}
          accentColor="green"
        />
        <StatCard
          icon={<FaCalendarAlt />}
          label="Total Bookings"
          value={loading ? '--' : stats.bookings}
          trend={{ direction: 'up', percent: 15.3 }}
          accentColor="purple"
        />
        <StatCard
          icon={<FaMoneyBillWave />}
          label="Total Revenue"
          value={loading ? '--' : `$${stats.totalRevenue.toLocaleString()}`}
          trend={{ direction: 'up', percent: 22.1 }}
          accentColor="teal"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<FaUserTie />}
          label="Drivers"
          value={loading ? '--' : stats.drivers}
          accentColor="indigo"
        />
        <StatCard
          icon={<FaMapMarkerAlt />}
          label="Online Vehicles"
          value={loading ? '--' : `${stats.onlineVehicles}/${stats.vehicles}`}
          accentColor="green"
        />
        <StatCard
          icon={<FaCheckCircle />}
          label="Completed Trips"
          value={loading ? '--' : stats.completedBookings}
          accentColor="emerald"
        />
        <StatCard
          icon={<FaClock />}
          label="Pending Trips"
          value={loading ? '--' : stats.pendingBookings}
          accentColor="yellow"
        />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart */}
        <Card title="Revenue Trend" className="col-span-2">
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#14b8a6" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Booking Status */}
        <Card title="Booking Status">
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bookingStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {bookingStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Vehicle Status and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Vehicle Status */}
        <Card title="Vehicle Status">
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehicleStatusData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card title="Recent Activity">
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {loading ? (
              <div className="text-gray-500">Loading activity...</div>
            ) : activity.length === 0 ? (
              <div className="text-gray-500">No recent activity</div>
            ) : (
              activity.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className={`p-2 rounded-lg ${
                    item.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    item.color === 'green' ? 'bg-green-100 text-green-600' :
                    item.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                    item.color === 'red' ? 'bg-red-100 text-red-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {item.icon === 'FaUsers' && <FaUsers />}
                    {item.icon === 'FaCar' && <FaCar />}
                    {item.icon === 'FaCalendarAlt' && <FaCalendarAlt />}
                    {item.icon === 'FaFileAlt' && <FaFileAlt />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.detail}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(item.date).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Live Tracking Summary */}
      <Card title="Live Tracking Summary">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.onlineVehicles}</div>
            <div className="text-sm text-green-700">Vehicles Online</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.onTripVehicles}</div>
            <div className="text-sm text-blue-700">Currently on Trip</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.availableVehicles}</div>
            <div className="text-sm text-yellow-700">Available for Booking</div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <Link 
            to="/tracking" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <FaMapMarkerAlt />
            View Live Map
          </Link>
        </div>
      </Card>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaTimesCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;