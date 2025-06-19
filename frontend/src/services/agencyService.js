import axios from 'axios';

export const createAgency = async (agency, token) => {
  const res = await axios.post(
    `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/agency`,
    agency,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};
