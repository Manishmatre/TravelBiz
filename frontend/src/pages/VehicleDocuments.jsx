import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import StatCard from '../components/common/StatCard';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { getVehicles, uploadVehicleDocument, deleteVehicleDocument } from '../services/vehicleService';
import { FaFileAlt, FaExclamationTriangle, FaCheckCircle, FaTrash } from 'react-icons/fa';
import Dropdown from '../components/common/Dropdown';
import SearchInput from '../components/common/SearchInput';

const tableColumns = [
  { label: 'Vehicle', accessor: 'vehicleName' },
  { label: 'Type', accessor: 'type' },
  { label: 'Expiry', accessor: 'expiryDate', render: v => v ? new Date(v).toLocaleDateString() : '-' },
  { label: 'Status', accessor: 'expiryDate', key: 'status', render: v => {
    if (!v) return '-';
    const days = Math.ceil((new Date(v) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return <span className="text-red-600 font-bold">Expired</span>;
    if (days <= 30) return <span className="text-orange-600 font-bold">Expiring</span>;
    return <span className="text-green-600 font-bold">Valid</span>;
  } },
  { label: 'File', accessor: 'fileUrl', render: v => v ? <a href={v} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a> : '-' },
  { label: 'Notes', accessor: 'notes' },
];

function VehicleDocuments() {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ vehicleId: '', type: '', expiryDate: '', notes: '', file: null });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const vehiclesRes = await getVehicles(token);
      setVehicles(vehiclesRes);
      // Flatten all documents with vehicle info
      const allDocs = vehiclesRes.flatMap(vehicle =>
        (vehicle.documents || []).map(d => ({
          ...d,
          vehicleName: vehicle.name,
          vehicleId: vehicle._id,
          numberPlate: vehicle.numberPlate,
        }))
      );
      setData(allDocs);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load documents');
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
    const matchesType = typeFilter ? row.type === typeFilter : true;
    const matchesSearch = search
      ? Object.values(row).some(val =>
          val && val.toString().toLowerCase().includes(search.toLowerCase())
        )
      : true;
    return matchesVehicle && matchesType && matchesSearch;
  });

  const handleOpenModal = () => {
    setForm({ vehicleId: '', type: '', expiryDate: '', notes: '', file: null });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setForm({ vehicleId: '', type: '', expiryDate: '', notes: '', file: null });
  };

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setForm(f => ({ ...f, file: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!form.vehicleId) throw new Error('Please select a vehicle');
      if (!form.file) throw new Error('Please select a file');
      const payload = {
        type: form.type,
        expiryDate: form.expiryDate,
        notes: form.notes,
        file: form.file,
      };
      await uploadVehicleDocument(form.vehicleId, payload, token);
      await fetchData();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to upload document');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async doc => {
    if (!window.confirm('Delete this document?')) return;
    setSaving(true);
    try {
      await deleteVehicleDocument(doc.vehicleId, doc._id, token);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete document');
    } finally {
      setSaving(false);
    }
  };

  // Stat cards
  const total = filteredData.length;
  const expiring = filteredData.filter(d => d.expiryDate && Math.ceil((new Date(d.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)) <= 30 && Math.ceil((new Date(d.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)) >= 0).length;
  const expired = filteredData.filter(d => d.expiryDate && Math.ceil((new Date(d.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)) < 0).length;
  const valid = total - expiring - expired;
  const stats = [
    { label: 'Total Documents', value: total, icon: <FaFileAlt />, accentColor: 'blue' },
    { label: 'Expiring Soon', value: expiring, icon: <FaExclamationTriangle />, accentColor: 'orange' },
    { label: 'Expired', value: expired, icon: <FaExclamationTriangle />, accentColor: 'red' },
    { label: 'Valid', value: valid, icon: <FaCheckCircle />, accentColor: 'green' },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">All Vehicle Documents</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} accentColor={stat.accentColor} />
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xl font-bold">All Documents</div>
          <Button color="primary" size="sm" onClick={handleOpenModal}>Add Document</Button>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <SearchInput
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search any field..."
            className="w-full h-[44px]"
            style={{ marginBottom: 0 }}
          />
          <button
            type="button"
            className="md:hidden bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold shadow hover:bg-blue-700 transition-all h-[44px]"
            onClick={() => setShowFilters(f => !f)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          {showFilters && (
            <>
              <Dropdown
                value={vehicleFilter}
                onChange={e => setVehicleFilter(e.target.value)}
                options={[{ value: '', label: 'All Vehicles' }, ...vehicles.map(v => ({ value: v._id, label: `${v.name} (${v.numberPlate})` }))]}
                className="min-w-[200px] h-[44px] w-full md:w-auto mb-0"
                style={{ marginBottom: 0 }}
              />
              <Dropdown
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Types' },
                  ...Array.from(new Set(data.map(d => d.type))).filter(Boolean).map(type => ({ value: type, label: type }))
                ]}
                className="min-w-[160px] h-[44px] w-full md:w-auto mb-0"
                style={{ marginBottom: 0 }}
              />
            </>
          )}
        </div>
        {loading ? <Loader /> : error ? <div className="text-red-500">{error}</div> : (
          <Table
            columns={tableColumns}
            data={filteredData}
            actions={doc => (
              <Button color="danger" size="sm" onClick={() => handleDelete(doc)}><FaTrash /></Button>
            )}
          />
        )}
      </div>
      <Modal open={modalOpen} onClose={handleCloseModal} title="Add Document">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="mb-2">
            <select name="vehicleId" value={form.vehicleId} onChange={handleChange} required className="w-full rounded-xl border border-gray-200 bg-white/70 shadow-sm px-4 py-2">
              <option value="">Select vehicle</option>
              {vehicles.map(v => (
                <option key={v._id} value={v._id}>{v.name} ({v.numberPlate})</option>
              ))}
            </select>
          </div>
          <Input label="Type" name="type" value={form.type} onChange={handleChange} required />
          <Input label="Expiry Date" name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange} />
          <Input label="Notes" name="notes" value={form.notes} onChange={handleChange} />
          <div className="mb-2">
            <input name="file" type="file" onChange={handleChange} required className="w-full" />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" color="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" color="primary" disabled={saving}>{saving ? 'Saving...' : 'Add'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default VehicleDocuments; 