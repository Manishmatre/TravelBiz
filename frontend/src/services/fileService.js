import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

// Generic function to get all files for the agency
export const getFiles = async (token) => {
  const res = await axios.get(`${API_URL}/files`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Get all files for a specific client
export const getFilesForClient = async (clientId, token) => {
  const res = await axios.get(`${API_URL}/files`, {
    params: { clientId },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Upload a file using a pre-constructed FormData object
export const uploadFile = async (formData, token) => {
  const res = await axios.post(`${API_URL}/files`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// Upload a file for a specific client
export const uploadFileForClient = async (clientId, title, fileType, file, token) => {
  const formData = new FormData();
  formData.append('clientId', clientId);
  formData.append('title', title);
  formData.append('fileType', fileType);
  formData.append('file', file);
  return uploadFile(formData, token);
};

// Delete a file by its ID
export const deleteFile = async (id, token) => {
  const res = await axios.delete(`${API_URL}/files/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}; 