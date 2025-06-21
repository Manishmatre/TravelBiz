import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { inviteUser, getUserById, updateUser } from '../services/userService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Dropdown from '../components/common/Dropdown';
import { FaUserPlus, FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../components/common/Loader';

const AddUser = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'agent'
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState('');

  // Fetch user data if in edit mode
  useEffect(() => {
    const fetchData = async () => {
      if (isEditMode) {
        setInitialLoading(true);
        try {
          const userData = await getUserById(id, token);
          setForm({
            name: userData.name || '',
            email: userData.email || '',
            role: userData.role || 'agent'
          });
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load user data');
        } finally {
          setInitialLoading(false);
        }
      }
    };
    
    if (token && isEditMode) {
      fetchData();
    }
  }, [token, id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEditMode) {
        await updateUser(id, form, token);
      } else {
        await inviteUser(form, token);
      }
      navigate('/users', { state: { refresh: true } });
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'invite'} user`);
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
          {isEditMode ? 'Edit User' : 'Add New User'}
        </h1>
          <Button 
            color="secondary" 
            onClick={() => navigate('/users')}
            className="flex items-center gap-2"
          >
          <FaArrowLeft /> Back to Users
          </Button>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-full">
            <FaUserPlus className="text-blue-600 text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditMode ? 'Update User Information' : 'Invite New Staff Member'}
            </h2>
            <p className="text-gray-600">
              {isEditMode 
                ? 'Modify the user details below' 
                : 'Fill in the details below to invite a new user to your agency'
              }
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <Dropdown
            label="Role"
            name="role"
            value={form.role}
            onChange={handleChange}
            options={[
              { value: 'agent', label: 'Agent' },
              { value: 'driver', label: 'Driver' },
              { value: 'admin', label: 'Admin' },
            ]}
          />

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <Button 
              type="button"
              color="secondary" 
              onClick={() => navigate('/users')}
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
              <FaUserPlus /> {isEditMode ? 'Update User' : 'Invite User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser; 