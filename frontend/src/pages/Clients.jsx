import React, { useEffect, useState } from 'react';
import { getClients, addClient, updateClient, deleteClient } from '../services/clientService';
import { useAuth } from '../contexts/AuthContext';
import ClientFormModal from '../components/ClientFormModal';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import Loader from '../components/common/Loader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Clients() {
  const { token, user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editClient, setEditClient] = useState(null);

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
    if (token) fetchClients();
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

  const tableData = clients.map(client => ({
    ...client,
    assignedAgentName: client.assignedAgent?.name || '-',
  }));

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Button color="primary" onClick={() => { setEditClient(null); setModalOpen(true); }}>Add Client</Button>
      </div>
      <ClientFormModal
        open={modalOpen}
        onClose={() => { setEditClient(null); setModalOpen(false); }}
        onSubmit={editClient ? handleEditClient : handleAddClient}
        initialData={editClient}
      />
      {loading ? (
        <Loader className="my-8" />
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <Table
          columns={columns}
          data={tableData}
          actions={client => (
            <>
              <Button color="secondary" size="sm" className="mr-2" onClick={() => { setEditClient(client); setModalOpen(true); }}>Edit</Button>
              <Button color="danger" size="sm" onClick={() => handleDeleteClient(client._id)}>Delete</Button>
            </>
          )}
        />
      )}
    </div>
  );
}

export default Clients; 