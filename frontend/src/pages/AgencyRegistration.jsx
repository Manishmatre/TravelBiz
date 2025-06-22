import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaBuilding, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserPlus, FaArrowLeft, FaShieldAlt, FaPhone, FaGlobe, FaMapMarkerAlt, FaUpload, FaTimes, FaCheckCircle, FaFileAlt, FaCalendarAlt, FaUsers, FaCar } from 'react-icons/fa';
import Button from '../components/common/Button';
import Notification from '../components/common/Notification';
import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

function AgencyRegistration() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    // User Account
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    // Agency Information
    agencyName: '',
    agencyType: 'travel_agency',
    description: '',
    establishedYear: '',
    agencySize: '',
    gstNumber: '',
    licenseNumber: '',
    
    // Contact Information
    contactPerson: {
      name: '',
      email: '',
      phone: '',
      position: ''
    },
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    
    // Address
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: ''
    },
    
    // Business Details
    website: '',
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    },
    
    // Services
    services: [],
    
    // Documents
    documents: {
      businessLicense: null,
      taxCertificate: null,
      insuranceCertificate: null,
      bankStatement: null
    }
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});

  const agencyTypes = [
    { value: 'travel_agency', label: 'Travel Agency' },
    { value: 'tour_operator', label: 'Tour Operator' },
    { value: 'transport_company', label: 'Transport Company' },
    { value: 'car_rental', label: 'Car Rental Service' },
    { value: 'limousine_service', label: 'Limousine Service' },
    { value: 'chauffeur_service', label: 'Chauffeur Service' }
  ];

  const agencySizes = [
    { value: '1-5', label: '1-5 employees' },
    { value: '6-20', label: '6-20 employees' },
    { value: '21-50', label: '21-50 employees' },
    { value: '51-100', label: '51-100 employees' },
    { value: '100+', label: '100+ employees' }
  ];

  const availableServices = [
    'Airport Transfers',
    'City Tours',
    'Inter-city Travel',
    'Corporate Travel',
    'Wedding Transportation',
    'Event Transportation',
    'Luxury Travel',
    'Group Tours',
    'Custom Itineraries',
    'Hotel Bookings',
    'Flight Bookings',
    'Car Rentals'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleServiceToggle = (service) => {
    setForm(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleFileUpload = (field, file) => {
    setForm(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [field]: file
      }
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!form.name || !form.email || !form.password || !form.confirmPassword || !form.phone) {
          setError('Please fill in all required fields');
          return false;
        }
        if (form.password !== form.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        if (form.password.length < 6) {
          setError('Password must be at least 6 characters long');
          return false;
        }
        break;
      case 2:
        if (!form.agencyName || !form.agencyType || !form.establishedYear || !form.licenseNumber) {
          setError('Please fill in all required agency information');
          return false;
        }
        break;
      case 3:
        if (!form.contactPerson.name || !form.contactPerson.email || !form.contactPerson.phone) {
          setError('Please fill in contact person information');
          return false;
        }
        if (!form.address.street || !form.address.city || !form.address.state) {
          setError('Please fill in address information');
          return false;
        }
        break;
      case 4:
        if (form.services.length === 0) {
          setError('Please select at least one service');
          return false;
        }
        break;
    }
    setError('');
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateStep(currentStep)) {
      return;
    }
    
    setLoading(true);
    try {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // User account data
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('password', form.password);
      formData.append('phone', form.phone);
      formData.append('role', 'admin');
      
      // Agency data
      formData.append('agencyName', form.agencyName);
      formData.append('agencyType', form.agencyType);
      formData.append('description', form.description);
      formData.append('establishedYear', form.establishedYear);
      formData.append('agencySize', form.agencySize);
      formData.append('gstNumber', form.gstNumber);
      formData.append('licenseNumber', form.licenseNumber);
      
      // Contact and address data
      formData.append('contactPerson', JSON.stringify(form.contactPerson));
      formData.append('emergencyContact', JSON.stringify(form.emergencyContact));
      formData.append('address', JSON.stringify(form.address));
      formData.append('website', form.website);
      formData.append('socialMedia', JSON.stringify(form.socialMedia));
      formData.append('services', JSON.stringify(form.services));
      
      // Upload documents
      Object.entries(form.documents).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });
      
      const response = await axios.post(`${API_URL}/auth/agency-signup`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress({ [key]: percentCompleted });
        }
      });
      
      setNotification({ 
        message: 'Agency registration successful! Please check your email to verify your account.', 
        type: 'success' 
      });
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      setNotification({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaUser className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your full name"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaEnvelope className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaPhone className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your phone number"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaLock className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={form.password}
            onChange={handleChange}
            className="block w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Create a password"
            required
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash className="h-4 w-4 text-gray-400" /> : <FaEye className="h-4 w-4 text-gray-400" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaLock className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className="block w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Confirm your password"
            required
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <FaEyeSlash className="h-4 w-4 text-gray-400" /> : <FaEye className="h-4 w-4 text-gray-400" />}
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Agency Information</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Agency Name *</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaBuilding className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            name="agencyName"
            value={form.agencyName}
            onChange={handleChange}
            className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter agency name"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Agency Type *</label>
        <select
          name="agencyType"
          value={form.agencyType}
          onChange={handleChange}
          className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          {agencyTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe your agency and services"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Established Year *</label>
          <input
            type="number"
            name="establishedYear"
            value={form.establishedYear}
            onChange={handleChange}
            min="1900"
            max={new Date().getFullYear()}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 2020"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Agency Size</label>
          <select
            name="agencySize"
            value={form.agencySize}
            onChange={handleChange}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select size</option>
            {agencySizes.map(size => (
              <option key={size.value} value={size.value}>{size.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
          <input
            type="text"
            name="gstNumber"
            value={form.gstNumber}
            onChange={handleChange}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter GST number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
          <input
            type="text"
            name="licenseNumber"
            value={form.licenseNumber}
            onChange={handleChange}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter business license number"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact & Address</h3>
      
      <div>
        <h4 className="text-md font-medium text-gray-800 mb-3">Contact Person</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              name="contactPerson.name"
              value={form.contactPerson.name}
              onChange={handleChange}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Contact person name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <input
              type="text"
              name="contactPerson.position"
              value={form.contactPerson.position}
              onChange={handleChange}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Manager, Owner"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              name="contactPerson.email"
              value={form.contactPerson.email}
              onChange={handleChange}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Contact email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input
              type="tel"
              name="contactPerson.phone"
              value={form.contactPerson.phone}
              onChange={handleChange}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Contact phone"
              required
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-md font-medium text-gray-800 mb-3">Emergency Contact</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="emergencyContact.name"
              value={form.emergencyContact.name}
              onChange={handleChange}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Emergency contact name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              name="emergencyContact.phone"
              value={form.emergencyContact.phone}
              onChange={handleChange}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Emergency phone"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
            <input
              type="text"
              name="emergencyContact.relationship"
              value={form.emergencyContact.relationship}
              onChange={handleChange}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Manager, Partner"
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-md font-medium text-gray-800 mb-3">Business Address</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
            <input
              type="text"
              name="address.street"
              value={form.address.street}
              onChange={handleChange}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter street address"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                type="text"
                name="address.city"
                value={form.address.city}
                onChange={handleChange}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="City"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <input
                type="text"
                name="address.state"
                value={form.address.state}
                onChange={handleChange}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="State"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
              <input
                type="text"
                name="address.postalCode"
                value={form.address.postalCode}
                onChange={handleChange}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Postal code"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaGlobe className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="url"
            name="website"
            value={form.website}
            onChange={handleChange}
            className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://your-website.com"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Services & Documents</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Services Offered *</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availableServices.map(service => (
            <label key={service} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={form.services.includes(service)}
                onChange={() => handleServiceToggle(service)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{service}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Required Documents</label>
        <div className="space-y-4">
          {Object.entries({
            businessLicense: 'Business License',
            taxCertificate: 'Tax Certificate',
            insuranceCertificate: 'Insurance Certificate',
            bankStatement: 'Bank Statement (Last 3 months)'
          }).map(([key, label]) => (
            <div key={key} className="border border-gray-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(key, e.target.files[0])}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {form.documents[key] && (
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <FaCheckCircle />
                    <span>{form.documents[key].name}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Submit</h3>
      
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Account Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><strong>Name:</strong> {form.name}</div>
            <div><strong>Email:</strong> {form.email}</div>
            <div><strong>Phone:</strong> {form.phone}</div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Agency Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><strong>Agency Name:</strong> {form.agencyName}</div>
            <div><strong>Type:</strong> {agencyTypes.find(t => t.value === form.agencyType)?.label}</div>
            <div><strong>Established:</strong> {form.establishedYear}</div>
            <div><strong>License:</strong> {form.licenseNumber}</div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><strong>Contact Person:</strong> {form.contactPerson.name}</div>
            <div><strong>Contact Email:</strong> {form.contactPerson.email}</div>
            <div><strong>Contact Phone:</strong> {form.contactPerson.phone}</div>
            <div><strong>Address:</strong> {form.address.street}, {form.address.city}, {form.address.state}</div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Services</h4>
          <div className="flex flex-wrap gap-2">
            {form.services.map(service => (
              <span key={service} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {service}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FaShieldAlt className="text-blue-600 mt-1" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Important Information</p>
            <ul className="space-y-1">
              <li>• Your application will be reviewed within 2-3 business days</li>
              <li>• You will receive an email confirmation once approved</li>
              <li>• All documents will be verified for authenticity</li>
              <li>• You can start using the platform once approved</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: 'Account', icon: <FaUser /> },
    { number: 2, title: 'Agency', icon: <FaBuilding /> },
    { number: 3, title: 'Contact', icon: <FaPhone /> },
    { number: 4, title: 'Services', icon: <FaCar /> },
    { number: 5, title: 'Review', icon: <FaCheckCircle /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8 px-4">
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <FaArrowLeft />
            <span>Back to Login</span>
          </Link>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-400 text-white rounded-full w-12 h-12 flex items-center justify-center font-black text-xl shadow-lg">
              T
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent">
              TravelBiz
            </h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Agency Registration</h2>
          <p className="text-gray-600">Join TravelBiz as a travel agency and start managing your business</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {currentStep > step.number ? <FaCheckCircle /> : step.icon}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-red-500 text-sm" />
                <p className="text-red-600 font-medium text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step Content */}
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                color="secondary"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <FaArrowLeft />
                Previous
              </Button>

              {currentStep < 5 ? (
                <Button
                  type="button"
                  color="primary"
                  onClick={nextStep}
                  className="flex items-center gap-2"
                >
                  Next
                  <FaArrowLeft className="rotate-180" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  color="primary"
                  loading={loading}
                  className="flex items-center gap-2"
                >
                  <FaUserPlus />
                  Complete Registration
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AgencyRegistration; 