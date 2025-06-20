import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import StatCard from '../components/common/StatCard';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { getVehicles, addVehicleFuelLog, updateVehicleFuelLog, deleteVehicleFuelLog } from '../services/vehicleService';
import { FaGasPump, FaChartLine, FaExclamationTriangle, FaEdit, FaTrash } from 'react-icons/fa';
import Dropdown from '../components/common/Dropdown';
import SearchInput from '../components/common/SearchInput';

const tableColumns = [
  { label: 'Vehicle', accessor: 'vehicleName' },
  { label: 'Date', accessor: 'date', render: v => v ? new Date(v).toLocaleDateString() : '-' },
  { label: 'Fuel (L)', accessor: 'fuel' },
  { label: 'Cost', accessor: 'cost', render: v => v ? `$${v}` : '-' },
  { label: 'Mileage', accessor: 'mileage' },
];

function VehicleFuel() {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editLog, setEditLog] = useState(null);
  const [form, setForm] = useState({ vehicleId: '', date: '', fuel: '', cost: '', mileage: '' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const vehiclesRes = await getVehicles(token);
      setVehicles(vehiclesRes);
      // Flatten all fuel logs with vehicle info
      const allFuel = vehiclesRes.flatMap(vehicle =>
        (vehicle.fuelLogs || []).map(f => ({
          ...f,
          vehicleName: vehicle.name,
          vehicleId: vehicle._id,
          numberPlate: vehicle.numberPlate,
        }))
      );
      setData(allFuel);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load fuel logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleOpenModal = (log = null) => {
    setEditLog(log);
    setForm(log ? {
      vehicleId: log.vehicleId,
      date: log.date ? log.date.slice(0, 10) : '',
      fuel: log.fuel || '',
      cost: log.cost || '',
      mileage: log.mileage || '',
    } : { vehicleId: '', date: '', fuel: '', cost: '', mileage: '' });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditLog(null);
    setForm({ vehicleId: '', date: '', fuel: '', cost: '', mileage: '' });
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!form.vehicleId) throw new Error('Please select a vehicle');
      if (editLog) {
        await updateVehicleFuelLog(form.vehicleId, editLog._id, form, token);
      } else {
        await addVehicleFuelLog(form.vehicleId, form, token);
      }
      await fetchData();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save fuel log');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async log => {
    if (!window.confirm('Delete this fuel log?')) return;
    setSaving(true);
    try {
      await deleteVehicleFuelLog(log.vehicleId, log._id, token);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete fuel log');
    } finally {
      setSaving(false);
    }
  };

  // Stat cards
  const total = data.length;
  const avgMileage = data.length ? (data.reduce((sum, l) => sum + (l.mileage || 0), 0) / data.length).toFixed(2) : '-';
  const fuelAlerts = data.filter(l => l.mileage && l.mileage < 10).length;
  const stats = [
    { label: 'Total Fuel Logs', value: total, icon: <FaGasPump />, accentColor: 'blue' },
    { label: 'Avg Mileage', value: avgMileage !== '-' ? `${avgMileage} km/l` : '-', icon: <FaChartLine />, accentColor: 'green' },
    { label: 'Fuel Alerts', value: fuelAlerts, icon: <FaExclamationTriangle />, accentColor: 'red' },
  ];

  // Filtering logic
  const filteredData = data.filter(row => {
    const matchesVehicle = vehicleFilter ? row.vehicleId === vehicleFilter : true;
    const matchesSearch = search
      ? Object.values(row).some(val =>
          val && val.toString().toLowerCase().includes(search.toLowerCase())
        )
      : true;
    return matchesVehicle && matchesSearch;
  });

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">All Vehicle Fuel Logs</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map(stat => (
          <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} accentColor={stat.accentColor} />
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xl font-bold">All Fuel Logs</div>
          <Button color="primary" size="sm" onClick={() => handleOpenModal()}>Add Fuel Log</Button>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <SearchInput
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search any field..."
            className="w-full h-[44px]"
            style={{ marginBottom: 0 }}
          />
          <Dropdown
            value={vehicleFilter}
            onChange={e => setVehicleFilter(e.target.value)}
            options={[{ value: '', label: 'All Vehicles' }, ...vehicles.map(v => ({ value: v._id, label: `${v.name} (${v.numberPlate})` }))]}
            className="min-w-[200px] h-[44px] w-full md:w-auto mb-0"
            style={{ marginBottom: 0 }}
          />
        </div>
        {loading ? <Loader /> : error ? <div className="text-red-500">{error}</div> : (
          <Table
            columns={tableColumns}
            data={filteredData}
            actions={log => (
              <>
                <Button color="secondary" size="sm" className="mr-2" onClick={() => handleOpenModal(log)}><FaEdit /></Button>
                <Button color="danger" size="sm" onClick={() => handleDelete(log)}><FaTrash /></Button>
              </>
            )}
          />
        )}
      </div>
      <Modal open={modalOpen} onClose={handleCloseModal} title={editLog ? 'Edit Fuel Log' : 'Add Fuel Log'}>
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="mb-2">
            <label className="block mb-1 font-semibold text-gray-700">Vehicle</label>
            <select name="vehicleId" value={form.vehicleId} onChange={handleChange} required className="w-full rounded-xl border border-gray-200 bg-white/70 shadow-sm px-4 py-2">
              <option value="">Select vehicle</option>
              {vehicles.map(v => (
                <option key={v._id} value={v._id}>{v.name} ({v.numberPlate})</option>
              ))}
            </select>
          </div>
          <Input label="Date" name="date" type="date" value={form.date} onChange={handleChange} required />
          <Input label="Fuel (L)" name="fuel" type="number" value={form.fuel} onChange={handleChange} required min="0" step="0.01" />
          <Input label="Cost" name="cost" type="number" value={form.cost} onChange={handleChange} min="0" step="0.01" />
          <Input label="Mileage" name="mileage" type="number" value={form.mileage} onChange={handleChange} min="0" step="0.01" />
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" color="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" color="primary" disabled={saving}>{saving ? 'Saving...' : (editLog ? 'Update' : 'Add')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default VehicleFuel; 