import React, { useContext, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { DataContext } from '../../context/DataContext';
import { COLORS, GRADIENTS, RADIUS, SPACING, SHADOWS } from '../../utils/theme';
import PremiumCard from '../../components/PremiumCard';
import GradientButton from '../../components/GradientButton';
import ConfirmModal from '../../components/ConfirmModal';

const CLUB_ICONS = {
  tech: 'laptop', media: 'camera', sport: 'trophy', art: 'palette',
  music: 'music-note', entre: 'lightbulb-outline', student: 'account-group', default: 'account-group-outline',
};
function getIcon(name = '') {
  const l = name.toLowerCase();
  if (l.includes('tech') || l.includes('code')) return CLUB_ICONS.tech;
  if (l.includes('media') || l.includes('photo')) return CLUB_ICONS.media;
  if (l.includes('sport') || l.includes('game'))  return CLUB_ICONS.sport;
  if (l.includes('art'))   return CLUB_ICONS.art;
  if (l.includes('music')) return CLUB_ICONS.music;
  if (l.includes('entre')) return CLUB_ICONS.entre;
  if (l.includes('student') || l.includes('council')) return CLUB_ICONS.student;
  return CLUB_ICONS.default;
}

export default function StudentClubsScreen() {
  const { clubs, joinClub, leaveClub } = useContext(DataContext);
  const [loadingId,    setLoadingId]    = useState(null);
  const [leaveTarget,  setLeaveTarget]  = useState(null);

  const handleJoin = async id => {
    setLoadingId(id);
    const res = await joinClub(id);
    setLoadingId(null);
    Toast.show({ type: res.success ? 'success' : 'error', text1: res.success ? 'Joined club! 🎉' : (res.message || 'Failed to join') });
  };

  const confirmLeave = async () => {
    if (!leaveTarget) return;
    setLoadingId(leaveTarget);
    const res = await leaveClub(leaveTarget);
    setLoadingId(null); setLeaveTarget(null);
    Toast.show({ type: 'success', text1: 'Left club' });
  };

  const renderItem = ({ item }) => {
    const icon = getIcon(item.name);
    return (
      <PremiumCard style={styles.card} variant={item.joined ? 'gold' : 'default'}>
        <View style={styles.cardTop}>
          <LinearGradient
            colors={item.joined ? GRADIENTS.gold : ['#1E1E2E', '#13131A']}
            style={styles.iconWrap}
          >
            <MaterialCommunityIcons name={icon} size={26} color={item.joined ? '#000' : COLORS.textSecond} />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={styles.clubName}>{item.name}</Text>
            <View style={styles.memberRow}>
              <MaterialCommunityIcons name="account-multiple" size={12} color={COLORS.textMuted} />
              <Text style={styles.memberText}>{item.memberCount || 0} {item.memberCount === 1 ? 'member' : 'members'}</Text>
            </View>
          </View>
          {item.joined && (
            <View style={styles.joinedPill}>
              <MaterialCommunityIcons name="check-circle" size={13} color={COLORS.success} />
              <Text style={styles.joinedText}>Joined</Text>
            </View>
          )}
        </View>

        {item.description ? (
          <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
        ) : null}

        <View style={{ marginTop: SPACING.m }}>
          {item.joined ? (
            <GradientButton
              title="Leave Club"
              variant="outline"
              size="small"
              onPress={() => setLeaveTarget(item.id)}
              loading={loadingId === item.id}
            />
          ) : (
            <GradientButton
              title="Join Club"
              variant="gold"
              icon="account-plus"
              size="small"
              onPress={() => handleJoin(item.id)}
              loading={loadingId === item.id}
            />
          )}
        </View>
      </PremiumCard>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover Clubs</Text>
        <Text style={styles.headerSub}>{clubs.filter(c => c.joined).length} joined · {clubs.length} total</Text>
      </View>

      <FlatList
        data={clubs}
        keyExtractor={c => c.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="account-group-outline" size={56} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No clubs available</Text>
          </View>
        }
      />

      <ConfirmModal
        visible={!!leaveTarget}
        title="Leave Club?"
        message="You can rejoin at any time, but you'll lose your member status."
        confirmLabel="Leave"
        onConfirm={confirmLeave}
        onCancel={() => setLeaveTarget(null)}
        variant="gold"
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
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.m, marginBottom: SPACING.s },
  iconWrap: {
    width: 52, height: 52, borderRadius: RADIUS.m,
    justifyContent: 'center', alignItems: 'center',
  },
  clubName: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.3 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  memberText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
  joinedPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.successGlow, borderRadius: RADIUS.pill,
    paddingVertical: 4, paddingHorizontal: 8,
    borderWidth: 1, borderColor: `${COLORS.success}44`,
  },
  joinedText: { fontSize: 11, color: COLORS.success, fontWeight: '700' },
  desc: { fontSize: 13, color: COLORS.textSecond, lineHeight: 20 },
  empty: { alignItems: 'center', paddingTop: 80, gap: SPACING.m },
  emptyText: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
});
