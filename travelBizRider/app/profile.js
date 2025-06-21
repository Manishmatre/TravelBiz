import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, changePassword } from '../services/api';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomNav from '../src/components/BottomNav';
import Header from '../src/components/Header';
import ScreenLayout from '../src/components/ScreenLayout';
import ProfileInfoCard from '../src/components/ProfileInfoCard';
import ProfileSecurityCard from '../src/components/ProfileSecurityCard';

export default function Profile() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarError, setAvatarError] = useState(false);
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const handlePwFormChange = (key, value) => {
    setPwForm(f => ({ ...f, [key]: value }));
  };

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

  const personalInfoItems = [
    { icon: 'email-outline', label: 'Email', value: profile.email },
    profile.phone && { icon: 'phone-outline', label: 'Phone', value: profile.phone },
    profile.gender && { icon: 'gender-male-female', label: 'Gender', value: profile.gender },
    profile.dateOfBirth && { icon: 'calendar-outline', label: 'Date of Birth', value: new Date(profile.dateOfBirth).toLocaleDateString() },
    address && { icon: 'map-marker-outline', label: 'Address', value: address },
  ];

  const driverInfoItems = [
    profile.licenseNumber && { icon: 'card-account-details-outline', label: 'License #', value: profile.licenseNumber },
    profile.licenseExpiry && { icon: 'calendar-check-outline', label: 'License Expiry', value: new Date(profile.licenseExpiry).toLocaleDateString() },
    profile.assignedVehicle && { icon: 'car-outline', label: 'Vehicle', value: `${profile.assignedVehicle.name} (${profile.assignedVehicle.numberPlate})` },
  ];

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

        <ProfileInfoCard title="Personal Information" items={personalInfoItems} />
        <ProfileInfoCard title="Driver Information" items={driverInfoItems} />

        <ProfileSecurityCard
          pwForm={pwForm}
          onPwFormChange={handlePwFormChange}
          onSubmit={handleChangePassword}
          isLoading={pwLoading}
        />

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
  
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    paddingVertical: 14,
    borderRadius: 12,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 