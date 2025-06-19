import React, { useEffect, useState } from 'react';
import { getVehicles, addVehicle, updateVehicle, deleteVehicle } from '../services/vehicleService';
import { useAuth } from '../contexts/AuthContext';
import VehicleFormModal from '../components/VehicleFormModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Vehicles() {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getVehicles(token);
        setVehicles(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load vehicles');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchVehicles();
  }, [token]);

  const handleAddVehicle = async (form) => {
    try {
      const newVehicle = await addVehicle(form, token);
      setVehicles([newVehicle, ...vehicles]);
      setModalOpen(false);
      toast.success('Vehicle added successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add vehicle');
    }
  };

  const handleEditVehicle = async (form) => {
    try {
      const updated = await updateVehicle(editVehicle._id, form, token);
      setVehicles(vehicles.map(v => (v._id === updated._id ? updated : v)));
      setEditVehicle(null);
      setModalOpen(false);
      toast.success('Vehicle updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update vehicle');
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await deleteVehicle(id, token);
      setVehicles(vehicles.filter(v => v._id !== id));
      toast.success('Vehicle deleted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete vehicle');
    }
  };

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Vehicles</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition" onClick={() => { setEditVehicle(null); setModalOpen(true); }}>Add Vehicle</button>
      </div>
      <VehicleFormModal
        open={modalOpen}
        onClose={() => { setEditVehicle(null); setModalOpen(false); }}
        onSubmit={editVehicle ? handleEditVehicle : handleAddVehicle}
        initialData={editVehicle}
      />
      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Type</th>
                <th className="py-2 px-4 text-left">Number Plate</th>
                <th className="py-2 px-4 text-left">Insurance Expiry</th>
                <th className="py-2 px-4 text-left">Driver</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Photo</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(vehicle => (
                <tr key={vehicle._id}>
                  <td className="py-2 px-4">{vehicle.name}</td>
                  <td className="py-2 px-4">{vehicle.vehicleType}</td>
                  <td className="py-2 px-4">{vehicle.numberPlate}</td>
                  <td className="py-2 px-4">{vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toLocaleDateString() : '-'}</td>
                  <td className="py-2 px-4">{vehicle.driverName || '-'}</td>
                  <td className="py-2 px-4">{vehicle.status}</td>
                  <td className="py-2 px-4">
                    {vehicle.photoUrl ? <img src={vehicle.photoUrl} alt="Vehicle" className="h-10 w-16 object-cover rounded" /> : '-'}</td>
                  <td className="py-2 px-4">
                    <button className="text-blue-600 hover:underline mr-2" onClick={() => { setEditVehicle(vehicle); setModalOpen(true); }}>Edit</button>
                    <button className="text-red-600 hover:underline" onClick={() => handleDeleteVehicle(vehicle._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Vehicles; 