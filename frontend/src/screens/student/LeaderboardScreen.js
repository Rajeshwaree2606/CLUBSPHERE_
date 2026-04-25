import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DataContext } from '../../context/DataContext';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, GRADIENTS, RADIUS, SPACING, SHADOWS } from '../../utils/theme';
import PremiumCard from '../../components/PremiumCard';

const MEDALS      = ['🥇', '🥈', '🥉'];
const RANK_COLORS = [COLORS.gold, '#94A3B8', '#CD7F32'];
const PODIUM_GRADIENTS = [
  GRADIENTS.gold,                        // 1st — gold
  ['#475569', '#334155'],                // 2nd — silver-grey
  ['#92400E', '#78350F'],                // 3rd — bronze
];

function TopThree({ data }) {
  if (data.length === 0) return null;
  const order = [1, 0, 2].filter(i => i < data.length);

  return (
    <View style={podiumStyles.wrap}>
      {order.map(i => {
        const item  = data[i];
        const isTop = i === 0;
        const size  = isTop ? 80 : 60;
        // Circular glow applied directly on the gradient element (no square wrapper shadow)
        const glowStyle = isTop ? Platform.select({
          web:     { boxShadow: `0 0 28px 6px ${RANK_COLORS[0]}99` },
          default: {},
        }) : {};
        return (
          <View key={item.id || i} style={[podiumStyles.col, isTop && podiumStyles.colTop]}>
            <LinearGradient
              colors={PODIUM_GRADIENTS[i]}
              style={[
                podiumStyles.avatar,
                { width: size, height: size, borderRadius: size / 2 },
                glowStyle,
              ]}
            >
              <Text style={[podiumStyles.avatarText, { fontSize: isTop ? 30 : 22, color: isTop ? '#000' : '#fff' }]}>
                {item.name?.[0]?.toUpperCase() || '?'}
              </Text>
            </LinearGradient>

            <Text style={podiumStyles.medal}>{MEDALS[i] || ''}</Text>
            <Text style={[podiumStyles.name, { color: RANK_COLORS[i] }]} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={[podiumStyles.xpPill, { borderColor: RANK_COLORS[i] + '55', backgroundColor: RANK_COLORS[i] + '18' }]}>
              <Text style={[podiumStyles.xpText, { color: RANK_COLORS[i] }]}>{item.xp} XP</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const podiumStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end',
    paddingHorizontal: SPACING.xl,
    paddingTop: 52,
    paddingBottom: SPACING.xl,
    gap: SPACING.m,
  },
  col:    { flex: 1, alignItems: 'center', gap: 6 },
  colTop: { transform: [{ translateY: -28 }] },
  // No avatarWrap needed — shadow goes directly on the circular gradient
  avatar: { justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontWeight: '900' },

  medal: { fontSize: 22 },
  name:  { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  xpPill: {
    borderRadius: RADIUS.pill, paddingVertical: 4, paddingHorizontal: 10,
    borderWidth: 1,
  },
  xpText: { fontSize: 11, fontWeight: '800' },
});

export default function LeaderboardScreen() {
  const { leaderboard } = useContext(DataContext);
  const { user }        = useContext(AuthContext);

  const sorted = [...leaderboard].sort((a, b) => b.xp - a.xp);
  const top3   = sorted.slice(0, 3);
  const rest   = sorted.slice(3);

  const renderRest = ({ item, index }) => {
    const rank = index + 4;
    const isMe = item.id === String(user?.id);
    return (
      <PremiumCard
        style={[styles.row, isMe && { borderColor: COLORS.indigo + '66' }]}
        variant={isMe ? 'indigo' : 'default'}
      >
        <View style={[styles.rankBadge, { backgroundColor: rank <= 10 ? COLORS.indigoGlow : COLORS.bgElevated }]}>
          <Text style={[styles.rankNum, { color: rank <= 10 ? COLORS.indigoLight : COLORS.textMuted }]}>
            #{rank}
          </Text>
        </View>
        <View style={styles.rowAvatar}>
          <Text style={styles.rowAvatarText}>{item.name?.[0]?.toUpperCase() || '?'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.rowName, isMe && { color: COLORS.indigo }]}>
            {item.name}{isMe ? ' · You' : ''}
          </Text>
          <Text style={styles.rowXP}>{item.xp} XP · Level {item.level || 1}</Text>
        </View>
        {rank <= 10 && (
          <MaterialCommunityIcons name="star-four-points" size={14} color={COLORS.gold} />
        )}
      </PremiumCard>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Red vignette — corners glow inward from screen edges */}
      <View style={styles.vignetteTop}    pointerEvents="none" />
      <View style={styles.vignetteBottom} pointerEvents="none" />
      <View style={styles.vignetteLeft}   pointerEvents="none" />
      <View style={styles.vignetteRight}  pointerEvents="none" />

      <FlatList
        data={rest}
        keyExtractor={(item, i) => item.id || String(i)}
        renderItem={renderRest}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* ── HERO — NO overflow:hidden so avatars aren't clipped */}
            <LinearGradient colors={['#0D1526', '#070C18']} style={styles.hero}>
              <View style={styles.heroBadge}>
                <MaterialCommunityIcons name="trophy" size={13} color={COLORS.gold} />
                <Text style={styles.heroBadgeText}>Season Rankings</Text>
              </View>
              <Text style={styles.heroTitle}>Leaderboard</Text>
              <Text style={styles.heroSub}>Earn XP by joining clubs and attending events</Text>
            </LinearGradient>

            {/* Podium — sits outside hero, never clipped */}
            <TopThree data={top3} />

            {/* Divider */}
            <LinearGradient
              colors={['transparent', COLORS.indigo, 'transparent']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ height: 1, opacity: 0.3, marginBottom: SPACING.m }}
            />

            {rest.length > 0 && (
              <Text style={styles.restTitle}>More Rankings</Text>
            )}
          </View>
        }
        ListEmptyComponent={
          top3.length === 0 ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="trophy-outline" size={56} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No rankings yet</Text>
              <Text style={styles.emptySub}>Join clubs and events to earn XP points</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },

  // Red vignette edges
  vignetteTop: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 120, zIndex: 1,
    ...Platform.select({
      web:     { background: 'radial-gradient(ellipse at top, rgba(220,38,38,0.18) 0%, transparent 70%)' },
      default: {},
    }),
    backgroundColor: 'transparent',
  },
  vignetteBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, zIndex: 1,
    ...Platform.select({
      web:     { background: 'radial-gradient(ellipse at bottom, rgba(220,38,38,0.15) 0%, transparent 70%)' },
      default: {},
    }),
    backgroundColor: 'transparent',
  },
  vignetteLeft: {
    position: 'absolute', top: 0, bottom: 0, left: 0, width: 80, zIndex: 1,
    ...Platform.select({
      web:     { background: 'linear-gradient(to right, rgba(220,38,38,0.12), transparent)' },
      default: {},
    }),
    backgroundColor: 'transparent',
  },
  vignetteRight: {
    position: 'absolute', top: 0, bottom: 0, right: 0, width: 80, zIndex: 1,
    ...Platform.select({
      web:     { background: 'linear-gradient(to left, rgba(220,38,38,0.12), transparent)' },
      default: {},
    }),
    backgroundColor: 'transparent',
  },

  // No overflow:hidden — that was the bug
  hero: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl + 12,
    paddingBottom: SPACING.l,
    // IMPORTANT: no overflow: 'hidden'
  },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.goldGlow, borderRadius: RADIUS.pill,
    borderWidth: 1, borderColor: COLORS.gold + '44',
    paddingVertical: 4, paddingHorizontal: 10,
    alignSelf: 'flex-start', marginBottom: SPACING.m,
  },
  heroBadgeText: { fontSize: 11, color: COLORS.gold, fontWeight: '700', letterSpacing: 0.3 },
  heroTitle: { fontSize: 32, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: -1 },
  heroSub:   { fontSize: 13, color: COLORS.textSecond, marginTop: 4 },

  list: { paddingHorizontal: SPACING.l, paddingBottom: 120 },
  restTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textSecond, marginBottom: SPACING.m },

  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.m },
  rankBadge: {
    width: 36, height: 36, borderRadius: RADIUS.s,
    justifyContent: 'center', alignItems: 'center',
  },
  rankNum: { fontSize: 13, fontWeight: '800' },
  rowAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.bgElevated, borderWidth: 1, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  rowAvatarText: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  rowName: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  rowXP:   { fontSize: 12, color: COLORS.textSecond, marginTop: 1 },

  empty: { alignItems: 'center', paddingTop: 60, gap: SPACING.m },
  emptyText: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  emptySub:  { fontSize: 14, color: COLORS.textSecond, textAlign: 'center' },
});
