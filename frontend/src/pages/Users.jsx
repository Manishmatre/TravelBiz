import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUsers, removeUser } from '../services/userService';
import StatCard from '../components/common/StatCard';
import Loader from '../components/common/Loader';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Dropdown from '../components/common/Dropdown';
import SearchInput from '../components/common/SearchInput';
import { FaUsers, FaUserTie, FaUserCog, FaUserPlus } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const Users = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
            onClick={() => navigate('/users/add')}
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
              { 
                label: 'Name', 
                key: 'name',
                render: (row) => (
                  <div className="flex items-center gap-3">
                    <img src={row.avatarUrl || `https://ui-avatars.com/api/?name=${row.name}&background=random`} alt={row.name} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <div className="font-semibold text-gray-800">{row.name || '-'}</div>
                      <div className="text-sm text-gray-500">{row.email || '-'}</div>
                    </div>
                  </div>
                )
              },
              { 
                label: 'Role', 
                key: 'role', 
                render: (row) => <span className="capitalize font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">{row.role}</span> 
              },
              { 
                label: 'Status', 
                key: 'status', 
                render: (row) => (
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    row.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {row.status || 'Active'}
                  </span>
                )
              },
               { 
                label: 'Joined', 
                key: 'createdAt',
                render: (row) => new Date(row.createdAt).toLocaleDateString()
              },
            ]}
            data={filteredUsers}
            actions={(row) => (
              <Button
                color="danger"
                variant="outline"
                size="sm"
                onClick={() => handleRemove(row._id)}
              >
                Remove
              </Button>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default Users;
