import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  const fetchData = async () => {
    try {
      const [resClubs, resEvents, resNotifs, resBudgets, resCerts, resLB] = await Promise.all([
        api.get('/clubs'), api.get('/events'), api.get('/notifications'), api.get('/budgets'), api.get('/certificates'), api.get('/leaderboard')
      ]);
      setClubs(resClubs.data);
      setEvents(resEvents.data);
      setNotifications(resNotifs.data);
      setBudgets(resBudgets.data);
      setCertificates(resCerts.data);
      setLeaderboard(resLB.data);
    } catch (e) {
      console.error('Failed to load initial data', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Club Methods
  const createClub = async (clubData) => {
    try {
       const res = await api.post('/clubs', clubData);
       setClubs([...clubs, res.data]);
       return { success: true };
    } catch (e) { return { success: false }; }
  };

  const joinClub = async (clubId) => {
    try {
      const res = await api.post(`/clubs/${clubId}/join`);
      const updatedList = clubs.map(c => c.id === clubId ? res.data : c);
      setClubs([...updatedList]);
      await addXP(10); // +10 XP for joining club
      return { success: true };
    } catch (e) { return { success: false }; }
  };

  // Event Methods
  const createEvent = async (eventData) => {
     try {
       const res = await api.post('/events', eventData);
       setEvents([...events, res.data]);
       return { success: true };
     } catch (e) { return { success: false }; }
  };

  const joinEvent = async (eventId) => {
     try {
       const res = await api.post(`/events/${eventId}/join`);
       const updatedEvents = events.map(e => e.id === eventId ? res.data : e);
       setEvents([...updatedEvents]);
       return { success: true };
     } catch (e) { return { success: false }; }
  };

  // Attendance Methods (Admin)
  const getAttendance = async (eventId) => {
    try {
       const res = await api.get(`/events/${eventId}/attendance`);
       return res.data;
    } catch(e) { return [];}
  };

  const markAttendance = async (eventId, userId, status) => {
    try {
        await api.post(`/events/${eventId}/attendance`, { userId, status });
        if (status === 'present') await addXP(20, userId); // Admin marking student present logic globally (stubbed)
        return { success: true };
    } catch(e) { return { success: false }; }
  };

  // Budget
  const addBudget = async (budgetData) => {
    try {
      const res = await api.post('/budgets', budgetData);
      setBudgets([...budgets, res.data]);
      return { success: true };
    } catch (e) { return { success: false }; }
  };

  const createNotification = async (notifData) => {
     try {
       const res = await api.post('/notifications', notifData);
       setNotifications([res.data, ...notifications]);
       return { success: true };
     } catch (e) { return { success: false }; }
  };

  const addXP = async (amount, userId = null) => {
     try {
       await api.post('/user/addXp', { xpToAdd: amount, userId });
     } catch (e) {}
  };

  return (
    <DataContext.Provider value={{
      clubs, events, notifications, budgets, certificates, leaderboard,
      createClub, joinClub, createEvent, joinEvent, 
      getAttendance, markAttendance, addBudget, createNotification,
      addXP, refreshData: fetchData
    }}>
      {children}
    </DataContext.Provider>
  );
};
