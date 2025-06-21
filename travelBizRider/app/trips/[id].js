import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { useAuth } from '../../contexts/AuthContext';
import { getTripDetails, startTrip, completeTrip } from '../../services/api';
import ScreenLayout from '../../src/components/ScreenLayout';
import Header from '../../src/components/Header';

const GOOGLE_MAPS_APIKEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function TripDetailScreen() {
  const { id: tripId } = useLocalSearchParams();
  const { token } = useAuth();
  const router = useRouter();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchTrip() {
      if (!tripId || !token) return;
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
    }
    fetchTrip();
  }, [tripId, token]);

  const handleTripAction = async (action) => {
    setActionLoading(true);
    try {
      let updatedTrip;
      if (action === 'start') {
        updatedTrip = await startTrip(token, tripId);
      } else if (action === 'complete') {
        updatedTrip = await completeTrip(token, tripId);
      }
      setTrip(updatedTrip); // Update trip state with the latest data from the server
      Alert.alert('Success', `Trip successfully ${action}ed!`);
    } catch (err) {
      Alert.alert('Error', `Failed to ${action} the trip.`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <ScreenLayout header={<Header title="Loading Trip..." />}>
        <ActivityIndicator size="large" style={styles.center} />
      </ScreenLayout>
    );
  }

  if (error || !trip) {
    return (
      <ScreenLayout header={<Header title="Error" />}>
        <Text style={styles.center}>{error || 'Trip details could not be loaded.'}</Text>
      </ScreenLayout>
    );
  }
  
  return (
    <ScreenLayout
      header={
        <Header
          title="Trip Details"
          subtitle={`For ${trip.client?.name || 'Client'}`}
          showBackButton
        />
      }
    >
      <ScrollView style={styles.container}>
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            initialRegion={{
              latitude: trip.pickupCoordinates.lat,
              longitude: trip.pickupCoordinates.lng,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Marker coordinate={trip.pickupCoordinates} title="Pickup" pinColor="green" />
            <Marker coordinate={trip.destinationCoordinates} title="Destination" pinColor="red" />
            <MapViewDirections
              origin={trip.pickupCoordinates}
              destination={trip.destinationCoordinates}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={4}
              strokeColor="hotpink"
            />
          </MapView>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Text style={styles.label}>Pickup</Text>
            <Text style={styles.value}>{trip.pickup}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.label}>Destination</Text>
            <Text style={styles.value}>{trip.destination}</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          {trip.status === 'Pending' && (
            <TouchableOpacity 
              style={[styles.button, actionLoading && styles.disabledButton]} 
              onPress={() => handleTripAction('start')}
              disabled={actionLoading}
            >
              <Text style={styles.buttonText}>{actionLoading ? 'Starting...' : 'Start Trip'}</Text>
            </TouchableOpacity>
          )}
          {trip.status === 'In-Progress' && (
            <TouchableOpacity 
              style={[styles.button, styles.completeButton, actionLoading && styles.disabledButton]} 
              onPress={() => handleTripAction('complete')}
              disabled={actionLoading}
            >
              <Text style={styles.buttonText}>{actionLoading ? 'Completing...' : 'Complete Trip'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  mapContainer: {
    height: 300,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  detailsContainer: {
    padding: 20,
  },
  detailItem: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  value: {
    fontSize: 18,
    color: '#1f2937',
    marginTop: 4,
  },
  actionsContainer: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 10,
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: '#10b981',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 