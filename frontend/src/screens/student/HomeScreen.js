import React, { useContext, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList,
  TouchableOpacity, StatusBar, Modal, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { DataContext } from '../../context/DataContext';
import { COLORS, GRADIENTS, RADIUS, SPACING, SHADOWS } from '../../utils/theme';
import PremiumCard from '../../components/PremiumCard';
import XPBar from '../../components/XPBar';

export default function HomeScreen({ navigation }) {
  const { user }                         = useContext(AuthContext);
  const { clubs, events, notifications } = useContext(DataContext);
  const [showNotifs, setShowNotifs]      = useState(false);

  const joinedClubs    = clubs.filter(c => c.joined);
  const attendedEvents = events.filter(e => e.joined);
  const upcoming       = events.filter(e => !e.joined).slice(0, 5);
  const unread         = notifications.length;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const STATS = [
    { icon: 'google-circles-extended', label: 'Clubs',    value: joinedClubs.length,    colors: GRADIENTS.indigo },
    { icon: 'calendar-check',          label: 'Events',   value: attendedEvents.length,  colors: GRADIENTS.cyan   },
    { icon: 'trophy',                  label: 'XP',       value: user?.xp || 0,          colors: GRADIENTS.purple },
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* ── Notifications Modal */}
      <Modal visible={showNotifs} transparent animationType="slide" onRequestClose={() => setShowNotifs(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowNotifs(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Notifications</Text>
            {notifications.length === 0 ? (
              <View style={styles.modalEmpty}>
                <MaterialCommunityIcons name="bell-off-outline" size={36} color={COLORS.textMuted} />
                <Text style={styles.modalEmptyText}>No notifications yet</Text>
              </View>
            ) : (
              notifications.map((n, i) => (
                <View key={n.id || i} style={styles.notifItem}>
                  <View style={styles.notifDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.notifTitle}>{n.title}</Text>
                    <Text style={styles.notifMsg}>{n.message}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── HEADER */}
        <LinearGradient colors={['#0D1526', '#070C18']} style={styles.hero}>
          {/* Ambient orb — pointer-events none so it doesn't block the bell */}

          <View style={styles.heroTop}>
            <View>
              <Text style={styles.greetText}>{greeting()},</Text>
              <Text style={styles.heroName}>{user?.name?.split(' ')[0] || 'Student'} 👋</Text>
            </View>

            {/* Bell button — properly pressable, no orb blocking it */}
            <TouchableOpacity
              style={styles.bellBtn}
              onPress={() => setShowNotifs(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons name="bell-outline" size={20} color={COLORS.textPrimary} />
              {unread > 0 && <View style={styles.bellDot} />}
            </TouchableOpacity>
          </View>

          {/* XP section */}
          <View style={styles.xpSection}>
            <View style={styles.xpRow}>
              <View style={styles.levelPill}>
                <MaterialCommunityIcons name="star-four-points" size={10} color={COLORS.indigo} />
                <Text style={styles.levelText}>Lv {user?.level || 1}</Text>
              </View>
              <Text style={styles.xpText}>{user?.xp || 0} / 1000 XP</Text>
            </View>
            <XPBar current={user?.xp || 0} max={1000} />
          </View>
        </LinearGradient>

        {/* Accent line */}
        <LinearGradient
          colors={['transparent', COLORS.indigo, 'transparent']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={{ height: 1, opacity: 0.3 }}
        />

        <View style={styles.body}>

          {/* ── STAT CARDS */}
          <View style={styles.statsRow}>
            {STATS.map(s => (
              <View key={s.label} style={styles.statCard}>
                <LinearGradient colors={s.colors} style={styles.statIcon}>
                  <MaterialCommunityIcons name={s.icon} size={16} color="#fff" />
                </LinearGradient>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* ── UPCOMING EVENTS */}
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          {upcoming.length > 0 ? (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={upcoming}
              keyExtractor={e => e.id}
              contentContainerStyle={{ paddingRight: SPACING.l }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.eventCard}
                  onPress={() => navigation.navigate('Events', {
                    screen: 'EventDetails',
                    params: { eventId: item.id },
                  })}
                  activeOpacity={0.85}
                >
                  <View style={styles.eventCardInner}>
                    {/* Date block */}
                    <LinearGradient colors={GRADIENTS.indigo} style={styles.datePill}>
                      <Text style={styles.dateDay}>{item.date?.split('-')[2] || '--'}</Text>
                      <Text style={styles.dateMon}>
                        {item.date ? new Date(item.date).toLocaleString('en', { month: 'short' }) : '---'}
                      </Text>
                    </LinearGradient>

                    <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>

                    <View style={styles.eventMeta}>
                      <MaterialCommunityIcons name="map-marker-outline" size={12} color={COLORS.textMuted} />
                      <Text style={styles.eventVenue} numberOfLines={1}>{item.venue || 'TBA'}</Text>
                    </View>

                    <View style={styles.eventFooter}>
                      <Text style={styles.viewMore}>View Details →</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          ) : (
            <PremiumCard style={{ alignItems: 'center', paddingVertical: SPACING.xl }}>
              <MaterialCommunityIcons name="calendar-blank" size={36} color={COLORS.textMuted} />
              <Text style={{ color: COLORS.textSecond, fontSize: 14, marginTop: SPACING.s }}>
                No upcoming events
              </Text>
            </PremiumCard>
          )}

          {/* ── ANNOUNCEMENTS */}
          {notifications.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>Latest Announcements</Text>
              {notifications.slice(0, 3).map((n, i) => (
                <PremiumCard key={n.id || i} style={styles.notifCard} variant="indigo">
                  <View style={styles.notifRow}>
                    <View style={styles.notifIconBox}>
                      <MaterialCommunityIcons name="bullhorn" size={16} color={COLORS.indigo} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.notifTitle}>{n.title}</Text>
                      <Text style={styles.notifMsg} numberOfLines={2}>{n.message}</Text>
                    </View>
                  </View>
                </PremiumCard>
              ))}
            </>
          )}

          {/* ── MY CLUBS */}
          {joinedClubs.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>My Clubs</Text>
              <View style={{ gap: SPACING.s }}>
                {joinedClubs.slice(0, 3).map(c => (
                  <PremiumCard key={c.id} style={styles.clubRow}>
                    <View style={styles.clubAvatar}>
                      <Text style={styles.clubAvatarText}>{c.name?.[0]?.toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.clubName}>{c.name}</Text>
                      <Text style={styles.clubMeta}>{c.memberCount || 0} members</Text>
                    </View>
                    <View style={styles.joinedPill}>
                      <Text style={styles.joinedText}>Joined</Text>
                    </View>
                  </PremiumCard>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: 110 },

  // ── Hero — NO overflow:hidden so orb doesn't visually clash with bell
  hero: {
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.xxl + 8,
    paddingBottom: SPACING.l,
  },
  heroTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: SPACING.l,
  },
  greetText: { fontSize: 13, color: COLORS.indigo, fontWeight: '600', letterSpacing: 0.3 },
  heroName:  { fontSize: 28, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: -1 },

  // Bell — clean, no orb interference
  bellBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
    zIndex: 10,
  },
  bellDot: {
    position: 'absolute', top: 9, right: 9,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.error, borderWidth: 1.5, borderColor: COLORS.bg,
  },

  // XP
  xpSection: { gap: 6 },
  xpRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.m },
  levelPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.indigoGlow, borderRadius: RADIUS.pill,
    paddingVertical: 3, paddingHorizontal: 10,
    borderWidth: 1, borderColor: COLORS.indigo + '44',
  },
  levelText: { fontSize: 12, color: COLORS.indigoLight, fontWeight: '700' },
  xpText:    { fontSize: 12, color: COLORS.textSecond },

  body: { padding: SPACING.l },

  // Stats
  statsRow: { flexDirection: 'row', gap: SPACING.s, marginBottom: SPACING.xl },
  statCard: {
    flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.l,
    padding: SPACING.m, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'flex-start', ...SHADOWS.card,
  },
  statIcon: {
    width: 36, height: 36, borderRadius: RADIUS.m,
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.s,
  },
  statValue: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -1 },
  statLabel: { fontSize: 11, color: COLORS.textSecond, marginTop: 2, fontWeight: '500' },

  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.m, letterSpacing: -0.3 },

  // Event cards
  eventCard: { width: 190, marginRight: SPACING.m, borderRadius: RADIUS.l, overflow: 'hidden', ...SHADOWS.card },
  eventCardInner: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.l, padding: SPACING.m,
    height: 175, borderWidth: 1, borderColor: COLORS.border,
  },
  datePill: { borderRadius: RADIUS.s, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: SPACING.m },
  dateDay: { fontSize: 18, fontWeight: '900', color: '#fff', lineHeight: 22 },
  dateMon: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.8)', letterSpacing: 0.5 },
  eventTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4, lineHeight: 18, flex: 1 },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  eventVenue: { fontSize: 11, color: COLORS.textMuted, flex: 1 },
  eventFooter: { marginTop: SPACING.s },
  viewMore: { fontSize: 12, color: COLORS.indigo, fontWeight: '700' },

  // Notifications
  notifCard: { marginBottom: SPACING.s },
  notifRow:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.m },
  notifIconBox: {
    width: 36, height: 36, borderRadius: RADIUS.m,
    backgroundColor: COLORS.indigoGlow, borderWidth: 1, borderColor: COLORS.indigo + '44',
    justifyContent: 'center', alignItems: 'center',
  },
  notifTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  notifMsg:   { fontSize: 12, color: COLORS.textSecond, marginTop: 2, lineHeight: 17 },

  // Clubs
  clubRow:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.m },
  clubAvatar:  {
    width: 40, height: 40, borderRadius: RADIUS.m,
    backgroundColor: COLORS.indigoGlow, borderWidth: 1, borderColor: COLORS.indigo + '44',
    justifyContent: 'center', alignItems: 'center',
  },
  clubAvatarText: { fontSize: 18, fontWeight: '800', color: COLORS.indigo },
  clubName: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  clubMeta: { fontSize: 12, color: COLORS.textSecond, marginTop: 1 },
  joinedPill: {
    backgroundColor: COLORS.successGlow, borderRadius: RADIUS.pill,
    paddingVertical: 4, paddingHorizontal: 10,
    borderWidth: 1, borderColor: COLORS.success + '44',
  },
  joinedText: { fontSize: 11, color: COLORS.success, fontWeight: '700' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: COLORS.bgCard, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    padding: SPACING.l, paddingTop: SPACING.m, maxHeight: '70%',
    borderWidth: 1, borderColor: COLORS.border, borderBottomWidth: 0,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border,
    alignSelf: 'center', marginBottom: SPACING.l,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.l },
  modalEmpty: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.m },
  modalEmptyText: { fontSize: 15, color: COLORS.textSecond },
  notifItem: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.m,
    paddingVertical: SPACING.m, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  notifDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.indigo, marginTop: 5,
  },
});
