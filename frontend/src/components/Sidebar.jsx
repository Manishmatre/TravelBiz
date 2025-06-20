import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaTachometerAlt, FaUsers, FaUserCog, FaFileAlt, FaCar, FaMapMarkedAlt, FaHistory, FaSignOutAlt, FaChevronDown, FaChevronUp, FaUserTie } from 'react-icons/fa';

const navLinks = [
  { to: '/', label: 'Dashboard', icon: <FaTachometerAlt />, roles: ['admin', 'agent', 'driver'] },
  { to: '/clients', label: 'Clients', icon: <FaUsers />, roles: ['admin', 'agent'] },
  { to: '/users', label: 'Users', icon: <FaUserCog />, roles: ['admin'] },
  { to: '/files', label: 'Files', icon: <FaFileAlt />, roles: ['admin', 'agent'] },
  { to: '/vehicles', label: 'Vehicles', icon: <FaCar />, roles: ['admin', 'agent'] },
  { to: '/drivers', label: 'Drivers', icon: <FaUserCog />, roles: ['admin', 'agent'] },
  { to: '/drivers/dashboard', label: 'Driver Dashboard', icon: <FaUserTie />, roles: ['admin', 'agent'] },
  { to: '/tracking', label: 'Live Tracking', icon: <FaMapMarkedAlt />, roles: ['admin', 'agent', 'driver'] },
  { to: '/activity-log', label: 'Activity Log', icon: <FaHistory />, roles: ['admin', 'agent'] },
];

const vehicleMenuLinks = [
  { to: '/vehicles', label: 'Vehicles' },
  { to: '/vehicles/dashboard', label: 'Dashboard' },
  { to: '/vehicles/maintenance', label: 'Maintenance' },
  { to: '/vehicles/fuel', label: 'Fuel' },
  { to: '/vehicles/documents', label: 'Documents' },
  { to: '/vehicles/assignments', label: 'Assignments' },
];

const driverMenuLinks = [
  { to: '/drivers/dashboard', label: 'Dashboard' },
  { to: '/drivers', label: 'Drivers' },
];

function Sidebar({ open, onClose }) {
  const { user, logout, agency } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [vehicleMenuOpen, setVehicleMenuOpen] = useState(false);
  const [driverMenuOpen, setDriverMenuOpen] = useState(false);

  // Open vehicle menu if on a vehicle-related page
  useEffect(() => {
    if (vehicleMenuLinks.some(link => location.pathname.startsWith(link.to))) {
      setVehicleMenuOpen(true);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Sidebar classes for responsiveness
  const sidebarBase = "fixed md:static top-0 left-0 h-full w-64 bg-white/80 backdrop-blur-md border-r border-blue-100 shadow-xl flex flex-col rounded-r-2xl z-50 transition-transform duration-300";
  const sidebarOpen = open ? "translate-x-0" : "-translate-x-full";
  const sidebarClass = `
    ${sidebarBase}
    ${open ? 'block' : 'hidden'}
    md:block md:translate-x-0
    ${!open ? 'md:block' : ''}
    ${open ? 'block' : 'hidden'}
    ${open ? 'md:block' : ''}
    ${open ? sidebarOpen : ''}
  `;

  return (
    <aside className={sidebarClass} style={{ minHeight: '100vh' }}>
      {/* Mobile close button */}
      <div className="flex md:hidden justify-end p-3">
        <button onClick={onClose} className="text-blue-700 p-2 rounded-full hover:bg-blue-100 focus:outline-none focus:ring">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex items-center gap-3 p-6 pt-0 md:pt-6 text-2xl font-extrabold tracking-wide border-b border-blue-100">
        <span className="bg-gradient-to-br from-blue-600 to-blue-400 text-white rounded-full w-10 h-10 flex items-center justify-center font-black text-lg shadow">T</span>
        <span className="bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent">TravelBiz</span>
        {agency && (
          <span className="ml-2 flex items-center gap-2 text-blue-700 text-base font-bold">
            {agency.logo && <img src={agency.logo} alt="Agency Logo" className="h-7 w-7 rounded-full object-cover border" />}
            {agency.name}
          </span>
        )}
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navLinks.filter(link => link.roles.includes(user?.role) && link.label !== 'Vehicles' && link.label !== 'Drivers' && link.label !== 'Driver Dashboard').map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-blue-100/80 focus:bg-blue-100/80 transition font-medium text-base text-blue-900 ${location.pathname === link.to ? 'bg-blue-200/80 font-semibold shadow' : ''}`}
            onClick={onClose}
          >
            <span className="text-lg">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
        {/* Vehicle Management Dropdown */}
        {(user?.role === 'admin' || user?.role === 'agent') && (
          <div className="mt-6">
            <button
              className={`flex items-center w-full px-4 py-2 rounded-xl hover:bg-blue-100/80 transition font-medium text-base text-blue-900 focus:outline-none ${vehicleMenuOpen ? 'bg-blue-50' : ''}`}
              onClick={() => setVehicleMenuOpen(v => !v)}
              type="button"
              style={{ minHeight: '44px' }}
            >
              <FaCar className="text-lg mr-2 shrink-0" />
              <span className="flex-1 text-left whitespace-nowrap truncate">Vehicle Management</span>
              {vehicleMenuOpen ? <FaChevronUp className="ml-2 shrink-0" /> : <FaChevronDown className="ml-2 shrink-0" />}
            </button>
            {vehicleMenuOpen && (
              <div className="ml-7 mt-1 space-y-1">
                {vehicleMenuLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-100/80 transition text-blue-900 text-sm ${location.pathname === link.to ? 'bg-blue-200/80 font-semibold shadow' : ''}`}
                    onClick={onClose}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Driver Management Dropdown */}
        {(user?.role === 'admin' || user?.role === 'agent') && (
          <div className="mt-6">
            <button
              className="flex items-center w-full px-4 py-2 rounded-xl hover:bg-blue-100/80 transition font-medium text-base text-blue-900 focus:outline-none"
              onClick={() => setDriverMenuOpen(v => !v)}
              type="button"
              style={{ minHeight: '44px' }}
            >
              <FaUserTie className="text-lg mr-2 shrink-0" />
              <span className="flex-1 text-left whitespace-nowrap truncate">Driver Management</span>
              {driverMenuOpen ? <FaChevronUp className="ml-2 shrink-0" /> : <FaChevronDown className="ml-2 shrink-0" />}
            </button>
            {driverMenuOpen && (
              <div className="ml-7 mt-1 space-y-1">
                {driverMenuLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-100/80 transition text-blue-900 text-sm ${location.pathname === link.to ? 'bg-blue-200/80 font-semibold shadow' : ''}`}
                    onClick={onClose}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>
      <div className="p-4 border-t border-blue-100">
        <div className="mb-2 text-sm text-blue-900">Logged in as <span className="font-semibold">{user?.name}</span> ({user?.role})</div>
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl font-semibold shadow transition-all">
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar; 