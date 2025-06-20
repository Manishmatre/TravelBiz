import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getBookings } from '../services/bookingService';
import { socket } from '../services/socket';
import { useAuth } from './AuthContext';

const BookingsContext = createContext();

export function BookingsProvider({ children }) {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getBookings(null, token);
      setBookings(data);
    } catch (e) {
      // Optionally handle error
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    socket.on('bookingCreated', (booking) => {
      setBookings(prev => [booking, ...prev]);
    });
    socket.on('bookingUpdated', (updated) => {
      setBookings(prev => prev.map(b => b._id === updated._id ? updated : b));
    });
    socket.on('bookingDeleted', (deletedId) => {
      setBookings(prev => prev.filter(b => b._id !== deletedId));
    });
    return () => {
      socket.off('bookingCreated');
      socket.off('bookingUpdated');
      socket.off('bookingDeleted');
    };
  }, []);

  return (
    <BookingsContext.Provider value={{ bookings, fetchBookings, loading }}>
      {children}
    </BookingsContext.Provider>
  );
}

export function useBookings() {
  return useContext(BookingsContext);
} 