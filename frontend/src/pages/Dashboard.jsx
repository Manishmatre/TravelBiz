import React, { useEffect, useState } from 'react';
import { getClients } from '../services/clientService';
import { getVehicles } from '../services/vehicleService';
import { getFiles } from '../services/fileService';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import { FaUsers, FaCar, FaFileAlt, FaPlus, FaSyncAlt } from 'react-icons/fa';
import {
  AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

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
  const { token } = useAuth();
  const [stats, setStats] = useState({ clients: 0, vehicles: 0, files: 0 });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const [clients, vehicles, files] = await Promise.all([
          getClients(token),
          getVehicles(token),
          getFiles(token),
        ]);
        setStats({ clients: clients.length, vehicles: vehicles.length, files: files.length });
        // Build recent activity feed
        const recentClients = clients
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(c => ({
            type: 'Client',
            name: c.name,
            date: c.createdAt,
            detail: c.email,
          }));
        const recentVehicles = vehicles
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(v => ({
            type: 'Vehicle',
            name: v.name,
            date: v.createdAt,
            detail: v.numberPlate,
          }));
        const recentFiles = files
          .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
          .slice(0, 5)
          .map(f => ({
            type: 'File',
            name: f.title,
            date: f.uploadDate,
            detail: f.fileType,
          }));
        // Merge and sort by date
        const merged = [...recentClients, ...recentVehicles, ...recentFiles]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 7);
        setActivity(merged);
      } catch (err) {
        setError('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchStats();
  }, [token]);

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8">
      <h1 className="text-2xl font-bold mb-5 text-gray-900 tracking-tight">Dashboard</h1>
      {/* Quick Actions Bar */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500 text-white text-sm font-medium shadow-sm hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 transition-all">
          <FaPlus /> Add Client
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500 text-white text-sm font-medium shadow-sm hover:bg-green-600 focus:ring-2 focus:ring-green-300 transition-all">
          <FaPlus /> Add Vehicle
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500 text-white text-sm font-medium shadow-sm hover:bg-purple-600 focus:ring-2 focus:ring-purple-300 transition-all">
          <FaPlus /> Add File
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium shadow-sm hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 transition-all" onClick={() => window.location.reload()}>
          <FaSyncAlt /> Refresh
        </button>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <StatCard
          icon={<FaUsers />}
          label="Total Clients"
          value={loading ? '--' : stats.clients}
          trend={{ direction: 'up', percent: 7.3 }}
          accentColor="blue"
        />
        <StatCard
          icon={<FaCar />}
          label="Total Vehicles"
          value={loading ? '--' : stats.vehicles}
          trend={{ direction: 'down', percent: 2.1 }}
          accentColor="green"
        />
        <StatCard
          icon={<FaFileAlt />}
          label="Total Files"
          value={loading ? '--' : stats.files}
          trend={{ direction: 'up', percent: 4.8 }}
          accentColor="purple"
        />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
        {/* Area Chart */}
        <Card title="Monthly Trends" className="col-span-2">
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTrendsData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVehicles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFiles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A21CAF" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#A21CAF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="clients" stroke="#3B82F6" fillOpacity={1} fill="url(#colorClients)" name="Clients" />
                <Area type="monotone" dataKey="vehicles" stroke="#22C55E" fillOpacity={1} fill="url(#colorVehicles)" name="Vehicles" />
                <Area type="monotone" dataKey="files" stroke="#A21CAF" fillOpacity={1} fill="url(#colorFiles)" name="Files" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        {/* Pie Chart */}
        <Card title="Distribution" className="flex flex-col items-center justify-center">
          <div className="w-full h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={55}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card className="bg-white/80 border border-gray-100">
        <h2 className="text-xl font-semibold mb-3 text-gray-900">Recent Activity</h2>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : activity.length === 0 ? (
          <div className="text-gray-400">No recent activity yet.</div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {activity.map((item, idx) => (
              <li key={idx} className="py-3 flex items-center gap-4 group">
                <span className="inline-block font-semibold text-xs px-2 py-1 rounded bg-blue-100 text-blue-600 border border-blue-100 mr-2 group-hover:bg-blue-200 transition">{item.type}</span>
                <span className="font-medium text-gray-800 truncate max-w-xs md:max-w-md">{item.name}</span>
                <span className="text-gray-400 text-xs">{item.date ? new Date(item.date).toLocaleString() : ''}</span>
                <span className="ml-auto text-gray-500 text-xs truncate max-w-[100px]">{item.detail}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

export default Dashboard;