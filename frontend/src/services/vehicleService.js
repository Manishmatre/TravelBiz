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

// Vehicle Document Management
export const getVehicleDocuments = async (vehicleId, token) => {
  const res = await axios.get(`${API_URL}/vehicles/${vehicleId}/documents`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const uploadVehicleDocument = async (vehicleId, form, token) => {
  const formData = new FormData();
  Object.entries(form).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value);
  });
  const res = await axios.post(`${API_URL}/vehicles/${vehicleId}/documents`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const deleteVehicleDocument = async (vehicleId, docId, token) => {
  const res = await axios.delete(`${API_URL}/vehicles/${vehicleId}/documents/${docId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// --- Maintenance ---
export const getVehicleMaintenance = async (vehicleId, token) => {
  const res = await axios.get(`${API_URL}/vehicles/${vehicleId}/maintenance`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const addVehicleMaintenance = async (vehicleId, data, token) => {
  const res = await axios.post(`${API_URL}/vehicles/${vehicleId}/maintenance`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateVehicleMaintenance = async (vehicleId, maintId, data, token) => {
  const res = await axios.put(`${API_URL}/vehicles/${vehicleId}/maintenance/${maintId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteVehicleMaintenance = async (vehicleId, maintId, token) => {
  const res = await axios.delete(`${API_URL}/vehicles/${vehicleId}/maintenance/${maintId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// --- Fuel Logs ---
export const getVehicleFuelLogs = async (vehicleId, token) => {
  const res = await axios.get(`${API_URL}/vehicles/${vehicleId}/fuel`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const addVehicleFuelLog = async (vehicleId, data, token) => {
  const res = await axios.post(`${API_URL}/vehicles/${vehicleId}/fuel`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateVehicleFuelLog = async (vehicleId, fuelId, data, token) => {
  const res = await axios.put(`${API_URL}/vehicles/${vehicleId}/fuel/${fuelId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteVehicleFuelLog = async (vehicleId, fuelId, token) => {
  const res = await axios.delete(`${API_URL}/vehicles/${vehicleId}/fuel/${fuelId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// --- Assignments ---
export const getVehicleAssignments = async (vehicleId, token) => {
  const res = await axios.get(`${API_URL}/vehicles/${vehicleId}/assignments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const addVehicleAssignment = async (vehicleId, data, token) => {
  const res = await axios.post(`${API_URL}/vehicles/${vehicleId}/assignments`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateVehicleAssignment = async (vehicleId, assignId, data, token) => {
  const res = await axios.put(`${API_URL}/vehicles/${vehicleId}/assignments/${assignId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteVehicleAssignment = async (vehicleId, assignId, token) => {
  const res = await axios.delete(`${API_URL}/vehicles/${vehicleId}/assignments/${assignId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}; 