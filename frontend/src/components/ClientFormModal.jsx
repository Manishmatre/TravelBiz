import React, { useState, useEffect } from 'react';
import Input from './common/Input';
import Button from './common/Button';
import Dropdown from './common/Dropdown';
import { getUsers } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

function ClientFormModal({ open, onClose, onSubmit, initialData }) {
  const { token } = useAuth ? useAuth() : { token: localStorage.getItem('token') };
  const [form, setForm] = useState({
    name: '',
    email: '',
    passportNumber: '',
    nationality: '',
    phone: '',
    emergencyContact: { name: '', phone: '', relation: '' },
    assignedAgent: '',
    notes: '',
    status: 'Active',
    avatar: null,
  });
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) setForm({
      ...initialData,
      emergencyContact: initialData.emergencyContact || { name: '', phone: '', relation: '' },
      assignedAgent: initialData.assignedAgent?._id || '',
      avatar: null,
    });
    else setForm({ name: '', email: '', passportNumber: '', nationality: '', phone: '', emergencyContact: { name: '', phone: '', relation: '' }, assignedAgent: '', notes: '', status: 'Active', avatar: null });
  }, [initialData, open]);

  useEffect(() => {
    if (token) getUsers({ role: 'agent' }, token).then(setAgents);
  }, [token]);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name.startsWith('emergencyContact.')) {
      const key = name.split('.')[1];
      setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, [key]: value } }));
    } else if (name === 'avatar') {
      setForm(f => ({ ...f, avatar: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.passportNumber || !form.nationality) {
      setError('Name, email, passport number, and nationality are required');
      return;
    }
    setError('');
    onSubmit(form);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl">&times;</button>
        <h2 className="text-xl font-bold mb-4">{initialData ? 'Edit Client' : 'Add Client'}</h2>
        {error && <div className="mb-2 text-red-500">{error}</div>}
        <form onSubmit={handleSubmit}>
          <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
          <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
          <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
          <Input label="Passport Number" name="passportNumber" value={form.passportNumber} onChange={handleChange} required />
          <Dropdown label="Nationality" name="nationality" value={form.nationality} onChange={handleChange} options={[
            { value: '', label: 'Select Nationality' },
            { value: 'Indian', label: 'Indian' },
            { value: 'American', label: 'American' },
            { value: 'British', label: 'British' },
            { value: 'Other', label: 'Other' },
          ]} className="w-full" required />
          <Dropdown label="Status" name="status" value={form.status} onChange={handleChange} options={[
            { value: 'Active', label: 'Active' },
            { value: 'Inactive', label: 'Inactive' },
          ]} className="w-full" required />
          <Dropdown label="Assigned Agent" name="assignedAgent" value={form.assignedAgent} onChange={handleChange} options={[
            { value: '', label: 'Select Agent' },
            ...agents.map(a => ({ value: a._id, label: a.name }))
          ]} className="w-full" />
          <Input label="Emergency Contact Name" name="emergencyContact.name" value={form.emergencyContact?.name || ''} onChange={handleChange} />
          <Input label="Emergency Contact Phone" name="emergencyContact.phone" value={form.emergencyContact?.phone || ''} onChange={handleChange} />
          <Input label="Emergency Contact Relation" name="emergencyContact.relation" value={form.emergencyContact?.relation || ''} onChange={handleChange} />
          <Input label="Notes" name="notes" value={form.notes} onChange={handleChange} />
          <input type="file" name="avatar" accept="image/*" onChange={handleChange} className="w-full mt-2" />
          <Button type="submit" color="primary" className="w-full mt-2">
            {initialData ? 'Update' : 'Add'} Client
          </Button>
        </form>
      </div>
    </div>
  );
}

export default ClientFormModal; 