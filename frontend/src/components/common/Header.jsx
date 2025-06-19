import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaUserCircle } from 'react-icons/fa';

const LOGO = (
  <span className="font-bold text-xl text-blue-700 tracking-wide">TravelBiz</span>
);

function Header({ onLogout }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
  };

  return (
    <header className="w-full bg-white shadow flex items-center justify-between px-6 py-3 sticky top-0 z-40">
      <div className="flex items-center gap-2">
        {LOGO}
      </div>
      <div className="relative" ref={dropdownRef}>
        <button
          className="flex items-center gap-2 focus:outline-none"
          onClick={() => setDropdownOpen(v => !v)}
        >
          <FaUserCircle className="text-2xl text-blue-600" />
          <span className="font-medium text-gray-700 hidden sm:inline">{user?.name || 'User'}</span>
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg py-2 z-50">
            <div className="px-4 py-2 border-b">
              <div className="font-semibold">{user?.name}</div>
              <div className="text-xs text-gray-500">{user?.email}</div>
              <div className="text-xs text-blue-600 font-bold mt-1">{user?.role?.toUpperCase()}</div>
            </div>
            <a href="/profile" className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => setDropdownOpen(false)}>Profile</a>
            {user?.role === 'admin' && (
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => setDropdownOpen(false)}>Admin Panel</button>
            )}
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header; 