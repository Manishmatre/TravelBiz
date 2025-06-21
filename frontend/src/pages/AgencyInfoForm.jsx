import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAgency } from '../services/agencyService';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Notification from '../components/common/Notification';
import { 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaGlobe, 
  FaEnvelope, 
  FaArrowRight,
  FaShieldAlt,
  FaCheckCircle
} from 'react-icons/fa';

export default function AgencyInfoForm() {
  const [form, setForm] = useState({ 
    name: '', 
    address: '', 
    phone: '', 
    website: '',
    email: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const { token, reloadUser } = useAuth();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await createAgency(form, token);
      await reloadUser();
      setNotification({ 
        message: 'Agency created successfully! Setting up your dashboard...', 
        type: 'success' 
      });
      
      setTimeout(() => {
      navigate('/dashboard');
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create agency. Please try again.';
      setError(errorMessage);
      setNotification({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

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
      <div className="w-full max-w-lg my-2">
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
          <h2 className="text-lg font-bold text-gray-900 mb-1">Welcome to TravelBiz!</h2>
          <p className="text-xs text-gray-600">Let's set up your travel agency profile to get started</p>
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
              <span className="text-xs font-medium text-gray-900">Agency Information</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 rounded-full">
              <div className="h-1 bg-blue-600 rounded-full w-full"></div>
            </div>
            <FaCheckCircle className="text-green-500 text-xs" />
          </div>
        </div>

        {/* Agency Form */}
        <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-lg shadow-md p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-blue-100 rounded-full">
              <FaBuilding className="text-blue-600 text-sm" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Agency Information</h3>
              <p className="text-xs text-gray-600">Tell us about your travel agency</p>
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

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Agency Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Agency Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <FaBuilding className="h-3 w-3 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="block w-full pl-7 pr-2 py-2 border border-gray-300 rounded-md bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  placeholder="Enter your agency name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Business Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <FaEnvelope className="h-3 w-3 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="block w-full pl-7 pr-2 py-2 border border-gray-300 rounded-md bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  placeholder="Enter business email"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <FaPhone className="h-3 w-3 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="block w-full pl-7 pr-2 py-2 border border-gray-300 rounded-md bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="h-3 w-3 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="block w-full pl-7 pr-2 py-2 border border-gray-300 rounded-md bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  placeholder="Enter agency address"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Website
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <FaGlobe className="h-3 w-3 text-gray-400" />
                </div>
                <input
                  type="url"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  className="block w-full pl-7 pr-2 py-2 border border-gray-300 rounded-md bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  placeholder="https://your-website.com"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Agency Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={2}
                className="block w-full px-2 py-2 border border-gray-300 rounded-md bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-sm"
                placeholder="Tell us about your agency and services..."
              />
            </div>

            {/* Action Button */}
            <Button
              type="submit"
              color="primary"
              loading={loading}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium mt-4"
            >
              <FaArrowRight className="text-xs" /> {loading ? 'Setting Up...' : 'Complete Setup'}
            </Button>
          </form>

          {/* Help Text */}
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <FaShieldAlt className="text-blue-500 mt-0.5 flex-shrink-0 text-xs" />
              <div>
                <h4 className="text-xs font-medium text-blue-900 mb-1">Why do we need this information?</h4>
                <p className="text-xs text-blue-700 leading-tight">
                  This information helps us personalize your TravelBiz experience and set up your agency profile. 
                  You can always update these details later in your agency settings.
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
