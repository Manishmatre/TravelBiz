import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaUserCircle } from 'react-icons/fa';

// Modernized logo is now directly in the header for gradient effect

function Header({ onLogout, onMenuClick }) {
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
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-blue-100 shadow-lg flex items-center justify-between px-2 md:px-8 py-3 min-h-[60px] sticky top-0 z-40 rounded-b-2xl">
      {/* Hamburger menu for mobile */}
      {onMenuClick && (
        <button
          className="md:hidden flex items-center justify-center p-2 rounded-full hover:bg-blue-50 focus:outline-none focus:ring mr-2"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 text-blue-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
      {/* Only show logo in header on small screens */}
      <div className="flex items-center gap-3 flex-1">
        <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent font-extrabold text-2xl tracking-wide drop-shadow md:hidden">TravelBiz</span>
      </div>
      <div className="relative" ref={dropdownRef}>
        <button
          className="flex items-center gap-2 focus:outline-none rounded-full bg-white/70 shadow px-2 py-1 hover:bg-blue-50 transition-all"
          onClick={() => setDropdownOpen(v => !v)}
        >
          <FaUserCircle className="text-2xl text-blue-600" />
          <span className="font-medium text-gray-700 hidden sm:inline truncate max-w-[120px]">{user?.name || 'User'}</span>
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-52 bg-white/90 border border-blue-100 rounded-2xl shadow-xl py-2 z-50 backdrop-blur-md animate-fade-in">
            <div className="px-4 py-2 border-b border-blue-50">
              <div className="font-semibold truncate">{user?.name}</div>
              <div className="text-xs text-gray-500 truncate">{user?.email}</div>
              <div className="text-xs text-blue-600 font-bold mt-1">{user?.role?.toUpperCase()}</div>
            </div>
            <a href="/profile" className="block w-full text-left px-4 py-2 hover:bg-blue-50 rounded-xl transition" onClick={() => setDropdownOpen(false)}>Profile</a>
            {user?.role === 'admin' && (
              <button className="w-full text-left px-4 py-2 hover:bg-blue-50 rounded-xl transition" onClick={() => setDropdownOpen(false)}>Admin Panel</button>
            )}
            <button className="w-full text-left px-4 py-2 hover:bg-blue-50 rounded-xl transition text-red-600" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header; 