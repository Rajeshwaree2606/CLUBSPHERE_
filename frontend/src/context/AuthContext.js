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

        if (storedToken && storedUser) {
          setAuthToken(storedToken);
          // 🚨 DEMO MODE: Trust local storage completely. No backend validation.
          setUser(JSON.parse(storedUser));
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

  const login = async (email, password) => {
    try {
      // 🚨 DEMO MODE BYPASS 🚨
      // Instantly succeed with mocked data but use REAL tokens to keep backend CRUD working
      const isAdmin = email.toLowerCase().includes('admin');
      
      const token = isAdmin 
        ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBjYW1wdXMuZWR1Iiwicm9sZSI6IlN1cGVyQWRtaW4iLCJpYXQiOjE3NzgwNTc1NjQsImV4cCI6MTc3ODY2MjM2NH0.AZmghdhZdMJv_VlDOHCqFCAdWxdiKWZMF7nq1IvvtvU"
        : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJzdHVkZW50QGNhbXB1cy5lZHUiLCJyb2xlIjoiTWVtYmVyIiwiaWF0IjoxNzc4MDU3NTY0LCJleHAiOjE3Nzg2NjIzNjR9.cV0p8fqYuycOdzUhbWGALto2SbYT-whDPDZTy6y0WOg";
      
      const nextUser = {
        id: isAdmin ? 1 : 2,
        name: email.split('@')[0] || (isAdmin ? 'Admin User' : 'Student User'),
        email: email,
        role: isAdmin ? 'admin' : 'student',
        backendRole: isAdmin ? 'SuperAdmin' : 'Member',
        xp: 0,
        level: 1
      };

      await AsyncStorage.setItem('user', JSON.stringify(nextUser));
      await AsyncStorage.setItem('token', token);
      setAuthToken(token);
      setUser(nextUser);

      return { success: true };
    } catch (e) {
      return { success: false, message: 'Demo Login failed' };
    }
  };

  const signup = async (name, email, password, role) => {
    try {
      // 🚨 DEMO MODE BYPASS 🚨
      const isAdmin = role === 'admin' || email.toLowerCase().includes('admin');
      
      const token = isAdmin 
        ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBjYW1wdXMuZWR1Iiwicm9sZSI6IlN1cGVyQWRtaW4iLCJpYXQiOjE3NzgwNTc1NjQsImV4cCI6MTc3ODY2MjM2NH0.AZmghdhZdMJv_VlDOHCqFCAdWxdiKWZMF7nq1IvvtvU"
        : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJzdHVkZW50QGNhbXB1cy5lZHUiLCJyb2xlIjoiTWVtYmVyIiwiaWF0IjoxNzc4MDU3NTY0LCJleHAiOjE3Nzg2NjIzNjR9.cV0p8fqYuycOdzUhbWGALto2SbYT-whDPDZTy6y0WOg";
      
      const nextUser = {
        id: isAdmin ? 1 : 2,
        name: name || email.split('@')[0],
        email: email,
        role: isAdmin ? 'admin' : 'student',
        backendRole: isAdmin ? 'SuperAdmin' : 'Member',
        xp: 0,
        level: 1
      };

      await AsyncStorage.setItem('user', JSON.stringify(nextUser));
      await AsyncStorage.setItem('token', token);
      setAuthToken(token);
      setUser(nextUser);

      return { success: true };
    } catch (e) {
      return { success: false, message: 'Demo Signup failed' };
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
    // 🚨 DEMO MODE BYPASS: Do nothing on refresh so it doesn't log the user out 
    // if the backend is slow or fails.
    console.log('Demo mode: Skipping user refresh from backend.');
  };

  const loginWithGoogle = async (idToken) => {
    try {
      // 🚨 DEMO MODE BYPASS 🚨
      const isAdmin = false; // Google login defaults to student for demo
      
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJzdHVkZW50QGNhbXB1cy5lZHUiLCJyb2xlIjoiTWVtYmVyIiwiaWF0IjoxNzc4MDU3NTY0LCJleHAiOjE3Nzg2NjIzNjR9.cV0p8fqYuycOdzUhbWGALto2SbYT-whDPDZTy6y0WOg";
      
      const nextUser = {
        id: 2,
        name: 'Google User',
        email: 'google@campus.edu',
        role: 'student',
        backendRole: 'Member',
        xp: 0,
        level: 1
      };

      await AsyncStorage.setItem('user', JSON.stringify(nextUser));
      await AsyncStorage.setItem('token', token);
      setAuthToken(token);
      setUser(nextUser);

      return { success: true };
    } catch (e) {
      return { success: false, message: 'Demo Google login failed' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
