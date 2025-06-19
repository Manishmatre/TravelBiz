import React, { useState, useEffect } from 'react';
import Input from './common/Input';
import Button from './common/Button';

function ClientFormModal({ open, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    passportNumber: '',
    nationality: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) setForm(initialData);
    else setForm({ name: '', email: '', passportNumber: '', nationality: '' });
  }, [initialData, open]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.passportNumber || !form.nationality) {
      setError('All fields are required');
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
        <h2 className="text-xl font-bold mb-4">{initialData ? 'Edit Client' : 'Add Client'}</h2>
        {error && <div className="mb-2 text-red-500">{error}</div>}
        <form onSubmit={handleSubmit}>
          <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
          <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
          <Input label="Passport Number" name="passportNumber" value={form.passportNumber} onChange={handleChange} required />
          <Input label="Nationality" name="nationality" value={form.nationality} onChange={handleChange} required />
          <Button type="submit" color="primary" className="w-full mt-2">
            {initialData ? 'Update' : 'Add'} Client
          </Button>
        </form>
      </div>
    </div>
  );
}

export default ClientFormModal; 