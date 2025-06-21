import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addVehicle, getVehicle, updateVehicle } from '../services/vehicleService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Dropdown from '../components/common/Dropdown';
import { FaCar, FaArrowLeft } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../components/common/Loader';

const AddVehicle = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [form, setForm] = useState({
    name: '',
    numberPlate: '',
    vehicleType: '',
    capacity: '',
    fuelType: '',
    status: 'available',
    insuranceExpiry: '',
    pucExpiry: '',
    registrationExpiry: '',
    permitExpiry: '',
    fitnessExpiry: '',
    photoUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState('');

  // Fetch vehicle data if in edit mode
  useEffect(() => {
    const fetchData = async () => {
      if (isEditMode) {
        setInitialLoading(true);
        try {
          const vehicleData = await getVehicle(id, token);
          setForm({
            name: vehicleData.name || '',
            numberPlate: vehicleData.numberPlate || '',
            vehicleType: vehicleData.vehicleType || '',
            capacity: vehicleData.capacity || '',
            fuelType: vehicleData.fuelType || '',
            status: vehicleData.status || 'available',
            insuranceExpiry: vehicleData.insuranceExpiry ? vehicleData.insuranceExpiry.split('T')[0] : '',
            pucExpiry: vehicleData.pucExpiry ? vehicleData.pucExpiry.split('T')[0] : '',
            registrationExpiry: vehicleData.registrationExpiry ? vehicleData.registrationExpiry.split('T')[0] : '',
            permitExpiry: vehicleData.permitExpiry ? vehicleData.permitExpiry.split('T')[0] : '',
            fitnessExpiry: vehicleData.fitnessExpiry ? vehicleData.fitnessExpiry.split('T')[0] : '',
            photoUrl: vehicleData.photoUrl || ''
          });
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load vehicle data');
          toast.error('Failed to load vehicle data');
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
        await updateVehicle(id, form, token);
        toast.success('Vehicle updated successfully!');
      } else {
        await addVehicle(form, token);
        toast.success('Vehicle added successfully!');
      }
      navigate('/vehicles');
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} vehicle`);
      toast.error(`Failed to ${isEditMode ? 'update' : 'add'} vehicle`);
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
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            color="secondary" 
            onClick={() => navigate('/vehicles')}
            className="flex items-center gap-2"
          >
            <FaArrowLeft /> Back
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h1>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-full">
            <FaCar className="text-blue-600 text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditMode ? 'Update Vehicle Information' : 'Vehicle Information'}
            </h2>
            <p className="text-gray-600">
              {isEditMode 
                ? 'Modify the vehicle details below' 
                : 'Fill in the vehicle details below to add it to your fleet'
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
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <Input
                  label="Vehicle Name/Model"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Toyota Innova"
                />

                <Input
                  label="Number Plate"
                  name="numberPlate"
                  value={form.numberPlate}
                  onChange={handleChange}
                  required
                  placeholder="e.g., MH-12-AB-1234"
                />

                <Dropdown
                  label="Vehicle Type"
                  name="vehicleType"
                  value={form.vehicleType}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select Vehicle Type' },
                    { value: 'sedan', label: 'Sedan' },
                    { value: 'suv', label: 'SUV' },
                    { value: 'hatchback', label: 'Hatchback' },
                    { value: 'minivan', label: 'Minivan' },
                    { value: 'bus', label: 'Bus' },
                    { value: 'truck', label: 'Truck' },
                  ]}
                />

                <Input
                  label="Passenger Capacity"
                  name="capacity"
                  type="number"
                  value={form.capacity}
                  onChange={handleChange}
                  placeholder="e.g., 7"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Technical Details</h3>
              <div className="space-y-4">
                <Dropdown
                  label="Fuel Type"
                  name="fuelType"
                  value={form.fuelType}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select Fuel Type' },
                    { value: 'petrol', label: 'Petrol' },
                    { value: 'diesel', label: 'Diesel' },
                    { value: 'cng', label: 'CNG' },
                    { value: 'electric', label: 'Electric' },
                    { value: 'hybrid', label: 'Hybrid' },
                  ]}
                />

                <Dropdown
                  label="Status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  options={[
                    { value: 'available', label: 'Available' },
                    { value: 'maintenance', label: 'Maintenance' },
                    { value: 'on-trip', label: 'On Trip' },
                  ]}
                />

                <Input
                  label="Photo URL"
                  name="photoUrl"
                  value={form.photoUrl}
                  onChange={handleChange}
                  placeholder="Vehicle image URL"
                />
              </div>
            </div>
          </div>

          {/* Document Expiry Dates */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Document Expiry Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label="Insurance Expiry"
                name="insuranceExpiry"
                type="date"
                value={form.insuranceExpiry}
                onChange={handleChange}
              />

              <Input
                label="PUC Expiry"
                name="pucExpiry"
                type="date"
                value={form.pucExpiry}
                onChange={handleChange}
              />

              <Input
                label="Registration Expiry"
                name="registrationExpiry"
                type="date"
                value={form.registrationExpiry}
                onChange={handleChange}
              />

              <Input
                label="Permit Expiry"
                name="permitExpiry"
                type="date"
                value={form.permitExpiry}
                onChange={handleChange}
              />

              <Input
                label="Fitness Expiry"
                name="fitnessExpiry"
                type="date"
                value={form.fitnessExpiry}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="button"
              color="secondary" 
              onClick={() => navigate('/vehicles')}
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
              <FaCar /> {isEditMode ? 'Update Vehicle' : 'Add Vehicle'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicle; 