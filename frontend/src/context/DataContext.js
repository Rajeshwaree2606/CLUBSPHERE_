import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export const DataContext = createContext();

const unwrap = (res) => res?.data?.data;

const toDateString = (value) => {
  if (!value) return '';
  const s = String(value);
  return s.includes('T') ? s.split('T')[0] : s;
};

const mapClub = (row) => {
  if (!row) return null;
  return {
    id: String(row.id),
    name: row.name,
    description: row.description,
    // These are UI-only fields; backend doesn't currently provide them
    memberCount: typeof row.memberCount === 'number' ? row.memberCount : 0,
    joined: Boolean(row.joined),
  };
};

const mapEvent = (row) => {
  if (!row) return null;
  return {
    id: String(row.id),
    clubId: row.club_id != null ? String(row.club_id) : (row.clubId != null ? String(row.clubId) : undefined),
    title: row.title,
    description: row.description,
    venue: row.venue || 'TBA',
    date: toDateString(row.event_date ?? row.date),
    // Backend doesn't currently store these; keep UI stable
    time: row.time || 'TBD',
    maxParticipants: typeof row.maxParticipants === 'number' ? row.maxParticipants : 100,
    joined: Boolean(row.joined),
  };
};

const mapAnnouncement = (row) => {
  if (!row) return null;
  return {
    id: String(row.id),
    title: row.title,
    message: row.message,
    date: toDateString(row.created_at ?? row.date),
  };
};

const apiStatusFromUi = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'present') return 'Present';
  if (s === 'absent') return 'Absent';
  if (s === 'late') return 'Late';
  return status; // fallback
};

const uiStatusFromApi = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'present') return 'present';
  if (s === 'absent') return 'absent';
  if (s === 'late') return 'late';
  return s;
};

export const DataProvider = ({ children }) => {
  const { user, loading: authLoading } = useContext(AuthContext);

  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // These features are still present in the UI, but the backend doesn't currently expose the APIs.
  const [budgets, setBudgets] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  const fetchData = async () => {
    try {
      const [resClubs, resEvents, resAnnouncements] = await Promise.all([
        api.get('/api/clubs'),
        api.get('/api/events'),
        api.get('/api/announcements'),
      ]);

      const clubsData = (unwrap(resClubs) || []).map(mapClub).filter(Boolean);
      const eventsData = (unwrap(resEvents) || []).map(mapEvent).filter(Boolean);
      const announcementsData = (unwrap(resAnnouncements) || []).map(mapAnnouncement).filter(Boolean);

      setClubs(clubsData);
      setEvents(eventsData);
      setNotifications(announcementsData);
    } catch (e) {
      console.error('Failed to load initial data', e);
    }
  };

  useEffect(() => {
    // Don't call protected endpoints until auth has settled and we have a logged-in user.
    if (authLoading) return;

    if (!user) {
      setClubs([]);
      setEvents([]);
      setNotifications([]);
      setBudgets([]);
      setCertificates([]);
      setLeaderboard([]);
      return;
    }

    fetchData();
  }, [authLoading, user]);

  // Club Methods
  const createClub = async (clubData) => {
    try {
      const res = await api.post('/api/clubs', {
        name: clubData?.name,
        description: clubData?.description,
      });

      const created = mapClub(unwrap(res));
      if (!created) return { success: false, message: 'Invalid server response' };

      setClubs((prev) => [created, ...prev]);
      return { success: true };
    } catch (e) {
      return { success: false, message: e.response?.data?.message || 'Failed to create club' };
    }
  };

  const joinClub = async (clubId) => {
    try {
      const res = await api.post(`/api/clubs/${clubId}/join`);
      const updated = mapClub(unwrap(res));
      if (!updated) return { success: false, message: 'Invalid server response' };

      setClubs((prev) => prev.map((c) => (c.id === String(clubId) ? { ...c, ...updated } : c)));
      return { success: true };
    } catch (e) {
      return { success: false, message: e.response?.data?.message || 'Failed to join club' };
    }
  };

  // Event Methods
  const createEvent = async (eventData) => {
    try {
      const res = await api.post('/api/events', {
        club_id: eventData?.clubId ?? eventData?.club_id,
        title: eventData?.title,
        description: eventData?.description,
        venue: eventData?.venue,
        event_date: eventData?.date ?? eventData?.event_date,
      });

      const created = mapEvent(unwrap(res));
      if (!created) return { success: false, message: 'Invalid server response' };

      setEvents((prev) => [created, ...prev]);
      return { success: true };
    } catch (e) {
      return { success: false, message: e.response?.data?.message || 'Failed to create event' };
    }
  };

  const joinEvent = async (eventId) => {
    try {
      const res = await api.post(`/api/events/${eventId}/join`);
      const updated = mapEvent(unwrap(res));
      if (!updated) return { success: false, message: 'Invalid server response' };

      setEvents((prev) => prev.map((e) => (e.id === String(eventId) ? { ...e, ...updated } : e)));
      return { success: true };
    } catch (e) {
      return { success: false, message: e.response?.data?.message || 'Failed to join event' };
    }
  };

  // Attendance Methods (Admin)
  const getAttendance = async (eventId) => {
    try {
      const res = await api.get(`/api/attendance/event/${eventId}`);
      const rows = unwrap(res) || [];
      return rows.map((r) => ({
        userId: String(r.user_id),
        name: r.user_name,
        status: uiStatusFromApi(r.status),
      }));
    } catch (e) {
      return [];
    }
  };

  const markAttendance = async (eventId, userId, status) => {
    try {
      await api.post('/api/attendance', {
        event_id: eventId,
        user_id: userId,
        status: apiStatusFromUi(status),
      });

      return { success: true };
    } catch (e) {
      return { success: false, message: e.response?.data?.message || 'Failed to mark attendance' };
    }
  };

  // User Attendance (Student view)
  const getUserAttendance = async () => {
    try {
      const res = await api.get('/api/attendance/me');
      return unwrap(res) || [];
    } catch (error) {
      console.error('Failed to fetch user attendance:', error);
      return [];
    }
  };

  // Budget (backend API not implemented yet)
  const addBudget = async () => {
    return { success: false, message: 'Budgets API is not implemented on the backend yet' };
  };

  // Announcements
  const createNotification = async (notifData) => {
    try {
      let clubId = notifData?.clubId ?? notifData?.club_id ?? clubs?.[0]?.id;

      // If no club_id resolved and clubs haven't loaded yet, fetch them first
      if (!clubId && clubs.length === 0) {
        try {
          const resClubs = await api.get('/api/clubs');
          const freshClubs = (unwrap(resClubs) || []).map(mapClub).filter(Boolean);
          if (freshClubs.length > 0) {
            setClubs(freshClubs);
            clubId = freshClubs[0].id;
          }
        } catch (_) { /* will fall through to guard below */ }
      }

      if (!clubId) {
        return { success: false, message: 'club_id is required to create an announcement. Please create a club first.' };
      }

      const res = await api.post('/api/announcements', {
        club_id: clubId,
        title: notifData?.title,
        message: notifData?.message,
      });

      const created = mapAnnouncement(unwrap(res));
      if (!created) return { success: false, message: 'Invalid server response' };

      setNotifications((prev) => [created, ...prev]);
      return { success: true };
    } catch (e) {
      return { success: false, message: e.response?.data?.message || 'Failed to create announcement' };
    }
  };

  // XP / Gamification (backend API not implemented yet)
  const addXP = async () => {
    return;
  };

  return (
    <DataContext.Provider value={{
      clubs,
      events,
      notifications,
      budgets,
      certificates,
      leaderboard,
      createClub,
      joinClub,
      createEvent,
      joinEvent,
      getAttendance,
      markAttendance,
      getUserAttendance,
      addBudget,
      createNotification,
      addXP,
      refreshData: fetchData,
    }}>
      {children}
    </DataContext.Provider>
  );
};
