import React, { useEffect, useState } from 'react';
import { getClients } from '../services/clientService';
import { getVehicles } from '../services/vehicleService';
import { getFiles } from '../services/fileService';
import { useAuth } from '../contexts/AuthContext';

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
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded shadow p-6 flex flex-col items-center">
          <div className="text-4xl font-bold text-blue-700 mb-2">{loading ? '--' : stats.clients}</div>
          <div className="text-gray-600">Total Clients</div>
        </div>
        <div className="bg-white rounded shadow p-6 flex flex-col items-center">
          <div className="text-4xl font-bold text-blue-700 mb-2">{loading ? '--' : stats.vehicles}</div>
          <div className="text-gray-600">Total Vehicles</div>
        </div>
        <div className="bg-white rounded shadow p-6 flex flex-col items-center">
          <div className="text-4xl font-bold text-blue-700 mb-2">{loading ? '--' : stats.files}</div>
          <div className="text-gray-600">Total Files</div>
        </div>
      </div>
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : activity.length === 0 ? (
          <div className="text-gray-500">No recent activity yet.</div>
        ) : (
          <ul>
            {activity.map((item, idx) => (
              <li key={idx} className="mb-2">
                <span className="font-semibold">[{item.type}]</span> {item.name} <span className="text-gray-500">({item.detail})</span> <span className="text-gray-400 text-xs">{item.date ? new Date(item.date).toLocaleString() : ''}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Dashboard; 