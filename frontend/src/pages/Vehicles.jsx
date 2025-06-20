import React, { useEffect, useState } from 'react';
import { getVehicles, addVehicle, updateVehicle, deleteVehicle } from '../services/vehicleService';
import { useAuth } from '../contexts/AuthContext';
import VehicleFormModal from '../components/VehicleFormModal';
import StatCard from '../components/common/StatCard';
import Loader from '../components/common/Loader';
import Table from '../components/common/Table';
import { FaCar } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Button from '../components/common/Button';

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
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Vehicles</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold shadow hover:bg-blue-700 transition-all" onClick={() => { setEditVehicle(null); setModalOpen(true); }}>Add Vehicle</button>
      </div>
      {/* Quick Stat */}
      <div className="mb-6 max-w-xs">
        <StatCard icon={<FaCar />} label="Total Vehicles" value={loading ? '--' : vehicles.length} accentColor="green" />
      </div>
      {/* Modal */}
      <VehicleFormModal
        open={modalOpen}
        onClose={() => { setEditVehicle(null); setModalOpen(false); }}
        onSubmit={editVehicle ? handleEditVehicle : handleAddVehicle}
        initialData={editVehicle}
      />
      {/* Table or Loader/Error */}
      <div className="">
        {loading ? (
          <Loader className="my-10" />
        ) : error ? (
          <div className="text-red-500 p-6">{error}</div>
        ) : (
          <Table
            columns={[
              { label: 'Model', accessor: 'name' },
              { label: 'Number', accessor: 'numberPlate' },
              { label: 'Type', accessor: 'vehicleType' },
              { label: 'Driver', accessor: 'driverName' },
              { label: 'Status', accessor: 'status' },
              { label: 'Photo', accessor: 'photoUrl', render: v => v ? <img src={v} alt="Vehicle" className="h-10 w-16 object-cover rounded" /> : '-' },
            ]}
            data={vehicles.map(v => ({
              ...v,
              driverName: v.driverName || '-',
              numberPlate: v.numberPlate || '-',
              vehicleType: v.vehicleType || '-',
              name: v.name || '-',
            }))}
            actions={vehicle => (
              <>
                <Button
                  color="primary"
                  size="sm"
                  className="mr-2"
                  onClick={() => { setEditVehicle(vehicle); setModalOpen(true); }}
                >
                  Edit
                </Button>
                <Button
                  color="danger"
                  size="sm"
                  onClick={() => handleDeleteVehicle(vehicle._id)}
                >
                  Delete
                </Button>
              </>
            )}
          />
        )}
      </div>
    </div>
  );
}

export default Vehicles;