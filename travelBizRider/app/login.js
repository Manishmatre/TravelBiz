import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native';
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
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const data = await loginDriver(email, password);
      await login(data.token, data.user);
      router.replace('/dashboard');
    } catch (err) {
      Alert.alert('Login Failed', err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.welcome}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account to continue</Text>
        </View>
        {/* Form */}
        <View style={{ marginTop: 12 }}>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="email" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#aaa"
              autoComplete="email"
              textContentType="emailAddress"
            />
          </View>
          <View style={styles.inputWrapper}>
            <Feather name="lock" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#aaa"
              autoComplete="password"
              textContentType="password"
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(v => !v)}>
              {showPassword ? (
                <Feather name="eye-off" size={20} color="#888" />
              ) : (
                <Feather name="eye" size={20} color="#888" />
              )}
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.forgot} onPress={() => Alert.alert('Forgot password?', 'Please contact your admin.')}> 
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Feather name="log-in" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
          </TouchableOpacity>
        </View>
        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>New to TravelBiz?</Text>
          <View style={styles.divider} />
        </View>
        {/* Register Link */}
        <TouchableOpacity style={styles.registerLink} onPress={() => router.replace('/register')}>
          <Feather name="user-plus" size={16} color="#2563eb" />
          <Text style={styles.registerText}>Create your account</Text>
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
    backgroundColor: 'linear-gradient(90deg, #2563eb, #38bdf8)',
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
  eyeIcon: {
    padding: 4,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  forgotText: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '500',
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