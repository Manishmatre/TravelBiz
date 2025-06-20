import React, { useEffect, useState } from 'react';
import { getClients, addClient, updateClient, deleteClient } from '../services/clientService';
import { useAuth } from '../contexts/AuthContext';
import ClientFormModal from '../components/ClientFormModal';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import Loader from '../components/common/Loader';
import StatCard from '../components/common/StatCard';
import { FaUsers } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SearchInput from '../components/common/SearchInput';
import Dropdown from '../components/common/Dropdown';
import { getUsers } from '../services/userService';
import { Link } from 'react-router-dom';

function Clients() {
  const { token, user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [search, setSearch] = useState('');
  const [filterAgent, setFilterAgent] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [agents, setAgents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 10;
  const [selectedClients, setSelectedClients] = useState([]);

  const filteredClients = clients.filter(client => {
    const matchesSearch =
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase());
    const matchesAgent = filterAgent ? String(client.assignedAgent?._id) === filterAgent : true;
    const matchesStatus = filterStatus ? (client.status || 'Active') === filterStatus : true;
    return matchesSearch && matchesAgent && matchesStatus;
  });

  const totalPages = Math.ceil(filteredClients.length / clientsPerPage);
  const paginatedClients = filteredClients.slice((currentPage - 1) * clientsPerPage, currentPage * clientsPerPage);

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

  const handleAddClient = async (form) => {
    try {
      let formData = { ...form };
      if (user?.role === 'agent') {
        formData.assignedAgent = user.id;
      }
      const newClient = await addClient(formData, token);
      setClients([newClient, ...clients]);
      setModalOpen(false);
      toast.success('Client added successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add client');
    }
  };

  const handleEditClient = async (form) => {
    try {
      const updated = await updateClient(editClient._id, form, token);
      setClients(clients.map(c => (c._id === updated._id ? updated : c)));
      setEditClient(null);
      setModalOpen(false);
      toast.success('Client updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update client');
    }
  };

  const handleDeleteClient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      await deleteClient(id, token);
      setClients(clients.filter(c => c._id !== id));
      toast.success('Client deleted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete client');
    }
  };

  const columns = [
    { label: 'Name', accessor: 'name' },
    { label: 'Email', accessor: 'email' },
    { label: 'Passport #', accessor: 'passportNumber' },
    { label: 'Nationality', accessor: 'nationality' },
    { label: 'Assigned Agent', accessor: 'assignedAgentName' },
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

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Clients</h1>
        <Button color="primary" onClick={() => { setEditClient(null); setModalOpen(true); }}>Add Client</Button>
      </div>
      {/* Quick Stat */}
      <div className="mb-6 max-w-xs">
        <StatCard icon={<FaUsers />} label="Total Clients" value={loading ? '--' : clients.length} accentColor="blue" />
      </div>
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-2 mb-4 items-center">
        <SearchInput
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full md:w-64"
        />
        <Dropdown
          label="Agent"
          value={filterAgent}
          onChange={e => setFilterAgent(e.target.value)}
          options={[{ value: '', label: 'All Agents' }, ...agents.map(a => ({ value: a._id, label: a.name }))]}
          className="w-full md:w-48"
        />
        <Dropdown
          label="Status"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'Active', label: 'Active' },
            { value: 'Inactive', label: 'Inactive' },
          ]}
          className="w-full md:w-40"
        />
      </div>
      {/* Bulk Actions */}
      {selectedClients.length > 0 && (
        <div className="mb-2 flex gap-2 items-center">
          <Button color="danger" size="sm" onClick={handleBulkDelete}>
            Delete Selected ({selectedClients.length})
          </Button>
        </div>
      )}
      {/* Modal */}
      <ClientFormModal
        open={modalOpen}
        onClose={() => { setEditClient(null); setModalOpen(false); }}
        onSubmit={editClient ? handleEditClient : handleAddClient}
        initialData={editClient}
      />
      {/* Table or Loader/Error */}
      <div className="">
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
                  <Link to={`/clients/${client._id}`}><Button color="primary" size="sm" className="mr-2">View</Button></Link>
                <Button color="secondary" size="sm" className="mr-2" onClick={() => { setEditClient(client); setModalOpen(true); }}>Edit</Button>
                <Button color="danger" size="sm" onClick={() => handleDeleteClient(client._id)}>Delete</Button>
              </>
            )}
          />
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <Button color="secondary" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Prev</Button>
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
                <Button color="secondary" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Clients;