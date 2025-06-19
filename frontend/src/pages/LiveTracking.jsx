import React, { useEffect, useState, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { getAllLocations } from '../services/locationService';
import { getVehicles } from '../services/vehicleService';
import { useAuth } from '../contexts/AuthContext';
import { io } from 'socket.io-client';

const containerStyle = {
  width: '100%',
  height: '500px',
};

// Placeholder center (Dubai)
const center = {
  lat: 25.2048,
  lng: 55.2708,
};

function LiveTracking() {
  const { token } = useAuth();
  const [locations, setLocations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [locs, vehs] = await Promise.all([
          getAllLocations(token),
          getVehicles(token),
        ]);
        setLocations(locs);
        setVehicles(vehs);
      } catch (err) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    // Connect to socket.io backend
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      transports: ['websocket'],
    });
    socketRef.current = socket;
    socket.on('locationUpdate', (location) => {
      setLocations((prev) => {
        const idx = prev.findIndex(l => l.vehicleId === location.vehicleId);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = location;
          return updated;
        } else {
          return [location, ...prev];
        }
      });
    });
    return () => socket.disconnect();
  }, [token]);

  // Helper to get vehicle info by ID
  const getVehicleInfo = (vehicleId) => vehicles.find(v => v._id === vehicleId) || {};

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Live Vehicle Tracking</h1>
      <div className="mb-6">
        {isLoaded ? (
          <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
            {locations.map(loc => {
              const vehicle = getVehicleInfo(loc.vehicleId);
              return (
                <Marker
                  key={loc.vehicleId}
                  position={{ lat: loc.latitude, lng: loc.longitude }}
                  label={vehicle.name || loc.vehicleId}
                  icon={{
                    url: loc.status === 'moving'
                      ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                      : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                  }}
                />
              );
            })}
          </GoogleMap>
        ) : (
          <div>Loading map...</div>
        )}
      </div>
      <div className="bg-white rounded shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Vehicle Status</h2>
        <ul>
          {locations.map(loc => {
            const vehicle = getVehicleInfo(loc.vehicleId);
            return (
              <li key={loc.vehicleId} className="mb-2">
                <span className="font-semibold">{vehicle.name || loc.vehicleId}</span>
                {vehicle.driverName ? ` (Driver: ${vehicle.driverName})` : ''} - {loc.status} - {loc.speed} km/h
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default LiveTracking; 