import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/payments`;

// Get all payments for a specific client
export const getPaymentsForClient = async (clientId, token) => {
  const res = await axios.get(`${API_URL}/client/${clientId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Create a new payment for a client
export const createPayment = async (clientId, paymentData, token) => {
  const res = await axios.post(`${API_URL}/client/${clientId}`, paymentData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Update a payment
export const updatePayment = async (paymentId, paymentData, token) => {
    const res = await axios.put(`${API_URL}/${paymentId}`, paymentData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Delete a payment
export const deletePayment = async (paymentId, token) => {
  const res = await axios.delete(`${API_URL}/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}; 