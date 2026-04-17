import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { initialClubs, initialEvents, initialNotifications, initialBudgets, initialCertificates } from './mockData';

const ENV = (typeof process !== 'undefined' && process.env) ? process.env : {};

// Platform-aware default: Android emulator needs 10.0.2.2, others use localhost
const getDefaultBaseURL = () => {
  if (Platform.OS === 'android') return 'http://10.0.2.2:5000';
  return 'http://localhost:5000'; // iOS simulator & web
};

// Real backend base URL (override in Expo via EXPO_PUBLIC_API_BASE_URL)
export const API_BASE_URL = ENV.EXPO_PUBLIC_API_BASE_URL || getDefaultBaseURL();

// Mock base URL (only used when USE_MOCK_API === true)
export const MOCK_API_BASE_URL = ENV.EXPO_PUBLIC_MOCK_API_BASE_URL || 'https://api.clubmanagement.local';

// Set to true only when you explicitly want to use axios-mock-adapter handlers below
export const USE_MOCK_API = String(ENV.EXPO_PUBLIC_USE_MOCK_API || 'false').toLowerCase() === 'true';

const api = axios.create({
  baseURL: USE_MOCK_API ? MOCK_API_BASE_URL : API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
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
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
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

// --------------------------------------------------
// Optional axios-mock-adapter support
// --------------------------------------------------
// IMPORTANT: When USE_MOCK_API is false we DO NOT create the MockAdapter, otherwise it will
// intercept real network requests and cause 404s for any route without a mock handler.
export const mock = USE_MOCK_API ? new MockAdapter(api, { delayResponse: 500 }) : null;

if (USE_MOCK_API && mock) {
  // State simulated DB
  let clubs = [...initialClubs];
  let events = [...initialEvents];
  let budgets = [...initialBudgets];
  let notificationsDB = [...initialNotifications];
  let attendanceDB = {}; // format: { eventId: [ { userId, name, status } ] }

  // Auth Map with XP
  const usersDB = {
    'admin@test.com': { id: 'admin1', name: 'Admin User', role: 'admin', xp: 500, level: 5 },
    'student@test.com': { id: 'stud1', name: 'Student User', role: 'student', xp: 120, level: 2 },
    'alex@test.com': { id: 'stud3', name: 'Alex Johnson', role: 'student', xp: 350, level: 4 },
    'maria@test.com': { id: 'stud4', name: 'Maria Garcia', role: 'student', xp: 210, level: 3 }
  };

  // NOTE: mock routes are defined without the /api prefix; if you want to use mocks with the
  // current app code, update these to match the frontend calls (e.g. /api/auth/login).
  mock.onPost('/auth/login').reply(config => {
    const { email, password } = JSON.parse(config.data);
    const user = usersDB[email];
    if (user && password === email.split('@')[0]) {
       return [200, { token: `mock-jwt-${user.id}`, user }];
    }
    return [401, { message: 'Invalid credentials' }];
  });

  mock.onPost('/auth/signup').reply(200, { token: 'mock-jwt-token', user: { id: 'stud2', name: 'New User', role: 'student', xp: 0, level: 1 } });

  // Clubs
  mock.onGet('/clubs').reply(() => [200, clubs]);
  mock.onPost('/clubs').reply(config => {
    const newClub = JSON.parse(config.data);
    newClub.id = Date.now().toString();
    clubs.push(newClub);
    return [201, newClub];
  });
  mock.onPost(/\/clubs\/\d+\/join/).reply(config => {
    const match = config.url.match(/\/clubs\/(\d+)\/join/);
    const clubId = match ? match[1] : null;
    const club = clubs.find(c => c.id === clubId);
    if (club) { club.joined = true; club.memberCount += 1; return [200, club]; }
    return [404, { message: 'Club not found' }];
  });

  // Events
  mock.onGet('/events').reply(() => [200, events]);
  mock.onPost('/events').reply(config => {
    const newEvent = JSON.parse(config.data);
    newEvent.id = Date.now().toString();
    events.push(newEvent);
    return [201, newEvent];
  });

  // Join Event
  mock.onPost(/\/events\/\d+\/join/).reply(config => {
    const match = config.url.match(/\/events\/(\d+)\/join/);
    const eventId = match ? match[1] : null;
    const event = events.find(e => e.id === eventId);
    if (event) { event.joined = true; return [200, event]; }
    return [404, { message: 'Event not found' }];
  });

  // Attendance Tracking (Admin)
  mock.onGet(/\/events\/\d+\/attendance/).reply(config => {
    const match = config.url.match(/\/events\/(\d+)\/attendance/);
    const eventId = match ? match[1] : null;
    const list = attendanceDB[eventId] || [
      { userId: 'stud1', name: 'Student User', status: 'pending' },
      { userId: 'stud2', name: 'Bob Smith', status: 'pending' }
    ];
    attendanceDB[eventId] = list; // initialize mock users if empty
    return [200, list];
  });

  mock.onPost(/\/events\/\d+\/attendance/).reply(config => {
    const match = config.url.match(/\/events\/(\d+)\/attendance/);
    const eventId = match ? match[1] : null;
    const { userId, status } = JSON.parse(config.data);
    
    if (!attendanceDB[eventId]) return [404, { message: 'No attendance record' }];
    
    const userRecord = attendanceDB[eventId].find(a => a.userId === userId);
    if (userRecord) {
      userRecord.status = status;
      return [200, attendanceDB[eventId]];
    }
    return [500, { message: 'User not found' }];
  });

  // Budgets & General
  mock.onGet('/budgets').reply(() => [200, budgets]);
  mock.onPost('/budgets').reply(config => {
    budgets.push({ ...JSON.parse(config.data), id: Date.now().toString() });
    return [201, budgets[budgets.length - 1]];
  });

  mock.onGet('/notifications').reply(() => [200, notificationsDB]);
  mock.onPost('/notifications').reply(config => {
    const newNotif = { ...JSON.parse(config.data), id: Date.now().toString(), date: new Date().toISOString().split('T')[0] };
    notificationsDB.unshift(newNotif);
    return [201, newNotif];
  });

  // Gamification Leaderboard
  mock.onGet('/leaderboard').reply(() => {
    const rankedUsers = Object.values(usersDB)
      .filter(u => u.role === 'student')
      .sort((a, b) => b.xp - a.xp)
      .map((u, index) => ({ ...u, rank: index + 1 }));
    return [200, rankedUsers];
  });

  mock.onPost('/user/addXp').reply(config => {
    const { xpToAdd } = JSON.parse(config.data);
    // Just simulate returning a success logic, in reality we'd update AuthContext
    return [200, { added: xpToAdd }];
  });

  mock.onGet('/certificates').reply(200, initialCertificates);
}

export default api;
