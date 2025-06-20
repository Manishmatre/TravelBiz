import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export const getBookings = async (clientId, token) => {
  const res = await axios.get(`${API_URL}/bookings`, {
    params: clientId ? { client: clientId } : {},
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const addBooking = async (data, token) => {
  const res = await axios.post(`${API_URL}/bookings`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateBooking = async (id, data, token) => {
  const res = await axios.put(`${API_URL}/bookings/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteBooking = async (id, token) => {
  const res = await axios.delete(`${API_URL}/bookings/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}; 