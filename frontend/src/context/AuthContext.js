import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from AsyncStorage on startup
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Failed to load user', e);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user } = response.data;
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('token', response.data.token);
      setUser(user);
      return { success: true };
    } catch (e) {
      return { success: false, message: e.response?.data?.message || 'Login failed' };
    }
  };

  const signup = async (name, email, password, role) => {
    try {
      const response = await api.post('/auth/signup', { name, email, password, role });
      const { user } = response.data;
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('token', response.data.token);
      setUser(user);
      return { success: true };
    } catch (e) {
      return { success: false, message: 'Signup failed' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      setUser(null);
    } catch (e) {
      console.error('Logout error', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
