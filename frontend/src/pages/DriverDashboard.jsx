import React, { useEffect, useState } from 'react';
import StatCard from '../components/common/StatCard';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import SearchInput from '../components/common/SearchInput';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Dropdown from '../components/common/Dropdown';
import { getUsers, inviteUser, updateUser } from '../services/userService';
import { getVehicles } from '../services/vehicleService';
import { FaUserTie, FaUserCheck, FaUserTimes, FaIdCard } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

function DriverDashboard() {
  const { token } = useAuth ? useAuth() : { token: localStorage.getItem('token') };
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editDriver, setEditDriver] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: '',
    assignedVehicle: '',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const fetchDrivers = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getUsers({ role: 'driver' }, token);
        setDrivers(data);
      } catch (err) {
        setError('Failed to load drivers');
      } finally {
        setLoading(false);
      }
    };
    fetchDrivers();
  }, [token]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await getVehicles(token);
        setVehicles(data);
      } catch (err) {
        setVehicles([]);
      }
    };
    if (modalOpen) fetchVehicles();
  }, [modalOpen, token]);

  // Analytics calculations
  const totalDrivers = drivers.length;
  const assignedDrivers = drivers.filter(d => d.assignedVehicle).length;
  const unassignedDrivers = totalDrivers - assignedDrivers;
  const expiringSoon = drivers.filter(d => {
    if (!d.licenseExpiry) return false;
    const expiry = new Date(d.licenseExpiry);
    const now = new Date();
    const diff = (expiry - now) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  }).length;

  const filteredDrivers = drivers
    .filter(d => d.role === 'driver')
    .filter(d =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase())
    );

  const handleOpenModal = (driver = null) => {
    if (driver) {
      setEditDriver(driver);
      setForm({
        name: driver.name || '',
        email: driver.email || '',
        phone: driver.phone || '',
        licenseNumber: driver.licenseNumber || '',
        licenseExpiry: driver.licenseExpiry ? driver.licenseExpiry.slice(0, 10) : '',
        assignedVehicle: driver.assignedVehicle?._id || '',
      });
    } else {
      setEditDriver(null);
      setForm({ name: '', email: '', phone: '', licenseNumber: '', licenseExpiry: '', assignedVehicle: '' });
    }
    setFormError('');
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setFormError('');
  };
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    if (!form.name || !form.email) {
      setFormError('Name and email are required');
      setSaving(false);
      return;
    }
    try {
      if (!editDriver) {
        await inviteUser({
          ...form,
          role: 'driver',
          assignedVehicle: form.assignedVehicle || undefined,
        }, token);
      } else {
        await updateUser(editDriver._id, {
          ...form,
          assignedVehicle: form.assignedVehicle || undefined,
        }, token);
      }
      // Refresh driver list
      const data = await getUsers({ role: 'driver' }, token);
      setDrivers(data);
      setModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save driver');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Driver Management Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<FaUserTie />} label="Total Drivers" value={totalDrivers} />
        <StatCard icon={<FaUserCheck />} label="Assigned" value={assignedDrivers} />
        <StatCard icon={<FaUserTimes />} label="Unassigned" value={unassignedDrivers} />
        <StatCard icon={<FaIdCard />} label="Expiring Licenses (30d)" value={expiringSoon} />
      </div>
      {/* Placeholder for charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-6 min-h-[200px] flex items-center justify-center text-gray-400">[Driver Status Chart Placeholder]</div>
        <div className="bg-white rounded-xl shadow p-6 min-h-[200px] flex items-center justify-center text-gray-400">[License Expiry Timeline Placeholder]</div>
      </div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-bold text-gray-800">All Drivers</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <SearchInput
            placeholder="Search drivers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full md:w-64"
          />
          <Button color="primary" size="md" onClick={() => handleOpenModal()}>
            + Add Driver
          </Button>
        </div>
      </div>
      <Modal open={modalOpen} onClose={handleCloseModal} title={editDriver ? 'Edit Driver' : 'Add Driver'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
          <Input label="Email" name="email" value={form.email} onChange={handleChange} required type="email" />
          <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
          <Input label="License Number" name="licenseNumber" value={form.licenseNumber} onChange={handleChange} />
          <Input label="License Expiry" name="licenseExpiry" value={form.licenseExpiry} onChange={handleChange} type="date" />
          <Dropdown
            label="Assigned Vehicle"
            name="assignedVehicle"
            value={form.assignedVehicle}
            onChange={handleChange}
            options={[{ value: '', label: 'None' }, ...vehicles.map(v => ({ value: v._id, label: v.numberPlate }))]}
          />
          {formError && <div className="text-red-500 text-sm">{formError}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" color="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" color="primary" disabled={saving}>{saving ? 'Saving...' : (editDriver ? 'Update Driver' : 'Add Driver')}</Button>
          </div>
        </form>
      </Modal>
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : error ? (
        <div className="text-red-500 py-10">{error}</div>
      ) : (
        <Table
          columns={[
            { label: 'Name', accessor: 'name' },
            { label: 'Email', accessor: 'email' },
            { label: 'Phone', accessor: 'phone' },
            { label: 'License #', accessor: 'licenseNumber' },
            { label: 'License Expiry', accessor: 'licenseExpiry', render: v => v ? new Date(v).toLocaleDateString() : '-' },
            { label: 'Assigned Vehicle', accessor: 'assignedVehicle', render: v => v ? `${v.numberPlate || '-'}${v.name ? ' (' + v.name + ')' : ''}` : '-' },
            { label: 'Status', accessor: 'status', render: v => v || '-' },
            { label: 'Documents', accessor: 'documents', render: docs => docs && docs.length > 0 ? `${docs.length} | View` : 'None' },
            { label: 'Joining Date', accessor: 'joiningDate', render: v => v ? new Date(v).toLocaleDateString() : '-' },
            { label: 'Gender', accessor: 'gender', render: v => v || '-' },
            { label: 'City', accessor: 'addressCity', render: driver => driver && driver.address && driver.address.city ? driver.address.city : '-' },
            { label: 'State', accessor: 'addressState', render: driver => driver && driver.address && driver.address.state ? driver.address.state : '-' },
          ]}
          data={filteredDrivers}
          actions={driver => (
            <Button color="secondary" size="sm" onClick={() => handleOpenModal(driver)}>Edit</Button>
          )}
        />
      )}
    </div>
  );
}

export default DriverDashboard; 