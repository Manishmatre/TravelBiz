import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import StatCard from '../components/common/StatCard';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { getVehicles, addVehicleAssignment, updateVehicleAssignment, deleteVehicleAssignment } from '../services/vehicleService';
import { FaUserTie, FaCheckCircle, FaExclamationTriangle, FaEdit, FaTrash } from 'react-icons/fa';
import Dropdown from '../components/common/Dropdown';
import SearchInput from '../components/common/SearchInput';

const tableColumns = [
  { label: 'Vehicle', accessor: 'vehicleName' },
  { label: 'Driver', accessor: 'driver', render: v => v && v.name ? v.name : '-' },
  { label: 'Status', accessor: 'status' },
  { label: 'Assignment Date', accessor: 'assignedAt', render: v => v ? new Date(v).toLocaleDateString() : '-' },
];

function VehicleAssignments() {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [form, setForm] = useState({ vehicleId: '', driver: '', status: 'Assigned', assignedAt: '' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const vehiclesRes = await getVehicles(token);
      setVehicles(vehiclesRes);
      // Flatten all assignments with vehicle info
      const allAssign = vehiclesRes.flatMap(vehicle =>
        (vehicle.assignments || []).map(a => ({
          ...a,
          vehicleName: vehicle.name,
          vehicleId: vehicle._id,
          numberPlate: vehicle.numberPlate,
        }))
      );
      setData(allAssign);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleOpenModal = (record = null) => {
    setEditRecord(record);
    setForm(record ? {
      vehicleId: record.vehicleId,
      driver: record.driver?._id || record.driver || '',
      status: record.status || 'Assigned',
      assignedAt: record.assignedAt ? record.assignedAt.slice(0, 10) : '',
    } : { vehicleId: '', driver: '', status: 'Assigned', assignedAt: '' });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditRecord(null);
    setForm({ vehicleId: '', driver: '', status: 'Assigned', assignedAt: '' });
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
      // Compose assignment data
      const payload = {
        driver: form.driver,
        status: form.status,
        assignedAt: form.assignedAt,
      };
      if (editRecord) {
        await updateVehicleAssignment(form.vehicleId, editRecord._id, payload, token);
      } else {
        await addVehicleAssignment(form.vehicleId, payload, token);
      }
      await fetchData();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save assignment');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async record => {
    if (!window.confirm('Delete this assignment?')) return;
    setSaving(true);
    try {
      await deleteVehicleAssignment(record.vehicleId, record._id, token);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete assignment');
    } finally {
      setSaving(false);
    }
  };

  // Stat cards
  const total = data.length;
  const assigned = data.filter(a => a.status === 'Assigned').length;
  const unassigned = total - assigned;
  const stats = [
    { label: 'Total Assignments', value: total, icon: <FaUserTie />, accentColor: 'blue' },
    { label: 'Assigned', value: assigned, icon: <FaCheckCircle />, accentColor: 'green' },
    { label: 'Unassigned', value: unassigned, icon: <FaExclamationTriangle />, accentColor: 'red' },
  ];

  // Collect all unique drivers from vehicles for the driver selector
  const allDrivers = Array.from(new Set(
    vehicles.flatMap(v => v.assignments?.map(a => a.driver && a.driver._id ? JSON.stringify({ _id: a.driver._id, name: a.driver.name }) : null)).filter(Boolean)
  )).map(str => JSON.parse(str));

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

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">All Vehicle Assignments</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map(stat => (
          <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} accentColor={stat.accentColor} />
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xl font-bold">All Assignments</div>
          <Button color="primary" size="sm" onClick={() => handleOpenModal()}>Add Assignment</Button>
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
              { value: 'Assigned', label: 'Assigned' },
              { value: 'Unassigned', label: 'Unassigned' },
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
      <Modal open={modalOpen} onClose={handleCloseModal} title={editRecord ? 'Edit Assignment' : 'Add Assignment'}>
        {/* Show error message inside modal if present */}
        {error && (
          <div className="mb-3 text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 text-sm font-semibold">{error}</div>
        )}
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
          <div className="mb-2">
            <label className="block mb-1 font-semibold text-gray-700">Driver</label>
            <select name="driver" value={form.driver} onChange={handleChange} required className="w-full rounded-xl border border-gray-200 bg-white/70 shadow-sm px-4 py-2">
              <option value="">Select driver</option>
              {allDrivers.map(d => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-2">
            <label className="block mb-1 font-semibold text-gray-700">Status</label>
            <select name="status" value={form.status} onChange={handleChange} required className="w-full rounded-xl border border-gray-200 bg-white/70 shadow-sm px-4 py-2">
              <option value="Assigned">Assigned</option>
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>
          <Input label="Assignment Date" name="assignedAt" type="date" value={form.assignedAt} onChange={handleChange} required />
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" color="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" color="primary" disabled={saving}>{saving ? 'Saving...' : (editRecord ? 'Update' : 'Add')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default VehicleAssignments; 