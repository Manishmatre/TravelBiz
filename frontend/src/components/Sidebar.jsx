import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navLinks = [
  { to: '/', label: 'Dashboard', roles: ['admin', 'agent', 'driver'] },
  { to: '/clients', label: 'Clients', roles: ['admin', 'agent'] },
  { to: '/files', label: 'Files', roles: ['admin', 'agent'] },
  { to: '/vehicles', label: 'Vehicles', roles: ['admin', 'agent'] },
  { to: '/tracking', label: 'Live Tracking', roles: ['admin', 'agent', 'driver'] },
  { to: '/activity-log', label: 'Activity Log', roles: ['admin', 'agent'] },
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
    <aside className="h-screen w-64 bg-blue-900 text-white flex flex-col">
      <div className="p-6 text-2xl font-bold tracking-wide border-b border-blue-800">TravelBiz</div>
      <nav className="flex-1 p-4 space-y-2">
        {navLinks.filter(link => link.roles.includes(user?.role)).map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`block px-4 py-2 rounded hover:bg-blue-800 transition ${location.pathname === link.to ? 'bg-blue-800 font-semibold' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-blue-800">
        <div className="mb-2 text-sm">Logged in as <span className="font-semibold">{user?.name}</span> ({user?.role})</div>
        <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold transition">Logout</button>
      </div>
    </aside>
  );
}

export default Sidebar; 