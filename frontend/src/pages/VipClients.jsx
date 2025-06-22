import React, { useState, useEffect } from 'react';
import { FaStar, FaSearch, FaFilter, FaUserTie, FaPhone, FaEnvelope, FaDollarSign, FaCalendarAlt, FaDownload } from 'react-icons/fa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Table from '../components/common/Table';
import PageHeading from '../components/common/PageHeading';
import { getClients } from '../services/clientService';
import { useAuth } from '../contexts/AuthContext';
import StatCard from '../components/common/StatCard';
import SearchInput from '../components/common/SearchInput';
import Dropdown from '../components/common/Dropdown';

function VipClients() {
  const { token } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getClients(token)
      .then(data => setClients(data.filter(c => c.vipLevel)))
      .finally(() => setLoading(false));
  }, [token]);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Stats
  const totalVIP = clients.length;
  const activeVIP = clients.filter(c => c.status === 'active').length;
  const totalRevenue = clients.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const avgBookings = clients.length ? Math.round(clients.reduce((sum, c) => sum + (c.totalBookings || 0), 0) / clients.length) : 0;

  const columns = [
    { key: 'name', label: 'Name', render: (client) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
          <FaUserTie className="text-white text-sm" />
        </div>
        <div>
          <div className="font-semibold text-gray-900">{client.name}</div>
          <div className="text-sm text-gray-500">{client.email}</div>
        </div>
      </div>
    )},
    { key: 'phone', label: 'Phone', render: (client) => (
      <div className="flex items-center gap-2">
        <FaPhone className="text-gray-400" />
        <span>{client.phone}</span>
      </div>
    )},
    { key: 'vipLevel', label: 'VIP Level', render: (client) => (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
        client.vipLevel === 'platinum' ? 'bg-purple-100 text-purple-800' :
        client.vipLevel === 'gold' ? 'bg-yellow-100 text-yellow-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {client.vipLevel.charAt(0).toUpperCase() + client.vipLevel.slice(1)}
      </span>
    )},
    { key: 'totalBookings', label: 'Total Bookings', render: (client) => (
      <span className="font-semibold">{client.totalBookings}</span>
    )},
    { key: 'totalSpent', label: 'Total Spent', render: (client) => (
      <span className="font-semibold text-green-600">${client.totalSpent.toLocaleString()}</span>
    )},
    { key: 'status', label: 'Status', render: (client) => (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
        client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
      </span>
    )},
    { key: 'actions', label: 'Actions', render: (client) => (
      <div className="flex gap-2">
        <Button size="sm" variant="outline">View</Button>
        <Button size="sm" variant="outline">
          <FaEnvelope className="text-sm" />
        </Button>
      </div>
    )}
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8 min-h-screen">
      <div className="space-y-6">
        <PageHeading
          icon={<FaStar />}
          title="VIP Clients"
          subtitle="Manage your most valuable clients with special attention and services"
          iconColor="text-yellow-500"
        >
          <Button>
            <FaStar className="mr-2" />
            Add VIP Client
          </Button>
        </PageHeading>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<FaStar />} label="Total VIP Clients" value={totalVIP} accentColor="yellow" />
          <StatCard icon={<FaUserTie />} label="Active VIP" value={activeVIP} accentColor="green" />
          <StatCard icon={<FaDollarSign />} label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} accentColor="blue" />
          <StatCard icon={<FaCalendarAlt />} label="Avg. Bookings" value={avgBookings} accentColor="purple" />
        </div>

        {/* Modern Filter Bar */}
        <div className="flex flex-wrap items-center justify-between bg-white rounded-2xl shadow-lg p-4 mb-6 border border-gray-100">
          <SearchInput
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search VIP clients..."
            className="w-96"
          />
          <div className="flex gap-4 items-center">
            <Dropdown
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]}
              className="w-40"
            />
            <Button variant="outline">
              <FaDownload className="mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Card>
          <div className="p-6">
            <Table
              data={filteredClients}
              columns={columns}
              loading={loading}
              emptyMessage="No VIP clients found"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default VipClients;
