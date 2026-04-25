import React, { useContext, useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, StatusBar, Platform,
} from 'react-native';
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

export default function AdminEventsScreen({ navigation }) {
  const { events, createEvent, editEvent, deleteEvent, clubs } = useContext(DataContext);
  const [modalVisible,   setModalVisible]   = useState(false);
  const [editingEvent,   setEditingEvent]   = useState(null);
  const [title,          setTitle]          = useState('');
  const [desc,           setDesc]           = useState('');
  const [date,           setDate]           = useState('');
  const [venue,          setVenue]          = useState('');
  const [clubId,         setClubId]         = useState('');
  const [loading,        setLoading]        = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [eventToDelete,  setEventToDelete]  = useState(null);

  useEffect(() => {
    if (!clubId && clubs.length > 0) setClubId(clubs[0].id);
  }, [clubs]);

  const openCreate = () => {
    setEditingEvent(null); setTitle(''); setDesc(''); setDate(''); setVenue('');
    setClubId(clubs.length > 0 ? clubs[0].id : '');
    setModalVisible(true);
  };
  const openEdit = e => {
    setEditingEvent(e); setTitle(e.title); setDesc(e.description || '');
    setDate(e.date || ''); setVenue(e.venue || '');
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

  const handleSave = async () => {
    if (!title.trim() || !date.trim()) {
      Toast.show({ type: 'error', text1: 'Missing fields', text2: 'Title and date are required.' }); return;
    }
    const finalClubId = clubId || (clubs.length > 0 ? clubs[0].id : null);
    if (!finalClubId) {
      Toast.show({ type: 'error', text1: 'No club', text2: 'Create a club first.' }); return;
    }
    setLoading(true);
    const payload = { title, description: desc, date, venue, clubId: finalClubId };
    const res = editingEvent ? await editEvent(editingEvent.id, payload) : await createEvent(payload);
    setLoading(false);
    if (res.success) {
      setModalVisible(false);
      Toast.show({ type: 'success', text1: editingEvent ? 'Event updated ✓' : 'Event created ✓' });
    } else {
      Toast.show({ type: 'error', text1: res.message || 'Operation failed' });
    }
  };

  const renderItem = ({ item }) => {
    const clubName = clubs.find(c => c.id === item.clubId)?.name || 'General';
    return (
      <PremiumCard style={styles.card}>
        <View style={styles.eventHeader}>
          <View style={styles.datePill}>
            <Text style={styles.dateDay}>{item.date?.split('-')[2] || '--'}</Text>
            <Text style={styles.dateMon}>{item.date ? new Date(item.date).toLocaleString('en', { month: 'short' }) : '---'}</Text>
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
          </View>
        </View>

        {item.description ? <Text style={styles.eventDesc} numberOfLines={2}>{item.description}</Text> : null}

        <View style={styles.cardDivider} />
        <View style={styles.actions}>
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
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Events</Text>
          <Text style={styles.headerSub}>{events.length} event{events.length !== 1 ? 's' : ''} scheduled</Text>
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

      <PremiumModal
        visible={modalVisible}
        title={editingEvent ? 'Edit Event' : 'Schedule Event'}
        subtitle={editingEvent ? 'Update event details' : 'Add a new campus event'}
        icon="calendar-edit"
        onClose={() => { setModalVisible(false); setEditingEvent(null); }}
        footer={
          <>
            <GradientButton title="Cancel" variant="ghost" onPress={() => { setModalVisible(false); setEditingEvent(null); }} style={{ flex: 1 }} fullWidth={false} />
            <GradientButton title={editingEvent ? 'Save Changes' : 'Create Event'} variant="gold" onPress={handleSave} loading={loading} style={{ flex: 1 }} fullWidth={false} />
          </>
        }
      >
        <PremiumInput label="Event Title" placeholder="e.g. Annual Hackathon" value={title} onChangeText={setTitle} leftIcon="calendar-star" autoCapitalize="words" />
        <PremiumInput label="Description" placeholder="What's this event about?" value={desc} onChangeText={setDesc} multiline numberOfLines={3} leftIcon="text-box-outline" />
        <PremiumInput
          label="Date"
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
          leftIcon="calendar-range"
          webType={Platform.OS === 'web' ? 'date' : undefined}
          keyboardType="numbers-and-punctuation"
        />
        <PremiumInput label="Venue" placeholder="e.g. Main Auditorium" value={venue} onChangeText={setVenue} leftIcon="map-marker-outline" autoCapitalize="words" />

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
                  <Text style={[styles.chipText, clubId === c.id && { color: '#000', fontWeight: '700' }]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.l, paddingTop: SPACING.xxl, paddingBottom: SPACING.l,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.8 },
  headerSub: { fontSize: 13, color: COLORS.textSecond, marginTop: 2 },
  addBtn: { borderRadius: RADIUS.pill, overflow: 'hidden', ...SHADOWS.gold },
  addBtnGrad: { width: 44, height: 44, borderRadius: RADIUS.pill, justifyContent: 'center', alignItems: 'center' },
  list: { padding: SPACING.l, paddingBottom: 120 },
  card: { marginBottom: SPACING.m },
  eventHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.m, marginBottom: SPACING.s },
  datePill: {
    width: 48, borderRadius: RADIUS.m, backgroundColor: COLORS.goldGlow,
    borderWidth: 1, borderColor: COLORS.goldDim, alignItems: 'center', paddingVertical: 6,
  },
  dateDay: { fontSize: 20, fontWeight: '800', color: COLORS.gold, lineHeight: 24 },
  dateMon: { fontSize: 10, fontWeight: '700', color: COLORS.gold, letterSpacing: 0.5 },
  eventTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.3 },
  metaRow:   { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  metaText:  { fontSize: 12, color: COLORS.textMuted },
  metaDot:   { width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.textMuted },
  eventDesc: { fontSize: 13, color: COLORS.textSecond, lineHeight: 19, marginBottom: SPACING.m },
  cardDivider: { height: 1, backgroundColor: COLORS.border, marginBottom: SPACING.m },
  actions: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 4 },
  actionText: { fontSize: 12, fontWeight: '600' },
  actionSep: { width: 1, height: 18, backgroundColor: COLORS.border },
  empty: { alignItems: 'center', paddingTop: 80, gap: SPACING.m },
  emptyText: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  emptySub: { fontSize: 14, color: COLORS.textSecond },
  clubSelector: { marginTop: SPACING.s },
  clubSelectorLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, color: COLORS.textMuted, marginBottom: SPACING.s },
  clubChips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.s },
  chip: {
    borderRadius: RADIUS.pill, paddingVertical: 7, paddingHorizontal: 14,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bgElevated,
    overflow: 'hidden',
  },
  chipActive: { borderColor: COLORS.gold },
  chipText: { fontSize: 13, color: COLORS.textSecond, fontWeight: '500' },
});
