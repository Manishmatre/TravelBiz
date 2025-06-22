import React, { useEffect, useState } from 'react';
import { getClients, deleteClient } from '../services/clientService';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import Loader from '../components/common/Loader';
import StatCard from '../components/common/StatCard';
import { FaUsers, FaUserCheck, FaUserTimes, FaUserClock, FaPlus, FaSearch, FaFilter, FaDownload, FaUpload, FaEye, FaEdit, FaTrash, FaSyncAlt, FaMapMarkerAlt, FaPhone, FaEnvelope, FaPassport } from 'react-icons/fa';
import SearchInput from '../components/common/SearchInput';
import Dropdown from '../components/common/Dropdown';
import { getUsers } from '../services/userService';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Notification from '../components/common/Notification';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

function Clients() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterAgent, setFilterAgent] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterNationality, setFilterNationality] = useState('');
  const [agents, setAgents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [clientsPerPage] = useState(15);
  const [selectedClients, setSelectedClients] = useState([]);
  const [notification, setNotification] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const filteredClients = clients.filter(client => {
    const matchesSearch =
      client.name?.toLowerCase().includes(search.toLowerCase()) ||
      client.email?.toLowerCase().includes(search.toLowerCase()) ||
      client.phone?.toLowerCase().includes(search.toLowerCase()) ||
      (client.passportNumber && client.passportNumber.toLowerCase().includes(search.toLowerCase())) ||
      (client.nationality && client.nationality.toLowerCase().includes(search.toLowerCase()));
    
    const matchesAgent = filterAgent ? String(client.assignedAgent?._id) === filterAgent : true;
    const matchesStatus = filterStatus ? (client.status || 'Active') === filterStatus : true;
    const matchesNationality = filterNationality ? client.nationality === filterNationality : true;
    
    return matchesSearch && matchesAgent && matchesStatus && matchesNationality;
  });

  // Sort clients
  const sortedClients = [...filteredClients].sort((a, b) => {
    let aValue = a[sortBy] || '';
    let bValue = b[sortBy] || '';
    
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const totalPages = Math.ceil(sortedClients.length / clientsPerPage);
  const paginatedClients = sortedClients.slice((currentPage - 1) * clientsPerPage, currentPage * clientsPerPage);

  // Client statistics
  const totalClients = clients.length;
  const activeClients = clients.filter(c => (c.status || 'Active') === 'Active').length;
  const inactiveClients = clients.filter(c => c.status === 'Inactive').length;
  const clientsWithBookings = clients.filter(c => c.totalBookings > 0).length;
  const newClientsThisMonth = clients.filter(c => {
    const createdAt = new Date(c.createdAt);
    const now = new Date();
    return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
  }).length;

  // Analytics data
  const nationalityData = (() => {
    const map = {};
    clients.forEach(c => {
      const nationality = c.nationality || 'Unknown';
      map[nationality] = (map[nationality] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  })();

  const clientsByMonth = (() => {
    const map = {};
    clients.forEach(c => {
      const month = new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      map[month] = (map[month] || 0) + 1;
    });
    return Object.entries(map).map(([month, count]) => ({ month, count }));
  })();

  const nationalityColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  // Fetch clients and agents
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getClients(token);
        setClients(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load clients');
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      getUsers({ role: 'agent' }, token).then(setAgents);
      fetchClients();
    }
  }, [token]);

  // Listen for refresh flag from navigation
  useEffect(() => {
    if (location.state?.refresh && token) {
      const fetchClients = async () => {
        setLoading(true);
        setError('');
        try {
          const data = await getClients(token);
          setClients(data);
          navigate(location.pathname, { replace: true, state: {} });
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load clients');
        } finally {
          setLoading(false);
        }
      };
      fetchClients();
    }
  }, [location.state?.refresh, token, navigate, location.pathname]);

  const handleDeleteClient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      await deleteClient(id, token);
      const updatedData = await getClients(token);
      setClients(updatedData);
      setNotification({ message: 'Client deleted successfully!', type: 'success' });
    } catch (err) {
      setNotification({ 
        message: 'Failed to delete client: ' + (err.response?.data?.message || err.message), 
        type: 'error' 
      });
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getClients(token);
      setClients(data);
      setNotification({ message: 'Clients refreshed successfully!', type: 'success' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to refresh clients');
      setNotification({ 
        message: 'Failed to refresh clients: ' + (err.response?.data?.message || err.message), 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedClients.length} selected clients?`)) return;
    
    for (const id of selectedClients) {
      try {
        await deleteClient(id, token);
      } catch (err) {
        console.error(`Failed to delete client ${id}:`, err);
      }
    }
    
    const updatedData = await getClients(token);
    setClients(updatedData);
    setSelectedClients([]);
    setNotification({ 
      message: `Successfully deleted ${selectedClients.length} clients!`, 
      type: 'success' 
    });
  };

  const exportToCSV = () => {
    if (!filteredClients.length) return;
    
    const headers = ['Name', 'Email', 'Phone', 'Nationality', 'Passport Number', 'Status', 'Assigned Agent', 'Total Bookings', 'Created Date'];
    const csvData = filteredClients.map(client => [
      client.name,
      client.email,
      client.phone,
      client.nationality,
      client.passportNumber,
      client.status || 'Active',
      client.assignedAgent?.name || '',
      client.totalBookings || 0,
      new Date(client.createdAt).toLocaleDateString()
    ]);
    
    const csv = [headers, ...csvData].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { 
      label: 'Name', 
      accessor: 'name',
      render: (v, row) => (
        <Link to={`/clients/${row._id}`} className="text-blue-700 hover:underline font-semibold">
          {v}
        </Link>
      )
    },
    { 
      label: 'Contact', 
      accessor: 'email',
      render: (v, row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <FaEnvelope className="text-gray-400" />
            <span>{v}</span>
          </div>
          {row.phone && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <FaPhone className="text-gray-400" />
              <span>{row.phone}</span>
            </div>
          )}
        </div>
      )
    },
    { 
      label: 'Nationality', 
      accessor: 'nationality',
      render: (v) => (
        <div className="flex items-center gap-2">
          <FaPassport className="text-gray-400" />
          <span>{v || 'Not specified'}</span>
        </div>
      )
    },
    { 
      label: 'Passport #', 
      accessor: 'passportNumber',
      render: (v) => v || '-'
    },
    { 
      label: 'Assigned Agent', 
      accessor: 'assignedAgentName',
      render: (v) => v || '-'
    },
    { 
      label: 'Status', 
      accessor: 'status',
      render: (v) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          (v || 'Active') === 'Active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {v || 'Active'}
        </span>
      )
    },
    { 
      label: 'Bookings', 
      accessor: 'totalBookings',
      render: (v) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
          {v || 0}
        </span>
      )
    },
    { 
      label: 'Created', 
      accessor: 'createdAt',
      render: (v) => new Date(v).toLocaleDateString()
    },
  ];

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const isAllSelected = paginatedClients.length > 0 && paginatedClients.every(c => selectedClients.includes(c._id));
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedClients(selectedClients.filter(id => !paginatedClients.some(c => c._id === id)));
    } else {
      setSelectedClients([
        ...selectedClients,
        ...paginatedClients.filter(c => !selectedClients.includes(c._id)).map(c => c._id)
      ]);
    }
  };
  const handleSelectOne = (id) => {
    setSelectedClients(selectedClients.includes(id)
      ? selectedClients.filter(cid => cid !== id)
      : [...selectedClients, id]);
  };

  const columnsWithCheckbox = [
    {
      label: <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} />,
      accessor: '_checkbox',
      render: (val, row) => (
        <input
          type="checkbox"
          checked={selectedClients.includes(row._id)}
          onChange={() => handleSelectOne(row._id)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      )
    },
    ...columns
  ];

  const uniqueNationalities = [...new Set(clients.map(c => c.nationality).filter(Boolean))];

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8 min-h-screen">
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600 mt-1">Manage all your clients and passengers</p>
        </div>
        <div className="flex gap-2">
          <Button 
            color="secondary" 
            onClick={handleRefresh}
            className="flex items-center gap-2"
            disabled={loading}
          >
            <FaSyncAlt className="w-4 h-4" />
            Refresh
          </Button>
          <Button 
            color="primary" 
            onClick={() => navigate('/clients/add')}
            className="flex items-center gap-2"
          >
            <FaPlus /> Add Client
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard icon={<FaUsers />} label="Total Clients" value={totalClients} accentColor="blue" />
        <StatCard icon={<FaUserCheck />} label="Active Clients" value={activeClients} accentColor="green" />
        <StatCard icon={<FaUserTimes />} label="Inactive Clients" value={inactiveClients} accentColor="red" />
        <StatCard icon={<FaUserClock />} label="With Bookings" value={clientsWithBookings} accentColor="purple" />
        <StatCard icon={<FaUsers />} label="New This Month" value={newClientsThisMonth} accentColor="yellow" />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Nationality Distribution */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4">Clients by Nationality</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={nationalityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {nationalityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={nationalityColors[index % nationalityColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clients by Month */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4">New Clients by Month</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientsByMonth} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <SearchInput
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search clients..."
              className="w-64"
            />
            <Button
              color="secondary"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2"
            >
              <FaFilter />
              {showAdvancedFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
          
          <div className="flex gap-2">
            {selectedClients.length > 0 && (
              <Button
                color="danger"
                onClick={handleBulkDelete}
                className="flex items-center gap-2"
              >
                <FaTrash />
                Delete Selected ({selectedClients.length})
              </Button>
            )}
            <Button
              color="secondary"
              onClick={exportToCSV}
              className="flex items-center gap-2"
            >
              <FaDownload />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <Dropdown
              value={filterAgent}
              onChange={e => setFilterAgent(e.target.value)}
              options={[
                { value: '', label: 'All Agents' },
                ...agents.map(agent => ({ value: agent._id, label: agent.name }))
              ]}
              className="w-full"
            />
            <Dropdown
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              options={[
                { value: '', label: 'All Status' },
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' }
              ]}
              className="w-full"
            />
            <Dropdown
              value={filterNationality}
              onChange={e => setFilterNationality(e.target.value)}
              options={[
                { value: '', label: 'All Nationalities' },
                ...uniqueNationalities.map(nat => ({ value: nat, label: nat }))
              ]}
              className="w-full"
            />
            <Dropdown
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              options={[
                { value: 'name', label: 'Sort by Name' },
                { value: 'email', label: 'Sort by Email' },
                { value: 'createdAt', label: 'Sort by Date' },
                { value: 'totalBookings', label: 'Sort by Bookings' }
              ]}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {loading ? (
          <Loader className="my-10" />
        ) : error ? (
          <div className="text-red-500 p-6">{error}</div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                Showing {((currentPage - 1) * clientsPerPage) + 1} to {Math.min(currentPage * clientsPerPage, sortedClients.length)} of {sortedClients.length} clients
              </p>
              <div className="flex items-center gap-2">
                <Button
                  color="secondary"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'} {sortBy}
                </Button>
              </div>
            </div>
            
            <Table
              columns={selectedClients.length > 0 ? columnsWithCheckbox : columns}
              data={paginatedClients.map(c => ({
                ...c,
                assignedAgentName: c.assignedAgent?.name || '-',
              }))}
              actions={client => (
                <div className="flex gap-2">
                  <Button
                    color="primary"
                    size="sm"
                    onClick={() => navigate(`/clients/${client._id}`)}
                  >
                    <FaEye />
                  </Button>
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={() => navigate(`/clients/${client._id}/edit`)}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    color="danger"
                    size="sm"
                    onClick={() => handleDeleteClient(client._id)}
                  >
                    <FaTrash />
                  </Button>
                </div>
              )}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <Button
                        key={page}
                        color={currentPage === page ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Clients;