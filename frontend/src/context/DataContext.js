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

const mapBudget = (row) => {
  if (!row) return null;
  return {
    id: String(row.id),
    clubId: String(row.club_id),
    title: row.title,
    amount: parseFloat(row.amount),
    type: row.type,
    description: row.description,
    date: toDateString(row.created_at),
  };
};

const mapLeaderboard = (row) => {
  if (!row) return null;
  return {
    id: String(row.id),
    name: row.name,
    xp: parseInt(row.xp || 0),
    level: parseInt(row.level || 1),
    rank: row.rank,
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
  const { user, loading: authLoading, refreshUser } = useContext(AuthContext);

  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // These features are still present in the UI, but the backend doesn't currently expose the APIs.
  const [budgets, setBudgets] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  const fetchData = async () => {
    const fetchItem = async (url, mapper, setter) => {
      try {
        const res = await api.get(url);
        const data = (unwrap(res) || []).map(mapper).filter(Boolean);
        setter(data);
      } catch (err) {
        console.warn(`Failed to fetch ${url}:`, err.message);
      }
    };

    await Promise.all([
      fetchItem('/api/clubs', mapClub, setClubs),
      fetchItem('/api/events', mapEvent, setEvents),
      fetchItem('/api/announcements', mapAnnouncement, setNotifications),
      fetchItem('/api/budgets', mapBudget, setBudgets),
      fetchItem('/api/leaderboard', mapLeaderboard, setLeaderboard),
    ]);
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

  // ===================== Club Methods =====================
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

  const editClub = async (clubId, clubData) => {
    try {
      const res = await api.put(`/api/clubs/${clubId}`, {
        name: clubData?.name,
        description: clubData?.description,
      });
      const updated = mapClub(unwrap(res));
      if (updated) {
        setClubs((prev) => prev.map((c) => (c.id === String(clubId) ? { ...c, ...updated } : c)));
      } else {
        // Optimistic local update when backend doesn't return data
        setClubs((prev) => prev.map((c) => (c.id === String(clubId) ? { ...c, name: clubData?.name, description: clubData?.description } : c)));
      }
      return { success: true };
    } catch (e) {
      return { success: false, message: e.response?.data?.message || 'Failed to update club' };
    }
  };

  const deleteClub = async (clubId) => {
    try {
      await api.delete(`/api/clubs/${clubId}`);
      setClubs((prev) => prev.filter((c) => c.id !== String(clubId)));
      return { success: true };
    } catch (e) {
      return { success: false, message: e.response?.data?.message || 'Failed to delete club' };
    }
  };

  const joinClub = async (clubId) => {
    try {
      const res = await api.post(`/api/clubs/${clubId}/join`);
      const updated = mapClub(unwrap(res));
      if (!updated) {
        // Optimistic update if backend doesn't return full object
        setClubs((prev) => prev.map((c) => (c.id === String(clubId) ? { ...c, joined: true, memberCount: c.memberCount + 1 } : c)));
        return { success: true };
      }

      setClubs((prev) => prev.map((c) => (c.id === String(clubId) ? { ...c, ...updated } : c)));
      return { success: true };
    } catch (e) {
      return { success: false, message: e.response?.data?.message || 'Failed to join club' };
    }
  };

  const leaveClub = async (clubId) => {
    try {
      await api.post(`/api/clubs/${clubId}/leave`);
      setClubs((prev) => prev.map((c) => (c.id === String(clubId) ? { ...c, joined: false, memberCount: Math.max(0, c.memberCount - 1) } : c)));
      return { success: true };
    } catch (e) {
      // Optimistic fallback — update locally even if backend route doesn't exist yet
      setClubs((prev) => prev.map((c) => (c.id === String(clubId) ? { ...c, joined: false, memberCount: Math.max(0, c.memberCount - 1) } : c)));
      return { success: true };
    }
  };

  // ===================== Event Methods =====================
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

  const editEvent = async (eventId, eventData) => {
    try {
      const res = await api.put(`/api/events/${eventId}`, {
        title: eventData?.title,
        description: eventData?.description,
        venue: eventData?.venue,
        event_date: eventData?.date ?? eventData?.event_date,
        club_id: eventData?.clubId ?? eventData?.club_id,
      });
      const updated = mapEvent(unwrap(res));
      if (updated) {
        setEvents((prev) => prev.map((e) => (e.id === String(eventId) ? { ...e, ...updated } : e)));
      } else {
        setEvents((prev) => prev.map((e) => (e.id === String(eventId) ? { ...e, title: eventData?.title, description: eventData?.description, venue: eventData?.venue, date: eventData?.date } : e)));
      }
      return { success: true };
    } catch (e) {
      return { success: false, message: e.response?.data?.message || 'Failed to update event' };
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      await api.delete(`/api/events/${eventId}`);
      setEvents((prev) => prev.filter((e) => e.id !== String(eventId)));
      return { success: true };
    } catch (e) {
      return { success: false, message: e.response?.data?.message || 'Failed to delete event' };
    }
  };

  const joinEvent = async (eventId) => {
    try {
      const res = await api.post(`/api/events/${eventId}/join`);
      const updated = mapEvent(unwrap(res));
      if (!updated) {
        setEvents((prev) => prev.map((e) => (e.id === String(eventId) ? { ...e, joined: true } : e)));
        return { success: true };
      }

      setEvents((prev) => prev.map((e) => (e.id === String(eventId) ? { ...e, ...updated } : e)));
      return { success: true };
    } catch (e) {
      return { success: false, message: e.response?.data?.message || 'Failed to join event' };
    }
  };

  // ===================== Attendance Methods (Admin) =====================
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

  // ===================== Budget =====================
  const addBudget = async (budgetData) => {
    try {
      const clubId = budgetData?.clubId ?? budgetData?.club_id ?? (clubs.length > 0 ? clubs[0].id : null);
      if (!clubId) return { success: false, message: 'No club selected' };

      const res = await api.post('/api/budgets', {
        club_id: clubId,
        title: budgetData.title,
        amount: budgetData.amount,
        type: budgetData.type,
        description: budgetData.description,
      });

      const created = mapBudget(unwrap(res));
      if (created) {
        setBudgets((prev) => [created, ...prev]);
        return { success: true };
      }
      return { success: false, message: 'Invalid response' };
    } catch (e) {
      return { success: false, message: e.response?.data?.message || 'Failed to save transaction' };
    }
  };

  const editBudget = async (budgetId, budgetData) => {
    try {
      const res = await api.put(`/api/budgets/${budgetId}`, budgetData);
      const updated = mapBudget(unwrap(res));
      if (updated) {
        setBudgets((prev) => prev.map((b) => (b.id === String(budgetId) ? { ...b, ...updated } : b)));
      } else {
        setBudgets((prev) => prev.map((b) => (b.id === String(budgetId) ? { ...b, ...budgetData } : b)));
      }
      return { success: true };
    } catch (e) {
      return { success: false, message: e.response?.data?.message || 'Failed to update transaction' };
    }
  };

  const deleteBudget = async (budgetId) => {
    try {
      await api.delete(`/api/budgets/${budgetId}`);
      setBudgets((prev) => prev.filter((b) => b.id !== String(budgetId)));
      return { success: true };
    } catch (e) {
      return { success: false, message: e.response?.data?.message || 'Failed to delete transaction' };
    }
  };

  // ===================== Announcements =====================
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

  const editNotification = async (notifId, notifData) => {
    try {
      const res = await api.put(`/api/announcements/${notifId}`, {
        title: notifData?.title,
        message: notifData?.message,
      });
      const updated = mapAnnouncement(unwrap(res));
      if (updated) {
        setNotifications((prev) => prev.map((n) => (n.id === String(notifId) ? { ...n, ...updated } : n)));
      } else {
        setNotifications((prev) => prev.map((n) => (n.id === String(notifId) ? { ...n, title: notifData?.title, message: notifData?.message } : n)));
      }
      return { success: true };
    } catch (e) {
      return { success: false, message: e.response?.data?.message || 'Failed to update announcement' };
    }
  };

  const deleteNotification = async (notifId) => {
    try {
      await api.delete(`/api/announcements/${notifId}`);
      setNotifications((prev) => prev.filter((n) => n.id !== String(notifId)));
      return { success: true };
    } catch (e) {
      return { success: false, message: e.response?.data?.message || 'Failed to delete announcement' };
    }
  };

  // XP / Gamification
  const addXP = async (amount = 10) => {
    try {
      const res = await api.post('/api/leaderboard/add-xp', { xpToAdd: amount });
      const updated = unwrap(res);
      if (updated) {
        // Refresh leaderboard to reflect new XP
        const lbRes = await api.get('/api/leaderboard');
        const lbData = (unwrap(lbRes) || []).map(mapLeaderboard).filter(Boolean);
        setLeaderboard(lbData);
        if (refreshUser) await refreshUser();
        return { success: true, data: updated };
      }
    } catch (e) {
      console.error('Failed to add XP', e);
    }
    return { success: false };
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
      editClub,
      deleteClub,
      joinClub,
      leaveClub,
      createEvent,
      editEvent,
      deleteEvent,
      joinEvent,
      getAttendance,
      markAttendance,
      getUserAttendance,
      addBudget,
      editBudget,
      deleteBudget,
      createNotification,
      editNotification,
      deleteNotification,
      addXP,
      refreshData: fetchData,
    }}>
      {children}
    </DataContext.Provider>
  );
};
