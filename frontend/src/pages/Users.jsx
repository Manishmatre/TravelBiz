import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

const Users = () => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'agent' });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  const [inviteSuccess, setInviteSuccess] = useState(null);

  // Fetch users in agency
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch users');
      }
      setLoading(false);
    };
    if (token) fetchUsers();
  }, [token]);

  // Invite user handler
  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteError(null);
    setInviteSuccess(null);
    try {
      const res = await axios.post(
        `${API_URL}/users/invite`,
        inviteForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInviteSuccess('User invited successfully!');
      setUsers((prev) => [...prev, res.data.user]);
      setInviteForm({ name: '', email: '', role: 'agent' });
    } catch (err) {
      setInviteError(err.response?.data?.message || 'Failed to invite user');
    }
    setInviteLoading(false);
  };

  // Remove user handler
  const handleRemove = async (id) => {
    if (!window.confirm('Remove this user from your agency?')) return;
    try {
      await axios.delete(`${API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove user');
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white bg-opacity-80 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Agency Users</h2>
      {loading ? (
        <div>Loading users...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <table className="w-full mb-6 border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b">
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2 capitalize">{u.role}</td>
                <td className="p-2">
                  {user.role === 'admin' && user.id !== u._id && (
                    <button
                      className="text-red-600 hover:underline mr-2"
                      onClick={() => handleRemove(u._id)}
                    >
                      Remove
                    </button>
                  )}
                  {user.id === u._id && <span className="text-gray-400">(You)</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {user.role === 'admin' && (
        <form onSubmit={handleInvite} className="bg-gray-50 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Invite New User</h3>
          {inviteError && <div className="text-red-500 mb-2">{inviteError}</div>}
          {inviteSuccess && <div className="text-green-600 mb-2">{inviteSuccess}</div>}
          <div className="flex flex-col md:flex-row gap-2 mb-2">
            <input
              type="text"
              placeholder="Name"
              className="border p-2 rounded flex-1"
              value={inviteForm.name}
              onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="border p-2 rounded flex-1"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              required
            />
            <select
              className="border p-2 rounded flex-1"
              value={inviteForm.role}
              onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
            >
              <option value="agent">Agent</option>
              <option value="driver">Driver</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={inviteLoading}
          >
            {inviteLoading ? 'Inviting...' : 'Invite User'}
          </button>
        </form>
      )}
    </div>
  );
};

export default Users;
