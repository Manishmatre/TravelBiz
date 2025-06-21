import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Notification from '../components/common/Notification';
import { 
  FaBuilding, 
  FaSearch, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaGlobe, 
  FaArrowRight,
  FaShieldAlt,
  FaCheckCircle,
  FaUsers
} from 'react-icons/fa';
import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export default function AgencySelection() {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgency, setSelectedAgency] = useState(null);
  const navigate = useNavigate();
  const { user, token, reloadUser, loading: authLoading } = useAuth();

  // Debug logging
  useEffect(() => {
    console.log('AgencySelection - Auth loading:', authLoading);
    console.log('AgencySelection - Token:', token);
    console.log('AgencySelection - User data:', user);
    console.log('AgencySelection - User agencyId:', user?.agencyId);
    console.log('AgencySelection - User role:', user?.role);
    console.log('AgencySelection - User _id:', user?._id);
    
    // If user already has an agency, redirect to dashboard
    if (user && user.agencyId) {
      console.log('User already has agency, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [user, navigate, authLoading, token]);

  useEffect(() => {
    fetchAgencies();
  }, []);

  const fetchAgencies = async () => {
    try {
      const response = await axios.get(`${API_URL}/agencies/list`);
      setAgencies(response.data);
    } catch (err) {
      console.error('Error fetching agencies:', err);
      setError('Failed to load agencies. Please try again.');
      setNotification({ message: 'Failed to load agencies. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinAgency = async () => {
    console.log('handleJoinAgency called');
    console.log('Selected agency:', selectedAgency);
    console.log('User object:', user);
    console.log('Token:', token);

    if (!selectedAgency) {
      setError('Please select an agency to join.');
      setNotification({ message: 'Please select an agency to join.', type: 'error' });
      return;
    }

    if (!user || !user._id) {
      console.error('User or user._id is missing:', { user, userId: user?._id });
      setError('User information not loaded. Please refresh the page.');
      setNotification({ message: 'User information not loaded. Please refresh the page.', type: 'error' });
      return;
    }

    if (!token) {
      console.error('Token is missing');
      setError('Authentication token missing. Please login again.');
      setNotification({ message: 'Authentication token missing. Please login again.', type: 'error' });
      return;
    }

    setJoining(true);
    setError('');
    
    try {
      console.log('Making API call to join agency:', {
        url: `${API_URL}/users/${user._id}/agency`,
        agencyId: selectedAgency._id,
        token: token ? 'present' : 'missing'
      });

      await axios.put(`${API_URL}/users/${user._id}/agency`, {
        agencyId: selectedAgency._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await reloadUser();
      setNotification({ 
        message: `Successfully joined ${selectedAgency.name}! Redirecting to dashboard...`, 
        type: 'success' 
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Error joining agency:', err);
      const errorMessage = err.response?.data?.message || 'Failed to join agency. Please try again.';
      setError(errorMessage);
      setNotification({ message: errorMessage, type: 'error' });
    } finally {
      setJoining(false);
    }
  };

  const filteredAgencies = agencies.filter(agency =>
    agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agency.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agency.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || authLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not loaded or doesn't exist, show error
  if (!user) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Authentication Error</p>
            <p>User information not loaded. Please login again.</p>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-2 overflow-y-auto">
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Main Container */}
      <div className="w-full max-w-2xl my-2">
        {/* Header */}
        <div className="text-center mb-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="bg-gradient-to-br from-blue-600 to-blue-400 text-white rounded-full w-8 h-8 flex items-center justify-center font-black text-sm shadow-lg">
              T
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent">
              TravelBiz
            </h1>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Join an Agency</h2>
          <p className="text-xs text-gray-600">Select an existing travel agency to join</p>
        </div>

        {/* Setup Progress */}
        <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-lg shadow-md p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900">Setup Progress</h3>
            <span className="text-xs text-blue-600 font-medium">Step 1 of 1</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </div>
              <span className="text-xs font-medium text-gray-900">Select Agency</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 rounded-full">
              <div className="h-1 bg-blue-600 rounded-full w-full"></div>
            </div>
            <FaCheckCircle className="text-green-500 text-xs" />
          </div>
        </div>

        {/* Agency Selection */}
        <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-lg shadow-md p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-blue-100 rounded-full">
              <FaBuilding className="text-blue-600 text-sm" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Available Agencies</h3>
              <p className="text-xs text-gray-600">Choose an agency to join</p>
            </div>
          </div>

          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-red-500 text-xs" />
                <p className="text-red-600 font-medium text-xs">{error}</p>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="mb-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <FaSearch className="h-3 w-3 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-7 pr-2 py-2 border border-gray-300 rounded-md bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                placeholder="Search agencies by name, address, or email..."
              />
            </div>
          </div>

          {/* Agency List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredAgencies.length === 0 ? (
              <div className="text-center py-8">
                <FaBuilding className="text-gray-400 text-2xl mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {searchTerm ? 'No agencies found matching your search.' : 'No agencies available.'}
                </p>
              </div>
            ) : (
              filteredAgencies.map((agency) => (
                <div
                  key={agency._id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedAgency?._id === agency._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedAgency(agency)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm text-gray-900">{agency.name}</h4>
                        {selectedAgency?._id === agency._id && (
                          <FaCheckCircle className="text-blue-500 text-xs" />
                        )}
                      </div>
                      
                      {agency.email && (
                        <div className="flex items-center gap-1 mb-1">
                          <FaGlobe className="text-gray-400 text-xs" />
                          <p className="text-xs text-gray-600">{agency.email}</p>
                        </div>
                      )}
                      
                      {agency.phone && (
                        <div className="flex items-center gap-1 mb-1">
                          <FaPhone className="text-gray-400 text-xs" />
                          <p className="text-xs text-gray-600">{agency.phone}</p>
                        </div>
                      )}
                      
                      {agency.address && (
                        <div className="flex items-center gap-1">
                          <FaMapMarkerAlt className="text-gray-400 text-xs" />
                          <p className="text-xs text-gray-600">{agency.address}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <FaUsers className="text-xs" />
                      <span>{agency.userCount || 0} members</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Action Button */}
          <Button
            onClick={handleJoinAgency}
            color="primary"
            loading={joining}
            disabled={!selectedAgency}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium mt-4"
          >
            <FaArrowRight className="text-xs" /> 
            {joining ? 'Joining...' : selectedAgency ? `Join ${selectedAgency.name}` : 'Select an Agency'}
          </Button>

          {/* Help Text */}
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <FaShieldAlt className="text-blue-500 mt-0.5 flex-shrink-0 text-xs" />
              <div>
                <h4 className="text-xs font-medium text-blue-900 mb-1">How does this work?</h4>
                <p className="text-xs text-blue-700 leading-tight">
                  Select an existing travel agency to join their team. You'll be able to access their bookings, 
                  clients, and vehicles once your request is approved by the agency admin.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 text-center text-xs text-gray-500">
          <p>&copy; 2024 TravelBiz. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
} 