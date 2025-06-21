import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, getAssignedVehicle, getAllDriverTrips } from '../services/api';
import BottomNav from '../src/components/BottomNav';
import { useRouter } from 'expo-router';

export default function Dashboard() {
  const { token } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      setError(null);
      try {
        const [profileData, vehicleData, tripsData] = await Promise.allSettled([
          getProfile(token),
          getAssignedVehicle(token),
          getAllDriverTrips(token)
        ]);

        if (profileData.status === 'fulfilled') setProfile(profileData.value);
        if (vehicleData.status === 'fulfilled') setVehicle(vehicleData.value);
        if (tripsData.status === 'fulfilled') setTrips(tripsData.value);
      } catch (err) {
        setError(err.message || JSON.stringify(err));
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [token]);

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Calculate stats
  const todayTrips = trips.filter(trip => {
    const today = new Date().toDateString();
    const tripDate = new Date(trip.startDate).toDateString();
    return tripDate === today;
  });

  const completedTrips = trips.filter(trip => trip.status === 'Completed');
  const pendingTrips = trips.filter(trip => trip.status === 'Pending' || trip.status === 'Confirmed');

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }
  if (error) {
    return <View style={styles.center}><Text style={{color:'red'}}>{error}</Text></View>;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeHeader}>
          <View style={styles.avatarContainer}>
            {profile?.avatarUrl ? (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>👤</Text>
              </View>
            ) : (
              <View style={[styles.avatar, styles.initialsContainer]}>
                <Text style={styles.initialsText}>{getInitials(profile?.name)}</Text>
              </View>
            )}
          </View>
          <View style={styles.welcomeText}>
            <Text style={styles.greeting}>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}!</Text>
            <Text style={styles.name}>{profile?.name || 'Driver'}</Text>
            <Text style={styles.role}>{profile?.role || 'Driver'}</Text>
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{todayTrips.length}</Text>
          <Text style={styles.statLabel}>Today's Trips</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{completedTrips.length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{pendingTrips.length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {/* Vehicle Status */}
      {vehicle && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚗 Assigned Vehicle</Text>
          <View style={styles.card}>
            <Text style={styles.vehicleName}>{vehicle.name || 'Vehicle'}</Text>
            <Text style={styles.vehiclePlate}>{vehicle.numberPlate || 'No Plate'}</Text>
            <Text style={styles.vehicleStatus}>Status: {vehicle.status || 'Available'}</Text>
          </View>
        </View>
      )}

      {/* Today's Schedule */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Today's Schedule</Text>
        {todayTrips.length > 0 ? (
          todayTrips.map((trip, index) => (
            <View key={trip._id || index} style={styles.tripCard}>
              <View style={styles.tripHeader}>
                <Text style={styles.tripTime}>
                  {new Date(trip.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Text style={[styles.tripStatus, { color: trip.status === 'Completed' ? '#10b981' : trip.status === 'in_progress' ? '#f59e0b' : '#6b7280' }]}>
                  {trip.status}
                </Text>
              </View>
              <Text style={styles.tripClient}>{trip.client?.name || 'Client'}</Text>
              <Text style={styles.tripRoute}>
                📍 {trip.pickup} → {trip.destination}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No trips scheduled for today</Text>
            <Text style={styles.emptySubtext}>Check back later for updates</Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/trips')}>
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionText}>View Trips</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/profile')}>
            <Text style={styles.actionIcon}>👤</Text>
            <Text style={styles.actionText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/location')}>
            <Text style={styles.actionIcon}>📍</Text>
            <Text style={styles.actionText}>Location</Text>
          </TouchableOpacity>
        </View>
      </View>

      <BottomNav />
    </ScrollView>
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
  welcomeSection: {
    backgroundColor: '#2563eb',
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
  },
  initialsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  initialsText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  welcomeText: {
    flex: 1,
  },
  greeting: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
  },
  name: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 2,
  },
  role: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -15,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#374151',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  vehiclePlate: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  vehicleStatus: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 4,
    fontWeight: '500',
  },
  tripCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  tripStatus: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  tripClient: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  tripRoute: {
    fontSize: 13,
    color: '#9ca3af',
  },
  emptyCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
}); 