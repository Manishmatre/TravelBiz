import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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

export default function UserCard({ user }) {
  const router = useRouter();
  const roleStyle = getRoleStyle(user.role);
  const statusStyle = getStatusStyle(user.status);

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => router.push(`/user/${user._id}`)}
    >
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
        <View style={styles.badges}>
          <View style={[styles.roleBadge, { backgroundColor: roleStyle.backgroundColor }]}>
            <Text style={[styles.roleText, { color: roleStyle.color }]}>
              {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'User'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>
              {user.status?.charAt(0).toUpperCase() + user.status?.slice(1) || 'Unknown'}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.infoRow}>
        <MaterialCommunityIcons name="phone" size={16} color="#6b7280" />
        <Text style={styles.infoText}>{user.phone || 'No phone'}</Text>
      </View>

      {user.role === 'driver' && (
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="car" size={16} color="#6b7280" />
          <Text style={styles.infoText}>
            {user.assignedVehicle ? 'Vehicle Assigned' : 'No Vehicle Assigned'}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.dateText}>
          Joined: {new Date(user.createdAt).toLocaleDateString()}
        </Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#9ca3af" />
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: '#6b7280',
  },
  badges: {
    alignItems: 'flex-end',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 6,
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
    fontSize: 12,
    color: '#6b7280',
  },
}); 