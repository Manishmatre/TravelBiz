import React, { useEffect, useState } from 'react';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import SearchInput from '../components/common/SearchInput';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Dropdown from '../components/common/Dropdown';
import { Link } from 'react-router-dom';
import { getUsers, inviteUser, updateUser } from '../services/userService';
import { getVehicles } from '../services/vehicleService';
import { useAuth } from '../contexts/AuthContext';

function Drivers() {
  const { token } = useAuth ? useAuth() : { token: localStorage.getItem('token') };
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
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
  const [editDriver, setEditDriver] = useState(null);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <SearchInput
            placeholder="Search drivers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full md:w-64"
          />
          <Button color="primary" size="md" onClick={handleOpenModal}>
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
            { 
              label: 'Driver', 
              key: 'name',
              render: (row) => (
                <div className="flex items-center gap-3">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&background=random`} alt={row.name} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <Link to={`/drivers/${row._id}`} className="text-blue-700 hover:underline font-semibold">
                      {row.name}
                    </Link>
                    <div className="text-sm text-gray-500">{row.email}</div>
                  </div>
                </div>
              )
            },
            { label: 'Phone', key: 'phone' },
            { 
              label: 'License', 
              key: 'license',
              render: (row) => (
                <div>
                  <div>{row.licenseNumber || '-'}</div>
                  <div className="text-xs text-gray-500">
                    Expires: {row.licenseExpiry ? new Date(row.licenseExpiry).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              )
            },
            { 
              label: 'Assigned Vehicle', 
              key: 'assignedVehicle', 
              render: (row) => row.assignedVehicle ? (
                <span className="font-medium">{row.assignedVehicle.name} ({row.assignedVehicle.numberPlate})</span>
              ) : (
                <span className="text-gray-400">None</span>
              )
            },
            { 
              label: 'Status', 
              key: 'status', 
              render: (row) => <span className="capitalize">{row.status || 'Active'}</span> 
            },
          ]}
          data={filteredDrivers}
          actions={driver => (
            <>
              <Button color="secondary" size="sm" className="mr-2" onClick={() => handleOpenModal(driver)}>Edit</Button>
            </>
          )}
        />
      )}
    </div>
  );
}

export default Drivers; 