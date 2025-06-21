import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Platform, ActivityIndicator, KeyboardAvoidingView, ScrollView } from 'react-native';
import { loginDriver } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Feather } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    let isValid = true;
    
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const data = await loginDriver(email, password);
      console.log('LOGIN: token received:', data.token);
      await login(data.token, data.user);
      router.replace('/dashboard');
    } catch (err) {
      Alert.alert('Login Failed', err.message || 'Invalid credentials. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

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
              <Text style={styles.welcome}>Welcome Back!</Text>
              <Text style={styles.subtitle}>Sign in to your driver account</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="email" size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, emailError && styles.inputError]}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
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

              <View style={styles.inputWrapper}>
                <Feather name="lock" size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, passwordError && styles.inputError]}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError('');
                  }}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#9ca3af"
                  autoComplete="password"
                  textContentType="password"
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(v => !v)}>
                  {showPassword ? (
                    <Feather name="eye-off" size={20} color="#6b7280" />
                  ) : (
                    <Feather name="eye" size={20} color="#6b7280" />
                  )}
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

              <TouchableOpacity 
                style={styles.forgot} 
                onPress={() => Alert.alert('Forgot Password', 'Please contact your administrator to reset your password.')}
              > 
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                ) : (
                  <Feather name="log-in" size={18} color="#fff" style={{ marginRight: 8 }} />
                )}
                <Text style={styles.buttonText}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>New to TravelBiz?</Text>
              <View style={styles.divider} />
            </View>

            {/* Register Link */}
            <TouchableOpacity 
              style={styles.registerLink} 
              onPress={() => router.replace('/register')}
            >
              <Feather name="user-plus" size={16} color="#2563eb" />
              <Text style={styles.registerText}>Create your account</Text>
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
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    width: '100%',
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
  registerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f0f9ff',
  },
  registerText: {
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