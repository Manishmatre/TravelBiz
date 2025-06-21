import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getAssignedVehicle, getDriverTrips } from '../services/api';
import BottomNav from '../src/components/BottomNav';

export default function Dashboard() {
  const { token } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [vehicleData, tripsData] = await Promise.all([
          getAssignedVehicle(token),
          getDriverTrips(token)
        ]);
        setVehicle(vehicleData);
        setTrips(tripsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }
  if (error) {
    return <View style={styles.center}><Text style={{color:'red'}}>{error}</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, Driver!</Text>
      {vehicle && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Assigned Vehicle</Text>
          <Text>Model: {vehicle.model}</Text>
          <Text>Plate: {vehicle.plateNumber}</Text>
        </View>
      )}
      <Text style={styles.sectionTitle}>Today's Trips</Text>
      <FlatList
        data={trips}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.tripCard}>
            <Text style={styles.tripTitle}>{item.clientName || 'Trip'}</Text>
            <Text>Status: {item.status}</Text>
            <Text>Pickup: {item.pickupLocation}</Text>
            <Text>Drop: {item.dropLocation}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No trips for today.</Text>}
      />
      <BottomNav />
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tripCard: {
    backgroundColor: '#e6f7ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  tripTitle: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
}); 