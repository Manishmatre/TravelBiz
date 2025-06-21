import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export const getAllLocations = async (token) => {
  const res = await axios.get(`${API_URL}/location`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getLocationHistory = async (vehicleId, from, to, token) => {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;
  const res = await axios.get(`${API_URL}/location/history/${vehicleId}`, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return res.data;
}; 