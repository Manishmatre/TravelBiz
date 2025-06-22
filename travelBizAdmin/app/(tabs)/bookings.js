import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import ScreenLayout from '../../src/components/ScreenLayout';
import Header from '../../src/components/Header';
import BookingCard from '../../src/components/BookingCard';
import BookingFormModal from '../../src/components/BookingFormModal';
import { useAuth } from '../../contexts/AuthContext';
import { getBookings } from '../../services/api';

const TABS = ['All', 'Pending', 'In-Progress', 'Completed', 'Cancelled'];

export default function BookingsScreen() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      if (!token) return;
      const data = await getBookings(token, activeTab);
      setBookings(data);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch bookings.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, activeTab]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings();
  }, [fetchBookings]);

  const renderTab = (tab) => (
    <TouchableOpacity 
      key={tab}
      style={[styles.tab, activeTab === tab && styles.activeTab]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenLayout
      header={
        <Header 
          title="Bookings"
          rightActions={[{ icon: 'plus-circle-outline', onPress: () => setShowModal(true) }]}
        />
      }
    >
      <View style={styles.tabContainer}>
        {TABS.map(renderTab)}
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : (
        <FlatList
          data={bookings}
          renderItem={({ item }) => <BookingCard booking={item} />}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingTop: 10 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No bookings found for this status.</Text>}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
      <BookingFormModal 
        visible={showModal} 
        onClose={() => setShowModal(false)} 
        onSuccess={fetchBookings}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 4,
    marginBottom: 8,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#2563eb',
  },
  tabText: {
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#6b7280',
  },
}); 