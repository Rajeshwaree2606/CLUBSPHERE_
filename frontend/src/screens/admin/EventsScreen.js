import React, { useContext, useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  StatusBar, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // ← use this NOT react-native's
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { DataContext } from '../../context/DataContext';
import { COLORS, GRADIENTS, RADIUS, SPACING, SHADOWS } from '../../utils/theme';
import PremiumCard from '../../components/PremiumCard';
import PremiumModal from '../../components/PremiumModal';
import PremiumInput from '../../components/PremiumInput';
import GradientButton from '../../components/GradientButton';
import ConfirmModal from '../../components/ConfirmModal';
import QRCodeModal from '../../components/QRCodeModal';
import DateTimePickerField from '../../components/DateTimePickerField';
import ImagePickerField from '../../components/ImagePickerField';

export default function AdminEventsScreen({ navigation }) {
  const { events, createEvent, editEvent, deleteEvent, clubs, refreshData } = useContext(DataContext);
  const [modalVisible,   setModalVisible]   = useState(false);
  const [editingEvent,   setEditingEvent]   = useState(null);
  const [title,          setTitle]          = useState('');
  const [desc,           setDesc]           = useState('');
  const [date,           setDate]           = useState('');
  const [startTime,      setStartTime]      = useState('');
  const [endTime,        setEndTime]        = useState('');
  const [venue,          setVenue]          = useState('');
  const [clubId,         setClubId]         = useState('');
  const [loading,        setLoading]        = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [eventToDelete,  setEventToDelete]  = useState(null);
  const [qrEvent,        setQrEvent]        = useState(null);
  const [eventImage,     setEventImage]     = useState(null);

  useEffect(() => {
    if (!clubId && clubs.length > 0) setClubId(clubs[0].id);
  }, [clubs]);

  const openCreate = () => {
    setEditingEvent(null);
    setTitle(''); setDesc(''); setDate(''); setStartTime(''); setEndTime(''); setVenue('');
    setEventImage(null);
    setClubId(clubs.length > 0 ? clubs[0].id : '');
    setModalVisible(true);
  };

  const openEdit = e => {
    setEditingEvent(e);
    setTitle(e.title);
    setDesc(e.description || '');
    setDate(e.date || '');
    setStartTime(e.start_time || '');
    setEndTime(e.end_time || '');
    setVenue(e.venue || '');
    setEventImage(e.event_image || null);
    setClubId(e.clubId || (clubs.length > 0 ? clubs[0].id : ''));
    setModalVisible(true);
  };

  const askDelete = id => { setEventToDelete(id); setConfirmVisible(true); };

  const confirmDelete = async () => {
    setLoading(true);
    const res = await deleteEvent(eventToDelete);
    setLoading(false); setConfirmVisible(false); setEventToDelete(null);
    Toast.show({ type: res.success ? 'success' : 'error', text1: res.success ? 'Event deleted' : 'Delete failed' });
  };

  // ── MAIN SUBMIT ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    // ① Guard double-tap
    if (loading) {
      console.log('🛑 [handleSave] Already loading, ignoring tap');
      return;
    }

    console.log('🔵 CREATE BUTTON CLICKED');
    console.log('  title:', JSON.stringify(title));
    console.log('  date:', JSON.stringify(date));
    console.log('  venue:', JSON.stringify(venue));
    console.log('  startTime:', JSON.stringify(startTime));
    console.log('  endTime:', JSON.stringify(endTime));
    console.log('  clubId state:', JSON.stringify(clubId));
    console.log('  clubs count:', clubs.length);
    console.log('  AUTH TOKEN EXISTS:', true); // token is attached in api.js interceptor

    // ② Validate title
    if (!title.trim()) {
      console.log('🔴 VALIDATION FAILED: missing title');
      Toast.show({ type: 'error', text1: 'Missing Title', text2: 'Event title is required.' });
      return;
    }

    // ③ Validate date
    if (!date || !date.trim()) {
      console.log('🔴 VALIDATION FAILED: missing date');
      Toast.show({ type: 'error', text1: 'Missing Date', text2: 'Please select an event date.' });
      return;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date.trim())) {
      console.log('🔴 VALIDATION FAILED: invalid date format:', date);
      Toast.show({ type: 'error', text1: 'Invalid Date', text2: `"${date}" must be YYYY-MM-DD` });
      return;
    }

    // ④ Resolve club_id
    const finalClubId = clubId || (clubs.length > 0 ? clubs[0].id : null);
    if (!finalClubId) {
      console.log('🔴 VALIDATION FAILED: no club_id');
      Toast.show({ type: 'error', text1: 'No Club', text2: 'Create a club first before adding events.' });
      return;
    }

    console.log('🟢 VALIDATION PASSED');
    console.log('  finalClubId:', finalClubId);

    // ⑤ Build payload — SAFE: NO event_image (avoids 413 payload-too-large on Render free tier)
    //    Image upload can be added separately after event creation works.
    const payload = {
      title:       title.trim(),
      description: desc.trim() || null,
      venue:       venue.trim() || null,
      event_date:  date.trim(),
      start_time:  startTime || null,
      end_time:    endTime   || null,
      club_id:     finalClubId,
      // event_image intentionally excluded to ensure reliable event creation
    };

    console.log('🟡 EVENT PAYLOAD:', JSON.stringify(payload));
    console.log('🌐 API URL: POST /api/events on', 'https://clubsphere-3l9t.onrender.com');

    setLoading(true);

    try {
      const res = editingEvent
        ? await editEvent(editingEvent.id, payload)
        : await createEvent(payload);

      console.log('📦 BACKEND RESPONSE:', JSON.stringify(res));

      if (res.success) {
        setModalVisible(false);
        resetForm();
        if (refreshData) await refreshData();
        if (!editingEvent && res.data) {
          setQrEvent({
            ...payload,
            id:       res.data.id,
            qr_token: res.data.qr_token,
            date,
          });
        }
        Toast.show({
          type: 'success',
          text1: editingEvent ? '✓ Event Updated' : '✓ Event Created — QR Ready!',
        });
      } else {
        const errMsg = res.message || 'Unknown error — check Expo logs';
        console.warn('🔴 BACKEND ERROR:', errMsg);
        Alert.alert(
          'Event Creation Failed',
          errMsg,
          [{ text: 'OK' }]
        );
        Toast.show({
          type: 'error',
          text1: 'Event Creation Failed',
          text2: errMsg,
        });
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message || 'Unexpected error';
      console.error('🔴 EXCEPTION:', errMsg, err);
      Alert.alert('Error', errMsg, [{ text: 'OK' }]);
      Toast.show({ type: 'error', text1: 'Error', text2: errMsg });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle(''); setDesc(''); setDate('');
    setStartTime(''); setEndTime(''); setVenue('');
    setEventImage(null);
    setEditingEvent(null);
    setClubId(clubs.length > 0 ? clubs[0].id : '');
  };
  // ────────────────────────────────────────────────────────────────────────────

  const renderItem = ({ item }) => {
    const clubName = clubs.find(c => c.id === item.clubId)?.name || 'General';
    const timeRange = item.start_time
      ? `${item.start_time}${item.end_time ? ' – ' + item.end_time : ''}`
      : null;

    return (
      <PremiumCard style={styles.card}>
        <View style={styles.eventHeader}>
          {/* Date block */}
          <View style={styles.datePill}>
            <Text style={styles.dateDay}>{item.date?.split('-')[2] || '--'}</Text>
            <Text style={styles.dateMon}>
              {item.date ? new Date(item.date).toLocaleString('en', { month: 'short' }) : '---'}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
            <View style={styles.metaRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={12} color={COLORS.textMuted} />
              <Text style={styles.metaText}>{item.venue || 'TBA'}</Text>
              <View style={styles.metaDot} />
              <MaterialCommunityIcons name="google-circles-extended" size={12} color={COLORS.textMuted} />
              <Text style={styles.metaText}>{clubName}</Text>
            </View>
            {timeRange && (
              <View style={[styles.metaRow, { marginTop: 2 }]}>
                <MaterialCommunityIcons name="clock-outline" size={12} color={COLORS.indigo} />
                <Text style={[styles.metaText, { color: COLORS.indigoLight }]}>{timeRange}</Text>
              </View>
            )}
          </View>

          {item.qr_token && (
            <TouchableOpacity style={styles.qrBadge} onPress={() => setQrEvent(item)}>
              <MaterialCommunityIcons name="qrcode" size={18} color={COLORS.indigo} />
            </TouchableOpacity>
          )}
        </View>

        {item.description
          ? <Text style={styles.eventDesc} numberOfLines={2}>{item.description}</Text>
          : null}

        <View style={styles.cardDivider} />

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setQrEvent(item)}>
            <MaterialCommunityIcons name="qrcode" size={15} color={COLORS.indigo} />
            <Text style={[styles.actionText, { color: COLORS.indigo }]}>View QR</Text>
          </TouchableOpacity>
          <View style={styles.actionSep} />
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('EventAttendance', { eventId: item.id })}>
            <MaterialCommunityIcons name="clipboard-check-outline" size={15} color={COLORS.cobaltLight} />
            <Text style={[styles.actionText, { color: COLORS.cobaltLight }]}>Attendance</Text>
          </TouchableOpacity>
          <View style={styles.actionSep} />
          <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(item)}>
            <MaterialCommunityIcons name="pencil-outline" size={15} color={COLORS.gold} />
            <Text style={[styles.actionText, { color: COLORS.gold }]}>Edit</Text>
          </TouchableOpacity>
          <View style={styles.actionSep} />
          <TouchableOpacity style={styles.actionBtn} onPress={() => askDelete(item.id)}>
            <MaterialCommunityIcons name="trash-can-outline" size={15} color={COLORS.error} />
            <Text style={[styles.actionText, { color: COLORS.error }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </PremiumCard>
    );
  };

  return (
    // SafeAreaView from react-native-safe-area-context handles ALL insets correctly
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} translucent={false} />

      {/* Header — SafeAreaView already added top inset, no extra paddingTop needed */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Events</Text>
          <Text style={styles.headerSub}>
            {events.length} event{events.length !== 1 ? 's' : ''} scheduled
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <LinearGradient colors={GRADIENTS.gold} style={styles.addBtnGrad}>
            <MaterialCommunityIcons name="plus" size={20} color="#000" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <FlatList
        data={events}
        keyExtractor={e => e.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={56} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No events yet</Text>
            <Text style={styles.emptySub}>Tap + to schedule the first event</Text>
          </View>
        }
      />

      {/* Create / Edit Modal */}
      <PremiumModal
        visible={modalVisible}
        title={editingEvent ? 'Edit Event' : 'Schedule Event'}
        subtitle={editingEvent ? 'Update event details' : 'New event — QR auto-generated'}
        icon="calendar-edit"
        onClose={() => { setModalVisible(false); setEditingEvent(null); }}
        footer={
          <>
            <GradientButton
              title="Cancel"
              variant="ghost"
              onPress={() => { setModalVisible(false); setEditingEvent(null); }}
              style={{ flex: 1 }}
              fullWidth={false}
            />
            <GradientButton
              title={loading ? 'Creating…' : (editingEvent ? 'Save Changes' : 'Create & Generate QR')}
              variant="gold"
              onPress={handleSave}
              loading={loading}
              disabled={loading}
              style={{ flex: 1 }}
              fullWidth={false}
            />
          </>
        }
      >
        <PremiumInput
          label="Event Title *"
          placeholder="e.g. Annual Hackathon"
          value={title} onChangeText={setTitle}
          leftIcon="calendar-star" autoCapitalize="words"
        />
        <PremiumInput
          label="Description"
          placeholder="What's this event about?"
          value={desc} onChangeText={setDesc}
          multiline numberOfLines={3} leftIcon="text-box-outline"
        />
        <PremiumInput
          label="Venue"
          placeholder="e.g. Main Auditorium"
          value={venue} onChangeText={setVenue}
          leftIcon="map-marker-outline" autoCapitalize="words"
        />

        {/* Image picker — optional */}
        <ImagePickerField
          image={eventImage}
          onImageSelected={setEventImage}
        />

        {/* Date picker */}
        <DateTimePickerField
          label="Event Date *"
          icon="calendar-range"
          mode="date"
          value={date}
          onChange={setDate}
          placeholder="Select date"
        />

        {/* Time pickers */}
        <View style={styles.timeRow}>
          <DateTimePickerField
            label="Start Time"
            icon="clock-start"
            mode="time"
            value={startTime}
            onChange={setStartTime}
            placeholder="Start"
            style={{ flex: 1 }}
          />
          <View style={styles.timeSep} />
          <DateTimePickerField
            label="End Time"
            icon="clock-end"
            mode="time"
            value={endTime}
            onChange={setEndTime}
            placeholder="End"
            style={{ flex: 1 }}
          />
        </View>

        {/* Club selector — only shown if multiple clubs */}
        {clubs.length > 1 && (
          <View style={styles.clubSelector}>
            <Text style={styles.clubSelectorLabel}>ASSIGN TO CLUB</Text>
            <View style={styles.clubChips}>
              {clubs.map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.chip, clubId === c.id && styles.chipActive]}
                  onPress={() => setClubId(c.id)}
                >
                  {clubId === c.id && (
                    <LinearGradient colors={GRADIENTS.gold} style={StyleSheet.absoluteFill} borderRadius={RADIUS.pill} />
                  )}
                  <Text style={[styles.chipText, clubId === c.id && { color: '#000', fontWeight: '700' }]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* QR note */}
        {!editingEvent && (
          <View style={styles.qrNote}>
            <MaterialCommunityIcons name="qrcode-scan" size={15} color={COLORS.indigo} />
            <Text style={styles.qrNoteText}>
              A unique QR code will be auto-generated for student attendance scanning.
            </Text>
          </View>
        )}
      </PremiumModal>

      <ConfirmModal
        visible={confirmVisible}
        title="Delete Event?"
        message="This will permanently remove the event and all attendance records."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmVisible(false); setEventToDelete(null); }}
      />

      <QRCodeModal
        visible={!!qrEvent}
        event={qrEvent}
        onClose={() => setQrEvent(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.m,      // small gap below safe area
    paddingBottom: SPACING.l,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.8 },
  headerSub:   { fontSize: 13, color: COLORS.textSecond, marginTop: 2 },
  addBtn:     { borderRadius: RADIUS.pill, overflow: 'hidden', ...SHADOWS.gold },
  addBtnGrad: { width: 44, height: 44, borderRadius: RADIUS.pill, justifyContent: 'center', alignItems: 'center' },
  list: { padding: SPACING.l, paddingBottom: 160 }, // 160 = tab bar height + buffer
  card: { marginBottom: SPACING.m },
  eventHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.m, marginBottom: SPACING.s },
  datePill: {
    width: 48, borderRadius: RADIUS.m, backgroundColor: COLORS.goldGlow,
    borderWidth: 1, borderColor: COLORS.goldDim, alignItems: 'center', paddingVertical: 6,
  },
  dateDay:    { fontSize: 20, fontWeight: '800', color: COLORS.gold, lineHeight: 24 },
  dateMon:    { fontSize: 10, fontWeight: '700', color: COLORS.gold, letterSpacing: 0.5 },
  eventTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.3 },
  metaRow:    { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  metaText:   { fontSize: 12, color: COLORS.textMuted },
  metaDot:    { width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.textMuted },
  eventDesc:  { fontSize: 13, color: COLORS.textSecond, lineHeight: 19, marginBottom: SPACING.m },
  qrBadge: {
    width: 36, height: 36, borderRadius: RADIUS.m,
    backgroundColor: COLORS.indigoGlow, borderWidth: 1, borderColor: COLORS.indigo + '44',
    justifyContent: 'center', alignItems: 'center',
  },
  cardDivider: { height: 1, backgroundColor: COLORS.border, marginBottom: SPACING.m },
  actions:    { flexDirection: 'row', alignItems: 'center' },
  actionBtn:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 4 },
  actionText: { fontSize: 12, fontWeight: '600' },
  actionSep:  { width: 1, height: 18, backgroundColor: COLORS.border },
  empty:      { alignItems: 'center', paddingTop: 80, gap: SPACING.m },
  emptyText:  { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  emptySub:   { fontSize: 14, color: COLORS.textSecond },
  timeRow:    { flexDirection: 'row', gap: 0 },
  timeSep:    { width: SPACING.s },
  clubSelector:      { marginTop: SPACING.s },
  clubSelectorLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, color: COLORS.textMuted, marginBottom: SPACING.s },
  clubChips:         { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.s },
  chip: {
    borderRadius: RADIUS.pill, paddingVertical: 7, paddingHorizontal: 14,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bgElevated, overflow: 'hidden',
  },
  chipActive: { borderColor: COLORS.gold },
  chipText:   { fontSize: 13, color: COLORS.textSecond, fontWeight: '500' },
  qrNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: COLORS.indigoGlow, borderRadius: RADIUS.m,
    padding: SPACING.m, borderWidth: 1, borderColor: COLORS.indigo + '33',
    marginTop: SPACING.s,
  },
  qrNoteText: { color: COLORS.indigoLight, fontSize: 13, flex: 1, lineHeight: 18 },
});
