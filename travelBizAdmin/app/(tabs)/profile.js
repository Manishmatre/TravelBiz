import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenLayout from '../../src/components/ScreenLayout';
import Header from '../../src/components/Header';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '../../services/api';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      if (user?.token) {
        const data = await getUserProfile(user.token);
        setProfile(data);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not fetch profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ]
    );
  };

  const ProfileSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const ProfileItem = ({ icon, label, value, onPress }) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress}>
      <View style={styles.profileItemLeft}>
        <MaterialCommunityIcons name={icon} size={24} color="#6b7280" />
        <View style={styles.profileItemContent}>
          <Text style={styles.profileItemLabel}>{label}</Text>
          <Text style={styles.profileItemValue}>{value || 'Not set'}</Text>
        </View>
      </View>
      {onPress && <MaterialCommunityIcons name="chevron-right" size={20} color="#9ca3af" />}
    </TouchableOpacity>
  );

  return (
    <ScreenLayout
      header={
        <Header 
          title="Profile"
          rightActions={[{ icon: 'cog', onPress: () => {} }]}
        />
      }
    >
      <ScrollView style={styles.container}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {profile?.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons name="account" size={40} color="#fff" />
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{profile?.name || user?.name || 'User'}</Text>
            <Text style={styles.email}>{profile?.email || user?.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1) || 'Admin'}
              </Text>
            </View>
          </View>
        </View>

        {/* Personal Information */}
        <ProfileSection title="Personal Information">
          <ProfileItem 
            icon="account" 
            label="Full Name" 
            value={profile?.name}
            onPress={() => {}}
          />
          <ProfileItem 
            icon="email" 
            label="Email" 
            value={profile?.email}
            onPress={() => {}}
          />
          <ProfileItem 
            icon="phone" 
            label="Phone" 
            value={profile?.phone}
            onPress={() => {}}
          />
          <ProfileItem 
            icon="calendar" 
            label="Date of Birth" 
            value={profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : null}
            onPress={() => {}}
          />
        </ProfileSection>

        {/* Professional Information */}
        <ProfileSection title="Professional Information">
          <ProfileItem 
            icon="briefcase" 
            label="Job Title" 
            value={profile?.jobTitle}
            onPress={() => {}}
          />
          <ProfileItem 
            icon="office-building" 
            label="Department" 
            value={profile?.department}
            onPress={() => {}}
          />
          <ProfileItem 
            icon="card-account-details" 
            label="Employee ID" 
            value={profile?.employeeId}
            onPress={() => {}}
          />
          <ProfileItem 
            icon="calendar-check" 
            label="Joining Date" 
            value={profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : null}
            onPress={() => {}}
          />
        </ProfileSection>

        {/* Settings */}
        <ProfileSection title="Settings">
          <ProfileItem 
            icon="bell" 
            label="Notifications" 
            value={profile?.notifications ? 'Enabled' : 'Disabled'}
            onPress={() => {}}
          />
          <ProfileItem 
            icon="shield-check" 
            label="Two-Factor Authentication" 
            value={profile?.twofa ? 'Enabled' : 'Disabled'}
            onPress={() => {}}
          />
          <ProfileItem 
            icon="theme-light-dark" 
            label="Theme" 
            value={profile?.theme || 'System'}
            onPress={() => {}}
          />
        </ProfileSection>

        {/* Actions */}
        <ProfileSection title="Actions">
          <ProfileItem 
            icon="account-edit" 
            label="Edit Profile" 
            value=""
            onPress={() => {}}
          />
          <ProfileItem 
            icon="lock-reset" 
            label="Change Password" 
            value=""
            onPress={() => {}}
          />
          <ProfileItem 
            icon="help-circle" 
            label="Help & Support" 
            value=""
            onPress={() => {}}
          />
          <ProfileItem 
            icon="logout" 
            label="Logout" 
            value=""
            onPress={handleLogout}
          />
        </ProfileSection>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
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
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileItemContent: {
    marginLeft: 12,
    flex: 1,
  },
  profileItemLabel: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 2,
  },
  profileItemValue: {
    fontSize: 14,
    color: '#6b7280',
  },
}); 