import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getProfile } from '../services/api';
import BottomNav from '../src/components/BottomNav';

export default function Dashboard() {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError(null);
      try {
        const data = await getProfile(token);
        setProfile(data);
      } catch (err) {
        setError(err.message || JSON.stringify(err));
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [token]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }
  if (error) {
    return <View style={styles.center}><Text style={{color:'red'}}>{error}</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {profile?.name || 'Driver'}!</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Email: {profile?.email}</Text>
        <Text style={styles.label}>Role: {profile?.role}</Text>
      </View>
      <Text style={styles.sectionTitle}>More features coming soon...</Text>
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
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
}); 