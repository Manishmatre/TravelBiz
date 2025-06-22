import React, { useState } from 'react';
import { FaCog, FaBuilding, FaPalette, FaLanguage, FaSave } from 'react-icons/fa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import TabButton from '../components/common/TabButton';

function GeneralSettings() {
  const [activeTab, setActiveTab] = useState('business');
  const [settings, setSettings] = useState({
    businessName: 'LuxeRide Services',
    address: '123 Luxury Lane, Metropolis, USA 12345',
    contactEmail: 'contact@luxeride.com',
    phone: '+1 (555) 123-4567',
    primaryColor: '#3B82F6',
    language: 'en-US',
    timezone: 'America/New_York'
  });
  const [logo, setLogo] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({...prev, [name]: value}));
  };

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLogo(URL.createObjectURL(e.target.files[0]));
    }
  };
  
  const renderTabContent = () => {
    switch(activeTab) {
      case 'business':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Business Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Business Name</label>
              <Input name="businessName" value={settings.businessName} onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <Input name="address" value={settings.address} onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Email</label>
              <Input type="email" name="contactEmail" value={settings.contactEmail} onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <Input type="tel" name="phone" value={settings.phone} onChange={handleInputChange} />
            </div>
          </div>
        );
      case 'branding':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Branding & Appearance</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Logo</label>
              <div className="mt-1 flex items-center gap-4">
                <span className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                  {logo ? <img src={logo} alt="logo" className="h-full w-full object-cover rounded-full" /> : <FaBuilding className="h-8 w-8 text-gray-400"/>}
                </span>
                <Input type="file" onChange={handleLogoChange} accept="image/*" className="w-auto"/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Primary Color</label>
              <div className="flex items-center gap-2">
                <Input type="color" name="primaryColor" value={settings.primaryColor} onChange={handleInputChange} className="w-12 h-10"/>
                <span className="font-mono">{settings.primaryColor}</span>
              </div>
            </div>
          </div>
        );
      case 'localization':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Localization</h3>
             <div>
              <label className="block text-sm font-medium text-gray-700">Language</label>
              <select name="language" value={settings.language} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md">
                <option value="en-US">English (United States)</option>
                <option value="en-GB">English (United Kingdom)</option>
                <option value="es-ES">Spanish</option>
                <option value="fr-FR">French</option>
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Timezone</label>
              <select name="timezone" value={settings.timezone} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md">
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="America/Chicago">Central Time (US & Canada)</option>
                <option value="America/Denver">Mountain Time (US & Canada)</option>
                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
              </select>
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaCog className="text-gray-600" />
            General Settings
          </h1>
          <p className="text-gray-600 mt-2">Configure application-wide settings and preferences.</p>
        </div>
        <Button>
          <FaSave className="mr-2" /> Save Changes
        </Button>
      </div>

      <Card>
        <div className="flex border-b">
          <TabButton icon={<FaBuilding/>} label="Business Info" isActive={activeTab === 'business'} onClick={() => setActiveTab('business')} />
          <TabButton icon={<FaPalette/>} label="Branding" isActive={activeTab === 'branding'} onClick={() => setActiveTab('branding')} />
          <TabButton icon={<FaLanguage/>} label="Localization" isActive={activeTab === 'localization'} onClick={() => setActiveTab('localization')} />
        </div>
        <div className="p-6">
          {renderTabContent()}
        </div>
      </Card>
    </div>
  );
}

export default GeneralSettings; 