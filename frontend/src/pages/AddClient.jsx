import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addClient, getClient, updateClient } from '../services/clientService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Dropdown from '../components/common/Dropdown';
import { FaUsers, FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { getUsers } from '../services/userService';
import Loader from '../components/common/Loader';

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
    status: 'Active'
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState('');
  const [agents, setAgents] = useState([]);

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
            status: clientData.status || 'Active'
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEditMode) {
        await updateClient(id, form, token);
      } else {
        let formData = { ...form };
        if (user?.role === 'agent') {
          formData.assignedAgent = user.id;
        }
        await addClient(formData, token);
      }
      // Navigate back with a refresh flag
      navigate('/clients', { state: { refresh: true } });
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} client`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {isEditMode ? 'Edit Client' : 'Add New Client'}
        </h1>
          <Button 
            color="secondary" 
            onClick={() => navigate('/clients')}
            className="flex items-center gap-2"
          >
          <FaArrowLeft /> Back to Clients
          </Button>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-full">
            <FaUsers className="text-blue-600 text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditMode ? 'Update Client Information' : 'Client Information'}
            </h2>
            <p className="text-gray-600">
              {isEditMode 
                ? 'Modify the client details below' 
                : 'Fill in the client details below to add them to your system'
              }
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter full name"
                />

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter email address"
                />

                <Input
                  label="Phone Number"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />

                <Input
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Travel Documents</h3>
              <div className="space-y-4">
                <Input
                  label="Passport Number"
                  name="passportNumber"
                  value={form.passportNumber}
                  onChange={handleChange}
                  placeholder="Enter passport number"
                />

                <Input
                  label="Nationality"
                  name="nationality"
                  value={form.nationality}
                  onChange={handleChange}
                  placeholder="Enter nationality"
                />

                <Dropdown
                  label="Status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Address and Emergency Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
              <div className="space-y-4">
                <Input
                  label="Address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter full address"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
              <div className="space-y-4">
                <Input
                  label="Emergency Contact Name"
                  name="emergencyContact"
                  value={form.emergencyContact}
                  onChange={handleChange}
                  placeholder="Emergency contact person name"
                />

                <Input
                  label="Emergency Contact Phone"
                  name="emergencyPhone"
                  value={form.emergencyPhone}
                  onChange={handleChange}
                  placeholder="Emergency contact phone number"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="button"
              color="secondary" 
              onClick={() => navigate('/clients')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              color="primary" 
              loading={loading}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <FaUsers /> {isEditMode ? 'Update Client' : 'Add Client'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClient; 