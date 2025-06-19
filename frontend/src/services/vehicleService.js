import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export const getVehicles = async (token) => {
  const res = await axios.get(`${API_URL}/vehicles`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const addVehicle = async (vehicle, token) => {
  const formData = new FormData();
  Object.entries(vehicle).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value);
  });
  const res = await axios.post(`${API_URL}/vehicles`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const updateVehicle = async (id, vehicle, token) => {
  const formData = new FormData();
  Object.entries(vehicle).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value);
  });
  const res = await axios.put(`${API_URL}/vehicles/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const deleteVehicle = async (id, token) => {
  const res = await axios.delete(`${API_URL}/vehicles/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}; 