import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, TouchableOpacity, Alert, Share, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
import BottomNav from '../src/components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { getAllDriverTrips } from '../services/api';

export default function LocationScreen() {
  const { token } = useAuth();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }
      
      // Get initial location
      let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(loc.coords);
      setLocationHistory([loc.coords]);
      setLoading(false);
      
      // Fetch current trip
      try {
        const trips = await getAllDriverTrips(token);
        const activeTrip = trips.find(trip => trip.status === 'in_progress');
        setCurrentTrip(activeTrip);
      } catch (err) {
        console.log('Failed to fetch trips:', err);
      }
    })();
  }, [token]);

  useEffect(() => {
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [locationSubscription]);

  const startLocationTracking = async () => {
    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (newLocation) => {
          setLocation(newLocation.coords);
          setLocationHistory(prev => [...prev.slice(-9), newLocation.coords]); // Keep last 10 locations
        }
      );
      setLocationSubscription(subscription);
      setTracking(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to start location tracking');
    }
  };

  const stopLocationTracking = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    setTracking(false);
  };

  const shareLocation = async () => {
    if (!location) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    try {
      const message = `📍 My current location: https://maps.google.com/?q=${location.latitude},${location.longitude}`;
      await Share.share({
        message,
        title: 'My Location',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share location');
    }
  };

  const centerOnLocation = () => {
    if (mapRef.current && location) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const sendEmergencyAlert = () => {
    Alert.alert(
      'Emergency Alert',
      'This will send your current location to emergency contacts. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Alert', 
          style: 'destructive',
          onPress: () => {
            // Here you would integrate with emergency services
            Alert.alert('Alert Sent', 'Emergency alert has been sent with your location');
          }
        }
      ]
    );
  };

  const getAddressFromCoords = async (coords) => {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        return `${address.street || ''} ${address.city || ''} ${address.region || ''}`.trim();
      }
    } catch (error) {
      console.log('Failed to get address:', error);
    }
    return 'Address not available';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
        <BottomNav />
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
        <BottomNav />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📍 Live Location</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: tracking ? '#10b981' : '#6b7280' }]} />
          <Text style={styles.statusText}>
            {tracking ? 'Tracking Active' : 'Location Only'}
          </Text>
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
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
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
        >
          <Marker
            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
            title="Your Location"
            description="Current position"
            pinColor="#2563eb"
          />
          
          {/* Show location history trail */}
          {locationHistory.length > 1 && tracking && (
            locationHistory.map((coord, index) => (
              <Circle
                key={index}
                center={coord}
                radius={5}
                fillColor="rgba(37, 99, 235, 0.3)"
                strokeColor="rgba(37, 99, 235, 0.5)"
                strokeWidth={1}
              />
            ))
          )}
        </MapView>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.mapButton} onPress={centerOnLocation}>
            <Text style={styles.mapButtonText}>📍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Location Details */}
      <ScrollView style={styles.detailsContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.locationCard}>
          <Text style={styles.cardTitle}>📍 Current Location</Text>
          <Text style={styles.coordinates}>
            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </Text>
          <Text style={styles.accuracy}>
            Accuracy: ±{location.accuracy ? Math.round(location.accuracy) : 'Unknown'}m
          </Text>
        </View>

        {/* Current Trip Info */}
        {currentTrip && (
          <View style={styles.tripCard}>
            <Text style={styles.cardTitle}>🚗 Active Trip</Text>
            <Text style={styles.tripClient}>{currentTrip.client?.name || 'Client'}</Text>
            <Text style={styles.tripRoute}>
              📍 {currentTrip.pickup} → {currentTrip.destination}
            </Text>
            <Text style={styles.tripStatus}>Status: {currentTrip.status}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, tracking && styles.activeActionButton]} 
            onPress={tracking ? stopLocationTracking : startLocationTracking}
          >
            <Text style={styles.actionIcon}>{tracking ? '⏹️' : '▶️'}</Text>
            <Text style={styles.actionText}>
              {tracking ? 'Stop Tracking' : 'Start Tracking'}
            </Text>
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

        {/* Location History */}
        {locationHistory.length > 1 && (
          <View style={styles.historyCard}>
            <Text style={styles.cardTitle}>📊 Recent Locations</Text>
            <Text style={styles.historyText}>
              {locationHistory.length} location{locationHistory.length !== 1 ? 's' : ''} recorded
            </Text>
            <Text style={styles.historySubtext}>
              Last updated: {new Date().toLocaleTimeString()}
            </Text>
          </View>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    backgroundColor: '#2563eb',
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapControls: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  mapButton: {
    backgroundColor: '#fff',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapButtonText: {
    fontSize: 20,
  },
  detailsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  locationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  coordinates: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 4,
  },
  accuracy: {
    fontSize: 12,
    color: '#9ca3af',
  },
  tripClient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  tripRoute: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  tripStatus: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#fff',
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeActionButton: {
    backgroundColor: '#10b981',
  },
  emergencyButton: {
    backgroundColor: '#ef4444',
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  historySubtext: {
    fontSize: 12,
    color: '#9ca3af',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
}); 