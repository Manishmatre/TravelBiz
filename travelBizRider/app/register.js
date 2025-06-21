import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Feather } from '@expo/vector-icons';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const router = useRouter();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    let isValid = true;
    
    if (!form.name.trim()) {
      setNameError('Full name is required');
      isValid = false;
    } else if (form.name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      isValid = false;
    } else {
      setNameError('');
    }

    if (!form.email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(form.email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    } else {
      setEmailError('');
    }

    return isValid;
  };

  async function handleRegister() {
    if (!validateForm()) return;
    
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
      Alert.alert(
        'Registration Successful!', 
        'Your account has been created. Please check your email for further instructions to complete your registration.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient
      colors={["#1e40af", "#3b82f6", "#60a5fa"]}
      style={styles.gradient}
    >
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>🚗</Text>
              </View>
              <Text style={styles.brandText}>TravelBiz</Text>
              <Text style={styles.welcome}>Join Our Team!</Text>
              <Text style={styles.subtitle}>Register as a driver to start earning</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="person" size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, nameError && styles.inputError]}
                  placeholder="Enter your full name"
                  value={form.name}
                  onChangeText={v => {
                    setForm(f => ({ ...f, name: v }));
                    if (nameError) setNameError('');
                  }}
                  placeholderTextColor="#9ca3af"
                  textContentType="name"
                  autoCapitalize="words"
                />
              </View>
              {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

              <View style={styles.inputWrapper}>
                <MaterialIcons name="email" size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, emailError && styles.inputError]}
                  placeholder="Enter your email address"
                  value={form.email}
                  onChangeText={v => {
                    setForm(f => ({ ...f, email: v }));
                    if (emailError) setEmailError('');
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor="#9ca3af"
                  autoComplete="email"
                  textContentType="emailAddress"
                />
              </View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              {success ? <Text style={styles.successText}>Registration successful! Check your email.</Text> : null}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                ) : (
                  <Feather name="user-plus" size={18} color="#fff" style={{ marginRight: 8 }} />
                )}
                <Text style={styles.buttonText}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>

              {/* Info Box */}
              <View style={styles.infoBox}>
                <MaterialIcons name="info" size={16} color="#2563eb" />
                <Text style={styles.infoText}>
                  After registration, you'll receive an email with instructions to complete your account setup.
                </Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>Already have an account?</Text>
              <View style={styles.divider} />
            </View>

            {/* Login Link */}
            <TouchableOpacity 
              style={styles.loginLink} 
              onPress={() => router.replace('/login')}
            >
              <Feather name="log-in" size={16} color="#2563eb" />
              <Text style={styles.loginText}>Back to Login</Text>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>&copy; 2024 TravelBiz. All rights reserved.</Text>
              <Text style={styles.footerSubtext}>Driver App v1.0</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    backgroundColor: '#2563eb',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  iconText: {
    fontSize: 28,
  },
  brandText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  welcome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  form: {
    width: '100%',
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#374151',
    backgroundColor: 'transparent',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  successText: {
    color: '#10b981',
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    width: '100%',
    marginTop: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'flex-start',
  },
  infoText: {
    color: '#1e40af',
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    width: '100%',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  loginLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f0f9ff',
  },
  loginText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtext: {
    color: '#9ca3af',
    fontSize: 10,
    textAlign: 'center',
  },
}); 