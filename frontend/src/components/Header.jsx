import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaBars } from 'react-icons/fa';

const Header = ({ toggleSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md p-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-4"
        >
          <FaBars className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
      </div>

      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <FaUserCircle className="h-8 w-8" />
          <span className="font-medium hidden md:block">{user ? user.name : 'Guest'}</span>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
            <div className="px-4 py-2 text-sm text-gray-700 border-b">
              <p className="font-semibold">{user ? user.name : 'Guest'}</p>
              <p className="text-gray-500">{user ? user.role : ''}</p>
            </div>
            <Link
              to="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setDropdownOpen(false)}
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 