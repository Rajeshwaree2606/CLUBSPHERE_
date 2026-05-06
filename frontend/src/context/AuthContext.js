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
          // Verify token with backend
          try {
            const response = await api.get('/api/auth/me');
            const payload = response?.data?.data;
            if (payload) {
              const backendRole = payload.role;
              const uiRole = ['SuperAdmin', 'ClubAdmin', 'admin'].includes(backendRole) ? 'admin' : 'student';
              const nextUser = { 
                id: payload.id, 
                name: payload.name, 
                email: payload.email, 
                role: uiRole, 
                backendRole,
                xp: parseInt(payload.xp || 0),
                level: parseInt(payload.level || 1)
              };
              setUser(nextUser);
              await AsyncStorage.setItem('user', JSON.stringify(nextUser));
            } else {
              await logout();
            }
          } catch (error) {
            console.error('Session verification failed, logging out...', error.message);
            await logout();
          }
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error('Failed to load user', e);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email, password, roleHint = 'student') => {
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
        throw new Error('Invalid server response');
      }

      await AsyncStorage.setItem('user', JSON.stringify(nextUser));
      await AsyncStorage.setItem('token', token);
      setAuthToken(token);
      setUser(nextUser);

      return { success: true };
    } catch (e) {
      // TEMP DEMO AUTH BYPASS - remove after OJT demo
      console.log('Login API failed, using fallback demo bypass. Error:', e.message);
      const isDemoAdmin = roleHint === 'admin' || email.toLowerCase().includes('admin');
      const uiRole = isDemoAdmin ? 'admin' : 'student';
      const backendRole = isDemoAdmin ? 'SuperAdmin' : 'Member';
      const nextUser = {
        id: 'demo-user-' + Math.floor(Math.random() * 10000),
        name: isDemoAdmin ? 'Demo Admin' : 'Demo Student',
        email: email || 'demo@campus.edu',
        role: uiRole,
        backendRole: backendRole,
        xp: 0,
        level: 1
      };
      const token = 'demo-token-bypass-' + Date.now();
      
      await AsyncStorage.setItem('user', JSON.stringify(nextUser));
      await AsyncStorage.setItem('token', token);
      setAuthToken(token);
      setUser(nextUser);
      
      return { success: true };
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
        throw new Error('Invalid server response');
      }

      await AsyncStorage.setItem('user', JSON.stringify(nextUser));
      await AsyncStorage.setItem('token', token);
      setAuthToken(token);
      setUser(nextUser);

      return { success: true };
    } catch (e) {
      // TEMP DEMO AUTH BYPASS - remove after OJT demo
      console.log('Signup API failed, using fallback demo bypass. Error:', e.message);
      const isDemoAdmin = role === 'admin' || email.toLowerCase().includes('admin');
      const uiRole = isDemoAdmin ? 'admin' : 'student';
      const backendRole = isDemoAdmin ? 'SuperAdmin' : 'Member';
      const nextUser = {
        id: 'demo-user-' + Math.floor(Math.random() * 10000),
        name: name || (isDemoAdmin ? 'Demo Admin' : 'Demo Student'),
        email: email || 'demo@campus.edu',
        role: uiRole,
        backendRole: backendRole,
        xp: 0,
        level: 1
      };
      const token = 'demo-token-bypass-' + Date.now();
      
      await AsyncStorage.setItem('user', JSON.stringify(nextUser));
      await AsyncStorage.setItem('token', token);
      setAuthToken(token);
      setUser(nextUser);
      
      return { success: true };
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

  const refreshUser = async () => {
    try {
      const response = await api.get('/api/auth/me');
      const payload = response?.data?.data;
      if (payload) {
        const backendRole = payload.role;
        const uiRole = ['SuperAdmin', 'ClubAdmin', 'admin'].includes(backendRole) ? 'admin' : 'student';
        const nextUser = { 
          id: payload.id, 
          name: payload.name, 
          email: payload.email, 
          role: uiRole, 
          backendRole,
          xp: parseInt(payload.xp || 0),
          level: parseInt(payload.level || 1)
        };
        await AsyncStorage.setItem('user', JSON.stringify(nextUser));
        setUser(nextUser);
      }
    } catch (e) {
      console.error('Failed to refresh user', e);
    }
  };

  const loginWithGoogle = async (idToken) => {
    try {
      const response = await api.post('/api/auth/google', { idToken });

      const payload = response?.data?.data;
      const token = payload?.token;
      const backendRole = payload?.role;
      const uiRole = ['SuperAdmin', 'ClubAdmin', 'admin'].includes(backendRole) ? 'admin' : 'student';
      const nextUser = payload
        ? { id: payload.id, name: payload.name, email: payload.email, role: uiRole, backendRole, avatar_url: payload.avatar_url }
        : null;

      if (!token || !nextUser) {
        return { success: false, message: 'Google login failed: invalid server response' };
      }

      await AsyncStorage.setItem('user', JSON.stringify(nextUser));
      await AsyncStorage.setItem('token', token);
      setAuthToken(token);
      setUser(nextUser);

      return { success: true };
    } catch (e) {
      return { success: false, message: e.response?.data?.message || 'Google login failed' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
