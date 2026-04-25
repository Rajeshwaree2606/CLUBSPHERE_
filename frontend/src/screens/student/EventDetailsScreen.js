import React, { useContext, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { DataContext } from '../../context/DataContext';
import { COLORS, GRADIENTS, RADIUS, SPACING, SHADOWS } from '../../utils/theme';
import PremiumCard from '../../components/PremiumCard';
import GradientButton from '../../components/GradientButton';

export default function EventDetailsScreen({ route, navigation }) {
  const { eventId } = route.params;
  const { events, clubs, joinEvent } = useContext(DataContext);
  const [loading, setLoading] = useState(false);

  const event = events.find(e => e.id === eventId);
  const club  = clubs.find(c => c.id === event?.clubId);

  const handleJoin = async () => {
    setLoading(true);
    const res = await joinEvent(event.id);
    setLoading(false);
    Toast.show({
      type: res.success ? 'success' : 'error',
      text1: res.success ? 'RSVP confirmed! 🎉' : (res.message || 'Failed to RSVP'),
    });
  };

  if (!event) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <MaterialCommunityIcons name="calendar-remove" size={56} color={COLORS.textMuted} />
        <Text style={{ color: COLORS.textSecond, marginTop: SPACING.m, fontSize: 16 }}>Event not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: SPACING.l }}>
          <Text style={{ color: COLORS.gold, fontWeight: '700' }}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const day = event.date?.split('-')[2] || '--';
  const mon = event.date ? new Date(event.date).toLocaleString('en', { month: 'long' }) : '---';
  const year = event.date?.split('-')[0] || '';

  const INFO = [
    { icon: 'calendar-range',     label: 'Date',       value: event.date    || 'TBA' },
    { icon: 'clock-outline',      label: 'Time',       value: event.time    || 'TBA' },
    { icon: 'map-marker-outline', label: 'Venue',      value: event.venue   || 'TBA' },
    { icon: 'account-group',      label: 'Club',       value: club?.name    || 'General' },
    { icon: 'ticket-confirmation',label: 'Capacity',   value: event.maxParticipants ? `${event.maxParticipants} seats` : 'Open' },
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Handle (modal presentation) */}
      <View style={styles.handle} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <View style={styles.heroRow}>
          <View style={styles.dateBlock}>
            <Text style={styles.dateDay}>{day}</Text>
            <Text style={styles.dateMon}>{mon}</Text>
            <Text style={styles.dateYear}>{year}</Text>
          </View>
          <View style={{ flex: 1 }}>
            {event.joined && (
              <View style={styles.rsvpPill}>
                <MaterialCommunityIcons name="check-circle" size={13} color={COLORS.success} />
                <Text style={styles.rsvpText}>RSVP'd</Text>
              </View>
            )}
            <Text style={styles.eventTitle}>{event.title}</Text>
            <View style={styles.clubRow}>
              <MaterialCommunityIcons name="google-circles-extended" size={14} color={COLORS.textMuted} />
              <Text style={styles.clubText}>{club?.name || 'Campus Event'}</Text>
            </View>
          </View>
        </View>

        {/* Gold divider */}
        <LinearGradient
          colors={['transparent', COLORS.gold, 'transparent']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.divider}
        />

        {/* Info grid */}
        <PremiumCard style={{ marginBottom: SPACING.l }}>
          {INFO.map((row, i) => (
            <View key={row.label}>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <MaterialCommunityIcons name={row.icon} size={16} color={COLORS.gold} />
                </View>
                <View>
                  <Text style={styles.infoLabel}>{row.label}</Text>
                  <Text style={styles.infoValue}>{row.value}</Text>
                </View>
              </View>
              {i < INFO.length - 1 && <View style={styles.rowDivider} />}
            </View>
          ))}
        </PremiumCard>

        {/* Description */}
        {event.description ? (
          <>
            <Text style={styles.sectionTitle}>About this Event</Text>
            <PremiumCard style={{ marginBottom: SPACING.xl }}>
              <Text style={styles.description}>{event.description}</Text>
            </PremiumCard>
          </>
        ) : null}

        {/* CTA */}
        {event.joined ? (
          <PremiumCard variant="gold" style={{ alignItems: 'center', paddingVertical: SPACING.l }}>
            <MaterialCommunityIcons name="check-circle" size={36} color={COLORS.success} />
            <Text style={styles.attendingText}>You're attending this event!</Text>
            <Text style={styles.attendingSub}>Your spot is confirmed. See you there 🎉</Text>
          </PremiumCard>
        ) : (
          <GradientButton
            title="Confirm RSVP"
            variant="gold"
            icon="ticket-confirmation"
            onPress={handleJoin}
            loading={loading}
          />
        )}

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={16} color={COLORS.textSecond} />
          <Text style={styles.backText}>Back to Events</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center', marginTop: 12, marginBottom: SPACING.s,
  },
  scroll: { padding: SPACING.l, paddingBottom: 100 },
  heroRow: { flexDirection: 'row', gap: SPACING.l, marginBottom: SPACING.l, alignItems: 'flex-start' },
  dateBlock: {
    width: 72, borderRadius: RADIUS.l,
    backgroundColor: COLORS.goldGlow, borderWidth: 1, borderColor: COLORS.goldDim,
    alignItems: 'center', paddingVertical: SPACING.m, ...SHADOWS.gold,
  },
  dateDay:  { fontSize: 32, fontWeight: '800', color: COLORS.gold, lineHeight: 36 },
  dateMon:  { fontSize: 12, fontWeight: '700', color: COLORS.gold, letterSpacing: 0.5 },
  dateYear: { fontSize: 11, color: COLORS.goldDim, fontWeight: '600', marginTop: 2 },
  rsvpPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.successGlow, borderWidth: 1, borderColor: `${COLORS.success}44`,
    borderRadius: RADIUS.pill, paddingVertical: 3, paddingHorizontal: 8,
    alignSelf: 'flex-start', marginBottom: SPACING.s,
  },
  rsvpText: { fontSize: 11, color: COLORS.success, fontWeight: '700' },
  eventTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5, lineHeight: 28, marginBottom: SPACING.s },
  clubRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  clubText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
  divider: { height: 1, opacity: 0.3, marginBottom: SPACING.l },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.m, paddingVertical: SPACING.s },
  infoIcon: {
    width: 36, height: 36, borderRadius: RADIUS.s,
    backgroundColor: COLORS.goldGlow, justifyContent: 'center', alignItems: 'center',
  },
  infoLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', letterSpacing: 0.5 },
  infoValue: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '600', marginTop: 1 },
  rowDivider: { height: 1, backgroundColor: COLORS.border },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.m, letterSpacing: -0.3 },
  description: { fontSize: 15, color: COLORS.textSecond, lineHeight: 24 },
  attendingText: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginTop: SPACING.m },
  attendingSub: { fontSize: 14, color: COLORS.textSecond, marginTop: 4 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: SPACING.xl, justifyContent: 'center' },
  backText: { fontSize: 14, color: COLORS.textSecond, fontWeight: '500' },
});
