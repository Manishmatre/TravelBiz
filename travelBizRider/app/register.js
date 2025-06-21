import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Feather } from '@expo/vector-icons';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleRegister() {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role: 'driver' }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Registration failed');
      setSuccess(true);
      Alert.alert('Success', 'Registration successful! Please check your email for further instructions.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient
      colors={["#e0e7ff", "#fff", "#bae6fd"]}
      style={styles.gradient}
    >
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>T</Text>
          </View>
          <Text style={styles.brandText}>TravelBiz</Text>
          <Text style={styles.welcome}>Create your account</Text>
          <Text style={styles.subtitle}>Register as a driver to get started</Text>
        </View>
        {/* Form */}
        <View style={{ marginTop: 12 }}>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="person" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={form.name}
              onChangeText={v => setForm(f => ({ ...f, name: v }))}
              placeholderTextColor="#aaa"
              textContentType="name"
            />
          </View>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="email" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={form.email}
              onChangeText={v => setForm(f => ({ ...f, email: v }))}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#aaa"
              autoComplete="email"
              textContentType="emailAddress"
            />
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.success}>Registration successful! Check your email.</Text> : null}
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Feather name="user-plus" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.buttonText}>{loading ? 'Registering...' : 'Register'}</Text>
          </TouchableOpacity>
        </View>
        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>Already have an account?</Text>
          <View style={styles.divider} />
        </View>
        {/* Login Link */}
        <TouchableOpacity style={styles.registerLink} onPress={() => router.replace('/login')}>
          <Feather name="log-in" size={16} color="#2563eb" />
          <Text style={styles.registerText}>Back to Login</Text>
        </TouchableOpacity>
        {/* Footer */}
        <Text style={styles.footer}>&copy; 2024 TravelBiz. All rights reserved.</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '95%',
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    backgroundColor: '#2563eb',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#2563eb',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  iconText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
  },
  brandText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 2,
  },
  welcome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    marginBottom: 14,
    paddingHorizontal: 8,
  },
  inputIcon: {
    marginRight: 4,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#222',
    backgroundColor: 'transparent',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 2,
    marginBottom: 8,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    width: '100%',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 8,
    color: '#888',
    fontSize: 13,
  },
  registerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    width: '100%',
  },
  registerText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 4,
  },
  footer: {
    marginTop: 10,
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
  },
}); 