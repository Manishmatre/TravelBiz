import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { getAgencyProfile } from '../services/agencyService';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [agency, setAgency] = useState(null);

  const reloadUser = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    if (token) {
      axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => setUser(res.data))
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const fetchAgency = async () => {
      if (user && user.token) {
        try {
          const agencyData = await getAgencyProfile(user.token);
          setAgency(agencyData);
        } catch (err) {
          setAgency(null);
        }
      }
    };
    fetchAgency();
  }, [user]);

  const login = async (email, password) => {
    console.log('Login attempt with:', { email });
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    console.log('Login response:', res.data);
    setToken(res.data.token);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    console.log('User after login:', res.data.user);
    return res.data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, reloadUser, agency }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}