import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { getAllDriverTrips } from '../services/api';
import BottomNav from '../src/components/BottomNav';

export default function Trips() {
  const { token } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchTrips() {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllDriverTrips(token);
        setTrips(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTrips();
  }, [token]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  if (error) return <View style={styles.center}><Text style={{color:'red'}}>{error}</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Trips</Text>
      <FlatList
        data={trips}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <Pressable style={styles.tripCard} onPress={() => router.push(`/trips/${item._id}`)}>
            <Text style={styles.tripTitle}>{item.clientName || 'Trip'}</Text>
            <Text>Status: {item.status}</Text>
            <Text>Pickup: {item.pickupLocation}</Text>
            <Text>Drop: {item.dropLocation}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text>No trips assigned.</Text>}
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