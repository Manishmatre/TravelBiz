import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Platform, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useAuth } from '../../contexts/AuthContext';
import { getTripDetails, startTrip, completeTrip, cancelTrip } from '../../services/api';
import ScreenLayout from '../../src/components/ScreenLayout';
import Header from '../../src/components/Header';
import { Ionicons } from '@expo/vector-icons';

export default function TripDetailScreen() {
  const { id: tripId } = useLocalSearchParams();
  const { token } = useAuth();
  const router = useRouter();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTrip = useCallback(async () => {
    if (!tripId || !token) {
      setError("Invalid trip ID or not authenticated.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const tripData = await getTripDetails(token, tripId);
      setTrip(tripData);
    } catch (err) {
      setError(err.message);
      Alert.alert('Error', 'Failed to fetch trip details.');
    } finally {
      setLoading(false);
    }
  }, [tripId, token]);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  const handleTripAction = async (action) => {
    const actions = {
      start: startTrip,
      complete: completeTrip,
      cancel: cancelTrip,
    };

    const actionFunction = actions[action];
    if (!actionFunction) return;

    setActionLoading(true);
    try {
      const updatedTrip = await actionFunction(token, tripId);
      setTrip(updatedTrip);
      Alert.alert('Success', `Trip successfully ${action}ed!`);
      if (action === 'complete' || action === 'cancel') {
        router.back(); // Go back to dashboard after final action
      }
    } catch (err) {
      Alert.alert('Error', `Failed to ${action} the trip.`);
    } finally {
      setActionLoading(false);
    }
  };

  const openInMaps = (coords, label) => {
    const scheme = Platform.OS === 'ios' ? 'maps:0,0?q=' : 'geo:0,0?q=';
    const latLng = `${coords.lat},${coords.lng}`;
    const url = Platform.OS === 'ios' ? `${scheme}${label}@${latLng}` : `${scheme}${latLng}(${label})`;
    Linking.openURL(url);
  };

  const renderDetailRow = (icon, label, value, action) => (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={22} color="#888" style={styles.detailIcon} />
      <View style={styles.detailTextContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      {action}
    </View>
  );

  const renderActionButtons = () => {
    if (!trip) return null;
    
    switch (trip.status) {
      case 'Confirmed':
        return (
          <TouchableOpacity style={[styles.button, styles.startButton]} onPress={() => handleTripAction('start')} disabled={actionLoading}>
            <Text style={styles.buttonText}>{actionLoading ? 'Starting...' : 'Start Trip'}</Text>
          </TouchableOpacity>
        );
      case 'In Progress':
        return (
          <TouchableOpacity style={[styles.button, styles.completeButton]} onPress={() => handleTripAction('complete')} disabled={actionLoading}>
            <Text style={styles.buttonText}>{actionLoading ? 'Completing...' : 'Complete Trip'}</Text>
          </TouchableOpacity>
        );
      case 'Completed':
      case 'Cancelled':
        return <Text style={styles.statusText}>This trip is {trip.status}.</Text>;
      default:
        return null;
    }
  };


  if (loading) {
    return (
      <ScreenLayout header={<Header title="Loading Trip..." showBackButton />}>
        <ActivityIndicator size="large" color="#007AFF" style={styles.center} />
      </ScreenLayout>
    );
  }

  if (error || !trip) {
    return (
      <ScreenLayout header={<Header title="Error" showBackButton />}>
        <Text style={styles.center}>{error || 'Trip details could not be loaded.'}</Text>
      </ScreenLayout>
    );
  }

  const { pickupCoordinates, destinationCoordinates } = trip;
  const hasCoordinates = pickupCoordinates?.lat && destinationCoordinates?.lat;

  return (
    <ScreenLayout
      header={<Header title={`Trip #${trip._id.slice(-6)}`} showBackButton />}
    >
      <ScrollView style={styles.container}>
        {hasCoordinates && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: (pickupCoordinates.lat + destinationCoordinates.lat) / 2,
                longitude: (pickupCoordinates.lng + destinationCoordinates.lng) / 2,
                latitudeDelta: Math.abs(pickupCoordinates.lat - destinationCoordinates.lat) * 2,
                longitudeDelta: Math.abs(pickupCoordinates.lng - destinationCoordinates.lng) * 2,
              }}
            >
              <Marker coordinate={pickupCoordinates} title="Pickup" pinColor="green" />
              <Marker coordinate={destinationCoordinates} title="Destination" pinColor="red" />
            </MapView>
          </View>
        )}

        <View style={styles.detailsContainer}>
          {renderDetailRow('person-outline', 'Client', trip.client?.name || 'N/A')}
          {renderDetailRow('calendar-outline', 'Date', new Date(trip.startDate).toLocaleDateString())}
          {renderDetailRow('time-outline', 'Time', new Date(trip.startDate).toLocaleTimeString())}
          
          <TouchableOpacity onPress={() => openInMaps(pickupCoordinates, trip.pickup.name)}>
            {renderDetailRow('flag-outline', 'Pickup', trip.pickup.name, <Ionicons name="navigate-circle-outline" size={26} color="#007AFF" />)}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => openInMaps(destinationCoordinates, trip.destination.name)}>
            {renderDetailRow('navigate-outline', 'Destination', trip.destination.name, <Ionicons name="navigate-circle-outline" size={26} color="#007AFF" />)}
          </TouchableOpacity>

          {renderDetailRow('car-sport-outline', 'Vehicle', trip.vehicle?.name || 'N/A')}
          {renderDetailRow('cash-outline', 'Payment', `${trip.payment?.mode || ''} - $${trip.price || 0}`)}
        </View>

        <View style={styles.actionsContainer}>
          {renderActionButtons()}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  mapContainer: { height: 250, backgroundColor: '#E0E0E0' },
  map: { ...StyleSheet.absoluteFillObject },
  detailsContainer: { padding: 16, backgroundColor: '#FFF' },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  detailIcon: { marginRight: 16, width: 24 },
  detailTextContainer: { flex: 1 },
  label: { fontSize: 14, color: '#666', marginBottom: 2 },
  value: { fontSize: 16, color: '#000', fontWeight: '500' },
  actionsContainer: { padding: 20, marginTop: 10 },
  button: { paddingVertical: 15, borderRadius: 10, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  startButton: { backgroundColor: '#007AFF' },
  completeButton: { backgroundColor: '#34C759' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  statusText: { fontSize: 18, textAlign: 'center', color: '#888', fontStyle: 'italic' },
}); 