import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { initialClubs, initialEvents, initialNotifications, initialBudgets, initialCertificates } from './mockData';

// Real backend base URL — explicitly hardcoded to prevent bad Vercel environment variables from overriding it.
export const API_BASE_URL = "https://clubsphere-3l9t.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds to allow Render free tier to wake up without throwing a Network Error
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    console.log(`📡 [API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data || '');
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to attach auth token', error);
    }
    return config;
  },
  (error) => {
    console.error('❌ [API Request Error]', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ [API Response] ${response.status} ${response.config.url}`, response.data || '');
    return response;
  },
  async (error) => {
    console.error(`❌ [API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
    
    if (error.response && error.response.status === 401) {
      // Clear session on 401 Unauthorized
      try {
        await AsyncStorage.multiRemove(['user', 'token']);
      } catch (e) {
        console.error('Error clearing storage on 401', e);
      }
    }
    return Promise.reject(error);
  }
);

export const setApiBaseURL = (baseURL) => {
  api.defaults.baseURL = baseURL;
};

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }
  delete api.defaults.headers.common.Authorization;
};

export const apiGet = (url, config = {}) => api.get(url, config);
export const apiPost = (url, data = {}, config = {}) => api.post(url, data, config);
export const apiPut = (url, data = {}, config = {}) => api.put(url, data, config);
export const apiPatch = (url, data = {}, config = {}) => api.patch(url, data, config);
export const apiDelete = (url, config = {}) => api.delete(url, config);

export default api;
