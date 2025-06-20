import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUsers, inviteUser, removeUser } from '../services/userService';
import StatCard from '../components/common/StatCard';
import Loader from '../components/common/Loader';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Dropdown from '../components/common/Dropdown';
import SearchInput from '../components/common/SearchInput';
import { FaUsers, FaUserTie, FaUserCog, FaUserPlus } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Users = () => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'agent' });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  const [inviteSuccess, setInviteSuccess] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Fetch users in agency
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUsers({}, token);
        setUsers(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch users');
        toast.error('Failed to fetch users');
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
      const res = await inviteUser(inviteForm, token);
      setInviteSuccess('User invited successfully!');
      setUsers((prev) => [...prev, res.user]);
      setInviteForm({ name: '', email: '', role: 'agent' });
      setModalOpen(false);
      toast.success('User invited successfully!');
    } catch (err) {
      setInviteError(err.response?.data?.message || 'Failed to invite user');
      toast.error('Failed to invite user');
    }
    setInviteLoading(false);
  };

  // Remove user handler
  const handleRemove = async (id) => {
    if (!window.confirm('Remove this user from your agency?')) return;
    try {
      await removeUser(id, token);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success('User removed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove user');
    }
  };

  // Filtering logic
  const filteredUsers = users.filter(u => {
    const matchesSearch = search ? (
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    ) : true;
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  // User statistics
  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const agentUsers = users.filter(u => u.role === 'agent').length;
  const driverUsers = users.filter(u => u.role === 'driver').length;

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Users</h1>
        {user.role === 'admin' && (
          <Button 
            color="primary" 
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2"
          >
            <FaUserPlus /> Invite User
          </Button>
        )}
      </div>

      {/* Dashboard Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<FaUsers />} label="Total Users" value={totalUsers} accentColor="blue" />
        <StatCard icon={<FaUserCog />} label="Admins" value={adminUsers} accentColor="purple" />
        <StatCard icon={<FaUserTie />} label="Agents" value={agentUsers} accentColor="green" />
        <StatCard icon={<FaUserTie />} label="Drivers" value={driverUsers} accentColor="orange" />
      </div>

      {/* Invite User Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Invite New User</h3>
            {inviteError && <div className="text-red-500 mb-4">{inviteError}</div>}
            {inviteSuccess && <div className="text-green-600 mb-4">{inviteSuccess}</div>}
            <form onSubmit={handleInvite}>
              <Input
                label="Name"
                name="name"
                value={inviteForm.name}
                onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                required
              />
              <Dropdown
                label="Role"
                name="role"
                value={inviteForm.role}
                onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                options={[
                  { value: 'agent', label: 'Agent' },
                  { value: 'driver', label: 'Driver' },
                  { value: 'admin', label: 'Admin' },
                ]}
              />
              <div className="flex gap-2 mt-4">
                <Button color="secondary" className="flex-1" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button color="primary" className="flex-1" type="submit" loading={inviteLoading}>
                  Invite User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table or Loader/Error */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <SearchInput
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full h-[44px]"
            style={{ marginBottom: 0 }}
          />
          <Dropdown
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            options={[
              { value: '', label: 'All Roles' },
              { value: 'admin', label: 'Admin' },
              { value: 'agent', label: 'Agent' },
              { value: 'driver', label: 'Driver' },
            ]}
            className="min-w-[200px] h-[44px] w-full md:w-auto mb-0"
            style={{ marginBottom: 0 }}
          />
        </div>
        {loading ? (
          <Loader className="my-10" />
        ) : error ? (
          <div className="text-red-500 p-6">{error}</div>
        ) : (
          <Table
            columns={[
              { label: 'Name', accessor: 'name' },
              { label: 'Email', accessor: 'email' },
              { label: 'Role', accessor: 'role', render: v => <span className="capitalize">{v}</span> },
              { label: 'Status', accessor: 'status', render: v => v || 'Active' },
            ]}
            data={filteredUsers.map(u => ({
              ...u,
              name: u.name || '-',
              email: u.email || '-',
              role: u.role || '-',
            }))}
            actions={userData => (
              <>
                {user.role === 'admin' && user.id !== userData._id && (
                  <Button
                    color="danger"
                    size="sm"
                    onClick={() => handleRemove(userData._id)}
                  >
                    Remove
                  </Button>
                )}
                {user.id === userData._id && (
                  <span className="text-gray-400 text-sm">(You)</span>
                )}
              </>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default Users;
