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

// Invite a new user (admin only)
export const inviteUser = async (user, token) => {
  const res = await axios.post(`${API_URL}/users/invite`, user, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Get users (optionally filtered by role)
export const getUsers = async (params = {}, token) => {
  const query = new URLSearchParams(params).toString();
  const res = await axios.get(`${API_URL}/users${query ? `?${query}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Get user by ID
export const getUserById = async (id, token) => {
  const res = await axios.get(`${API_URL}/users/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
};

// Update user by ID (admin/agent)
export const updateUser = async (id, user, token) => {
  const res = await axios.put(`${API_URL}/users/${id}`, user, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Remove user by ID (admin only)
export const removeUser = async (id, token) => {
  const res = await axios.delete(`${API_URL}/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Get documents for a user (driver)
export const getUserDocuments = async (userId, token) => {
  const user = await getUserById(userId, token);
  return user.documents || [];
};

// Upload a document for a user (driver)
export const uploadUserDocument = async (userId, form, token) => {
  const formData = new FormData();
  Object.entries(form).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value);
  });
  const res = await axios.post(`${API_URL}/users/${userId}/documents`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// Delete a document for a user (driver)
export const deleteUserDocument = async (userId, docId, token) => {
  const res = await axios.delete(`${API_URL}/users/${userId}/documents/${docId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Update user photo (avatar)
export const updateUserPhoto = async (userId, file, token) => {
  const formData = new FormData();
  formData.append('photo', file);
  const res = await axios.put(`${API_URL}/users/${userId}/photo`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}; 

// Fetch all agents in the agency
export async function getAgents(token) {
  const res = await fetch(`${API_URL}/users?role=agent`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch agents');
  return res.json();
}

// Get admin dashboard data
export const getAdminDashboard = async (token) => {
  const res = await axios.get(`${API_URL}/users/admin/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data;
}; 