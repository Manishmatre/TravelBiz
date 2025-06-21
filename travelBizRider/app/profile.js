import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, Button, Alert, ScrollView } from 'react-native';
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

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError(null);
      try {
        const data = await getProfile(token);
        setProfile(data);
        setForm({ name: data.name, email: data.email, phone: data.phone });
      } catch (err) {
        setError(err.message);
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

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  if (error) return <View style={styles.center}><Text style={{color:'red'}}>{error}</Text></View>;
  if (!profile) return <View style={styles.center}><Text>Profile not found.</Text></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {edit ? (
        <>
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={v => setForm(f => ({ ...f, name: v }))}
            placeholder="Name"
          />
          <TextInput
            style={styles.input}
            value={form.email}
            onChangeText={v => setForm(f => ({ ...f, email: v }))}
            placeholder="Email"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            value={form.phone}
            onChangeText={v => setForm(f => ({ ...f, phone: v }))}
            placeholder="Phone"
            keyboardType="phone-pad"
          />
          <Button title="Save" onPress={handleSave} disabled={loading} />
          <Button title="Cancel" onPress={() => setEdit(false)} color="gray" />
        </>
      ) : (
        <>
          <Text style={styles.label}>Name: {profile.name}</Text>
          <Text style={styles.label}>Email: {profile.email}</Text>
          <Text style={styles.label}>Phone: {profile.phone}</Text>
          <Button title="Edit Profile" onPress={() => setEdit(true)} />
        </>
      )}
      <View style={styles.divider} />
      <Text style={styles.subtitle}>Change Password</Text>
      <TextInput
        style={styles.input}
        value={pwForm.oldPassword}
        onChangeText={v => setPwForm(f => ({ ...f, oldPassword: v }))}
        placeholder="Old Password"
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        value={pwForm.newPassword}
        onChangeText={v => setPwForm(f => ({ ...f, newPassword: v }))}
        placeholder="New Password"
        secureTextEntry
      />
      <Button title={pwLoading ? 'Changing...' : 'Change Password'} onPress={handleChangePassword} disabled={pwLoading} />
      <View style={{ marginVertical: 24 }} />
      <Button title="Logout" color="red" onPress={() => { logout(); router.replace('/login'); }} />
      <BottomNav />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 24,
  },
}); 