import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenLayout from '../../src/components/ScreenLayout';
import Header from '../../src/components/Header';
import BookingFormModal from '../../src/components/BookingFormModal';
import { useAuth } from '../../contexts/AuthContext';
import { getBookingById, updateBookingStatus } from '../../services/api';

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

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { token } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      if (!token || !id) return;
      const data = await getBookingById(token, id);
      setBooking(data);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch booking details.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      await updateBookingStatus(token, id, newStatus);
      setBooking(prev => ({ ...prev, status: newStatus }));
      Alert.alert('Success', `Booking status updated to ${newStatus}`);
    } catch (error) {
      Alert.alert('Error', 'Could not update booking status.');
    } finally {
      setUpdating(false);
    }
  };

  const DetailSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const DetailItem = ({ icon, label, value }) => (
    <View style={styles.detailItem}>
      <MaterialCommunityIcons name={icon} size={20} color="#6b7280" />
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || 'Not specified'}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <ScreenLayout
        header={<Header title="Booking Details" showBack />}
      >
        <ActivityIndicator size="large" color="#2563eb" />
      </ScreenLayout>
    );
  }

  if (!booking) {
    return (
      <ScreenLayout
        header={<Header title="Booking Details" showBack />}
      >
        <Text style={styles.errorText}>Booking not found</Text>
      </ScreenLayout>
    );
  }

  const statusStyle = getStatusStyle(booking.status);

  return (
    <ScreenLayout
      header={<Header title="Booking Details" showBack rightActions={[{ icon: 'pencil', onPress: () => setShowEdit(true) }]} />}
    >
      <ScrollView style={styles.container}>
        {/* Status Header */}
        <View style={styles.statusHeader}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>
              {booking.status}
            </Text>
          </View>
          <Text style={styles.bookingId}>#{booking._id.slice(-8)}</Text>
        </View>

        {/* Client Information */}
        <DetailSection title="Client Information">
          <DetailItem 
            icon="account" 
            label="Name" 
            value={booking.client?.name}
          />
          <DetailItem 
            icon="email" 
            label="Email" 
            value={booking.client?.email}
          />
          <DetailItem 
            icon="phone" 
            label="Phone" 
            value={booking.client?.phone}
          />
        </DetailSection>

        {/* Driver Information */}
        <DetailSection title="Driver Information">
          <DetailItem 
            icon="account-tie" 
            label="Name" 
            value={booking.driver?.name || 'Unassigned'}
          />
          <DetailItem 
            icon="email" 
            label="Email" 
            value={booking.driver?.email}
          />
          <DetailItem 
            icon="phone" 
            label="Phone" 
            value={booking.driver?.phone}
          />
          <DetailItem 
            icon="car" 
            label="Vehicle" 
            value={booking.vehicle?.name}
          />
        </DetailSection>

        {/* Trip Details */}
        <DetailSection title="Trip Details">
          <DetailItem 
            icon="map-marker" 
            label="Pickup Location" 
            value={booking.pickup}
          />
          <DetailItem 
            icon="map-marker-check" 
            label="Destination" 
            value={booking.destination}
          />
          <DetailItem 
            icon="calendar" 
            label="Start Date" 
            value={booking.startDate ? new Date(booking.startDate).toLocaleString() : 'Not set'}
          />
          <DetailItem 
            icon="calendar-check" 
            label="End Date" 
            value={booking.endDate ? new Date(booking.endDate).toLocaleString() : 'Not set'}
          />
        </DetailSection>

        {/* Payment Information */}
        <DetailSection title="Payment Information">
          <DetailItem 
            icon="cash" 
            label="Amount" 
            value={`$${booking.payment?.amountPaid || '0.00'}`}
          />
          <DetailItem 
            icon="credit-card" 
            label="Payment Mode" 
            value={booking.payment?.mode}
          />
          <DetailItem 
            icon="calendar-clock" 
            label="Payment Date" 
            value={booking.payment?.date ? new Date(booking.payment.date).toLocaleDateString() : 'Not paid'}
          />
        </DetailSection>

        {/* Booking Information */}
        <DetailSection title="Booking Information">
          <DetailItem 
            icon="calendar-plus" 
            label="Created" 
            value={new Date(booking.createdAt).toLocaleString()}
          />
          <DetailItem 
            icon="calendar-edit" 
            label="Last Updated" 
            value={new Date(booking.updatedAt).toLocaleString()}
          />
          {booking.notes && (
            <DetailItem 
              icon="note-text" 
              label="Notes" 
              value={booking.notes}
            />
          )}
        </DetailSection>

        {/* Action Buttons */}
        {booking.status === 'Pending' && (
          <View style={styles.actionSection}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.startButton]}
              onPress={() => handleStatusUpdate('In-Progress')}
              disabled={updating}
            >
              <MaterialCommunityIcons name="play" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Start Trip</Text>
            </TouchableOpacity>
          </View>
        )}

        {booking.status === 'In-Progress' && (
          <View style={styles.actionSection}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => handleStatusUpdate('Completed')}
              disabled={updating}
            >
              <MaterialCommunityIcons name="check" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Complete Trip</Text>
            </TouchableOpacity>
          </View>
        )}

        {['Pending', 'In-Progress'].includes(booking.status) && (
          <View style={styles.actionSection}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => {
                Alert.alert(
                  'Cancel Booking',
                  'Are you sure you want to cancel this booking?',
                  [
                    { text: 'No', style: 'cancel' },
                    { text: 'Yes', style: 'destructive', onPress: () => handleStatusUpdate('Cancelled') }
                  ]
                );
              }}
              disabled={updating}
            >
              <MaterialCommunityIcons name="close" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Cancel Booking</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      <BookingFormModal 
        visible={showEdit} 
        onClose={() => setShowEdit(false)} 
        onSuccess={() => { setShowEdit(false); fetchBooking(); }}
        initialData={booking}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusHeader: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bookingId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  actionSection: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 8,
  },
  startButton: {
    backgroundColor: '#3b82f6',
  },
  completeButton: {
    backgroundColor: '#10b981',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#6b7280',
  },
}); 