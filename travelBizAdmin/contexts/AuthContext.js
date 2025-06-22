import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Note: We will create this api file next
// import * as api from '../services/api';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

function useProtectedRoute(user) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    
    if (!user && !inAuthGroup) {
      router.replace('/login');
    } else if (user && inAuthGroup) {
      router.replace('/dashboard');
    }
  }, [user, segments, router]);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  
  useEffect(() => {
    async function loadAuthData() {
      try {
        const storedToken = await AsyncStorage.getItem('admin_token');
        const storedUser = await AsyncStorage.getItem('admin_user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Failed to load auth data from storage', e);
      }
    }
    loadAuthData();
  }, []);
  
  useProtectedRoute(user);

  const login = async (email, password) => {
    // const { token, user } = await api.loginAdmin(email, password);
    // For now, we'll use mock data until the API is ready
    const mockToken = 'mock-admin-token';
    const mockUser = { name: 'Admin User', email, role: 'admin' };
    
    await AsyncStorage.setItem('admin_token', mockToken);
    await AsyncStorage.setItem('admin_user', JSON.stringify(mockUser));
    
    setToken(mockToken);
    setUser(mockUser);
  };
  
  const logout = async () => {
    await AsyncStorage.removeItem('admin_token');
    await AsyncStorage.removeItem('admin_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
} 