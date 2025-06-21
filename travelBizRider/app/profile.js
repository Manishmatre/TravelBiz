import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, changePassword } from '../services/api';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomNav from '../src/components/BottomNav';
import Header from '../src/components/Header';
import ScreenLayout from '../src/components/ScreenLayout';

export default function Profile() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarError, setAvatarError] = useState(false);
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const profileData = await getProfile(token);
        setProfile(profileData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [token]);

  async function handleChangePassword() {
    if (!pwForm.oldPassword || !pwForm.newPassword) {
      Alert.alert('Error', 'Please enter both your current and new passwords.');
      return;
    }
    setPwLoading(true);
    try {
      const res = await changePassword(token, user._id, pwForm);
      Alert.alert('Success', res.message);
      setPwForm({ oldPassword: '', newPassword: '' });
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setPwLoading(false);
    }
  }

  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderLoading = () => (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#2563eb" />
      <Text style={styles.loadingText}>Loading Profile...</Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.center}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );
  
  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <MaterialCommunityIcons name={icon} size={22} color="#6b7280" style={styles.infoIcon} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
    </View>
  );

  if (loading) {
    return (
      <ScreenLayout header={<Header title="Profile" />} footer={<BottomNav />}>
        {renderLoading()}
      </ScreenLayout>
    );
  }
  
  if (error || !profile) {
    return (
      <ScreenLayout header={<Header title="Profile" subtitle="Error" />} footer={<BottomNav />}>
        {renderError()}
      </ScreenLayout>
    );
  }

  const address = profile.address ? [profile.address.street, profile.address.city, profile.address.state, profile.address.country, profile.address.postalCode].filter(Boolean).join(', ') : '';

  return (
    <ScreenLayout
      header={
        <Header
          title={profile.name}
          subtitle={profile.role}
          rightActions={[
            { icon: '🏠', onPress: () => router.push('/dashboard') }
          ]}
        />
      }
      footer={<BottomNav />}
    >
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarContainer}>
            {profile.avatarUrl && !avatarError ? (
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} onError={() => setAvatarError(true)} />
            ) : (
              <View style={[styles.avatar, styles.initialsAvatar]}>
                <Text style={styles.initialsText}>{getInitials(profile.name)}</Text>
              </View>
            )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.card}>
            <InfoRow icon="email-outline" label="Email" value={profile.email} />
            {profile.phone && <InfoRow icon="phone-outline" label="Phone" value={profile.phone} />}
            {profile.gender && <InfoRow icon="gender-male-female" label="Gender" value={profile.gender} />}
            {profile.dateOfBirth && <InfoRow icon="calendar-outline" label="Date of Birth" value={new Date(profile.dateOfBirth).toLocaleDateString()} />}
            {address && <InfoRow icon="map-marker-outline" label="Address" value={address} />}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver Information</Text>
          <View style={styles.card}>
            {profile.licenseNumber && <InfoRow icon="card-account-details-outline" label="License #" value={profile.licenseNumber} />}
            {profile.licenseExpiry && <InfoRow icon="calendar-check-outline" label="License Expiry" value={new Date(profile.licenseExpiry).toLocaleDateString()} />}
            {profile.assignedVehicle && <InfoRow icon="car-outline" label="Vehicle" value={`${profile.assignedVehicle.name} (${profile.assignedVehicle.numberPlate})`} />}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.card}>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="lock-outline" size={20} color="#9ca3af" />
              <TextInput
                style={styles.input}
                value={pwForm.oldPassword}
                onChangeText={v => setPwForm(f => ({ ...f, oldPassword: v }))}
                placeholder="Current Password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
              />
            </View>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="lock-plus-outline" size={20} color="#9ca3af" />
              <TextInput
                style={styles.input}
                value={pwForm.newPassword}
                onChangeText={v => setPwForm(f => ({ ...f, newPassword: v }))}
                placeholder="New Password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
              />
            </View>
            <TouchableOpacity style={[styles.button, pwLoading && styles.buttonDisabled]} onPress={handleChangePassword} disabled={pwLoading}>
              <Text style={styles.buttonText}>{pwLoading ? 'Changing...' : 'Change Password'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={() => { logout(); router.replace('/login'); }}>
            <MaterialCommunityIcons name="logout" size={22} color="#ef4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  loadingText: { marginTop: 10, fontSize: 16, color: '#6b7280' },
  errorText: { fontSize: 16, color: '#ef4444', textAlign: 'center' },
  scrollContainer: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  
  avatarContainer: {
    alignItems: 'center',
    marginTop: -60, // Pull the avatar up to overlap with the header area
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#f8f9fa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
  initialsAvatar: { backgroundColor: '#2563eb' },
  initialsText: { color: '#fff', fontSize: 36, fontWeight: 'bold' },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 12 },
  
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },
  
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoRowLast: { borderBottomWidth: 0 },
  infoIcon: { marginRight: 12 },
  infoLabel: { fontSize: 15, color: '#6b7280', width: 110 },
  infoValue: { flex: 1, fontSize: 15, color: '#1f2937', fontWeight: '500', textAlign: 'left' },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  input: { flex: 1, paddingVertical: 12, fontSize: 16, marginLeft: 8 },

  button: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#9ca3af' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
}); 