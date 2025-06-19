import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAgency } from '../services/agencyService';
import Loader from '../components/common/Loader';
import { useAuth } from '../contexts/AuthContext';

export default function AgencyInfoForm() {
  const [form, setForm] = useState({ name: '', address: '', phone: '', website: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { token, reloadUser } = useAuth();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createAgency(form, token);
      await reloadUser();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create agency');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <form className="bg-white/80 rounded-2xl shadow-lg p-8 w-full max-w-lg" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6 text-center">Tell us about your agency</h2>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Agency Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Address</label>
          <input type="text" name="address" value={form.address} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Phone</label>
          <input type="text" name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Website</label>
          <input type="text" name="website" value={form.website} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-xl font-semibold shadow hover:bg-blue-700 transition-all" disabled={loading}>
          {loading ? <Loader /> : 'Continue'}
        </button>
      </form>
    </div>
  );
}
