import React, { useEffect, useState } from 'react';
import { getClients, addClient, updateClient, deleteClient } from '../services/clientService';
import { useAuth } from '../contexts/AuthContext';
import ClientFormModal from '../components/ClientFormModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Clients() {
  const { token } = useAuth();
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
      const newClient = await addClient(form, token);
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

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition" onClick={() => { setEditClient(null); setModalOpen(true); }}>Add Client</button>
      </div>
      <ClientFormModal
        open={modalOpen}
        onClose={() => { setEditClient(null); setModalOpen(false); }}
        onSubmit={editClient ? handleEditClient : handleAddClient}
        initialData={editClient}
      />
      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Email</th>
                <th className="py-2 px-4 text-left">Passport #</th>
                <th className="py-2 px-4 text-left">Nationality</th>
                <th className="py-2 px-4 text-left">Assigned Agent</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client._id}>
                  <td className="py-2 px-4">{client.name}</td>
                  <td className="py-2 px-4">{client.email}</td>
                  <td className="py-2 px-4">{client.passportNumber}</td>
                  <td className="py-2 px-4">{client.nationality}</td>
                  <td className="py-2 px-4">{client.assignedAgent?.name || '-'}</td>
                  <td className="py-2 px-4">
                    <button className="text-blue-600 hover:underline mr-2" onClick={() => { setEditClient(client); setModalOpen(true); }}>Edit</button>
                    <button className="text-red-600 hover:underline" onClick={() => handleDeleteClient(client._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Clients; 