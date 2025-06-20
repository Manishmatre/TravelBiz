import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export const getClients = async (token) => {
  const res = await axios.get(`${API_URL}/clients`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const addClient = async (client, token) => {
  if (client.avatar) {
    const formData = new FormData();
    Object.entries(client).forEach(([key, value]) => {
      if (key === 'avatar' && value) formData.append('avatar', value);
      else if (typeof value === 'object' && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    const res = await axios.post(`${API_URL}/clients`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } else {
    const res = await axios.post(`${API_URL}/clients`, client, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  }
};

export const updateClient = async (id, client, token) => {
  if (client.avatar) {
    const formData = new FormData();
    Object.entries(client).forEach(([key, value]) => {
      if (key === 'avatar' && value) formData.append('avatar', value);
      else if (typeof value === 'object' && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    const res = await axios.put(`${API_URL}/clients/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } else {
    const res = await axios.put(`${API_URL}/clients/${id}`, client, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  }
};

export const deleteClient = async (id, token) => {
  const res = await axios.delete(`${API_URL}/clients/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}; 