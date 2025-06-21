import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { getAllDriverTrips, startTrip, completeTrip, cancelTrip } from '../../services/api';

export default function TripDetail() {
  const { id } = useLocalSearchParams();
  const { token } = useAuth();
  const router = useRouter();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchTrip() {
      setLoading(true);
      setError(null);
      try {
        // For demo, fetch all trips and find by id (replace with getTripById if available)
        const trips = await getAllDriverTrips(token);
        const found = trips.find(t => t._id === id);
        setTrip(found);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTrip();
  }, [id, token]);

  async function handleAction(action) {
    setActionLoading(true);
    try {
      if (action === 'start') await startTrip(token, id);
      if (action === 'complete') await completeTrip(token, id);
      if (action === 'cancel') await cancelTrip(token, id);
      Alert.alert('Success', `Trip ${action}ed successfully!`);
      router.back();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  if (error) return <View style={styles.center}><Text style={{color:'red'}}>{error}</Text></View>;
  if (!trip) return <View style={styles.center}><Text>Trip not found.</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trip Details</Text>
      <View style={styles.infoCard}>
        {trip.client?.name && <Text style={styles.label}>Client: <Text style={styles.value}>{trip.client.name}</Text></Text>}
        {trip.status && <Text style={styles.label}>Status: <Text style={styles.value}>{trip.status}</Text></Text>}
        {trip.pickup && <Text style={styles.label}>Pickup: <Text style={styles.value}>{trip.pickup}</Text></Text>}
        {trip.destination && <Text style={styles.label}>Drop-off: <Text style={styles.value}>{trip.destination}</Text></Text>}
        {trip.startDate && <Text style={styles.label}>Start Date: <Text style={styles.value}>{new Date(trip.startDate).toLocaleString()}</Text></Text>}
        {trip.endDate && <Text style={styles.label}>End Date: <Text style={styles.value}>{new Date(trip.endDate).toLocaleString()}</Text></Text>}
        {trip.vehicle?.name && <Text style={styles.label}>Vehicle: <Text style={styles.value}>{trip.vehicle.name} ({trip.vehicle.numberPlate})</Text></Text>}
      </View>
      
      <View style={styles.actions}>
        {(trip.status === 'Pending' || trip.status === 'Confirmed') && <Button title="Start Trip" onPress={() => handleAction('start')} disabled={actionLoading} />}
        {trip.status === 'in_progress' && <Button title="Complete Trip" onPress={() => handleAction('complete')} disabled={actionLoading} />}
        {trip.status !== 'Completed' && trip.status !== 'Cancelled' && <Button title="Cancel Trip" color="red" onPress={() => handleAction('cancel')} disabled={actionLoading} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
    color: '#555',
  },
  value: {
    fontWeight: 'normal',
    color: '#333',
  },
  actions: {
    marginTop: 16,
    gap: 8,
  },
}); 