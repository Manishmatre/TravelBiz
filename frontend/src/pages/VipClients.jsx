import React, { useState, useEffect } from 'react';
import { FaStar, FaSearch, FaFilter, FaUserTie, FaPhone, FaEnvelope } from 'react-icons/fa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Table from '../components/common/Table';

function VipClients() {
  const [vipClients, setVipClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data for VIP clients
  useEffect(() => {
    const mockVipClients = [
      {
        id: 1,
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1 (555) 123-4567',
        status: 'active',
        totalBookings: 45,
        totalSpent: 12500,
        lastBooking: '2024-01-15',
        vipLevel: 'platinum'
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        phone: '+1 (555) 987-6543',
        status: 'active',
        totalBookings: 32,
        totalSpent: 8900,
        lastBooking: '2024-01-10',
        vipLevel: 'gold'
      },
      {
        id: 3,
        name: 'Michael Brown',
        email: 'michael.b@email.com',
        phone: '+1 (555) 456-7890',
        status: 'inactive',
        totalBookings: 28,
        totalSpent: 7200,
        lastBooking: '2023-12-20',
        vipLevel: 'silver'
      }
    ];
    
    setTimeout(() => {
      setVipClients(mockVipClients);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredClients = vipClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaStar className="text-yellow-500" />
            VIP Clients
          </h1>
          <p className="text-gray-600 mt-2">Manage your most valuable clients with special attention and services</p>
        </div>
        <Button>
          <FaStar className="mr-2" />
          Add VIP Client
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total VIP Clients</p>
                <p className="text-2xl font-bold text-gray-900">{vipClients.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FaStar className="text-yellow-600" />
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active VIP</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vipClients.filter(c => c.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaUserTie className="text-green-600" />
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${vipClients.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold">$</span>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(vipClients.reduce((sum, c) => sum + c.totalBookings, 0) / vipClients.length || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold">#</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search VIP clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <div className="flex items-center gap-2">
                <FaFilter className="text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Export</Button>
              <Button variant="outline">Import</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* VIP Clients Table */}
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
  );
}

export default VipClients;
