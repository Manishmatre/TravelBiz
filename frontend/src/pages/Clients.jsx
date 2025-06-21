import React, { useEffect, useState } from 'react';
import { getClients, deleteClient } from '../services/clientService';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import Loader from '../components/common/Loader';
import StatCard from '../components/common/StatCard';
import { FaUsers, FaUserCheck, FaUserTimes, FaUserClock } from 'react-icons/fa';
import SearchInput from '../components/common/SearchInput';
import Dropdown from '../components/common/Dropdown';
import { getUsers } from '../services/userService';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Notification from '../components/common/Notification';

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
  const [agents, setAgents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 10;
  const [selectedClients, setSelectedClients] = useState([]);
  const [notification, setNotification] = useState(null);

  const filteredClients = clients.filter(client => {
    const matchesSearch =
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase()) ||
      (client.passportNumber && client.passportNumber.toLowerCase().includes(search.toLowerCase()));
    const matchesAgent = filterAgent ? String(client.assignedAgent?._id) === filterAgent : true;
    const matchesStatus = filterStatus ? (client.status || 'Active') === filterStatus : true;
    return matchesSearch && matchesAgent && matchesStatus;
  });

  const totalPages = Math.ceil(filteredClients.length / clientsPerPage);
  const paginatedClients = filteredClients.slice((currentPage - 1) * clientsPerPage, currentPage * clientsPerPage);

  // Client statistics
  const totalClients = clients.length;
  const activeClients = clients.filter(c => (c.status || 'Active') === 'Active').length;
  const inactiveClients = clients.filter(c => c.status === 'Inactive').length;
  const clientsWithBookings = clients.filter(c => c.totalBookings > 0).length;

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
          // Clear the refresh flag
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
      // Refresh the data instead of just filtering
      const updatedData = await getClients(token);
      setClients(updatedData);
      // Show success notification
      setNotification({ message: 'Client deleted successfully!', type: 'success' });
    } catch (err) {
      console.error('Failed to delete client:', err.response?.data?.message || err.message);
      
      // Check if the client was actually deleted despite the error
      // This can happen if the delete succeeded but activity logging failed
      try {
        const updatedData = await getClients(token);
        const clientStillExists = updatedData.find(client => client._id === id);
        
        if (!clientStillExists) {
          // Client was actually deleted, just refresh the data
          setClients(updatedData);
          setNotification({ 
            message: 'Client deleted successfully! (Activity log error ignored)', 
            type: 'success' 
          });
        } else {
          // Client still exists, show error
          setNotification({ 
            message: 'Failed to delete client: ' + (err.response?.data?.message || err.message), 
            type: 'error' 
          });
        }
      } catch (refreshErr) {
        // If we can't even refresh, show the original error
        setNotification({ 
          message: 'Failed to delete client: ' + (err.response?.data?.message || err.message), 
          type: 'error' 
        });
      }
    }
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
    { label: 'Email', accessor: 'email' },
    { label: 'Passport #', accessor: 'passportNumber' },
    { label: 'Nationality', accessor: 'nationality' },
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
  const handleBulkDelete = async () => {
    if (!window.confirm('Are you sure you want to delete selected clients?')) return;
    for (const id of selectedClients) {
      await handleDeleteClient(id);
    }
    setSelectedClients([]);
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
        />
      ),
    },
    ...columns,
  ];

  // Manual refresh function
  const handleRefresh = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getClients(token);
      setClients(data);
      setNotification({ message: 'Data refreshed successfully!', type: 'success' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to refresh data');
      setNotification({ 
        message: 'Failed to refresh data: ' + (err.response?.data?.message || err.message), 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8">
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Clients</h1>
        <div className="flex gap-2">
          <Button 
            color="secondary" 
            onClick={handleRefresh}
            className="flex items-center gap-2"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Refresh
          </Button>
        <Button 
          color="primary" 
          onClick={() => navigate('/clients/add')}
          className="flex items-center gap-2"
        >
          <FaUsers /> Add Client
        </Button>
        </div>
      </div>

      {/* Dashboard Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<FaUsers />} label="Total Clients" value={totalClients} accentColor="blue" />
        <StatCard icon={<FaUserCheck />} label="Active Clients" value={activeClients} accentColor="green" />
        <StatCard icon={<FaUserTimes />} label="Inactive Clients" value={inactiveClients} accentColor="red" />
        <StatCard icon={<FaUserClock />} label="With Bookings" value={clientsWithBookings} accentColor="purple" />
      </div>

      {/* Table or Loader/Error */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <SearchInput
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or passport..."
            className="w-full h-[44px]"
            style={{ marginBottom: 0 }}
          />
          <Dropdown
            value={filterAgent}
            onChange={e => setFilterAgent(e.target.value)}
            options={[{ value: '', label: 'All Agents' }, ...agents.map(a => ({ value: a._id, label: a.name }))]}
            className="min-w-[200px] h-[44px] w-full md:w-auto mb-0"
            style={{ marginBottom: 0 }}
          />
          <Dropdown
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
            className="min-w-[200px] h-[44px] w-full md:w-auto mb-0"
            style={{ marginBottom: 0 }}
          />
        </div>

        {/* Bulk Actions */}
        {selectedClients.length > 0 && (
          <div className="mb-4 flex gap-2 items-center">
            <Button color="danger" size="sm" onClick={handleBulkDelete}>
              Delete Selected ({selectedClients.length})
            </Button>
          </div>
        )}

        {loading ? (
          <Loader className="my-10" />
        ) : error ? (
          <div className="text-red-500 p-6">{error}</div>
        ) : (
          <>
            <Table
              columns={columnsWithCheckbox}
              data={paginatedClients.map(client => ({
                ...client,
                assignedAgentName: client.assignedAgent?.name || '-',
              }))}
              actions={client => (
                <>
                  <Button color="danger" size="sm" onClick={() => handleDeleteClient(client._id)}>
                    Delete
                  </Button>
                </>
              )}
            />
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button 
                  color="secondary" 
                  size="sm" 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i + 1}
                    color={currentPage === i + 1 ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handlePageChange(i + 1)}
                    className={currentPage === i + 1 ? 'font-bold' : ''}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button 
                  color="secondary" 
                  size="sm" 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Clients;