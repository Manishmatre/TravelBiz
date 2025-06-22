import React, { useState, useEffect } from 'react';
import { FaFileContract, FaSearch, FaFilter, FaUserTie, FaCalendar, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Table from '../components/common/Table';

function DriverContracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const mockContracts = [
      {
        id: 'CON-001',
        driverName: 'Johnathan "John" Wick',
        driverId: 'DRV-101',
        startDate: '2023-01-15',
        endDate: '2025-01-14',
        type: 'Full-Time Employee',
        status: 'active',
        documents: ['Contract.pdf', 'NDA.pdf', 'License.pdf'],
      },
      {
        id: 'CON-002',
        driverName: 'Sarah Connor',
        driverId: 'DRV-102',
        startDate: '2023-06-01',
        endDate: '2024-05-31',
        type: 'Independent Contractor',
        status: 'expiring_soon',
      },
      {
        id: 'CON-003',
        driverName: 'James "Jim" Hopper',
        driverId: 'DRV-103',
        startDate: '2022-11-20',
        endDate: '2023-11-19',
        type: 'Part-Time Employee',
        status: 'expired',
      },
    ];
    
    setTimeout(() => {
      setContracts(mockContracts);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = c.driverName.toLowerCase().includes(searchTerm.toLowerCase()) || c.driverId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusChip = (status) => {
    if (status === 'active') return <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800"><FaCheckCircle/> Active</span>;
    if (status === 'expiring_soon') return <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800"><FaExclamationTriangle/> Expiring Soon</span>;
    if (status === 'expired') return <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800"><FaExclamationTriangle/> Expired</span>;
    return null;
  };
  
  const columns = [
    { key: 'driver', label: 'Driver', render: (c) => (
      <div>
        <div className="font-bold text-gray-900">{c.driverName}</div>
        <div className="text-sm text-gray-500 font-mono">{c.driverId}</div>
      </div>
    )},
    { key: 'type', label: 'Contract Type', render: (c) => <div className="text-sm">{c.type}</div> },
    { key: 'term', label: 'Term', render: (c) => (
      <div className="flex items-center gap-2 text-sm">
        <FaCalendar className="text-gray-400" />
        <span>{new Date(c.startDate).toLocaleDateString()} - {new Date(c.endDate).toLocaleDateString()}</span>
      </div>
    )},
    { key: 'status', label: 'Status', render: (c) => getStatusChip(c.status) },
    { key: 'actions', label: 'Actions', render: (c) => (
      <div className="flex gap-2">
        <Button size="sm">View</Button>
        <Button size="sm" variant="outline" disabled={c.status === 'expired'}>Renew</Button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaFileContract className="text-cyan-600" />
            Driver Contracts
          </h1>
          <p className="text-gray-600 mt-2">Manage driver contracts, terms, and compliance documents.</p>
        </div>
        <Button>
          <FaPlus className="mr-2"/> New Contract
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card>
          <div className="p-6">
            <h3 className="font-semibold text-gray-700">Active Contracts</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{contracts.filter(c => c.status === 'active').length}</p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h3 className="font-semibold text-gray-700">Expiring Soon (30d)</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{contracts.filter(c => c.status === 'expiring_soon').length}</p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h3 className="font-semibold text-gray-700">Expired Contracts</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">{contracts.filter(c => c.status === 'expired').length}</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
               <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by driver name or ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select 
                value={filterStatus} 
                onChange={e => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="expiring_soon">Expiring Soon</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
          <Table
            data={filteredContracts}
            columns={columns}
            loading={loading}
            emptyMessage="No contracts found."
          />
        </div>
      </Card>
    </div>
  );
}

export default DriverContracts; 