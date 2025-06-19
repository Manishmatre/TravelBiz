import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export const getAllLocations = async (token) => {
  const res = await axios.get(`${API_URL}/location`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}; 