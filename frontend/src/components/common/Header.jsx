import React, { useState, useRef, useEffect, useContext } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaUserCircle, 
  FaBell, 
  FaSearch, 
  FaCalendarAlt, 
  FaUsers, 
  FaCar, 
  FaMapMarkedAlt,
  FaSun,
  FaCloud,
  FaCloudRain,
  FaSnowflake,
  FaBolt,
  FaCheckCircle,
  FaClock,
  FaCalendar,
  FaTachometerAlt,
  FaSignOutAlt,
  FaUserCog,
  FaBuilding,
  FaShieldAlt,
  FaCog,
  FaQuestionCircle,
  FaUserPlus,
  FaTimesCircle,
  FaInfoCircle
} from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { NotificationContext } from '../../contexts/NotificationContext';

// Modernized logo is now directly in the header for gradient effect

function Header({ onLogout, onMenuClick }) {
  const { user, logout, agency } = useAuth();
  const location = useLocation();
  const { notificationLog } = useContext(NotificationContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);

  // Use real notifications
  const notifications = notificationLog.slice().reverse().slice(0, 10); // show latest 10
  const [read, setRead] = useState([]);
  const unreadNotifications = notifications.filter((_, i) => !read.includes(i)).length;
  const handleMarkAllRead = () => setRead(notifications.map((_, i) => i));

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Mock weather data
  useEffect(() => {
    // In a real app, you'd fetch weather data from an API
    setWeather({
      temperature: 24,
      condition: 'sunny',
      location: 'New York',
      humidity: 65,
      windSpeed: 12
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
  };

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'sunny': return <FaSun className="text-yellow-500" />;
      case 'cloudy': return <FaCloud className="text-gray-500" />;
      case 'rainy': return <FaCloudRain className="text-blue-500" />;
      case 'snowy': return <FaSnowflake className="text-blue-300" />;
      case 'stormy': return <FaBolt className="text-yellow-600" />;
      default: return <FaSun className="text-yellow-500" />;
    }
  };

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    return pathSegments.map((segment, index) => ({
      name: segment.charAt(0).toUpperCase() + segment.slice(1),
      path: '/' + pathSegments.slice(0, index + 1).join('/'),
      isLast: index === pathSegments.length - 1
    }));
  };

  const quickActions = [
    { label: 'New Booking', icon: <FaCalendarAlt />, link: '/bookings/add', color: 'blue' },
    { label: 'Add Client', icon: <FaUserPlus />, link: '/clients/add', color: 'green' },
    { label: 'Add Vehicle', icon: <FaCar />, link: '/vehicles/add', color: 'purple' },
    { label: 'Live Tracking', icon: <FaMapMarkedAlt />, link: '/tracking', color: 'red' },
  ];

  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-blue-100 shadow-lg sticky top-0 z-40">
      {/* Top Bar - Weather, Time, Quick Actions */}
      <div className="px-2 md:px-8 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <div className="flex items-center justify-between text-sm">
          {/* Left Side - Weather and Time */}
          <div className="flex items-center gap-4">
            {weather && (
              <div className="flex items-center gap-2 text-gray-600">
                {getWeatherIcon(weather.condition)}
                <span className="font-medium">{weather.temperature}°C</span>
                <span className="text-gray-500">|</span>
                <span>{weather.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-600">
              <FaClock className="text-blue-500" />
              <span className="font-medium">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-gray-500">|</span>
              <FaCalendar className="text-blue-500" />
              <span>{currentTime.toLocaleDateString()}</span>
            </div>
          </div>

          {/* Right Side - Quick Actions */}
          <div className="flex items-center gap-2">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all hover:scale-105 ${
                  action.color === 'blue' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                  action.color === 'green' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                  action.color === 'purple' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' :
                  'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {action.icon}
                <span className="hidden sm:inline">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="flex items-center justify-between px-2 md:px-8 py-3 min-h-[60px]">
        {/* Left Side - Menu and Breadcrumbs */}
        <div className="flex items-center gap-4 flex-1">
          {/* Hamburger menu for mobile */}
          {onMenuClick && (
            <button
              className="md:hidden flex items-center justify-center p-2 rounded-full hover:bg-blue-50 focus:outline-none focus:ring"
              onClick={onMenuClick}
              aria-label="Open sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          {/* Logo on small screens */}
          <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent font-extrabold text-2xl tracking-wide drop-shadow md:hidden">
            TravelBiz
          </span>

          {/* Breadcrumbs */}
          <div className="hidden md:flex items-center gap-2 text-sm">
            <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
              Home
            </Link>
            {getBreadcrumbs().map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-gray-400">/</span>
                {crumb.isLast ? (
                  <span className="text-gray-700 font-medium">{crumb.name}</span>
                ) : (
                  <Link to={crumb.path} className="text-blue-600 hover:text-blue-800">
                    {crumb.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Center - Search Bar */}
        <div className="flex-1 max-w-md mx-4" ref={searchRef}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search bookings, clients, vehicles..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl leading-5 bg-white/70 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
            />
            {searchOpen && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2">Quick Search Results</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded-lg cursor-pointer">
                      <FaCalendarAlt className="text-blue-500" />
                      <span>Booking #12345</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded-lg cursor-pointer">
                      <FaUsers className="text-green-500" />
                      <span>John Doe (Client)</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded-lg cursor-pointer">
                      <FaCar className="text-purple-500" />
                      <span>Vehicle ABC-123</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Notifications and User Menu */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              className="relative flex items-center justify-center p-2 rounded-full hover:bg-blue-50 focus:outline-none focus:ring transition-all"
              onClick={() => setNotificationDropdownOpen(v => !v)}
            >
              <FaBell className="text-xl text-gray-600" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>
            {notificationDropdownOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-white/95 backdrop-blur-md border border-blue-100 rounded-2xl shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-blue-50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <button className="text-xs text-blue-600 hover:text-blue-800" onClick={handleMarkAllRead}>Mark all read</button>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-gray-400">No notifications</div>
                  ) : notifications.map((notification, i) => (
                    <div
                      key={i}
                      className={`px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors ${!read.includes(i) ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {notification.type === 'success' ? <FaCheckCircle className="text-green-500" /> :
                           notification.type === 'error' ? <FaTimesCircle className="text-red-500" /> :
                           <FaInfoCircle className="text-blue-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {notification.message}
                            </h4>
                            <span className="text-xs text-gray-500">{notification.timestamp ? new Date(notification.timestamp).toLocaleTimeString() : ''}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-blue-50">
                  <Link to="/notifications" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Agency Info (Admin Only) */}
          {user?.role === 'admin' && agency && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg">
              {agency.logo && (
                <img src={agency.logo} alt="Agency" className="w-6 h-6 rounded-full object-cover" />
              )}
              <span className="text-sm font-medium text-blue-700">{agency.name}</span>
            </div>
          )}

          {/* User Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-2 focus:outline-none rounded-full bg-white/70 shadow px-3 py-2 hover:bg-blue-50 transition-all"
              onClick={() => setDropdownOpen(v => !v)}
            >
              <div className="relative">
                <FaUserCircle className="text-2xl text-blue-600" />
                {user?.role === 'admin' && (
                  <FaShieldAlt className="absolute -bottom-1 -right-1 text-xs text-green-600 bg-white rounded-full" />
                )}
              </div>
              <div className="hidden sm:block text-left">
                <div className="font-medium text-gray-700 truncate max-w-[120px]">
                  {user?.name || 'User'}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {user?.role}
                </div>
              </div>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-md border border-blue-100 rounded-2xl shadow-xl py-2 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-blue-50">
                  <div className="flex items-center gap-3">
                    <FaUserCircle className="text-3xl text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{user?.name}</div>
                      <div className="text-sm text-gray-500 truncate">{user?.email}</div>
                      <div className="text-xs text-blue-600 font-bold mt-1 capitalize">
                        {user?.role} {user?.role === 'admin' && <FaShieldAlt className="inline ml-1" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="px-2 py-1">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors text-gray-700"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FaUserCog className="text-blue-500" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors text-gray-700"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FaTachometerAlt className="text-green-500" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors text-gray-700"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FaCog className="text-purple-500" />
                    <span>Settings</span>
                  </Link>
                </div>

                {/* Admin Section */}
                {user?.role === 'admin' && (
                  <div className="px-2 py-1 border-t border-blue-50">
                    <Link
                      to="/agency-profile"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors text-gray-700"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FaBuilding className="text-indigo-500" />
                      <span>Agency Profile</span>
                    </Link>
                    <Link
                      to="/admin-panel"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors text-gray-700"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FaShieldAlt className="text-red-500" />
                      <span>Admin Panel</span>
                    </Link>
                  </div>
                )}

                {/* Help & Support */}
                <div className="px-2 py-1 border-t border-blue-50">
                  <Link
                    to="/help"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors text-gray-700"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FaQuestionCircle className="text-orange-500" />
                    <span>Help & Support</span>
                  </Link>
                </div>

                {/* Logout */}
                <div className="px-2 py-1 border-t border-blue-50">
                  <button
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-red-600 w-full text-left"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header; 