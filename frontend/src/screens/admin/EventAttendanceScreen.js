import React, { useContext, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { DataContext } from '../../context/DataContext';
import { COLORS, GRADIENTS, RADIUS, SPACING, SHADOWS } from '../../utils/theme';
import PremiumCard from '../../components/PremiumCard';
import GradientButton from '../../components/GradientButton';

export default function EventAttendanceScreen({ route, navigation }) {
  const { eventId } = route.params;
  const { events, getAttendance, markAttendance } = useContext(DataContext);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);

  const event = events.find(e => e.id === eventId);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await getAttendance(eventId);
    setAttendees(data || []);
    setLoading(false);
  };

  const handleMark = async (userId, status) => {
    // Optimistic update
    setAttendees(prev => prev.map(a => a.userId === userId ? { ...a, status } : a));
    const res = await markAttendance(eventId, userId, status);
    if (res.success) {
      Toast.show({ type: 'success', text1: `Marked ${status === 'present' ? 'Present ✓' : 'Absent'}` });
    } else {
      Toast.show({ type: 'error', text1: 'Failed to update' });
      loadData(); // revert
    }
  };

  const presentCount = attendees.filter(a => a.status === 'present').length;
  const rate = attendees.length > 0 ? Math.round((presentCount / attendees.length) * 100) : 0;

  const renderItem = ({ item }) => {
    const isPresent = item.status === 'present';
    const isAbsent  = item.status === 'absent';
    return (
      <PremiumCard style={styles.row} variant={isPresent ? 'gold' : 'default'}>
        <View style={styles.rowAvatar}>
          <Text style={styles.rowAvatarText}>{item.name?.[0]?.toUpperCase() || '?'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowName}>{item.name}</Text>
          <Text style={styles.rowId}>ID: {item.userId}</Text>
        </View>
        <View style={styles.rowBtns}>
          <TouchableOpacity
            style={[styles.markBtn, isPresent && styles.markBtnPresent]}
            onPress={() => handleMark(item.userId, 'present')}
          >
            {isPresent && <LinearGradient colors={GRADIENTS.gold} style={StyleSheet.absoluteFill} borderRadius={RADIUS.m} />}
            <MaterialCommunityIcons name="check" size={16} color={isPresent ? '#000' : COLORS.textMuted} />
            <Text style={[styles.markBtnText, isPresent && { color: '#000', fontWeight: '700' }]}>Present</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.markBtn, isAbsent && styles.markBtnAbsent]}
            onPress={() => handleMark(item.userId, 'absent')}
          >
            {isAbsent && <LinearGradient colors={GRADIENTS.crimson} style={StyleSheet.absoluteFill} borderRadius={RADIUS.m} />}
            <MaterialCommunityIcons name="close" size={16} color={isAbsent ? '#fff' : COLORS.textMuted} />
            <Text style={[styles.markBtnText, isAbsent && { color: '#fff', fontWeight: '700' }]}>Absent</Text>
          </TouchableOpacity>
        </View>
      </PremiumCard>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={COLORS.gold} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Attendance</Text>
          <Text style={styles.headerSub} numberOfLines={1}>{event?.title || 'Event'}</Text>
        </View>
      </View>

      {/* Stats */}
      {!loading && (
        <View style={styles.statsRow}>
          {[
            { label: 'Total',    value: attendees.length, color: COLORS.textPrimary },
            { label: 'Present',  value: presentCount,     color: COLORS.success },
            { label: 'Absent',   value: attendees.length - presentCount, color: COLORS.error },
            { label: 'Rate',     value: `${rate}%`,       color: COLORS.gold },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Gold divider */}
      <LinearGradient
        colors={['transparent', COLORS.gold, 'transparent']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.divider}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Loading attendees...</Text>
        </View>
      ) : (
        <FlatList
          data={attendees}
          keyExtractor={item => item.userId}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="account-off-outline" size={56} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No attendees registered</Text>
              <Text style={styles.emptySub}>Students who RSVP will appear here</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.m,
    paddingHorizontal: SPACING.l, paddingTop: SPACING.xxl,
    paddingBottom: SPACING.l, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.bgElevated, borderWidth: 1, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: COLORS.textSecond, marginTop: 2 },
  statsRow: {
    flexDirection: 'row', paddingHorizontal: SPACING.l, paddingVertical: SPACING.m,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', letterSpacing: -1 },
  statLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', marginTop: 2 },
  divider: { height: 1, opacity: 0.25 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.m },
  loadingText: { color: COLORS.textSecond, fontSize: 14 },
  list: { padding: SPACING.l, paddingBottom: 100 },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.m, marginBottom: SPACING.s },
  rowAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.bgElevated, borderWidth: 1, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  rowAvatarText: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  rowName: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  rowId:   { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  rowBtns: { flexDirection: 'row', gap: SPACING.s },
  markBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 7, paddingHorizontal: 10,
    borderRadius: RADIUS.m, backgroundColor: COLORS.bgElevated,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  markBtnPresent: { borderColor: COLORS.gold },
  markBtnAbsent:  { borderColor: COLORS.crimson },
  markBtnText:    { fontSize: 12, color: COLORS.textSecond, fontWeight: '500' },
  empty: { alignItems: 'center', paddingTop: 60, gap: SPACING.m },
  emptyText: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  emptySub:  { fontSize: 14, color: COLORS.textSecond },
});
