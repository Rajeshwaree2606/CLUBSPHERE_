import React, { useContext, useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, StatusBar, Modal, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { DataContext } from '../../context/DataContext';
import { apiPost } from '../../services/api';
import { COLORS, GRADIENTS, RADIUS, SPACING, SHADOWS } from '../../utils/theme';
import PremiumCard from '../../components/PremiumCard';

export default function EventAttendanceScreen({ route, navigation }) {
  const { eventId } = route.params;
  const { events, getAttendance, markAttendance } = useContext(DataContext);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [qrModal, setQrModal]     = useState(false);
  const [qrToken, setQrToken]     = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const event = events.find(e => String(e.id) === String(eventId));

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (qrModal) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 700, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [qrModal]);

  const loadData = async () => {
    setLoading(true);
    const data = await getAttendance(eventId);
    setAttendees(data || []);
    setLoading(false);
  };

  const handleMark = async (userId, status) => {
    setAttendees(prev => prev.map(a => a.userId === userId ? { ...a, status } : a));
    const res = await markAttendance(eventId, userId, status);
    if (res.success) {
      Toast.show({ type: 'success', text1: `Marked ${status === 'present' ? 'Present ✓' : 'Absent'}` });
    } else {
      Toast.show({ type: 'error', text1: 'Failed to update' });
      loadData();
    }
  };

  const handleGenerateQR = async () => {
    setQrLoading(true);
    setQrToken(null);
    try {
      const res = await apiPost(`/api/events/${eventId}/qr-token`, {});
      const token = res?.data?.data?.qr_token;
      if (token) {
        setQrToken(token);
        setQrModal(true);
      } else {
        Toast.show({ type: 'error', text1: 'Failed to generate QR token' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: e?.response?.data?.message || 'QR generation failed' });
    } finally {
      setQrLoading(false);
    }
  };

  const presentCount = attendees.filter(a =>
    a.status === 'present' || a.status === 'Present'
  ).length;
  const rate = attendees.length > 0 ? Math.round((presentCount / attendees.length) * 100) : 0;

  const renderItem = ({ item }) => {
    const isPresent = item.status === 'present' || item.status === 'Present';
    const isAbsent  = item.status === 'absent'  || item.status === 'Absent';
    return (
      <PremiumCard style={styles.row} variant={isPresent ? 'gold' : 'default'}>
        <View style={styles.rowAvatar}>
          <Text style={styles.rowAvatarText}>{item.name?.[0]?.toUpperCase() || '?'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowName}>{item.name}</Text>
          <Text style={styles.rowId}>ID: {item.userId || item.user_id}</Text>
        </View>
        <View style={styles.rowBtns}>
          <TouchableOpacity
            style={[styles.markBtn, isPresent && styles.markBtnPresent]}
            onPress={() => handleMark(item.userId || item.user_id, 'present')}
          >
            {isPresent && <LinearGradient colors={GRADIENTS.gold} style={StyleSheet.absoluteFill} borderRadius={RADIUS.m} />}
            <MaterialCommunityIcons name="check" size={16} color={isPresent ? '#000' : COLORS.textMuted} />
            <Text style={[styles.markBtnText, isPresent && { color: '#000', fontWeight: '700' }]}>Present</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.markBtn, isAbsent && styles.markBtnAbsent]}
            onPress={() => handleMark(item.userId || item.user_id, 'absent')}
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
        {/* QR Generate Button */}
        <TouchableOpacity
          style={styles.qrBtn}
          onPress={handleGenerateQR}
          disabled={qrLoading}
        >
          {qrLoading
            ? <ActivityIndicator size="small" color="#fff" />
            : <>
                <MaterialCommunityIcons name="qrcode" size={18} color="#fff" />
                <Text style={styles.qrBtnText}>QR</Text>
              </>
          }
        </TouchableOpacity>
      </View>

      {/* Stats */}
      {!loading && (
        <View style={styles.statsRow}>
          {[
            { label: 'Total',   value: attendees.length,                       color: COLORS.textPrimary },
            { label: 'Present', value: presentCount,                            color: COLORS.success },
            { label: 'Absent',  value: attendees.length - presentCount,        color: COLORS.error },
            { label: 'Rate',    value: `${rate}%`,                              color: COLORS.gold },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}

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
          keyExtractor={item => String(item.userId || item.user_id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="account-off-outline" size={56} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No attendees registered</Text>
              <Text style={styles.emptySub}>Students who RSVP will appear here</Text>
              <Text style={[styles.emptySub, { color: COLORS.indigoLight, marginTop: 4 }]}>
                Generate a QR code above so students can scan in!
              </Text>
            </View>
          }
        />
      )}

      {/* QR Modal */}
      <Modal visible={qrModal} transparent animationType="fade" onRequestClose={() => setQrModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Event QR Code</Text>
            <Text style={styles.modalSub}>{event?.title}</Text>

            {/* QR visual — rendered as styled token display for web compatibility */}
            <Animated.View style={[styles.qrDisplay, { transform: [{ scale: pulseAnim }] }]}>
              <LinearGradient colors={['#4F6EF7','#7C3AED']} style={styles.qrGlow} />
              <View style={styles.qrInner}>
                <MaterialCommunityIcons name="qrcode-scan" size={80} color={COLORS.indigo} />
                <Text style={styles.qrTokenLabel}>Token Active</Text>
              </View>
            </Animated.View>

            <Text style={styles.qrTokenText} selectable>{qrToken}</Text>
            <Text style={styles.qrHint}>
              Show this screen to students. They tap "Scan" in their app to mark attendance.
            </Text>

            <TouchableOpacity style={styles.modalClose} onPress={() => setQrModal(false)}>
              <LinearGradient colors={['#4F6EF7','#7C3AED']} style={StyleSheet.absoluteFill} borderRadius={RADIUS.m} />
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerSub:   { fontSize: 13, color: COLORS.textSecond, marginTop: 2 },
  qrBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.indigo, borderRadius: RADIUS.m,
    paddingVertical: 8, paddingHorizontal: 14, ...SHADOWS.card,
  },
  qrBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  statsRow: { flexDirection: 'row', paddingHorizontal: SPACING.l, paddingVertical: SPACING.m },
  statCard:  { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', letterSpacing: -1 },
  statLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', marginTop: 2 },
  divider:   { height: 1, opacity: 0.25 },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.m },
  loadingText: { color: COLORS.textSecond, fontSize: 14 },
  list: { padding: SPACING.l, paddingBottom: 100 },
  row:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.m, marginBottom: SPACING.s },
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
  emptySub:  { fontSize: 14, color: COLORS.textSecond, textAlign: 'center' },
  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center', alignItems: 'center', padding: SPACING.xl,
  },
  modalCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl,
    padding: SPACING.xl, width: '100%', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.indigo + '44', ...SHADOWS.card,
  },
  modalTitle: { fontSize: 22, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: -0.5 },
  modalSub:   { fontSize: 14, color: COLORS.textSecond, marginTop: 4, marginBottom: SPACING.l },
  qrDisplay: {
    width: 180, height: 180, borderRadius: RADIUS.xl,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.l, position: 'relative',
  },
  qrGlow: {
    ...StyleSheet.absoluteFillObject, borderRadius: RADIUS.xl, opacity: 0.15,
  },
  qrInner: {
    width: 160, height: 160, borderRadius: RADIUS.l,
    backgroundColor: COLORS.bgElevated, borderWidth: 2, borderColor: COLORS.indigo + '55',
    justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  qrTokenLabel: { fontSize: 12, color: COLORS.success, fontWeight: '700' },
  qrTokenText: {
    fontSize: 11, color: COLORS.textMuted, textAlign: 'center',
    marginBottom: SPACING.m, fontFamily: 'monospace', letterSpacing: 0.5,
  },
  qrHint: {
    fontSize: 13, color: COLORS.textSecond, textAlign: 'center',
    lineHeight: 18, marginBottom: SPACING.l,
  },
  modalClose: {
    width: '100%', borderRadius: RADIUS.m, overflow: 'hidden',
    paddingVertical: 14, alignItems: 'center',
  },
  modalCloseText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
