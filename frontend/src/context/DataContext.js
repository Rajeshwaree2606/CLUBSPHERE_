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

  const editClub = async (clubId, clubData) => {
    try {
      const res = await api.put(`/clubs/${clubId}`, clubData);
      setClubs(clubs.map(c => c.id === clubId ? res.data : c));
      return { success: true };
    } catch (e) { return { success: false }; }
  };

  const deleteClub = async (clubId) => {
    try {
      await api.delete(`/clubs/${clubId}`);
      setClubs(clubs.filter(c => c.id !== clubId));
      return { success: true };
    } catch (e) { return { success: false }; }
  };

  const joinClub = async (clubId) => {
    try {
      const res = await api.post(`/clubs/${clubId}/join`);
      setClubs(clubs.map(c => c.id === clubId ? res.data : c));
      await addXP(10); // +10 XP for joining club
      return { success: true };
    } catch (e) { return { success: false }; }
  };

  const leaveClub = async (clubId) => {
    try {
      const res = await api.post(`/clubs/${clubId}/leave`);
      setClubs(clubs.map(c => c.id === clubId ? res.data : c));
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

  const editEvent = async (eventId, eventData) => {
    try {
      const res = await api.put(`/events/${eventId}`, eventData);
      setEvents(events.map(e => e.id === eventId ? res.data : e));
      return { success: true };
    } catch (e) { return { success: false }; }
  };

  const deleteEvent = async (eventId) => {
    try {
      await api.delete(`/events/${eventId}`);
      setEvents(events.filter(e => e.id !== eventId));
      return { success: true };
    } catch (e) { return { success: false }; }
  };

  const joinEvent = async (eventId) => {
     try {
       const res = await api.post(`/events/${eventId}/join`);
       setEvents(events.map(e => e.id === eventId ? res.data : e));
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

  const editBudget = async (budgetId, budgetData) => {
    try {
      const res = await api.put(`/budgets/${budgetId}`, budgetData);
      setBudgets(budgets.map(b => b.id === budgetId ? res.data : b));
      return { success: true };
    } catch (e) { return { success: false }; }
  };

  const deleteBudget = async (budgetId) => {
    try {
      await api.delete(`/budgets/${budgetId}`);
      setBudgets(budgets.filter(b => b.id !== budgetId));
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

  const editNotification = async (notifId, notifData) => {
    try {
      const res = await api.put(`/notifications/${notifId}`, notifData);
      setNotifications(notifications.map(n => n.id === notifId ? res.data : n));
      return { success: true };
    } catch (e) { return { success: false }; }
  };

  const deleteNotification = async (notifId) => {
    try {
      await api.delete(`/notifications/${notifId}`);
      setNotifications(notifications.filter(n => n.id !== notifId));
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
      createClub, editClub, deleteClub, joinClub, leaveClub,
      createEvent, editEvent, deleteEvent, joinEvent, 
      getAttendance, markAttendance, 
      addBudget, editBudget, deleteBudget,
      createNotification, editNotification, deleteNotification,
      addXP, refreshData: fetchData
    }}>
      {children}
    </DataContext.Provider>
  );
};
