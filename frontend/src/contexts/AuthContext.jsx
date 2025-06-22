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
      console.log('User data loaded:', res.data);
      setUser(res.data);
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    if (token) {
      axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          console.log('User data loaded on mount:', res.data);
          setUser(res.data);
        })
        .catch((error) => {
          console.error('Error loading user on mount:', error);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const fetchAgency = async () => {
      if (user && token) {
        try {
          const agencyData = await getAgencyProfile(token);
          console.log('Agency data loaded:', agencyData);
          setAgency(agencyData);
        } catch (err) {
          console.error('Error loading agency:', err);
          setAgency(null);
        }
      }
    };
    fetchAgency();
  }, [user, token]);

  const login = async (email, password) => {
    console.log('Login attempt with:', { email });
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    const { token: new_token, user: new_user } = res.data;
    
    console.log('Login response:', { new_token, new_user });
    
    setToken(new_token);
    localStorage.setItem('token', new_token);
    setUser(new_user);
    console.log('User after login:', new_user);
    
    // Fetch agency profile immediately after login
    if (new_user && new_token) {
      try {
        const agencyData = await getAgencyProfile(new_token);
        console.log('Agency data loaded on login:', agencyData);
        setAgency(agencyData);
      } catch (err) {
        console.error('Error loading agency on login:', err);
        setAgency(null);
      }
    }
    
    return new_user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAgency(null);
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