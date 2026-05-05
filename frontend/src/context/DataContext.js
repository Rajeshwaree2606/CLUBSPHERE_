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
  if (!row || !row.id) return null;
  return {
    id: String(row.id),
    name: row.name || 'Unnamed Club',
    description: row.description || '',
    // memberCount may come as camelCase (SQL alias) or snake_case
    memberCount: Number(row.memberCount ?? row.member_count ?? 0),
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
    qr_token: row.qr_token || null,
    start_time: row.start_time || null,
    end_time: row.end_time || null,
    event_image: row.event_image || null,
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
    const payload = {
      name: clubData?.name,
      description: clubData?.description || null,
    };
    console.log('🏛️ [DataContext] createClub → POST /api/clubs', JSON.stringify(payload));
    try {
      const res = await api.post('/api/clubs', payload);
      console.log('🏛️ [DataContext] createClub ← response:', res?.data);

      const raw = unwrap(res);
      // Resilient mapping: even if mapClub gets unusual shape, still add to list
      const created = mapClub(raw) || (raw?.id ? {
        id: String(raw.id),
        name: raw.name || payload.name,
        description: raw.description || payload.description || '',
        memberCount: 0,
        joined: false,
      } : null);

      if (!created) {
        console.warn('🏛️ [DataContext] mapClub returned null, raw:', raw);
        return { success: false, message: 'Club created but response mapping failed' };
      }

      setClubs((prev) => [created, ...prev]);
      return { success: true };
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'Failed to create club';
      console.error('🏛️ [DataContext] createClub error:', {
        status: e.response?.status,
        message: msg,
        data: e.response?.data,
      });
      return { success: false, message: msg };
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
      const requestPayload = {
        club_id:     eventData?.club_id ?? eventData?.clubId,
        title:       eventData?.title,
        description: eventData?.description || null,
        venue:       eventData?.venue || null,
        event_date:  eventData?.event_date ?? eventData?.date,
        start_time:  eventData?.start_time || null,
        end_time:    eventData?.end_time   || null,
        event_image: eventData?.event_image || null,
      };

      console.log('🗄️ [DataContext] createEvent → POST /api/events', JSON.stringify({
        ...requestPayload,
        event_image: requestPayload.event_image ? `[base64 len: ${requestPayload.event_image?.length}]` : null,
      }));

      const res = await api.post('/api/events', requestPayload);

      console.log('🗄️ [DataContext] createEvent ← response:', res?.data);

      const created = mapEvent(unwrap(res));
      if (!created) {
        console.warn('🗄️ [DataContext] mapEvent returned null, raw:', unwrap(res));
        return { success: false, message: 'Invalid server response' };
      }

      setEvents((prev) => [created, ...prev]);
      return { success: true, data: unwrap(res) };
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'Failed to create event';
      console.error('🗄️ [DataContext] createEvent error:', {
        status: e.response?.status,
        message: msg,
        data: e.response?.data,
      });
      return { success: false, message: msg };
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
        start_time: eventData?.start_time || null,
        end_time: eventData?.end_time || null,
        event_image: eventData?.event_image || null,
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
