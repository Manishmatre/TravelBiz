import React, { useState, useEffect } from 'react';

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl">&times;</button>
        <h2 className="text-xl font-bold mb-4">{initialData ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
        {error && <div className="mb-2 text-red-500">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block mb-1 font-medium">Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div className="mb-3">
            <label className="block mb-1 font-medium">Vehicle Type</label>
            <input name="vehicleType" value={form.vehicleType} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div className="mb-3">
            <label className="block mb-1 font-medium">Number Plate</label>
            <input name="numberPlate" value={form.numberPlate} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div className="mb-3">
            <label className="block mb-1 font-medium">Insurance Expiry</label>
            <input name="insuranceExpiry" type="date" value={form.insuranceExpiry?.slice(0, 10) || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div className="mb-3">
            <label className="block mb-1 font-medium">Driver Name</label>
            <input name="driverName" value={form.driverName} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="mb-3">
            <label className="block mb-1 font-medium">Driver Contact</label>
            <input name="driverContact" value={form.driverContact} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="mb-3">
            <label className="block mb-1 font-medium">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded px-3 py-2" required>
              <option value="available">Available</option>
              <option value="on-trip">On Trip</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Photo</label>
            <input name="photo" type="file" onChange={handleChange} className="w-full" accept="image/*" />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">
            {initialData ? 'Update' : 'Add'} Vehicle
          </button>
        </form>
      </div>
    </div>
  );
}

export default VehicleFormModal; 