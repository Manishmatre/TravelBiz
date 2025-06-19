import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export const getFiles = async (token) => {
  const res = await axios.get(`${API_URL}/files`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const uploadFile = async (formData, token) => {
  const res = await axios.post(`${API_URL}/files`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const deleteFile = async (id, token) => {
  const res = await axios.delete(`${API_URL}/files/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}; 