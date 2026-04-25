import React, { useContext, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { DataContext } from '../../context/DataContext';
import { COLORS, GRADIENTS, RADIUS, SPACING, SHADOWS } from '../../utils/theme';
import PremiumCard from '../../components/PremiumCard';
import GradientButton from '../../components/GradientButton';

export default function StudentEventsScreen({ navigation }) {
  const { events, joinEvent } = useContext(DataContext);
  const [loadingId, setLoadingId] = useState(null);

  const handleJoin = async id => {
    setLoadingId(id);
    const res = await joinEvent(id);
    setLoadingId(null);
    Toast.show({ type: res.success ? 'success' : 'error', text1: res.success ? 'RSVP confirmed! 🎉' : (res.message || 'Failed to RSVP') });
  };

  const renderItem = ({ item }) => {
    const day = item.date?.split('-')[2] || '--';
    const mon = item.date ? new Date(item.date).toLocaleString('en', { month: 'short' }) : '---';
    return (
      <PremiumCard style={styles.card} variant={item.joined ? 'gold' : 'default'}>
        <View style={styles.cardRow}>
          {/* Date block */}
          <View style={styles.datePill}>
            <Text style={styles.dateDay}>{day}</Text>
            <Text style={styles.dateMon}>{mon}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
            <View style={styles.metaRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={12} color={COLORS.textMuted} />
              <Text style={styles.metaText}>{item.venue || 'TBA'}</Text>
            </View>
            {item.description ? (
              <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.cardFooter}>
          {item.joined ? (
            <View style={styles.rsvpBadge}>
              <MaterialCommunityIcons name="check-circle" size={14} color={COLORS.success} />
              <Text style={styles.rsvpText}>RSVP'd</Text>
            </View>
          ) : (
            <GradientButton
              title="RSVP Now"
              variant="gold"
              icon="calendar-check"
              size="small"
              onPress={() => handleJoin(item.id)}
              loading={loadingId === item.id}
              fullWidth={false}
              style={{ alignSelf: 'flex-start' }}
            />
          )}
          <TouchableOpacity
            style={styles.detailsBtn}
            onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}
          >
            <Text style={styles.detailsBtnText}>Details</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.gold} />
          </TouchableOpacity>
        </View>
      </PremiumCard>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Events</Text>
        <Text style={styles.headerSub}>{events.filter(e => e.joined).length} RSVP'd · {events.length} total</Text>
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
            <Text style={styles.emptySub}>Check back soon for upcoming events</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingHorizontal: SPACING.l, paddingTop: SPACING.xxl,
    paddingBottom: SPACING.l, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.8 },
  headerSub: { fontSize: 13, color: COLORS.textSecond, marginTop: 2 },
  list: { padding: SPACING.l, paddingBottom: 120 },
  card: { marginBottom: SPACING.m },
  cardRow: { flexDirection: 'row', gap: SPACING.m, marginBottom: SPACING.m },
  datePill: {
    width: 52, borderRadius: RADIUS.m, backgroundColor: COLORS.goldGlow,
    borderWidth: 1, borderColor: COLORS.goldDim,
    alignItems: 'center', paddingVertical: 8, alignSelf: 'flex-start',
  },
  dateDay: { fontSize: 22, fontWeight: '800', color: COLORS.gold, lineHeight: 26 },
  dateMon: { fontSize: 10, fontWeight: '700', color: COLORS.gold, letterSpacing: 0.5 },
  eventTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.3, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  metaText: { fontSize: 12, color: COLORS.textMuted },
  desc: { fontSize: 13, color: COLORS.textSecond, lineHeight: 19 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.m },
  rsvpBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.successGlow, borderRadius: RADIUS.pill,
    paddingVertical: 6, paddingHorizontal: 12,
    borderWidth: 1, borderColor: `${COLORS.success}44`,
  },
  rsvpText: { fontSize: 13, color: COLORS.success, fontWeight: '700' },
  detailsBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  detailsBtnText: { fontSize: 13, color: COLORS.gold, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 80, gap: SPACING.m },
  emptyText: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  emptySub: { fontSize: 14, color: COLORS.textSecond },
});
