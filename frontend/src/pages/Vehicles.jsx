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
import { Link } from 'react-router-dom';
import Dropdown from '../components/common/Dropdown';
import SearchInput from '../components/common/SearchInput';

function Vehicles() {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

  // Filtering logic
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = search ? (
      Object.values(v).some(val => val && val.toString().toLowerCase().includes(search.toLowerCase()))
    ) : true;
    const matchesStatus = statusFilter ? v.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Vehicles</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold shadow hover:bg-blue-700 transition-all" onClick={() => { setEditVehicle(null); setModalOpen(true); }}>Add Vehicle</button>
      </div>
      {/* Dashboard Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard icon={<FaCar />} label="Total Vehicles" value={vehicles.length} accentColor="blue" />
        <StatCard icon={<FaCar />} label="Available" value={vehicles.filter(v => v.status === 'available').length} accentColor="green" />
        <StatCard icon={<FaCar />} label="On Trip" value={vehicles.filter(v => v.status === 'on-trip').length} accentColor="yellow" />
        <StatCard icon={<FaCar />} label="Maintenance" value={vehicles.filter(v => v.status === 'maintenance').length} accentColor="red" />
        <StatCard icon={<FaCar />} label="Expiring Insurance" value={vehicles.filter(v => v.insuranceExpiry && (new Date(v.insuranceExpiry) - new Date())/(1000*60*60*24) <= 30 && (new Date(v.insuranceExpiry) - new Date())/(1000*60*60*24) >= 0).length} accentColor="orange" />
        <StatCard icon={<FaCar />} label="Expiring PUC" value={vehicles.filter(v => v.pucExpiry && (new Date(v.pucExpiry) - new Date())/(1000*60*60*24) <= 30 && (new Date(v.pucExpiry) - new Date())/(1000*60*60*24) >= 0).length} accentColor="purple" />
      </div>
      {/* Modal */}
      <VehicleFormModal
        open={modalOpen}
        onClose={() => { setEditVehicle(null); setModalOpen(false); }}
        onSubmit={editVehicle ? handleEditVehicle : handleAddVehicle}
        initialData={editVehicle}
      />
      {/* Table or Loader/Error */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <SearchInput
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search any field..."
            className="w-full h-[44px]"
            style={{ marginBottom: 0 }}
          />
          <Dropdown
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'available', label: 'Available' },
              { value: 'on-trip', label: 'On Trip' },
              { value: 'maintenance', label: 'Maintenance' },
            ]}
            className="min-w-[200px] h-[44px] w-full md:w-auto mb-0"
            style={{ marginBottom: 0 }}
          />
        </div>
        {loading ? (
          <Loader className="my-10" />
        ) : error ? (
          <div className="text-red-500 p-6">{error}</div>
        ) : (
          <Table
            columns={[
              { label: 'Model', accessor: 'name', render: (v, row) => (
                <Link to={`/vehicles/${row._id}`} className="text-blue-700 hover:underline font-semibold">{v}</Link>
              ) },
              { label: 'Number', accessor: 'numberPlate' },
              { label: 'Type', accessor: 'vehicleType' },
              { label: 'Driver', accessor: 'driverName' },
              { label: 'Status', accessor: 'status' },
              { label: 'Photo', accessor: 'photoUrl', render: v => v ? <img src={v} alt="Vehicle" className="h-10 w-16 object-cover rounded" /> : '-' },
            ]}
            data={filteredVehicles.map(v => ({
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