import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenLayout from '../../src/components/ScreenLayout';
import Header from '../../src/components/Header';
import UserFormModal from '../../src/components/UserFormModal';
import { useAuth } from '../../contexts/AuthContext';
import { getUserById, updateUserStatus, removeUser } from '../../services/api';

const getRoleStyle = (role) => {
  switch (role) {
    case 'driver':
      return { backgroundColor: '#3b82f6', color: '#fff' };
    case 'client':
      return { backgroundColor: '#10b981', color: '#fff' };
    case 'admin':
      return { backgroundColor: '#f59e0b', color: '#fff' };
    default:
      return { backgroundColor: '#e5e7eb', color: '#4b5563' };
  }
};

const getStatusStyle = (status) => {
  switch (status) {
    case 'active':
      return { backgroundColor: '#10b981', color: '#fff' };
    case 'inactive':
      return { backgroundColor: '#ef4444', color: '#fff' };
    default:
      return { backgroundColor: '#e5e7eb', color: '#4b5563' };
  }
};

export default function UserDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { token } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      if (!token || !id) return;
      const data = await getUserById(token, id);
      setUser(data);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch user details.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      await updateUserStatus(token, id, newStatus);
      setUser(prev => ({ ...prev, status: newStatus }));
      Alert.alert('Success', `User status updated to ${newStatus}`);
    } catch (error) {
      Alert.alert('Error', 'Could not update user status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveUser = async () => {
    Alert.alert(
      'Remove User',
      'Are you sure you want to remove this user? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: async () => {
          try {
            setUpdating(true);
            await removeUser(token, id);
            Alert.alert('User removed');
            router.back();
          } catch (error) {
            Alert.alert('Error', 'Could not remove user.');
          } finally {
            setUpdating(false);
          }
        }}
      ]
    );
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
        header={<Header title="User Details" showBack />}
      >
        <ActivityIndicator size="large" color="#2563eb" />
      </ScreenLayout>
    );
  }

  if (!user) {
    return (
      <ScreenLayout
        header={<Header title="User Details" showBack />}
      >
        <Text style={styles.errorText}>User not found</Text>
      </ScreenLayout>
    );
  }

  const roleStyle = getRoleStyle(user.role);
  const statusStyle = getStatusStyle(user.status);

  return (
    <ScreenLayout
      header={<Header title="User Details" showBack rightActions={[{ icon: 'account-edit', onPress: () => setShowEdit(true) }]} />}
    >
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.statusHeader}>
          <View style={[styles.roleBadge, { backgroundColor: roleStyle.backgroundColor }]}>
            <Text style={[styles.roleText, { color: roleStyle.color }]}>{user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>{user.status?.charAt(0).toUpperCase() + user.status?.slice(1)}</Text>
          </View>
        </View>

        {/* Personal Information */}
        <DetailSection title="Personal Information">
          <DetailItem icon="account" label="Name" value={user.name} />
          <DetailItem icon="email" label="Email" value={user.email} />
          <DetailItem icon="phone" label="Phone" value={user.phone} />
          <DetailItem icon="calendar" label="Date of Birth" value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : null} />
        </DetailSection>

        {/* Professional Information */}
        <DetailSection title="Professional Information">
          <DetailItem icon="briefcase" label="Job Title" value={user.jobTitle} />
          <DetailItem icon="office-building" label="Department" value={user.department} />
          <DetailItem icon="card-account-details" label="Employee ID" value={user.employeeId} />
          <DetailItem icon="calendar-check" label="Joining Date" value={user.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : null} />
        </DetailSection>

        {/* Driver/Vehicle Info */}
        {user.role === 'driver' && (
          <DetailSection title="Driver Details">
            <DetailItem icon="car" label="Assigned Vehicle" value={user.assignedVehicle ? 'Assigned' : 'None'} />
            {/* Add more driver-specific info if needed */}
          </DetailSection>
        )}

        {/* Actions */}
        <DetailSection title="Actions">
          {user.status === 'active' ? (
            <TouchableOpacity style={[styles.actionButton, styles.inactiveButton]} onPress={() => handleStatusUpdate('inactive')} disabled={updating}>
              <MaterialCommunityIcons name="account-off" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Set Inactive</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.actionButton, styles.activeButton]} onPress={() => handleStatusUpdate('active')} disabled={updating}>
              <MaterialCommunityIcons name="account-check" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Set Active</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.actionButton, styles.removeButton]} onPress={handleRemoveUser} disabled={updating}>
            <MaterialCommunityIcons name="delete" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Remove User</Text>
          </TouchableOpacity>
        </DetailSection>
      </ScrollView>
      <UserFormModal 
        visible={showEdit} 
        onClose={() => setShowEdit(false)} 
        onSuccess={() => { setShowEdit(false); fetchUser(); }}
        initialData={user}
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
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 8,
  },
  activeButton: {
    backgroundColor: '#10b981',
  },
  inactiveButton: {
    backgroundColor: '#ef4444',
  },
  removeButton: {
    backgroundColor: '#6b7280',
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