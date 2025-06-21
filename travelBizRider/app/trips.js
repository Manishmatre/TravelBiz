import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getAllDriverTrips } from '../services/api';
import BottomNav from '../src/components/BottomNav';
import { useRouter } from 'expo-router';

export default function Trips() {
  const { token } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchTrips();
  }, [token]);

  useEffect(() => {
    filterTrips();
  }, [trips, searchQuery, activeFilter]);

  async function fetchTrips() {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllDriverTrips(token);
      setTrips(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await fetchTrips();
    setRefreshing(false);
  }

  function filterTrips() {
    let filtered = trips;

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(trip => {
        if (activeFilter === 'today') {
          const today = new Date().toDateString();
          const tripDate = new Date(trip.startDate).toDateString();
          return tripDate === today;
        }
        return trip.status.toLowerCase() === activeFilter;
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(trip => 
        trip.client?.name?.toLowerCase().includes(query) ||
        trip.pickup?.toLowerCase().includes(query) ||
        trip.destination?.toLowerCase().includes(query) ||
        trip.vehicle?.name?.toLowerCase().includes(query)
      );
    }

    setFilteredTrips(filtered);
  }

  function getStatusColor(status) {
    switch (status?.toLowerCase()) {
      case 'completed': return '#10b981';
      case 'in_progress': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'pending': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  }

  function getStatusIcon(status) {
    switch (status?.toLowerCase()) {
      case 'completed': return '✅';
      case 'in_progress': return '🚗';
      case 'confirmed': return '📋';
      case 'pending': return '⏳';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading trips...</Text>
        </View>
        <BottomNav />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Trips</Text>
        <Text style={styles.subtitle}>{filteredTrips.length} trip{filteredTrips.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search trips..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {[
          { key: 'all', label: 'All' },
          { key: 'today', label: 'Today' },
          { key: 'pending', label: 'Pending' },
          { key: 'confirmed', label: 'Confirmed' },
          { key: 'in_progress', label: 'Active' },
          { key: 'completed', label: 'Completed' },
        ].map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              activeFilter === filter.key && styles.activeFilterTab
            ]}
            onPress={() => setActiveFilter(filter.key)}
          >
            <Text style={[
              styles.filterText,
              activeFilter === filter.key && styles.activeFilterText
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Trips List */}
      <ScrollView 
        style={styles.tripsContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
                : 'You\'ll see your trips here once they\'re assigned'
              }
            </Text>
          </View>
        ) : (
          filteredTrips.map((trip, index) => (
            <TouchableOpacity
              key={trip._id || index}
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
                <Text style={styles.clientName}>
                  👤 {trip.client?.name || 'Client'}
                </Text>
                <Text style={styles.route}>
                  📍 {trip.pickup} → {trip.destination}
                </Text>
                {trip.vehicle && (
                  <Text style={styles.vehicle}>
                    🚗 {trip.vehicle.name} ({trip.vehicle.numberPlate})
                  </Text>
                )}
              </View>

              <View style={styles.tripFooter}>
                <Text style={styles.price}>
                  ${trip.price || '0'}
                </Text>
                <TouchableOpacity 
                  style={styles.viewButton}
                  onPress={() => router.push(`/trips/${trip._id}`)}
                >
                  <Text style={styles.viewButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <BottomNav />
    </View>
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
  header: {
    backgroundColor: '#2563eb',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
  },
  filterContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  activeFilterTab: {
    backgroundColor: '#2563eb',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeFilterText: {
    color: '#fff',
  },
  tripsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tripInfo: {
    flex: 1,
  },
  tripDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 2,
  },
  tripTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  tripDetails: {
    marginBottom: 12,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  route: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  vehicle: {
    fontSize: 13,
    color: '#9ca3af',
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
    color: '#10b981',
  },
  viewButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
}); 