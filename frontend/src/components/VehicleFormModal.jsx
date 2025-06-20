import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';
import Input from './common/Input';
import Button from './common/Button';

function VehicleFormModal({ open, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState({
    name: '',
    vehicleType: '',
    numberPlate: '',
    insuranceExpiry: '',
    driverName: '',
    driverContact: '',
    status: 'available',
    photo: null,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) setForm({ ...initialData, photo: null });
    else setForm({ name: '', vehicleType: '', numberPlate: '', insuranceExpiry: '', driverName: '', driverContact: '', status: 'available', photo: null });
  }, [initialData, open]);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'photo') {
      setForm({ ...form, photo: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name || !form.vehicleType || !form.numberPlate || !form.insuranceExpiry || !form.status) {
      setError('All required fields must be filled');
      return;
    }
    setError('');
    onSubmit(form);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? 'Edit Vehicle' : 'Add Vehicle'}
      overlayClassName="bg-black/10 backdrop-blur-sm"
      cardClassName="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative"
    >
        {error && <div className="mb-2 text-red-500">{error}</div>}
        <form onSubmit={handleSubmit}>
        <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
        <Input label="Vehicle Type" name="vehicleType" value={form.vehicleType} onChange={handleChange} required />
        <Input label="Number Plate" name="numberPlate" value={form.numberPlate} onChange={handleChange} required />
        <Input label="Insurance Expiry" name="insuranceExpiry" type="date" value={form.insuranceExpiry?.slice(0, 10) || ''} onChange={handleChange} required />
        <Input label="Driver Name" name="driverName" value={form.driverName} onChange={handleChange} />
        <Input label="Driver Contact" name="driverContact" value={form.driverContact} onChange={handleChange} />
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="w-full rounded-xl border border-gray-200 bg-white/70 shadow-sm px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition">
              <option value="available">Available</option>
              <option value="on-trip">On Trip</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">Photo</label>
            <input name="photo" type="file" onChange={handleChange} className="w-full" accept="image/*" />
          </div>
        <Button type="submit" color="primary" className="w-full mt-2">
            {initialData ? 'Update' : 'Add'} Vehicle
        </Button>
        </form>
    </Modal>
  );
}

export default VehicleFormModal; 