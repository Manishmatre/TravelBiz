import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { getAllDriverTrips } from '../services/api';
import BottomNav from '../src/components/BottomNav';
import Header from '../src/components/Header';
import ScreenLayout from '../src/components/ScreenLayout';

export default function Trips() {
  const { token } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchTrips = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      const data = await getAllDriverTrips(token);
      setTrips(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch trips.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTrips().finally(() => setRefreshing(false));
  }, [fetchTrips]);

  const filterTrips = () => {
    let filtered = trips;
    if (activeFilter !== 'all') {
      if (activeFilter === 'today') {
        const today = new Date().toDateString();
        filtered = filtered.filter(trip => new Date(trip.startDate).toDateString() === today);
      } else {
        filtered = filtered.filter(trip => trip.status === activeFilter);
      }
    }
    if (searchQuery) {
      filtered = filtered.filter(trip =>
        trip.client?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.pickup.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.destination.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  };

  const getStatusColor = (status) => {
    if (status === 'Completed' || status === 'completed') return '#10b981';
    if (status === 'In-Progress' || status === 'in_progress') return '#f59e0b';
    if (status === 'Cancelled' || status === 'cancelled') return '#ef4444';
    return '#6b7280';
  };

  const getStatusIcon = (status) => {
    if (status === 'Completed' || status === 'completed') return '🎉';
    if (status === 'In-Progress' || status === 'in_progress') return '🚗';
    if (status === 'Cancelled' || status === 'cancelled') return '❌';
    return '⏳';
  };
  
  const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString([], {
          month: 'short',
          day: 'numeric'
      });
  };
  
  const formatTime = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
      });
  };

  const filteredTrips = filterTrips();

  const renderLoading = () => (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#2563eb" />
      <Text style={styles.loadingText}>Loading trips...</Text>
    </View>
  );

  const renderContent = () => (
    <ScrollView
      style={styles.tripsContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchTrips}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredTrips.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🚗</Text>
          <Text style={styles.emptyTitle}>
            {searchQuery || activeFilter !== 'all' ? 'No trips found' : 'No trips yet'}
          </Text>
          <Text style={styles.emptyText}>
            {searchQuery || activeFilter !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'You\'ll see your trips here once they\'re assigned'}
          </Text>
        </View>
      ) : (
        filteredTrips.map((trip) => (
          <TouchableOpacity
            key={trip._id}
            style={styles.tripCard}
            onPress={() => router.push(`/trips/${trip._id}`)}
          >
            <View style={styles.tripHeader}>
              <View style={styles.tripInfo}>
                <Text style={styles.tripDate}>{formatDate(trip.startDate)}</Text>
                <Text style={styles.tripTime}>{formatTime(trip.startDate)}</Text>
              </View>
              <View style={styles.statusContainer}>
                <Text style={styles.statusIcon}>{getStatusIcon(trip.status)}</Text>
                <Text style={[styles.statusText, { color: getStatusColor(trip.status) }]}>
                  {trip.status}
                </Text>
              </View>
            </View>
            <View style={styles.tripDetails}>
              <Text style={styles.clientName}>👤 {trip.client?.name || 'Client'}</Text>
              <Text style={styles.route}>📍 {trip.pickup} → {trip.destination}</Text>
              {trip.vehicle && (
                <Text style={styles.vehicle}>🚗 {trip.vehicle.name} ({trip.vehicle.numberPlate})</Text>
              )}
            </View>
            <View style={styles.tripFooter}>
              <Text style={styles.price}>${trip.price || '0'}</Text>
              <TouchableOpacity style={styles.viewButton} onPress={() => router.push(`/trips/${trip._id}`)}>
                <Text style={styles.viewButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );

  return (
    <ScreenLayout
      header={
        <Header
          title="My Trips"
          subtitle={`${filteredTrips.length} trip${filteredTrips.length !== 1 ? 's' : ''} found`}
          rightActions={[
            { icon: '🔄', onPress: onRefresh },
            { icon: '🏠', onPress: () => router.push('/dashboard') },
          ]}
        >
          <View style={styles.headerSearch}>
            <TextInput
              style={styles.headerSearchInput}
              placeholder="Search trips..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.headerFilters}>
            {[
              { key: 'all', label: 'All', icon: '📋' },
              { key: 'today', label: 'Today', icon: '📅' },
              { key: 'pending', label: 'Pending', icon: '⏳' },
              { key: 'confirmed', label: 'Confirmed', icon: '✅' },
              { key: 'in_progress', label: 'Active', icon: '🚗' },
              { key: 'completed', label: 'Done', icon: '🎉' },
            ].map(filter => (
              <TouchableOpacity
                key={filter.key}
                style={[styles.headerFilterTab, activeFilter === filter.key && styles.headerActiveFilterTab]}
                onPress={() => setActiveFilter(filter.key)}
              >
                <Text style={styles.headerFilterIcon}>{filter.icon}</Text>
                <Text style={[styles.headerFilterText, activeFilter === filter.key && styles.headerActiveFilterText]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Header>
      }
      footer={<BottomNav />}
    >
      {loading ? renderLoading() : renderContent()}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
  },
  // Header search and filter styles
  headerSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  headerSearchInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 16,
  },
  headerFilters: {
    flexDirection: 'row',
  },
  headerFilterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerActiveFilterTab: {
    backgroundColor: '#fff',
  },
  headerFilterIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  headerFilterText: {
    color: '#fff',
    fontWeight: '500',
  },
  headerActiveFilterText: {
    color: '#2563eb',
  },
  // Main content styles
  tripsContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tripInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tripDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  tripTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  tripDetails: {
    paddingVertical: 12,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 8,
  },
  route: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  vehicle: {
    fontSize: 14,
    color: '#6b7280',
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  viewButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
}); 