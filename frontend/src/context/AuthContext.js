import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { setAuthToken } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user/token from AsyncStorage on startup
  useEffect(() => {
    const loadUser = async () => {
      try {
        const [storedUser, storedToken] = await Promise.all([
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem('token'),
        ]);

        if (storedToken) {
          setAuthToken(storedToken);
        }

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
      const response = await api.post('/api/auth/login', { email, password });

      // Backend shape: { success, message, data: { id, name, email, role, token } }
      const payload = response?.data?.data;
      const token = payload?.token;
      const backendRole = payload?.role;
      const uiRole = ['SuperAdmin', 'ClubAdmin', 'admin'].includes(backendRole) ? 'admin' : 'student';
      const nextUser = payload
        ? { id: payload.id, name: payload.name, email: payload.email, role: uiRole, backendRole }
        : null;

      if (!token || !nextUser) {
        return { success: false, message: 'Login failed: invalid server response' };
      }

      await AsyncStorage.setItem('user', JSON.stringify(nextUser));
      await AsyncStorage.setItem('token', token);
      setAuthToken(token);
      setUser(nextUser);

      return { success: true };
    } catch (e) {
      return { success: false, message: e.response?.data?.message || 'Login failed' };
    }
  };

  const signup = async (name, email, password, role) => {
    try {
      // Backend endpoint is /api/auth/register
      const response = await api.post('/api/auth/register', { name, email, password, role });

      const payload = response?.data?.data;
      const token = payload?.token;
      const backendRole = payload?.role;
      const uiRole = ['SuperAdmin', 'ClubAdmin', 'admin'].includes(backendRole) ? 'admin' : 'student';
      const nextUser = payload
        ? { id: payload.id, name: payload.name, email: payload.email, role: uiRole, backendRole }
        : null;

      if (!token || !nextUser) {
        return { success: false, message: 'Signup failed: invalid server response' };
      }

      await AsyncStorage.setItem('user', JSON.stringify(nextUser));
      await AsyncStorage.setItem('token', token);
      setAuthToken(token);
      setUser(nextUser);

      return { success: true };
    } catch (e) {
      return { success: false, message: e.response?.data?.message || 'Signup failed' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      setAuthToken(null);
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
