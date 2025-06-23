import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../../components/common/StatCard';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { getVehicles, addVehicleMaintenance, updateVehicleMaintenance, deleteVehicleMaintenance } from '../../services/vehicleService';
import { FaTools, FaCalendarCheck, FaExclamationTriangle, FaEdit, FaTrash } from 'react-icons/fa';
import Dropdown from '../../components/common/Dropdown';
import SearchInput from '../../components/common/SearchInput';

const tableColumns = [
  { label: 'Vehicle', accessor: 'vehicleName' },
  { label: 'Type', accessor: 'type' },
  { label: 'Date', accessor: 'date', render: v => v ? new Date(v).toLocaleDateString() : '-' },
  { label: 'Status', accessor: 'status' },
  { label: 'Cost', accessor: 'cost', render: v => v ? `$${v}` : '-' },
  { label: 'Notes', accessor: 'notes' },
];

function VehicleMaintenance() {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [form, setForm] = useState({ vehicleId: '', type: '', date: '', status: 'Upcoming', cost: '', notes: '' });
  const [saving, setSaving] = useState(false);
  // Search/filter state
  const [search, setSearch] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const vehiclesRes = await getVehicles(token);
      setVehicles(vehiclesRes);
      // Flatten all maintenance records with vehicle info
      const allMaint = vehiclesRes.flatMap(vehicle =>
        (vehicle.maintenance || []).map(m => ({
          ...m,
          vehicleName: vehicle.name,
          vehicleId: vehicle._id,
          numberPlate: vehicle.numberPlate,
        }))
      );
      setData(allMaint);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  // Filtering logic
  const filteredData = data.filter(row => {
    const matchesVehicle = vehicleFilter ? row.vehicleId === vehicleFilter : true;
    const matchesStatus = statusFilter ? row.status === statusFilter : true;
    const matchesSearch = search
      ? Object.values(row).some(val =>
          val && val.toString().toLowerCase().includes(search.toLowerCase())
        )
      : true;
    return matchesVehicle && matchesStatus && matchesSearch;
  });

  const handleOpenModal = (record = null) => {
    setEditRecord(record);
    setForm(record ? {
      vehicleId: record.vehicleId,
      type: record.type || '',
      date: record.date ? record.date.slice(0, 10) : '',
      status: record.status || 'Upcoming',
      cost: record.cost || '',
      notes: record.notes || '',
    } : { vehicleId: '', type: '', date: '', status: 'Upcoming', cost: '', notes: '' });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditRecord(null);
    setForm({ vehicleId: '', type: '', date: '', status: 'Upcoming', cost: '', notes: '' });
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
      if (editRecord) {
        await updateVehicleMaintenance(form.vehicleId, editRecord._id, form, token);
      } else {
        await addVehicleMaintenance(form.vehicleId, form, token);
      }
      await fetchData();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save maintenance record');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async record => {
    if (!window.confirm('Delete this maintenance record?')) return;
    setSaving(true);
    try {
      await deleteVehicleMaintenance(record.vehicleId, record._id, token);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete maintenance record');
    } finally {
      setSaving(false);
    }
  };

  // Stat cards
  const total = filteredData.length;
  const upcoming = filteredData.filter(r => r.status === 'Upcoming').length;
  const overdue = filteredData.filter(r => r.status === 'Overdue').length;
  const stats = [
    { label: 'Total Maintenance', value: total, icon: <FaTools />, accentColor: 'blue' },
    { label: 'Upcoming', value: upcoming, icon: <FaCalendarCheck />, accentColor: 'green' },
    { label: 'Overdue', value: overdue, icon: <FaExclamationTriangle />, accentColor: 'red' },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">All Vehicle Maintenance</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map(stat => (
          <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} accentColor={stat.accentColor} />
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xl font-bold">All Maintenance Records</div>
          <Button color="primary" size="sm" onClick={() => handleOpenModal()}>Add Maintenance</Button>
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
          <Dropdown
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'Upcoming', label: 'Upcoming' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Overdue', label: 'Overdue' },
            ]}
            className="min-w-[140px] h-[44px] w-full md:w-auto mb-0"
            style={{ marginBottom: 0 }}
          />
        </div>
        {loading ? <Loader /> : error ? <div className="text-red-500">{error}</div> : (
          <Table
            columns={tableColumns}
            data={filteredData}
            actions={record => (
              <>
                <Button color="secondary" size="sm" className="mr-2" onClick={() => handleOpenModal(record)}><FaEdit /></Button>
                <Button color="danger" size="sm" onClick={() => handleDelete(record)}><FaTrash /></Button>
              </>
            )}
          />
        )}
      </div>
      <Modal open={modalOpen} onClose={handleCloseModal} title={editRecord ? 'Edit Maintenance' : 'Add Maintenance'}>
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
          <Input label="Type" name="type" value={form.type} onChange={handleChange} required />
          <Input label="Date" name="date" type="date" value={form.date} onChange={handleChange} required />
          <div className="mb-2">
            <label className="block mb-1 font-semibold text-gray-700">Status</label>
            <select name="status" value={form.status} onChange={handleChange} required className="w-full rounded-xl border border-gray-200 bg-white/70 shadow-sm px-4 py-2">
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
          <Input label="Cost" name="cost" type="number" value={form.cost} onChange={handleChange} min="0" step="0.01" />
          <Input label="Notes" name="notes" value={form.notes} onChange={handleChange} />
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" color="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" color="primary" disabled={saving}>{saving ? 'Saving...' : (editRecord ? 'Update' : 'Add')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default VehicleMaintenance; 