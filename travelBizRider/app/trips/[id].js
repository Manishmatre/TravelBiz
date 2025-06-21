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
      <Text>Client: {trip.clientName}</Text>
      <Text>Status: {trip.status}</Text>
      <Text>Pickup: {trip.pickupLocation}</Text>
      <Text>Drop: {trip.dropLocation}</Text>
      <View style={{ marginVertical: 16 }}>
        {trip.status === 'pending' && <Button title="Start Trip" onPress={() => handleAction('start')} disabled={actionLoading} />}
        {trip.status === 'in_progress' && <Button title="Complete Trip" onPress={() => handleAction('complete')} disabled={actionLoading} />}
        {trip.status !== 'completed' && <Button title="Cancel Trip" color="red" onPress={() => handleAction('cancel')} disabled={actionLoading} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
}); 