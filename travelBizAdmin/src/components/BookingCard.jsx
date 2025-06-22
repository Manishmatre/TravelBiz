import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const getStatusStyle = (status) => {
  switch (status) {
    case 'In-Progress':
      return { backgroundColor: '#f59e0b', color: '#fff' };
    case 'Completed':
      return { backgroundColor: '#10b981', color: '#fff' };
    case 'Cancelled':
      return { backgroundColor: '#ef4444', color: '#fff' };
    case 'Pending':
    default:
      return { backgroundColor: '#e5e7eb', color: '#4b5563' };
  }
};

export default function BookingCard({ booking }) {
  const router = useRouter();
  const statusStyle = getStatusStyle(booking.status);

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => router.push(`/booking/${booking._id}`)}
    >
      <View style={styles.header}>
        <Text style={styles.clientName}>{booking.client?.name || 'N/A'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
          <Text style={[styles.statusText, { color: statusStyle.color }]}>{booking.status}</Text>
        </View>
      </View>
      
      <View style={styles.infoRow}>
        <MaterialCommunityIcons name="account-tie" size={20} color="#6b7280" />
        <Text style={styles.infoText}>Driver: {booking.driver?.name || 'Unassigned'}</Text>
      </View>

      <View style={styles.infoRow}>
        <MaterialCommunityIcons name="map-marker-path" size={20} color="#6b7280" />
        <Text style={styles.infoText} numberOfLines={1}>{booking.pickup} → {booking.destination}</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.dateText}>
          {new Date(booking.createdAt).toLocaleDateString()}
        </Text>
        <Text style={styles.priceText}>
          ${booking.payment?.amountPaid || '0.00'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 15,
    color: '#4b5563',
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
}); 