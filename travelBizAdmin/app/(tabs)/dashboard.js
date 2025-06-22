import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { getAdminDashboard } from '../../services/api';
import ScreenLayout from '../../src/components/ScreenLayout';
import Header from '../../src/components/Header';
import StatCard from '../../src/components/StatCard';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const { user, token } = useAuth();
  const router = useRouter();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      if (!token) return;
      const data = await getAdminDashboard(token);
      setDashboardData(data);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch dashboard data.');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);
  
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const renderActivityItem = ({ item }) => {
    const activityText = `Booking for ${item.client?.name || 'N/A'} assigned to ${item.driver?.name || 'N/A'}`;
    return (
      <View style={styles.activityItem}>
        <Text style={styles.activityText}>{activityText}</Text>
      </View>
    );
  };
  
  if (loading && !dashboardData) {
    return (
      <ScreenLayout header={<Header title="Dashboard" />}>
        <ActivityIndicator size="large" color="#2563eb" />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      header={
        <Header 
          title="Dashboard"
          subtitle={`${getGreeting()}, ${user?.name || 'Admin'}!`}
          rightActions={[{ icon: 'bell-outline', onPress: () => {} }]}
        />
      }
    >
      <ScrollView 
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.statsRow}>
          <StatCard icon="steering" label="Online Drivers" value={dashboardData?.onlineDrivers ?? 0} color="#10b981" onPress={() => router.push('/users')} />
          <StatCard icon="car-clock" label="Active Trips" value={dashboardData?.activeTrips ?? 0} color="#f59e0b" onPress={() => router.push('/bookings')} />
        </View>
        <View style={styles.statsRow}>
          <StatCard icon="calendar-check" label="Today's Bookings" value={dashboardData?.totalBookingsToday ?? 0} color="#3b82f6" onPress={() => router.push('/bookings')} />
          <StatCard icon="alert-circle" label="Reported Issues" value={dashboardData?.issues ?? 0} color="#ef4444" onPress={() => {}} />
        </View>
        
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <FlatList
          data={dashboardData?.recentActivity ?? []}
          renderItem={renderActivityItem}
          keyExtractor={item => item._id}
          ListEmptyComponent={<Text style={styles.emptyText}>No recent activity</Text>}
        />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    color: '#1f2937',
  },
  activityItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  activityText: {
    fontSize: 15,
    color: '#374151',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#6b7280',
  },
}); 