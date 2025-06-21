import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { getDriverDashboard } from '../services/api';
import BottomNav from '../src/components/BottomNav';
import Header from '../src/components/Header';
import ScreenLayout from '../src/components/ScreenLayout';

export default function Dashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState({
    todayTrips: [],
    completedTrips: [],
    pendingTrips: [],
    vehicle: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getDriverDashboard(token);
      setDashboardData({
        todayTrips: data.todayTrips || [],
        completedTrips: data.completedTrips || [],
        pendingTrips: data.pendingTrips || [],
        vehicle: data.vehicle,
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data. Please pull down to refresh.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token, fetchDashboardData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData().finally(() => setRefreshing(false));
  }, [fetchDashboardData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };

  const { todayTrips, completedTrips, vehicle } = dashboardData;
  
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
          <Text style={styles.sectionTitle}>📅 Today's Schedule</Text>
          {todayTrips.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.emptyText}>No trips scheduled for today</Text>
              <Text style={styles.emptySubtext}>Check back later for updates</Text>
            </View>
          ) : (
            todayTrips.map(trip => (
              <TouchableOpacity
                key={trip._id}
                style={styles.tripCard}
                onPress={() => router.push(`/trips/${trip._id}`)}
              >
                <View style={styles.tripHeader}>
                  <Text style={styles.tripTime}>
                    {new Date(trip.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Text style={styles.tripStatus}>{trip.status}</Text>
                </View>
                <Text style={styles.tripClient}>👤 {trip.client?.name || 'Client'}</Text>
                <Text style={styles.tripRoute}>
                  📍 {trip.pickup} → {trip.destination}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assigned Vehicle</Text>
          <View style={styles.card}>
            {vehicle ? (
              <>
                <Text style={styles.vehicleName}>{vehicle.name}</Text>
                <Text style={styles.vehiclePlate}>{vehicle.numberPlate}</Text>
                <Text style={[styles.vehicleStatus, { color: vehicle.status === 'Active' ? '#10b981' : '#f59e0b' }]}>
                  Status: {vehicle.status}
                </Text>
              </>
            ) : (
              <Text style={styles.emptyText}>No vehicle assigned</Text>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <ScreenLayout
      header={
        <Header
          title="Dashboard"
          subtitle={`Good ${getGreeting()}, ${user?.name?.split(' ')[0] || 'Driver'}!`}
          rightActions={[
            { icon: '⚙️', onPress: () => router.push('/profile') },
            { icon: '📍', onPress: () => router.push('/location') },
          ]}
          infoRow={
            <View style={styles.headerStats}>
              <View style={styles.headerStatItem}>
                <Text style={styles.headerStatNumber}>{todayTrips.length}</Text>
                <Text style={styles.headerStatLabel}>Today</Text>
              </View>
              <View style={styles.headerStatDivider} />
              <View style={styles.headerStatItem}>
                <Text style={styles.headerStatNumber}>{completedTrips.length}</Text>
                <Text style={styles.headerStatLabel}>Completed</Text>
              </View>
              <View style={styles.headerStatDivider} />
              <View style={styles.headerStatItem}>
                <Text style={styles.headerStatNumber}>{vehicle ? '🚗' : '❌'}</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tripTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  tripStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
    textTransform: 'capitalize',
  },
  tripClient: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
    fontWeight: '500',
  },
  tripRoute: {
    fontSize: 14,
    color: '#6b7280',
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  vehiclePlate: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginVertical: 4,
  },
  vehicleStatus: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
}); 