import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateProfile, changePassword } from '../services/api';
import BottomNav from '../src/components/BottomNav';
import { useRouter } from 'expo-router';

export default function Profile() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError(null);
      try {
        const data = await getProfile(token);
        setProfile(data);
        setForm({ name: data.name, email: data.email, phone: data.phone });
      } catch (err) {
        setError(err.message || JSON.stringify(err));
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [token]);

  async function handleSave() {
    try {
      setLoading(true);
      await updateProfile(token, form);
      Alert.alert('Success', 'Profile updated!');
      setEdit(false);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword() {
    try {
      setPwLoading(true);
      await changePassword(token, pwForm.oldPassword, pwForm.newPassword);
      Alert.alert('Success', 'Password changed!');
      setPwForm({ oldPassword: '', newPassword: '' });
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setPwLoading(false);
    }
  }

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
        <BottomNav />
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
        <BottomNav />
      </View>
    );
  }
  
  if (!profile) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Profile not found.</Text>
        </View>
        <BottomNav />
      </View>
    );
  }

  const address = profile.address ? `${profile.address.street || ''}, ${profile.address.city || ''}, ${profile.address.state || ''}, ${profile.address.country || ''}, ${profile.address.postalCode || ''}` : '';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👤 Profile</Text>
        <Text style={styles.headerSubtitle}>Manage your account</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarSection}>
            {profile.avatarUrl && (
              <>
                {avatarError ? (
                  <View style={[styles.avatar, styles.initialsContainer]}>
                    <Text style={styles.initialsText}>{getInitials(profile.name)}</Text>
                  </View>
                ) : (
                  <Image
                    source={{ uri: profile.avatarUrl }}
                    style={styles.avatar}
                    onError={() => setAvatarError(true)}
                  />
                )}
              </>
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{profile.name}</Text>
              <Text style={styles.role}>{profile.role}</Text>
              <Text style={styles.status}>{profile.status || 'Active'}</Text>
            </View>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Personal Information</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📧 Email</Text>
              <Text style={styles.infoValue}>{profile.email}</Text>
            </View>
            {profile.phone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📱 Phone</Text>
                <Text style={styles.infoValue}>{profile.phone}</Text>
              </View>
            )}
            {profile.gender && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>👤 Gender</Text>
                <Text style={styles.infoValue}>{profile.gender}</Text>
              </View>
            )}
            {profile.dateOfBirth && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🎂 Date of Birth</Text>
                <Text style={styles.infoValue}>{profile.dateOfBirth}</Text>
              </View>
            )}
            {address.trim().length > 1 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📍 Address</Text>
                <Text style={styles.infoValue}>{address}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Driver Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚗 Driver Information</Text>
          <View style={styles.card}>
            {profile.licenseNumber && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🪪 License Number</Text>
                <Text style={styles.infoValue}>{profile.licenseNumber}</Text>
              </View>
            )}
            {profile.licenseExpiry && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📅 License Expiry</Text>
                <Text style={styles.infoValue}>{profile.licenseExpiry}</Text>
              </View>
            )}
            {profile.assignedVehicle && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🚙 Assigned Vehicle</Text>
                <Text style={styles.infoValue}>
                  {profile.assignedVehicle.numberPlate || profile.assignedVehicle.name}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Change Password */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 Security</Text>
          <View style={styles.card}>
            <TextInput
              style={styles.input}
              value={pwForm.oldPassword}
              onChangeText={v => setPwForm(f => ({ ...f, oldPassword: v }))}
              placeholder="Current Password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              value={pwForm.newPassword}
              onChangeText={v => setPwForm(f => ({ ...f, newPassword: v }))}
              placeholder="New Password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
            />
            <TouchableOpacity 
              style={[styles.button, pwLoading && styles.buttonDisabled]} 
              onPress={handleChangePassword} 
              disabled={pwLoading}
            >
              <Text style={styles.buttonText}>
                {pwLoading ? 'Changing...' : 'Change Password'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={() => { logout(); router.replace('/login'); }}
          >
            <Text style={styles.logoutText}>🚪 Logout</Text>
          </TouchableOpacity>
        </View>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileHeader: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: -20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    marginRight: 16,
  },
  initialsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: '#2563eb',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#374151',
    flex: 2,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#f9fafb',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
}); 