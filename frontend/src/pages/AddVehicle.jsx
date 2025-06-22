import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addVehicle, getVehicleById, updateVehicle } from '../services/vehicleService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Dropdown from '../components/common/Dropdown';
import { FaCar, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../components/common/Loader';
import Card from '../components/common/Card';
import PageHeading from '../components/common/PageHeading';

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
          const vehicleData = await getVehicleById(id, token);
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

    if (!form.vehicleType) {
      toast.error('Please select a vehicle type.');
      return;
    }

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
      <PageHeading
        icon={<FaCar />}
        title={isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}
        subtitle={isEditMode ? 'Edit vehicle details or update information' : 'Add a new vehicle to your fleet'}
      />

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-red-600"><FaExclamationTriangle /></span>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Form Card */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-12 pb-24">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2 flex items-center gap-2"><FaCar className="text-blue-400" /> Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Input
                  label={<span className="flex items-center gap-2">Vehicle Name/Model <span className="text-red-500">*</span></span>}
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Toyota Innova"
                />
                <Input
                  label={<span className="flex items-center gap-2">Number Plate <span className="text-red-500">*</span></span>}
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
                    { value: 'on-trip', label: 'On Trip' },
                    { value: 'maintenance', label: 'Maintenance' },
                  ]}
                />
                <Input
                  label="Photo URL"
                  name="photoUrl"
                  value={form.photoUrl}
                  onChange={handleChange}
                  placeholder="Paste image URL or leave blank"
                />
              </div>
            </div>
          </div>

          {/* Expiry Dates */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2 flex items-center gap-2"><FaCar className="text-blue-400" /> Expiry Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Input
                  label="Insurance Expiry"
                  name="insuranceExpiry"
                  type="date"
                  value={form.insuranceExpiry}
                  onChange={handleChange}
                  required
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
              </div>
              <div className="space-y-4">
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
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 mt-8">
            <Button color="secondary" type="button" onClick={() => navigate('/vehicles')}>
              <FaArrowLeft className="mr-2" /> Cancel
            </Button>
            <Button color="primary" type="submit" loading={loading}>
              {isEditMode ? 'Update Vehicle' : 'Add Vehicle'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddVehicle; 