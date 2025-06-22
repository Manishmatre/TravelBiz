import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaUserCog, 
  FaFileAlt, 
  FaCar, 
  FaMapMarkedAlt, 
  FaHistory, 
  FaSignOutAlt, 
  FaChevronDown, 
  FaChevronUp, 
  FaUserTie, 
  FaCalendarAlt, 
  FaRoute,
  FaUserPlus,
  FaChartBar,
  FaCog,
  FaBuilding,
  FaSearch,
  FaPlus,
  FaDownload,
  FaUpload,
  FaBell,
  FaEnvelope,
  FaShieldAlt,
  FaTools,
  FaGasPump,
  FaFileContract,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaCalendar,
  FaChartLine,
  FaChartPie,
  FaChartArea,
  FaList,
  FaStar,
  FaArchive
} from 'react-icons/fa';

const navLinks = [
  { to: '/', label: 'Dashboard', icon: <FaTachometerAlt />, roles: ['admin', 'agent', 'driver'] },
  { to: '/clients', label: 'Clients', icon: <FaUsers />, roles: ['admin', 'agent'] },
  { to: '/bookings', label: 'Bookings', icon: <FaCalendarAlt />, roles: ['admin', 'agent'] },
  { to: '/users', label: 'Users', icon: <FaUserCog />, roles: ['admin'] },
  { to: '/files', label: 'Files', icon: <FaFileAlt />, roles: ['admin', 'agent'] },
  { to: '/vehicles', label: 'Vehicles', icon: <FaCar />, roles: ['admin', 'agent'] },
  { to: '/drivers', label: 'Drivers', icon: <FaUserCog />, roles: ['admin', 'agent'] },
  { to: '/drivers/dashboard', label: 'Driver Dashboard', icon: <FaUserTie />, roles: ['admin', 'agent'] },
  { to: '/tracking', label: 'Live Tracking', icon: <FaMapMarkedAlt />, roles: ['admin', 'agent', 'driver'] },
  { to: '/activity-log', label: 'Activity Log', icon: <FaHistory />, roles: ['admin', 'agent'] },
  { to: '/bookings/add', label: 'New Booking' },
];

// Client Management Links
const clientMenuLinks = [
  { to: '/clients', label: 'All Clients', icon: <FaUsers />, description: 'View and manage all clients' },
  { to: '/clients/add', label: 'Add New Client', icon: <FaUserPlus />, description: 'Create a new client profile' },
  { to: '/clients/vip', label: 'VIP Clients', icon: <FaStar />, description: 'Manage VIP client accounts' },
  { to: '/clients/analytics', label: 'Client Analytics', icon: <FaChartBar />, description: 'Client statistics and insights' },
  { to: '/clients/import', label: 'Import Clients', icon: <FaUpload />, description: 'Bulk import client data' },
  { to: '/clients/export', label: 'Export Clients', icon: <FaDownload />, description: 'Export client data' },
  { to: '/clients/communications', label: 'Communications', icon: <FaEnvelope />, description: 'Client communication history' },
  { to: '/clients/documents', label: 'Documents', icon: <FaFileContract />, description: 'Client documents and files' },
];

// Vehicle Management Links
const vehicleMenuLinks = [
  { to: '/vehicles', label: 'All Vehicles', icon: <FaCar />, description: 'View and manage all vehicles' },
  { to: '/vehicles/add', label: 'Add Vehicle', icon: <FaPlus />, description: 'Add a new vehicle' },
  { to: '/vehicles/dashboard', label: 'Dashboard', icon: <FaTachometerAlt />, description: 'Vehicle overview and stats' },
  { to: '/vehicles/maintenance', label: 'Maintenance', icon: <FaTools />, description: 'Vehicle maintenance records' },
  { to: '/vehicles/fuel', label: 'Fuel Management', icon: <FaGasPump />, description: 'Fuel consumption tracking' },
  { to: '/vehicles/documents', label: 'Documents', icon: <FaFileContract />, description: 'Vehicle documents' },
  { to: '/vehicles/assignments', label: 'Assignments', icon: <FaRoute />, description: 'Vehicle-driver assignments' },
  { to: '/vehicles/analytics', label: 'Analytics', icon: <FaChartBar />, description: 'Vehicle performance analytics' },
];

// Booking Management Links
const bookingMenuLinks = [
  { to: '/bookings', label: 'All Bookings', icon: <FaList />, description: 'View all bookings with analytics' },
  { to: '/bookings/add', label: 'New Booking', icon: <FaPlus />, description: 'Create a new booking' },
  { to: '/booking-flow', label: 'Booking Flow', icon: <FaRoute />, description: 'Step-by-step booking wizard' },
  { to: '/bookings/pending', label: 'Pending', icon: <FaClock />, description: 'Pending bookings with analytics' },
  { to: '/bookings/confirmed', label: 'Confirmed', icon: <FaCheckCircle />, description: 'Confirmed bookings' },
  { to: '/bookings/completed', label: 'Completed', icon: <FaCheckCircle />, description: 'Completed bookings' },
  { to: '/bookings/cancelled', label: 'Cancelled', icon: <FaTimesCircle />, description: 'Cancelled bookings' },
  { to: '/bookings/today', label: 'Today\'s Bookings', icon: <FaCalendar />, description: 'Today\'s bookings' },
  { to: '/bookings/upcoming', label: 'Upcoming', icon: <FaCalendar />, description: 'Upcoming bookings' },
  { to: '/bookings/overdue', label: 'Overdue', icon: <FaExclamationTriangle />, description: 'Overdue bookings' },
  { to: '/bookings/calendar', label: 'Calendar View', icon: <FaCalendarAlt />, description: 'Calendar view of bookings' },
  { to: '/bookings/reports', label: 'Reports', icon: <FaChartLine />, description: 'Booking reports and analytics' },
];

// Driver Management Links
const driverMenuLinks = [
  { to: '/drivers', label: 'All Drivers', icon: <FaUsers />, description: 'View and manage all drivers' },
  { to: '/drivers/add', label: 'Add Driver', icon: <FaUserPlus />, description: 'Add a new driver' },
  { to: '/drivers/dashboard', label: 'Dashboard', icon: <FaTachometerAlt />, description: 'Driver overview and stats' },
  { to: '/drivers/assignments', label: 'Assignments', icon: <FaRoute />, description: 'Driver-vehicle assignments' },
  { to: '/drivers/schedule', label: 'Schedule', icon: <FaCalendarAlt />, description: 'Driver schedules' },
  { to: '/drivers/performance', label: 'Performance', icon: <FaChartBar />, description: 'Driver performance analytics' },
];

// Analytics & Reports Links
const analyticsMenuLinks = [
  { to: '/analytics/dashboard', label: 'Analytics Dashboard', icon: <FaChartBar />, description: 'Comprehensive analytics' },
  { to: '/analytics/revenue', label: 'Revenue Analytics', icon: <FaChartLine />, description: 'Revenue tracking and analysis' },
  { to: '/analytics/bookings', label: 'Booking Analytics', icon: <FaChartPie />, description: 'Booking trends and patterns' },
  { to: '/analytics/clients', label: 'Client Analytics', icon: <FaChartArea />, description: 'Client behavior analysis' },
  { to: '/analytics/vehicles', label: 'Vehicle Analytics', icon: <FaChartBar />, description: 'Vehicle performance metrics' },
  { to: '/analytics/drivers', label: 'Driver Analytics', icon: <FaChartLine />, description: 'Driver performance metrics' },
  { to: '/reports', label: 'Reports', icon: <FaFileAlt />, description: 'Generate and view reports' },
];

// Settings & Configuration Links
const settingsMenuLinks = [
  { to: '/settings/profile', label: 'Profile Settings', icon: <FaUserCog />, description: 'User profile settings' },
  { to: '/settings/agency', label: 'Agency Settings', icon: <FaBuilding />, description: 'Agency configuration' },
  { to: '/settings/system', label: 'System Settings', icon: <FaCog />, description: 'System configuration' },
  { to: '/settings/notifications', label: 'Notifications', icon: <FaBell />, description: 'Notification preferences' },
  { to: '/settings/security', label: 'Security', icon: <FaShieldAlt />, description: 'Security settings' },
  { to: '/settings/backup', label: 'Backup & Restore', icon: <FaArchive />, description: 'Data backup and restore' },
];

function Sidebar({ open, onClose }) {
  const { user, logout, agency } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState({});

  useEffect(() => {
    const currentOpenMenus = {};
    if (clientMenuLinks.some(link => location.pathname.startsWith(link.to))) currentOpenMenus.clients = true;
    if (vehicleMenuLinks.some(link => location.pathname.startsWith(link.to))) currentOpenMenus.vehicles = true;
    if (bookingMenuLinks.some(link => location.pathname.startsWith(link.to))) currentOpenMenus.bookings = true;
    if (driverMenuLinks.some(link => location.pathname.startsWith(link.to))) currentOpenMenus.drivers = true;
    if (analyticsMenuLinks.some(link => location.pathname.startsWith(link.to))) currentOpenMenus.analytics = true;
    if (settingsMenuLinks.some(link => location.pathname.startsWith(link.to))) currentOpenMenus.settings = true;
    setOpenMenus(currentOpenMenus);
  }, [location.pathname]);

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderMenuItem = (link, isSubmenu = false) => (
    <Link
      key={link.to}
      to={link.to}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-100/80 transition text-blue-900 text-sm group ${
        location.pathname === link.to ? 'bg-blue-200/80 font-semibold shadow' : ''
      } ${isSubmenu ? 'ml-7' : ''}`}
      onClick={onClose}
      title={link.description}
    >
      <span className="text-lg text-blue-600 group-hover:text-blue-700 transition-colors">{link.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{link.label}</div>
        {link.description && (
          <div className="text-xs text-gray-500 truncate opacity-0 group-hover:opacity-100 transition-opacity">
            {link.description}
          </div>
        )}
      </div>
    </Link>
  );

  const renderMenuSection = (title, menuKey, icon, links, roles = ['admin', 'agent']) => {
    if (!roles.includes(user?.role)) return null;
    const isOpen = openMenus[menuKey];
    
    return (
      <div className="mt-4">
        <button
          className={`flex items-center w-full px-4 py-2 rounded-xl hover:bg-blue-100/80 transition font-medium text-base text-blue-900 focus:outline-none ${isOpen ? 'bg-blue-50' : ''}`}
          onClick={() => toggleMenu(menuKey)}
          type="button"
          style={{ minHeight: '44px' }}
        >
          <span className="text-lg mr-3 text-blue-600">{icon}</span>
          <span className="flex-1 text-left whitespace-nowrap truncate">{title}</span>
          {isOpen ? <FaChevronUp className="ml-2 shrink-0" /> : <FaChevronDown className="ml-2 shrink-0" />}
        </button>
        {isOpen && (
          <div className="mt-2 space-y-1">
            {links.map(link => renderMenuItem(link, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={`fixed inset-y-0 left-0 bg-white/80 backdrop-blur-md border-r border-blue-100 shadow-xl w-64 z-40 transform transition-transform duration-300 md:relative md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col h-full">
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-6 pt-4 border-b border-blue-100">
          <button onClick={onClose} className="absolute top-2 right-2 md:hidden text-blue-700 p-2 rounded-full hover:bg-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-br from-blue-600 to-blue-400 text-white rounded-full w-10 h-10 flex items-center justify-center font-black text-lg shadow">T</span>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent">TravelBiz</span>
            </div>
            {agency && (
              <div className="mt-2 flex flex-col items-center text-blue-700 font-bold text-sm leading-tight">
                {agency.logo && <img src={agency.logo} alt="Agency Logo" className="h-7 w-7 rounded-full object-cover border mb-1" />}
                <span>{agency.name}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin">
          <nav className="p-4 space-y-1">
            {user?.role === 'driver' ? (
              <>
                {/* Driver-specific links */}
              </>
            ) : (
              <>
                {/* Admin/Agent links */}
                <div className="mb-4 space-y-2">
                  <Link to="/bookings/add" className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105" onClick={onClose}>
                    <FaCalendarAlt className="text-lg" />
                    <span>New Booking</span>
                  </Link>
                  <Link to="/clients/add" className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105" onClick={onClose}>
                    <FaUserPlus className="text-lg" />
                    <span>Add Client</span>
                  </Link>
                </div>
                <Link to="/" className={`flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-blue-100/80 transition font-medium text-base text-blue-900 ${location.pathname === '/' ? 'bg-blue-200/80 font-semibold shadow' : ''}`} onClick={onClose}>
                  <FaTachometerAlt className="text-lg" />
                  <span>Dashboard</span>
                </Link>
                {renderMenuSection('Client Management', 'clients', <FaUsers />, clientMenuLinks, ['admin', 'agent'])}
                {renderMenuSection('Booking Management', 'bookings', <FaCalendarAlt />, bookingMenuLinks, ['admin', 'agent'])}
                {renderMenuSection('Vehicle Management', 'vehicles', <FaCar />, vehicleMenuLinks, ['admin', 'agent'])}
                {renderMenuSection('Driver Management', 'drivers', <FaUserTie />, driverMenuLinks, ['admin', 'agent'])}
                {renderMenuSection('Analytics & Reports', 'analytics', <FaChartBar />, analyticsMenuLinks, ['admin', 'agent'])}
                <Link to="/tracking" className={`flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-blue-100/80 transition font-medium text-base text-blue-900 ${location.pathname === '/tracking' ? 'bg-blue-200/80 font-semibold shadow' : ''}`} onClick={onClose}>
                  <FaMapMarkedAlt className="text-lg" />
                  <span>Live Tracking</span>
                </Link>
                {(user?.role === 'admin' || user?.role === 'agent') && (
                  <Link to="/files" className={`flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-blue-100/80 transition font-medium text-base text-blue-900 ${location.pathname === '/files' ? 'bg-blue-200/80 font-semibold shadow' : ''}`} onClick={onClose}>
                    <FaFileAlt className="text-lg" />
                    <span>Files</span>
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <Link to="/users" className={`flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-blue-100/80 transition font-medium text-base text-blue-900 ${location.pathname === '/users' ? 'bg-blue-200/80 font-semibold shadow' : ''}`} onClick={onClose}>
                    <FaUserCog className="text-lg" />
                    <span>User Management</span>
                  </Link>
                )}
                {(user?.role === 'admin' || user?.role === 'agent') && (
                  <Link to="/activity-log" className={`flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-blue-100/80 transition font-medium text-base text-blue-900 ${location.pathname === '/activity-log' ? 'bg-blue-200/80 font-semibold shadow' : ''}`} onClick={onClose}>
                    <FaHistory className="text-lg" />
                    <span>Activity Log</span>
                  </Link>
                )}
                {renderMenuSection('Settings', 'settings', <FaCog />, settingsMenuLinks, ['admin', 'agent'])}
              </>
            )}
          </nav>
        </div>
          
        {/* Fixed Footer */}
        <div className="flex-shrink-0 p-4 border-t border-blue-100">
          <div className="mb-2 text-sm text-blue-900">
            Logged in as <span className="font-semibold">{user?.name}</span>
            <div className="text-xs text-blue-700 capitalize">({user?.role})</div>
          </div>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl font-semibold shadow transition-all"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar; 