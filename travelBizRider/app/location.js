import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Platform, Share } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentTrip, sendLocation } from '../services/api';
import BottomNav from '../src/components/BottomNav';
import Header from '../src/components/Header';
import ScreenLayout from '../src/components/ScreenLayout';
import io from 'socket.io-client';

const socket = io(process.env.EXPO_PUBLIC_API_URL);

export default function LocationScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [locationHistory, setLocationHistory] = useState([]);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const mapRef = useRef(null);
  const locationSubscriber = useRef(null);

  const initializeLocation = useCallback(async () => {
    setLoading(true);
    let { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      setErrorMsg('Permission to access foreground location was denied');
      setLoading(false);
      return;
    }

    let { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      Alert.alert(
        'Background Location Required',
        'This app requires background location access to track your trip progress even when the app is not in the foreground.',
        [{ text: 'OK' }]
      );
    }

    try {
      const initialLocation = await Location.getCurrentPositionAsync({});
      setLocation(initialLocation.coords);
      const tripData = await getCurrentTrip(token);
      setCurrentTrip(tripData);
    } catch (error) {
      setErrorMsg('Failed to fetch initial location or trip data.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    initializeLocation();

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      if (token) {
        socket.emit('authenticate', { token });
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    return () => {
      if (locationSubscriber.current) {
        locationSubscriber.current.remove();
      }
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [initializeLocation, token]);

  const startLocationTracking = async () => {
    if (tracking) return;
    setTracking(true);
    
    locationSubscriber.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 5000, // 5 seconds
        distanceInterval: 10, // 10 meters
      },
      (newLocation) => {
        const { latitude, longitude } = newLocation.coords;
        setLocation(newLocation.coords);
        setLocationHistory(prev => [...prev, { latitude, longitude }]);
        socket.emit('updateLocation', { latitude, longitude });
      }
    );
  };

  const stopLocationTracking = () => {
    if (locationSubscriber.current) {
      locationSubscriber.current.remove();
    }
    setTracking(false);
  };

  const shareLocation = async () => {
    if (!location) return;
    try {
      await Share.share({
        message: `Here is my current location: https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share location.');
    }
  };

  const centerOnLocation = () => {
    if (mapRef.current && location) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  const sendEmergencyAlert = () => {
    Alert.alert(
      'Emergency Alert', 
      'This will send an alert to your agency. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Alert', onPress: () => console.log('Emergency alert sent!'), style: 'destructive' }
      ]
    );
  };
  
  if (loading) {
    return (
      <ScreenLayout
        header={<Header title="Location" />}
        footer={<BottomNav />}
      >
        <View style={styles.center}><ActivityIndicator size="large" /></View>
      </ScreenLayout>
    );
  }

  if (errorMsg && !location) {
    return (
      <ScreenLayout
        header={<Header title="Location" subtitle="Error" />}
        footer={<BottomNav />}
      >
        <View style={styles.center}><Text style={{color: 'red'}}>{errorMsg}</Text></View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      header={
        <Header
          title="Live Location"
          rightActions={[
            { icon: '🏠', onPress: () => router.push('/dashboard') },
            { icon: '📋', onPress: () => router.push('/trips') },
          ]}
          infoRow={
            <View style={styles.headerInfo}>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: tracking ? '#10b981' : '#6b7280' }]} />
                <Text style={styles.statusText}>{tracking ? 'Tracking Active' : 'Location Only'}</Text>
              </View>
              {location && (
                <View style={styles.locationInfo}>
                  <Text style={styles.locationText}>📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</Text>
                  <Text style={styles.accuracyText}>±{location.accuracy ? Math.round(location.accuracy) : '...'}m</Text>
                </View>
              )}
            </View>
          }
        />
      }
      footer={<BottomNav />}
    >
      <View style={styles.mapContainer}>
        {location ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation
            showsMyLocationButton={false}
          >
            <Marker coordinate={location} pinColor="#2563eb" />
            {locationHistory.length > 1 && tracking && (
              locationHistory.map((coord, index) => (
                <Circle key={index} center={coord} radius={5} fillColor="rgba(37, 99, 235, 0.3)" strokeColor="rgba(37, 99, 235, 0.5)" />
              ))
            )}
          </MapView>
        ) : <View style={styles.center}><Text>Fetching map...</Text></View>}

        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.mapButton} onPress={centerOnLocation}>
            <Text style={styles.mapButtonText}>📍</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.detailsContainer}>
        {currentTrip && (
          <View style={styles.tripCard}>
            <Text style={styles.cardTitle}>🚗 Active Trip</Text>
            <Text style={styles.tripClient}>{currentTrip.client?.name || 'Client'}</Text>
            <Text style={styles.tripRoute}>📍 {currentTrip.pickup} → {currentTrip.destination}</Text>
            <Text style={styles.tripStatus}>Status: {currentTrip.status}</Text>
          </View>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={[styles.actionButton, tracking && styles.activeActionButton]} onPress={tracking ? stopLocationTracking : startLocationTracking}>
            <Text style={styles.actionIcon}>{tracking ? '⏹️' : '▶️'}</Text>
            <Text style={styles.actionText}>{tracking ? 'Stop Tracking' : 'Start Tracking'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={shareLocation}>
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={styles.actionText}>Share Location</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.emergencyButton]} onPress={sendEmergencyAlert}>
            <Text style={styles.actionIcon}>🚨</Text>
            <Text style={styles.actionText}>Emergency</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Header styles
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  locationInfo: {
    alignItems: 'flex-end',
  },
  locationText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  accuracyText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  // Map styles
  mapContainer: {
    flex: 1,
    minHeight: 250, // Ensure map has a decent height
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapControls: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  mapButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  mapButtonText: {
    fontSize: 20,
  },
  // Details styles
  detailsContainer: {
    flex: 1,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tripClient: {
    fontSize: 16,
    color: '#374151',
  },
  tripRoute: {
    fontSize: 14,
    color: '#6b7280',
    marginVertical: 4,
  },
  tripStatus: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10b981',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  activeActionButton: {
    backgroundColor: '#dcfce7',
    borderColor: '#10b981',
    borderWidth: 1,
  },
  emergencyButton: {
    backgroundColor: '#fef2f2',
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
}); 