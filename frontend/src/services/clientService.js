import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export const getClients = async (token) => {
  const res = await axios.get(`${API_URL}/clients`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const addClient = async (client, token) => {
  const res = await axios.post(`${API_URL}/clients`, client, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateClient = async (id, client, token) => {
  const res = await axios.put(`${API_URL}/clients/${id}`, client, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteClient = async (id, token) => {
  const res = await axios.delete(`${API_URL}/clients/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}; 