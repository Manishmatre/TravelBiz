import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaTachometerAlt, FaUsers, FaFileAlt, FaCar, FaMapMarkedAlt, FaHistory, FaSignOutAlt } from 'react-icons/fa';

const navLinks = [
  { to: '/', label: 'Dashboard', icon: <FaTachometerAlt />, roles: ['admin', 'agent', 'driver'] },
  { to: '/clients', label: 'Clients', icon: <FaUsers />, roles: ['admin', 'agent'] },
  { to: '/files', label: 'Files', icon: <FaFileAlt />, roles: ['admin', 'agent'] },
  { to: '/vehicles', label: 'Vehicles', icon: <FaCar />, roles: ['admin', 'agent'] },
  { to: '/tracking', label: 'Live Tracking', icon: <FaMapMarkedAlt />, roles: ['admin', 'agent', 'driver'] },
  { to: '/activity-log', label: 'Activity Log', icon: <FaHistory />, roles: ['admin', 'agent'] },
];

function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="h-screen w-64 bg-blue-900 text-white flex flex-col shadow-lg">
      <div className="flex items-center gap-2 p-6 text-2xl font-bold tracking-wide border-b border-blue-800">
        <span className="bg-white text-blue-700 rounded-full w-8 h-8 flex items-center justify-center font-black text-lg">T</span>
        <span>TravelBiz</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navLinks.filter(link => link.roles.includes(user?.role)).map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center gap-3 px-4 py-2 rounded hover:bg-blue-800 focus:bg-blue-800 transition font-medium text-base ${location.pathname === link.to ? 'bg-blue-800 font-semibold' : ''}`}
          >
            <span className="text-lg">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-blue-800">
        <div className="mb-2 text-sm">Logged in as <span className="font-semibold">{user?.name}</span> ({user?.role})</div>
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold transition">
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar; 