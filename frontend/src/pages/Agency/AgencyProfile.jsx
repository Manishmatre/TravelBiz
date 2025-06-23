import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getAgencyProfile, updateAgencyProfile, getAgencyStats } from '../../services/agencyService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import { 
  FaBuilding, FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe, 
  FaEdit, FaSave, FaTimes, FaCheck, FaExclamationTriangle,
  FaUserTie, FaCalendarAlt, FaShieldAlt, FaCertificate,
  FaStar, FaThumbsUp, FaUsers, FaCar, FaRoute, FaMoneyBillWave,
  FaFileAlt, FaUpload, FaDownload, FaEye, FaEyeSlash
} from 'react-icons/fa';
import Notification from '../../components/common/Notification';

function AgencyProfile() {
  const { token, user } = useAuth();
  const [agency, setAgency] = useState(null);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalVehicles: 0,
    totalBookings: 0,
    completedBookings: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = React.useRef(null);

  const populateFormData = (data) => {
    setFormData({
      name: data.name || '',
      description: data.description || '',
      street: data.address?.street || '',
      city: data.address?.city || '',
      state: data.address?.state || '',
      country: data.address?.country || '',
      postalCode: data.address?.postalCode || '',
      phone: data.phone || '',
      email: data.email || '',
      website: data.website || '',
      socialMedia: data.socialMedia || { facebook: '', twitter: '', instagram: '', linkedin: '' },
      licenseNumber: data.licenseNumber || '',
      taxId: data.taxId || '',
      establishedDate: data.establishedDate ? new Date(data.establishedDate).toISOString().split('T')[0] : '',
      businessHours: data.businessHours || { monday: '9:00 AM - 6:00 PM', tuesday: '9:00 AM - 6:00 PM', wednesday: '9:00 AM - 6:00 PM', thursday: '9:00 AM - 6:00 PM', friday: '9:00 AM - 6:00 PM', saturday: 'Closed', sunday: 'Closed' },
      emergencyContact: data.emergencyContact?.phone || '',
      logo: data.logo || '',
      coverImage: data.coverImage || '',
      services: data.services || [],
      certifications: data.certifications || [],
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [agencyData, statsData] = await Promise.all([
          getAgencyProfile(token),
          getAgencyStats(token)
        ]);
        
        setAgency(agencyData);
        setStats(statsData);
        populateFormData(agencyData);

      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load agency data');
        setNotification({ 
          message: 'Failed to load agency data: ' + (err.response?.data?.message || err.message), 
          type: 'error' 
        });
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setNotification({ message: 'File size must be less than 5MB.', type: 'error' });
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Handle nested businessHours object
    if (Object.keys(formData.businessHours).includes(name)) {
      setFormData(prev => ({
        ...prev,
        businessHours: {
          ...prev.businessHours,
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSocialMediaChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    const data = new FormData();

    // Append all form fields
    for (const key in formData) {
      if (Object.hasOwnProperty.call(formData, key)) {
        const value = formData[key];
        // Handle nested objects and arrays
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          for (const nestedKey in value) {
            if (Object.hasOwnProperty.call(value, nestedKey)) {
              data.append(`${key}[${nestedKey}]`, value[nestedKey]);
            }
          }
        } else if (Array.isArray(value)) {
          value.forEach(item => data.append(`${key}[]`, item));
        } else if (value !== undefined && value !== null) {
          data.append(key, value);
        }
      }
    }
    
    if (logoFile) {
      data.append('logo', logoFile, logoFile.name);
    }

    try {
      const updatedAgency = await updateAgencyProfile(data, token);
      setAgency(updatedAgency);
      populateFormData(updatedAgency);
      setEditing(false);
      setLogoFile(null);
      setLogoPreview(null);
      setNotification({ message: 'Agency profile updated successfully!', type: 'success' });
    } catch (err) {
      setNotification({ 
        message: 'Failed to update agency profile: ' + (err.response?.data?.message || err.message), 
        type: 'error' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (agency) {
      populateFormData(agency);
    }
    setEditing(false);
    setLogoFile(null);
    setLogoPreview(null);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaBuilding /> },
    { id: 'contact', label: 'Contact Info', icon: <FaPhone /> },
    { id: 'business', label: 'Business Details', icon: <FaUserTie /> },
    { id: 'social', label: 'Social Media', icon: <FaGlobe /> },
    { id: 'services', label: 'Services', icon: <FaRoute /> },
    { id: 'team', label: 'Team', icon: <FaUsers /> },
    { id: 'documents', label: 'Documents', icon: <FaFileAlt /> }
  ];

  if (loading || !formData) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600">{error}</p>
      </div>
    </div>
  );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen py-6 px-2 md:px-8">
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Agency Profile
            </h1>
            <p className="text-gray-600 text-lg">
              Manage your agency information and settings
            </p>
            </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button
                  color="secondary"
                  onClick={handleCancel}
                  className="flex items-center gap-2"
                >
                  <FaTimes />
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onClick={handleSave}
                  loading={saving}
                  className="flex items-center gap-2"
                >
                  <FaSave />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button
                color="primary"
                onClick={() => setEditing(true)}
                className="flex items-center gap-2"
              >
                <FaEdit />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Agency Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Bookings</p>
              <p className="text-2xl font-bold">{stats.totalBookings}</p>
            </div>
            <FaCalendarAlt className="text-3xl text-blue-200" />
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Active Clients</p>
              <p className="text-2xl font-bold">{stats.totalClients}</p>
            </div>
            <FaUsers className="text-3xl text-green-200" />
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Vehicles</p>
              <p className="text-2xl font-bold">{stats.totalVehicles}</p>
            </div>
            <FaCar className="text-3xl text-purple-200" />
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Completed Trips</p>
              <p className="text-2xl font-bold">{stats.completedBookings}</p>
            </div>
            <FaCheck className="text-3xl text-yellow-200" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 relative">
                   <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/png, image/jpeg, image/gif"
                    disabled={!editing}
                  />
                  <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {logoPreview || (agency && agency.logo) ? (
                      <img 
                        src={logoPreview ? logoPreview : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${agency.logo}`} 
                        alt="Agency Logo" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <FaBuilding className="text-4xl text-gray-400" />
                    )}
                  </div>
                  {editing && (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-110"
                        aria-label="Upload new logo"
                    >
                        <FaUpload size={14}/>
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {editing ? (
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Agency Name"
                        className="text-2xl font-bold"
                      />
                    ) : (
                      agency.name
                    )}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {editing ? (
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Agency description..."
                        className="w-full p-2 border border-gray-300 rounded-lg resize-none"
                        rows={3}
                      />
                    ) : (
                      agency.description || 'No description available'
                    )}
                  </p>
                  
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-gray-800">Account Owner</h4>
                    <p className="text-gray-900">{agency?.owner?.name}</p>
                    <p className="text-gray-700 mt-1">{agency?.owner?.email}</p>
                    <p className="text-xs text-gray-500 mt-1">The owner's email is used for login and cannot be changed here.</p>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-4">
                    <div className="flex items-center space-x-1">
                      <FaMapMarkerAlt />
                      <span>{agency?.address?.city && agency?.address?.state ? `${agency.address.city}, ${agency.address.state}` : 'Location not set'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FaCalendarAlt />
                      <span>Est. {agency?.establishedDate ? new Date(agency.establishedDate).getFullYear() : 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FaShieldAlt />
                      <span>License: {agency?.licenseNumber || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <FaStar className="text-blue-500" />
                    <span className="font-semibold text-blue-900">Rating</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">4.8/5</p>
                  <p className="text-sm text-blue-700">Based on 234 reviews</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <FaThumbsUp className="text-green-500" />
                    <span className="font-semibold text-green-900">Success Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">98%</p>
                  <p className="text-sm text-green-700">Completed trips</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <FaCertificate className="text-purple-500" />
                    <span className="font-semibold text-purple-900">Certifications</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">5</p>
                  <p className="text-sm text-purple-700">Industry certified</p>
                </div>
              </div>
            </div>
          )}

          {/* Contact Info Tab */}
          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Public Contact Email</label>
                    {editing ? (
                      <Input
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="contact@youragency.com"
                      />
                    ) : (
                      <p className="text-gray-900">{agency.email || 'Not specified'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    {editing ? (
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 123-4567"
                      />
                    ) : (
                      <p className="text-gray-900">{agency.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                    {editing ? (
                      <Input
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleInputChange}
                        placeholder="Emergency contact number"
                      />
                    ) : (
                      <p className="text-gray-900">{agency?.emergencyContact?.phone || 'Not specified'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    {editing ? (
                      <Input
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="https://www.agency.com"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {agency.website ? (
                          <a href={agency.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {agency.website}
                          </a>
                        ) : (
                          'Not specified'
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Address</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Street */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                      {editing ? (
                        <Input
                          name="street"
                          value={formData.street}
                          onChange={handleInputChange}
                          placeholder="123 Main St"
                        />
                      ) : (
                        <p className="text-gray-900">{agency?.address?.street || 'Not set'}</p>
                      )}
                    </div>
                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      {editing ? (
                        <Input
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="New York"
                        />
                      ) : (
                        <p className="text-gray-900">{agency?.address?.city || 'Not set'}</p>
                      )}
                    </div>
                    {/* State */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
                      {editing ? (
                        <Input
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="NY"
                        />
                      ) : (
                        <p className="text-gray-900">{agency?.address?.state || 'Not set'}</p>
                      )}
                    </div>
                    {/* Postal Code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                      {editing ? (
                        <Input
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          placeholder="10001"
                        />
                      ) : (
                        <p className="text-gray-900">{agency?.address?.postalCode || 'Not set'}</p>
                      )}
                    </div>
                    {/* Country */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      {editing ? (
                        <Input
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          placeholder="United States"
                        />
                      ) : (
                        <p className="text-gray-900">{agency?.address?.country || 'Not set'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Business Details Tab */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                  {editing ? (
                    <Input
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      placeholder="Business license number"
                    />
                  ) : (
                    <p className="text-gray-900">{agency.licenseNumber || 'Not specified'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID</label>
                  {editing ? (
                    <Input
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleInputChange}
                      placeholder="Tax identification number"
                    />
                  ) : (
                    <p className="text-gray-900">{agency.taxId || 'Not specified'}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Established Date</label>
                {editing ? (
                  <Input
                    name="establishedDate"
                    type="date"
                    value={formData.establishedDate}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p className="text-gray-900">
                    {agency.establishedDate ? new Date(agency.establishedDate).toLocaleDateString() : 'Not specified'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Hours</label>
                {editing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {Object.keys(formData.businessHours).map(day => (
                      <div key={day}>
                        <label htmlFor={day} className="capitalize block text-xs font-medium text-gray-600">{day}</label>
                        <Input
                          id={day}
                          name={day}
                          value={formData.businessHours[day]}
                          onChange={handleInputChange}
                          placeholder="e.g., 9:00 AM - 5:00 PM"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="list-disc list-inside text-gray-900 space-y-1">
                    {Object.entries(agency?.businessHours || {}).map(([day, hours]) => (
                      <li key={day}><span className="capitalize font-medium">{day}:</span> {hours}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Social Media Tab */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Social Media Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                  {editing ? (
                    <Input
                      value={formData.socialMedia?.facebook || ''}
                      onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                      placeholder="https://facebook.com/agency"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {agency.socialMedia?.facebook ? (
                        <a href={agency.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {agency.socialMedia.facebook}
                        </a>
                      ) : (
                        'Not specified'
                      )}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                  {editing ? (
                    <Input
                      value={formData.socialMedia?.twitter || ''}
                      onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                      placeholder="https://twitter.com/agency"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {agency.socialMedia?.twitter ? (
                        <a href={agency.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {agency.socialMedia.twitter}
                        </a>
                      ) : (
                        'Not specified'
                      )}
                    </p>
                )}
              </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                  {editing ? (
                    <Input
                      value={formData.socialMedia?.instagram || ''}
                      onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                      placeholder="https://instagram.com/agency"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {agency.socialMedia?.instagram ? (
                        <a href={agency.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {agency.socialMedia.instagram}
                        </a>
                      ) : (
                        'Not specified'
                      )}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                  {editing ? (
                    <Input
                      value={formData.socialMedia?.linkedin || ''}
                      onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/company/agency"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {agency.socialMedia?.linkedin ? (
                        <a href={agency.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {agency.socialMedia.linkedin}
                        </a>
                      ) : (
                        'Not specified'
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Services Offered</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  'Airport Transfers',
                  'City Tours',
                  'Corporate Travel',
                  'Wedding Transportation',
                  'Event Transportation',
                  'Long Distance Travel',
                  'Luxury Vehicle Service',
                  'Group Transportation',
                  'Chauffeur Service'
                ].map((service) => (
                  <div key={service} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={service}
                      checked={formData.services?.includes(service) || false}
                      onChange={(e) => {
                        if (editing) {
                          const updatedServices = e.target.checked
                            ? [...(formData.services || []), service]
                            : (formData.services || []).filter(s => s !== service);
                          setFormData(prev => ({ ...prev, services: updatedServices }));
                        }
                      }}
                      disabled={!editing}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={service} className="text-sm font-medium text-gray-700">
                      {service}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Team Members</h3>
              <p className="text-gray-600">Team management will be available in a future update.</p>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Documents & Certifications</h3>
              <p className="text-gray-600">Document management will be available in a future update.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AgencyProfile;