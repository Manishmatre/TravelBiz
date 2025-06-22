import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addClient, getClient, updateClient } from '../services/clientService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Dropdown from '../components/common/Dropdown';
import { FaUsers, FaArrowLeft, FaSave, FaEye, FaEyeSlash, FaCheckCircle, FaExclamationTriangle, FaUser, FaEnvelope, FaPhone, FaPassport, FaBuilding, FaUserTie, FaLanguage, FaUserShield, FaExclamationCircle } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { getUsers } from '../services/userService';
import Loader from '../components/common/Loader';
import Card from '../components/common/Card';
import PageHeading from '../components/common/PageHeading';

const AddClient = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    passportNumber: '',
    nationality: '',
    dateOfBirth: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    status: 'Active',
    gender: '',
    occupation: '',
    company: '',
    preferredLanguage: 'English',
    dietaryRestrictions: '',
    specialRequirements: '',
    assignedAgent: ''
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [agents, setAgents] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Nationality options
  const nationalities = [
    'Afghan', 'Albanian', 'Algerian', 'American', 'Andorran', 'Angolan', 'Antiguans', 'Argentinean', 'Armenian', 'Australian',
    'Austrian', 'Azerbaijani', 'Bahamian', 'Bahraini', 'Bangladeshi', 'Barbadian', 'Barbudans', 'Batswana', 'Belarusian', 'Belgian',
    'Belizean', 'Beninese', 'Bhutanese', 'Bolivian', 'Bosnian', 'Brazilian', 'British', 'Bruneian', 'Bulgarian', 'Burkinabe',
    'Burmese', 'Burundian', 'Cambodian', 'Cameroonian', 'Canadian', 'Cape Verdean', 'Central African', 'Chadian', 'Chilean', 'Chinese',
    'Colombian', 'Comoran', 'Congolese', 'Costa Rican', 'Croatian', 'Cuban', 'Cypriot', 'Czech', 'Danish', 'Djibouti',
    'Dominican', 'Dutch', 'East Timorese', 'Ecuadorean', 'Egyptian', 'Emirian', 'Equatorial Guinean', 'Eritrean', 'Estonian', 'Ethiopian',
    'Fijian', 'Filipino', 'Finnish', 'French', 'Gabonese', 'Gambian', 'Georgian', 'German', 'Ghanaian', 'Greek',
    'Grenadian', 'Guatemalan', 'Guinea-Bissauan', 'Guinean', 'Guyanese', 'Haitian', 'Herzegovinian', 'Honduran', 'Hungarian', 'I-Kiribati',
    'Icelander', 'Indian', 'Indonesian', 'Iranian', 'Iraqi', 'Irish', 'Israeli', 'Italian', 'Ivorian', 'Jamaican',
    'Japanese', 'Jordanian', 'Kazakhstani', 'Kenyan', 'Kittian and Nevisian', 'Kuwaiti', 'Kyrgyz', 'Laotian', 'Latvian', 'Lebanese',
    'Liberian', 'Libyan', 'Liechtensteiner', 'Lithuanian', 'Luxembourger', 'Macedonian', 'Malagasy', 'Malawian', 'Malaysian', 'Maldivan',
    'Malian', 'Maltese', 'Marshallese', 'Mauritanian', 'Mauritian', 'Mexican', 'Micronesian', 'Moldovan', 'Monacan', 'Mongolian',
    'Moroccan', 'Mosotho', 'Motswana', 'Mozambican', 'Namibian', 'Nauruan', 'Nepalese', 'New Zealander', 'Ni-Vanuatu', 'Nicaraguan',
    'Nigerian', 'Nigerien', 'North Korean', 'Northern Irish', 'Norwegian', 'Omani', 'Pakistani', 'Palauan', 'Panamanian', 'Papua New Guinean',
    'Paraguayan', 'Peruvian', 'Polish', 'Portuguese', 'Qatari', 'Romanian', 'Russian', 'Rwandan', 'Saint Lucian', 'Salvadoran',
    'Samoan', 'San Marinese', 'Sao Tomean', 'Saudi', 'Scottish', 'Senegalese', 'Serbian', 'Seychellois', 'Sierra Leonean', 'Singaporean',
    'Slovakian', 'Slovenian', 'Solomon Islander', 'Somali', 'South African', 'South Korean', 'Spanish', 'Sri Lankan', 'Sudanese', 'Surinamer',
    'Swazi', 'Swedish', 'Swiss', 'Syrian', 'Taiwanese', 'Tajik', 'Tanzanian', 'Thai', 'Togolese', 'Tongan',
    'Trinidadian or Tobagonian', 'Tunisian', 'Turkish', 'Tuvaluan', 'Ugandan', 'Ukrainian', 'Uruguayan', 'Uzbekistani', 'Venezuelan', 'Vietnamese',
    'Welsh', 'Yemenite', 'Zambian', 'Zimbabwean'
  ];

  // Language options
  const languages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian', 'Chinese', 'Japanese', 'Korean',
    'Arabic', 'Hindi', 'Bengali', 'Urdu', 'Turkish', 'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish',
    'Polish', 'Czech', 'Hungarian', 'Romanian', 'Bulgarian', 'Greek', 'Hebrew', 'Thai', 'Vietnamese', 'Indonesian',
    'Malay', 'Filipino', 'Swahili', 'Zulu', 'Afrikaans', 'Persian', 'Kurdish', 'Armenian', 'Georgian', 'Azerbaijani'
  ];

  // Fetch client data if in edit mode
  useEffect(() => {
    const fetchData = async () => {
      if (isEditMode) {
        setInitialLoading(true);
        try {
          const clientData = await getClient(id, token);
          setForm({
            name: clientData.name || '',
            email: clientData.email || '',
            phone: clientData.phone || '',
            passportNumber: clientData.passportNumber || '',
            nationality: clientData.nationality || '',
            dateOfBirth: clientData.dateOfBirth ? clientData.dateOfBirth.split('T')[0] : '',
            address: clientData.address || '',
            emergencyContact: clientData.emergencyContact || '',
            emergencyPhone: clientData.emergencyPhone || '',
            status: clientData.status || 'Active',
            gender: clientData.gender || '',
            occupation: clientData.occupation || '',
            company: clientData.company || '',
            preferredLanguage: clientData.preferredLanguage || 'English',
            dietaryRestrictions: clientData.dietaryRestrictions || '',
            specialRequirements: clientData.specialRequirements || '',
            assignedAgent: clientData.assignedAgent || ''
          });
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load client data');
        } finally {
          setInitialLoading(false);
        }
      }
    };
    
    if (token && isEditMode) {
      fetchData();
    }
  }, [token, id, isEditMode]);

  // Fetch agents for assignment
  useEffect(() => {
    if (token && user?.role === 'admin') {
      getUsers({ role: 'agent' }, token).then(setAgents);
    }
  }, [token, user]);

  // Validation function
  const validateForm = () => {
    const errors = {};
    
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = 'Email is invalid';
    }
    if (form.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(form.phone.replace(/\s/g, ''))) {
      errors.phone = 'Phone number is invalid';
    }
    if (form.dateOfBirth) {
      const age = new Date().getFullYear() - new Date(form.dateOfBirth).getFullYear();
      if (age < 0 || age > 120) errors.dateOfBirth = 'Invalid date of birth';
    }
    if (form.emergencyPhone && !/^[\+]?[1-9][\d]{0,15}$/.test(form.emergencyPhone.replace(/\s/g, ''))) {
      errors.emergencyPhone = 'Emergency phone number is invalid';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fix the validation errors below');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isEditMode) {
        await updateClient(id, form, token);
        setSuccess('Client updated successfully!');
      } else {
        let formData = { ...form };
        if (user?.role === 'agent') {
          formData.assignedAgent = user.id;
        }
        await addClient(formData, token);
        setSuccess('Client added successfully!');
      }
      
      // Navigate back after a short delay to show success message
      setTimeout(() => {
        navigate('/clients', { state: { refresh: true } });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} client`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
  };

  if (initialLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8">
        <Loader className="my-10" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8">
      {/* Header */}
      <PageHeading
        icon={<FaUser />}
        title={isEditMode ? 'Edit Client' : 'Add New Client'}
        subtitle="Add a new client or edit existing client details"
      />

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-green-600" />
            <p className="text-green-700 font-medium">{success}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-red-600" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Form Card */}
      <Card className="p-6 relative">
        <form onSubmit={handleSubmit} className="space-y-12 pb-24">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2 flex items-center gap-2"><FaUser className="text-blue-400" /> Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Input
                  label={<span className="flex items-center gap-2">Full Name <span className="text-red-500">*</span></span>}
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter full name"
                  error={validationErrors.name}
                  icon={<FaUser />}
                />
                <Input
                  label={<span className="flex items-center gap-2">Email Address <span className="text-red-500">*</span></span>}
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter email address"
                  error={validationErrors.email}
                  icon={<FaEnvelope />}
                />
                <Input
                  label="Phone Number"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  error={validationErrors.phone}
                  icon={<FaPhone />}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    error={validationErrors.dateOfBirth}
                  />
                  <Dropdown
                    label="Gender"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    options={[
                      { value: '', label: 'Select Gender' },
                      { value: 'Male', label: 'Male' },
                      { value: 'Female', label: 'Female' },
                      { value: 'Other', label: 'Other' },
                    ]}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <Input
                  label="Address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                />
                <Input
                  label="Emergency Contact Name"
                  name="emergencyContact"
                  value={form.emergencyContact}
                  onChange={handleChange}
                  placeholder="Enter emergency contact name"
                />
                <Input
                  label="Emergency Contact Phone"
                  name="emergencyPhone"
                  value={form.emergencyPhone}
                  onChange={handleChange}
                  placeholder="Enter emergency phone number"
                  error={validationErrors.emergencyPhone}
                  icon={<FaPhone />}
                />
              </div>
            </div>
          </div>

          {/* Travel Documents & Status */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2 flex items-center gap-2"><FaPassport className="text-blue-400" /> Travel & Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Input
                  label="Passport Number"
                  name="passportNumber"
                  value={form.passportNumber}
                  onChange={handleChange}
                  placeholder="Enter passport number"
                  icon={<FaPassport />}
                />
                <Dropdown
                  label="Nationality"
                  name="nationality"
                  value={form.nationality}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select Nationality' },
                    ...nationalities.map(nat => ({ value: nat, label: nat }))
                  ]}
                  searchable
                />
                <Dropdown
                  label="Status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' },
                    { value: 'VIP', label: 'VIP' },
                  ]}
                />
              </div>
              <div className="space-y-4">
                <Dropdown
                  label="Preferred Language"
                  name="preferredLanguage"
                  value={form.preferredLanguage}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select Language' },
                    ...languages.map(lang => ({ value: lang, label: lang }))
                  ]}
                  searchable
                  icon={<FaLanguage />}
                />
                <Input
                  label="Dietary Restrictions"
                  name="dietaryRestrictions"
                  value={form.dietaryRestrictions}
                  onChange={handleChange}
                  placeholder="Enter dietary restrictions"
                />
                <Input
                  label="Special Requirements"
                  name="specialRequirements"
                  value={form.specialRequirements}
                  onChange={handleChange}
                  placeholder="Enter any special requirements"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2 flex items-center gap-2"><FaUserTie className="text-blue-400" /> Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Input
                  label="Occupation"
                  name="occupation"
                  value={form.occupation}
                  onChange={handleChange}
                  placeholder="Enter occupation"
                  icon={<FaUserTie />}
                />
                <Input
                  label="Company"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  icon={<FaBuilding />}
                />
                {user?.role === 'admin' && (
                  <Dropdown
                    label="Assigned Agent"
                    name="assignedAgent"
                    value={form.assignedAgent}
                    onChange={handleChange}
                    options={[
                      { value: '', label: 'Select Agent' },
                      ...agents.map(agent => ({ value: agent._id, label: agent.name }))
                    ]}
                    icon={<FaUserShield />}
                    searchable
                  />
                )}
              </div>
            </div>
          </div>

          {/* Sticky Save/Cancel Bar */}
          <div className="fixed left-0 right-0 bottom-0 z-30 bg-white/90 border-t border-gray-200 shadow-lg flex justify-end gap-4 px-8 py-4">
            <Button
              type="button"
              color="secondary"
              onClick={() => navigate('/clients')}
              className="flex items-center gap-2"
            >
              <FaArrowLeft /> Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              loading={loading}
              className="flex items-center gap-2"
            >
              <FaSave /> {isEditMode ? 'Update Client' : 'Add Client'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddClient; 