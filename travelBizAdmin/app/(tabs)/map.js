import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import io from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';
import ScreenLayout from '../../src/components/ScreenLayout';
import Header from '../../src/components/Header';
import AnimatedDriverMarker from '../../src/components/AnimatedDriverMarker';

export default function MapScreen() {
  const { token } = useAuth();
  const [drivers, setDrivers] = useState({});
  const mapRef = useRef(null);
  
  useEffect(() => {
    const socket = io(process.env.EXPO_PUBLIC_API_URL);

    socket.on('connect', () => {
      console.log('Connected to WebSocket for map');
      if (token) {
        socket.emit('authenticate', { token });
      }
    });

    socket.on('driverLocationUpdate', (data) => {
      // Using a functional update to get the latest state
      setDrivers(prevDrivers => ({
        ...prevDrivers,
        [data.driverId]: data.location,
      }));
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket for map');
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);
  
  return (
    <ScreenLayout
      header={<Header title="Live Driver Map" />}
    >
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={{
          latitude: 23.2599, // Centered on India for now
          longitude: 77.4126,
          latitudeDelta: 15,
          longitudeDelta: 15,
        }}
      >
        {Object.keys(drivers).map(driverId => (
          <AnimatedDriverMarker 
            key={driverId} 
            driverData={drivers[driverId]} 
          />
        ))}
      </MapView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
}); 