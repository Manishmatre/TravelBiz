import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { getAllDriverTrips } from '../services/api';
import BottomNav from '../src/components/BottomNav';
import Header from '../src/components/Header';
import ScreenLayout from '../src/components/ScreenLayout';

export default function Dashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Restrict access to drivers only
  if (user?.role !== 'driver') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red', fontSize: 18, fontWeight: 'bold' }}>Access denied. Only drivers can access this page.</Text>
      </View>
    );
  }

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllDriverTrips(token);
      const sortedData = data.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      setTrips(sortedData);
    } catch (err) {
      setError(err.message || 'Failed to fetch trips. Pull down to refresh.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchTrips();
    }
  }, [token, fetchTrips]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTrips().finally(() => setRefreshing(false));
  }, [fetchTrips]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };

  const upcomingTrips = trips.filter(t => t.status === 'Confirmed' || t.status === 'Pending');
  const completedTripsCount = trips.filter(t => t.status === 'Completed').length;
  
  const renderLoading = () => (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#2563eb" />
      <Text style={styles.loadingText}>Loading Dashboard...</Text>
    </View>
  );

  const renderContent = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗓️ Upcoming Trips</Text>
          {upcomingTrips.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.emptyText}>No upcoming trips</Text>
              <Text style={styles.emptySubtext}>You're all clear for now!</Text>
            </View>
          ) : (
            upcomingTrips.map(trip => (
              <TouchableOpacity
                key={trip._id}
                style={styles.tripCard}
                onPress={() => router.push(`/trips/${trip._id}`)}
              >
                <View style={styles.tripHeader}>
                   <Text style={styles.tripDate}>
                    {new Date(trip.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </Text>
                  <Text style={[styles.tripStatus, { backgroundColor: getStatusColor(trip.status) }]}>{trip.status}</Text>
                </View>
                <Text style={styles.tripClient}>👤 {trip.client?.name || 'Client'}</Text>
                <Text style={styles.tripRoute}>
                  📍 {trip.pickup?.name} → {trip.destination}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completed Trips</Text>
           <View style={styles.card}>
              <Text style={styles.completedTripsText}>You have completed {completedTripsCount} trips.</Text>
              <TouchableOpacity onPress={() => router.push('/trips')}>
                 <Text style={styles.viewHistoryText}>View History →</Text>
              </TouchableOpacity>
           </View>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <ScreenLayout
      header={
        <Header
          title="My Trips"
          subtitle={`Good ${getGreeting()}, ${user?.name?.split(' ')[0] || 'Driver'}!`}
          rightActions={[
            { icon: '⚙️', onPress: () => router.push('/profile') },
          ]}
          infoRow={
            <View style={styles.headerStats}>
              <View style={styles.headerStatItem}>
                <Text style={styles.headerStatNumber}>{upcomingTrips.length}</Text>
                <Text style={styles.headerStatLabel}>Upcoming</Text>
              </View>
              <View style={styles.headerStatDivider} />
              <View style={styles.headerStatItem}>
                <Text style={styles.headerStatNumber}>{completedTripsCount}</Text>
                <Text style={styles.headerStatLabel}>Completed</Text>
              </View>
              <View style={styles.headerStatDivider} />
              <View style={styles.headerStatItem}>
                <Text style={styles.headerStatNumber}>{user?.assignedVehicle ? '✅' : '❌'}</Text>
                <Text style={styles.headerStatLabel}>Vehicle</Text>
              </View>
            </View>
          }
        />
      }
      footer={<BottomNav />}
    >
      {loading && !refreshing ? renderLoading() : renderContent()}
    </ScreenLayout>
  );
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Pending': return '#f59e0b';
    case 'Confirmed': return '#10b981';
    default: return '#6b7280';
  }
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 12,
  },
  headerStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  headerStatNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerStatLabel: {
    fontSize: 13,
    color: '#dbeafe',
    marginTop: 2,
  },
  headerStatDivider: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    marginVertical: 16,
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    fontSize: 15,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  emptySubtext: {
    textAlign: 'center',
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: '#2563eb',
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  tripTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  tripStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tripClient: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  tripRoute: {
    fontSize: 14,
    color: '#6b7280',
  },
  completedTripsText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
  viewHistoryText: {
    fontSize: 16,
    color: '#2563eb',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 8,
  },
}); 