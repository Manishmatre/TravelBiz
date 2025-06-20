import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getVehicles } from '../services/vehicleService';
import { socket } from '../services/socket';
import { useAuth } from './AuthContext';

const VehiclesContext = createContext();

export function VehiclesProvider({ children }) {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchVehicles = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getVehicles(token);
      setVehicles(data);
    } catch (e) {
      // Optionally handle error
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    socket.on('vehicleCreated', (vehicle) => {
      setVehicles(prev => [vehicle, ...prev]);
    });
    socket.on('vehicleUpdated', (updated) => {
      setVehicles(prev => prev.map(v => v._id === updated._id ? updated : v));
    });
    socket.on('vehicleDeleted', (deletedId) => {
      setVehicles(prev => prev.filter(v => v._id !== deletedId));
    });
    return () => {
      socket.off('vehicleCreated');
      socket.off('vehicleUpdated');
      socket.off('vehicleDeleted');
    };
  }, []);

  return (
    <VehiclesContext.Provider value={{ vehicles, fetchVehicles, loading }}>
      {children}
    </VehiclesContext.Provider>
  );
}

export function useVehicles() {
  return useContext(VehiclesContext);
} 