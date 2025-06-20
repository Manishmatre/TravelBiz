import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUpload, FaTimes, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaUsers, FaCar, FaFileAlt } from 'react-icons/fa';
import { getAgencyProfile, updateAgencyProfile, getAgencyStats } from '../services/agencyService';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Profile from '../components/common/Profile';
import StatCard from '../components/common/StatCard';
import Tab from '../components/common/Tab';

const AgencyProfile = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const tabList = [
    { label: 'Profile' },
    { label: 'Contact' },
    { label: 'Address' },
    { label: 'Social' },
    { label: 'Branding' },
    { label: 'Business Hours' },
  ];
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [agency, setAgency] = useState(null);
  const [stats, setStats] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    establishedYear: '',
    agencySize: '',
    gstNumber: '',
    tags: '',
    contactPerson: { name: '', email: '', phone: '' },
    emergencyContact: { name: '', phone: '' },
    address: { street: '', city: '', state: '', country: 'US', postalCode: '' },
    socialMedia: { facebook: '', twitter: '', instagram: '', linkedin: '', youtube: '', whatsapp: '', telegram: '' },
    primaryColor: '',
    secondaryColor: '',
    businessHours: {},
    logoUrl: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getAgencyProfile(token);
        setAgency(data);
        setFormData({
          name: data.name || '',
          description: data.description || '',
          email: data.email || '',
          phone: data.phone || '',
          website: data.website || '',
          establishedYear: data.establishedYear || '',
          agencySize: data.agencySize || '',
          gstNumber: data.gstNumber || '',
          tags: data.tags || '',
          contactPerson: {
            name: data.contactPerson?.name || '',
            email: data.contactPerson?.email || '',
            phone: data.contactPerson?.phone || ''
          },
          emergencyContact: {
            name: data.emergencyContact?.name || '',
            phone: data.emergencyContact?.phone || ''
          },
          logoUrl: data.logoUrl || data.logo || '',
          address: {
            street: data.address?.street || '',
            city: data.address?.city || '',
            state: data.address?.state || '',
            postalCode: data.address?.postalCode || '',
            country: data.address?.country || ''
          },
          socialMedia: {
            facebook: data.socialMedia?.facebook || '',
            twitter: data.socialMedia?.twitter || '',
            instagram: data.socialMedia?.instagram || '',
            linkedin: data.socialMedia?.linkedin || '',
            youtube: data.socialMedia?.youtube || '',
            whatsapp: data.socialMedia?.whatsapp || '',
            telegram: data.socialMedia?.telegram || ''
          },
          primaryColor: data.primaryColor || '#3b82f6',
          secondaryColor: data.secondaryColor || '#60a5fa',
          businessHours: data.businessHours || {},
        });
        if (data.logoUrl || data.logo) setLogoPreview(data.logoUrl || data.logo);
        // Fetch stats
        const statsData = await getAgencyStats(token);
        setStats(statsData);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to load agency profile');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
    else { setError('Authentication required. Please log in.'); setLoading(false); }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user.role !== 'admin') { setError('Only administrators can update agency profile'); return; }
    try {
      setSaving(true); setError(''); setSuccess('');
      const formDataToSend = new FormData();
      const { socialMedia, address, businessHours, ...otherFields } = formData;
      Object.entries(otherFields).forEach(([key, value]) => { if (value !== null && value !== undefined) formDataToSend.append(key, value); });
      if (socialMedia) formDataToSend.append('socialMedia', JSON.stringify(socialMedia));
      if (address) formDataToSend.append('address', JSON.stringify(address));
      if (businessHours) formDataToSend.append('businessHours', JSON.stringify(businessHours));
      if (logoFile) formDataToSend.append('logo', logoFile);
      else if (formData.logoUrl) formDataToSend.append('logoUrl', formData.logoUrl);
      const updated = await updateAgencyProfile(formDataToSend, token);
      setSuccess('Agency profile updated successfully!');
      setEditMode(false);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update agency profile');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-2 md:px-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    </div>
  );

  if (!agency) return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-2 md:px-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || 'Failed to load agency profile. Please try again later.'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8">
      <div className="w-full">
        {/* Page Header: Logo, Name, Description, Edit Btn */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-8 gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6 w-full">
            <div className="flex-shrink-0 flex flex-col items-center">
              <img src={logoPreview || '/default-avatar.png'} alt="Agency Logo" className="h-32 w-32 rounded-2xl object-cover border-4 border-blue-200 shadow mb-2" />
              {user.role === 'admin' && editMode && (
                <label htmlFor="logo-upload" className="w-full flex justify-center">
                  <Button as="span" color="primary" size="sm" className="mb-2 cursor-pointer">Change Logo
                    <input id="logo-upload" name="logo-upload" type="file" className="sr-only" accept="image/*" onChange={handleLogoChange} />
                  </Button>
                </label>
              )}
            </div>
            <div className="flex-1 w-full">
              {editMode ? (
                <Input label="Agency Name" name="name" value={formData.name} onChange={handleChange} required />
              ) : (
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-4"><FaUsers className="text-blue-600" /> {agency.name}</h1>
              )}
              {editMode ? (
                <Input label="Description" name="description" value={formData.description} onChange={handleChange} />
              ) : (
                <p className="text-gray-600 mb-2">{agency.description}</p>
              )}
            </div>
          </div>
          {/* Edit Button for Admins (not in edit mode) */}
          {user.role === 'admin' && !editMode && (
            <Button color="primary" size="md" className="mt-4 md:mt-0" onClick={() => setEditMode(true)}>
              Edit Profile
            </Button>
          )}
        </div>

        {success && <div className="text-green-600 text-center mb-4">{success}</div>}
        {error && <div className="text-red-600 text-center mb-4">{error}</div>}

        {/* Tab Navigation */}
        <Tab tabs={tabList} activeTab={activeTab} onTabChange={setActiveTab} className="mb-6" />

        {/* Tab Panels */}
        <div className="w-full">
          {/* Profile Tab */}
          {activeTab === 0 && (
            <Card title="Agency Info" className="p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {editMode ? (
                  <Input label="Agency Name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Arionex Travels" />
                ) : (
                  <div><span className="font-semibold">Name:</span> {agency.name}</div>
                )}
                {editMode ? (
                  <Input label="Email" name="email" value={formData.email} onChange={handleChange} placeholder="info@agency.com" />
                ) : (
                  <div><span className="font-semibold">Email:</span> {agency.email}</div>
                )}
                {editMode ? (
                  <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 9876543210" />
                ) : (
                  <div><span className="font-semibold">Phone:</span> {agency.phone}</div>
                )}
                {editMode ? (
                  <Input label="Website" name="website" value={formData.website} onChange={handleChange} placeholder="https://youragency.com" />
                ) : (
                  <div><span className="font-semibold">Website:</span> {agency.website}</div>
                )}
                {editMode ? (
                  <Input label="Established Year" name="establishedYear" value={formData.establishedYear} onChange={handleChange} placeholder="e.g. 2005" type="number" min="1900" max={new Date().getFullYear()} />
                ) : (
                  <div><span className="font-semibold">Established:</span> {agency.establishedYear}</div>
                )}
                {editMode ? (
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">Agency Size</label>
                    <select name="agencySize" value={formData.agencySize} onChange={handleChange} className="w-full rounded-xl border border-gray-200 bg-white/70 shadow-sm px-4 py-2 text-gray-800">
                      <option value="">Select Size</option>
                      <option value="1-10">1-10</option>
                      <option value="11-50">11-50</option>
                      <option value="51-200">51-200</option>
                      <option value="200+">200+</option>
                    </select>
                  </div>
                ) : (
                  <div><span className="font-semibold">Agency Size:</span> {agency.agencySize}</div>
                )}
                {editMode ? (
                  <Input label="GST/Tax ID" name="gstNumber" value={formData.gstNumber} onChange={handleChange} placeholder="Agency GST or Tax ID" />
                ) : (
                  <div><span className="font-semibold">GST/Tax ID:</span> {agency.gstNumber}</div>
                )}
                {editMode ? (
                  <Input label="Tags/Notes" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g. luxury, packages, 24x7" />
                ) : (
                  <div><span className="font-semibold">Tags/Notes:</span> {agency.tags}</div>
                )}
                {editMode ? (
                  <Input label="About" name="description" value={formData.description} onChange={handleChange} placeholder="Describe your agency..." />
                ) : (
                  <div><span className="font-semibold">About:</span> {agency.description}</div>
                )}
              </div>
            </Card>
          )}
          {/* Contact Tab */}
          {activeTab === 1 && (
            <>
              <Card title="Contact Person" className="p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {editMode ? (
                    <Input label="Contact Name" name="contactPerson.name" value={formData.contactPerson.name} onChange={handleChange} placeholder="e.g. John Doe" />
                  ) : (
                    <div><span className="font-semibold">Name:</span> {agency.contactPerson?.name}</div>
                  )}
                  {editMode ? (
                    <Input label="Contact Email" name="contactPerson.email" value={formData.contactPerson.email} onChange={handleChange} placeholder="contact@agency.com" />
                  ) : (
                    <div><span className="font-semibold">Email:</span> {agency.contactPerson?.email}</div>
                  )}
                  {editMode ? (
                    <Input label="Contact Phone" name="contactPerson.phone" value={formData.contactPerson.phone} onChange={handleChange} placeholder="+91 9876543210" />
                  ) : (
                    <div><span className="font-semibold">Phone:</span> {agency.contactPerson?.phone}</div>
                  )}
                </div>
              </Card>
              <Card title="Emergency Contact" className="p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editMode ? (
                    <Input label="Emergency Name" name="emergencyContact.name" value={formData.emergencyContact.name} onChange={handleChange} placeholder="e.g. Jane Smith" />
                  ) : (
                    <div><span className="font-semibold">Name:</span> {agency.emergencyContact?.name}</div>
                  )}
                  {editMode ? (
                    <Input label="Emergency Phone" name="emergencyContact.phone" value={formData.emergencyContact.phone} onChange={handleChange} placeholder="+91 9000000000" />
                  ) : (
                    <div><span className="font-semibold">Phone:</span> {agency.emergencyContact?.phone}</div>
                  )}
                </div>
              </Card>
            </>
          )}
          {/* Address Tab */}
          {activeTab === 2 && (
            <Card title="Address" className="p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {editMode ? (
                  <Input label="Street" name="address.street" value={formData.address.street} onChange={handleChange} placeholder="123 Main St" />
                ) : (
                  <div><span className="font-semibold">Street:</span> {agency.address?.street}</div>
                )}
                {editMode ? (
                  <Input label="City" name="address.city" value={formData.address.city} onChange={handleChange} placeholder="Mumbai" />
                ) : (
                  <div><span className="font-semibold">City:</span> {agency.address?.city}</div>
                )}
                {editMode ? (
                  <Input label="State" name="address.state" value={formData.address.state} onChange={handleChange} placeholder="Maharashtra" />
                ) : (
                  <div><span className="font-semibold">State:</span> {agency.address?.state}</div>
                )}
                {editMode ? (
                  <Input label="Country" name="address.country" value={formData.address.country} onChange={handleChange} placeholder="India" />
                ) : (
                  <div><span className="font-semibold">Country:</span> {agency.address?.country}</div>
                )}
                {editMode ? (
                  <Input label="Postal Code" name="address.postalCode" value={formData.address.postalCode} onChange={handleChange} placeholder="400001" />
                ) : (
                  <div><span className="font-semibold">Postal Code:</span> {agency.address?.postalCode}</div>
                )}
              </div>
            </Card>
          )}
          {/* Social Tab */}
          {activeTab === 3 && (
            <Card title="Social Media" className="p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {editMode ? (
                  <Input label="Facebook" name="socialMedia.facebook" value={formData.socialMedia.facebook} onChange={handleChange} placeholder="facebook username" />
                ) : (
                  <div className="flex items-center gap-2">{agency.socialMedia?.facebook && <FaFacebook className="text-blue-600" />} {agency.socialMedia?.facebook}</div>
                )}
                {editMode ? (
                  <Input label="Twitter" name="socialMedia.twitter" value={formData.socialMedia.twitter} onChange={handleChange} placeholder="twitter username" />
                ) : (
                  <div className="flex items-center gap-2">{agency.socialMedia?.twitter && <FaTwitter className="text-blue-400" />} {agency.socialMedia?.twitter}</div>
                )}
                {editMode ? (
                  <Input label="Instagram" name="socialMedia.instagram" value={formData.socialMedia.instagram} onChange={handleChange} placeholder="instagram username" />
                ) : (
                  <div className="flex items-center gap-2">{agency.socialMedia?.instagram && <FaInstagram className="text-pink-500" />} {agency.socialMedia?.instagram}</div>
                )}
                {editMode ? (
                  <Input label="LinkedIn" name="socialMedia.linkedin" value={formData.socialMedia.linkedin} onChange={handleChange} placeholder="linkedin username" />
                ) : (
                  <div className="flex items-center gap-2">{agency.socialMedia?.linkedin && <FaLinkedin className="text-blue-700" />} {agency.socialMedia?.linkedin}</div>
                )}
                {editMode ? (
                  <Input label="YouTube" name="socialMedia.youtube" value={formData.socialMedia.youtube} onChange={handleChange} placeholder="youtube channel" />
                ) : (
                  <div className="flex items-center gap-2">{agency.socialMedia?.youtube && <span className="text-red-600">▶️</span>} {agency.socialMedia?.youtube}</div>
                )}
                {editMode ? (
                  <Input label="WhatsApp" name="socialMedia.whatsapp" value={formData.socialMedia.whatsapp} onChange={handleChange} placeholder="whatsapp number" />
                ) : (
                  <div className="flex items-center gap-2">{agency.socialMedia?.whatsapp && <span className="text-green-500">🟢</span>} {agency.socialMedia?.whatsapp}</div>
                )}
                {editMode ? (
                  <Input label="Telegram" name="socialMedia.telegram" value={formData.socialMedia.telegram} onChange={handleChange} placeholder="telegram username" />
                ) : (
                  <div className="flex items-center gap-2">{agency.socialMedia?.telegram && <span className="text-blue-400">✈️</span>} {agency.socialMedia?.telegram}</div>
                )}
              </div>
            </Card>
          )}
          {/* Branding Tab */}
          {activeTab === 4 && (
            <Card title="Branding" className="p-6 mb-6">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex items-center gap-4">
                  <span className="font-semibold">Primary Color:</span>
                  <span className="inline-block w-8 h-8 rounded-full border" style={{ background: agency.primaryColor || formData.primaryColor }}></span>
                  {editMode && (
                    <input type="color" name="primaryColor" value={formData.primaryColor} onChange={handleChange} className="ml-2 w-10 h-10 border-none bg-transparent cursor-pointer" />
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">Secondary Color:</span>
                  <span className="inline-block w-8 h-8 rounded-full border" style={{ background: agency.secondaryColor || formData.secondaryColor }}></span>
                  {editMode && (
                    <input type="color" name="secondaryColor" value={formData.secondaryColor} onChange={handleChange} className="ml-2 w-10 h-10 border-none bg-transparent cursor-pointer" />
                  )}
                </div>
              </div>
            </Card>
          )}
          {/* Business Hours Tab */}
          {activeTab === 5 && (
            <Card title="Business Hours" className="p-6 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(agency.businessHours || formData.businessHours || {}).map(([day, hours]) => (
                  <div key={day} className="flex flex-col">
                    <span className="font-semibold capitalize">{day}</span>
                    {editMode ? (
                      <Input label="" name={`businessHours.${day}`} value={formData.businessHours?.[day] || ''} onChange={handleChange} placeholder="e.g. 10:00-18:00" />
                    ) : (
                      <span className="text-gray-600 text-sm">{hours}</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Edit/Save/Cancel Buttons */}
          {user.role === 'admin' && (
            <div className="flex justify-end gap-3">
              {editMode ? (
                <>
                  <Button type="button" color="secondary" onClick={() => setEditMode(false)}>Cancel</Button>
                  <Button type="submit" color="primary" disabled={saving} onClick={handleSubmit}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                </>
              ) : null}
            </div>
          )}
          {success && <div className="text-green-600 text-center mt-2">{success}</div>}
          {error && <div className="text-red-600 text-center mt-2">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default AgencyProfile;