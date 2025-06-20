import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

// Get current user profile
export const getProfile = async (token) => {
  const res = await axios.get(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Update user profile (to be implemented in backend)
export const updateProfile = async (profile, token) => {
  // This is a placeholder; backend endpoint needed
  // Example: PUT /api/users/me
  const res = await axios.put(`${API_URL}/users/me`, profile, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}; 