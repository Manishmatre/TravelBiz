import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const t = await AsyncStorage.getItem('token');
        const u = await AsyncStorage.getItem('user');
        if (t && u) {
          setToken(t);
          setUser(JSON.parse(u));
        }
      } catch (err) {
        console.error('Auth load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const login = async (token, user) => {
    setToken(token);
    setUser(user);
    try {
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } catch (err) {
      console.error('Auth save error:', err);
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (err) {
      console.error('Auth remove error:', err);
    }
  };

  if (loading) {
    // Optionally, show a splash/loading screen here
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 