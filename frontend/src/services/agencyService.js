import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create a new agency
export const createAgency = async (agencyData, token) => {
  const res = await axios.post(
    `${API_URL}/agencies`,
    agencyData,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// Get agency profile
export const getAgencyProfile = async (token) => {
  const res = await axios.get(
    `${API_URL}/agencies/profile`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// Update agency profile
export const updateAgencyProfile = async (formData, token) => {
  const res = await axios.put(
    `${API_URL}/agencies/profile`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    }
  );
  return res.data;
};

// Get agency statistics
export const getAgencyStats = async (token) => {
  const res = await axios.get(
    `${API_URL}/agencies/stats`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};
