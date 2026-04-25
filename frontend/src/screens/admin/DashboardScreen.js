import React, { useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { DataContext } from '../../context/DataContext';
import { COLORS, GRADIENTS, RADIUS, SPACING, SHADOWS } from '../../utils/theme';
import PremiumCard from '../../components/PremiumCard';
import { formatCurrency } from '../../utils/currency';

// ── Mini bar chart (no external deps)
function BarChart({ data = [], height: chartH = 60 }) {
  const max = Math.max(...data, 1);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: chartH }}>
      {data.map((v, i) => {
        const isLast = i === data.length - 1;
        return (
          <View key={i} style={{ flex: 1, height: '100%', justifyContent: 'flex-end' }}>
            <LinearGradient
              colors={isLast ? GRADIENTS.indigo : ['rgba(79,110,247,0.6)', 'rgba(79,110,247,0.15)']}
              style={{ height: `${(v / max) * 100}%`, borderRadius: 4 }}
            />
          </View>
        );
      })}
    </View>
  );
}

// ── Donut-like progress ring (simple View trick)
function RingProgress({ percent = 0, color = COLORS.indigo, size = 56 }) {
  const strokeW = 6;
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{
        width: size, height: size, borderRadius: size / 2,
        borderWidth: strokeW, borderColor: color + '33',
        position: 'absolute',
      }} />
      <Text style={{ fontSize: 14, fontWeight: '800', color, letterSpacing: -0.5 }}>{percent}%</Text>
    </View>
  );
}

// ── Stat card
function StatCard({ icon, value, label, color, glow, trend, trendUp }) {
  return (
    <View style={[statS.card, { borderColor: color + '33' }]}>
      <LinearGradient colors={[glow, 'transparent']} style={StyleSheet.absoluteFill} />
      <View style={[statS.iconBox, { backgroundColor: color + '22' }]}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
      </View>
      <Text style={[statS.value, { color: COLORS.textPrimary }]}>{value}</Text>
      <Text style={statS.label}>{label}</Text>
      {trend && (
        <View style={[statS.trendRow, { backgroundColor: (trendUp ? COLORS.success : COLORS.error) + '22' }]}>
          <MaterialCommunityIcons name={trendUp ? 'trending-up' : 'trending-down'} size={11} color={trendUp ? COLORS.success : COLORS.error} />
          <Text style={[statS.trendText, { color: trendUp ? COLORS.success : COLORS.error }]}>{trend}</Text>
        </View>
      )}
    </View>
  );
}
const statS = StyleSheet.create({
  card: {
    flex: 1, borderRadius: RADIUS.l, padding: SPACING.m,
    backgroundColor: COLORS.bgCard, borderWidth: 1,
    overflow: 'hidden', ...SHADOWS.card,
  },
  iconBox: { width: 40, height: 40, borderRadius: RADIUS.m, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.s },
  value:   { fontSize: 26, fontWeight: '800', letterSpacing: -1, color: COLORS.textPrimary },
  label:   { fontSize: 11, color: COLORS.textSecond, fontWeight: '500', marginTop: 2 },
  trendRow:{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6, borderRadius: RADIUS.pill, paddingVertical: 2, paddingHorizontal: 6, alignSelf: 'flex-start' },
  trendText:{ fontSize: 10, fontWeight: '700' },
});

export default function DashboardScreen() {
  const { user }               = useContext(AuthContext);
  const { clubs, events, budgets } = useContext(DataContext);

  const totalIncome  = budgets.filter(b => b.type === 'income').reduce((a, b) => a + b.amount, 0);
  const totalExpense = budgets.filter(b => b.type === 'expense').reduce((a, b) => a + b.amount, 0);
  const balance      = totalIncome - totalExpense;
  const budgetPct    = totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0;
  const totalMembers = clubs.reduce((a, c) => a + (c.memberCount || 0), 0);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Fake weekly activity for the bar chart
  const weekActivity = [12, 19, 15, 28, 22, 35, 24];
  const weekLabels   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── HEADER */}
        <LinearGradient colors={['#0D1526', '#070C18']} style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>{greeting()},</Text>
              <Text style={styles.heroName}>{user?.name || 'Admin'}</Text>
            </View>
            <View style={styles.headerBadge}>
              <MaterialCommunityIcons name="shield-crown" size={13} color={COLORS.purple} />
              <Text style={styles.headerBadgeText}>Admin</Text>
            </View>
          </View>
          {/* Accent line */}
          <LinearGradient colors={['transparent', COLORS.indigo, 'transparent']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.accentLine} />
        </LinearGradient>

        <View style={styles.body}>

          {/* ── STAT CARDS ROW 1 */}
          <View style={styles.statsRow}>
            <StatCard icon="account-group"    value={clubs.length}  label="Total Clubs"   color={COLORS.indigo}  glow={COLORS.indigoGlow}  trend="+2 this month"  trendUp />
            <StatCard icon="calendar-star"    value={events.length} label="Events"        color={COLORS.cyan}    glow={COLORS.cyanGlow}    trend={`${events.filter(e=>e.joined).length} RSVP'd`} trendUp />
            <StatCard icon="account-multiple" value={totalMembers}  label="Members"       color={COLORS.success} glow={COLORS.successGlow} trend="+12 this week"  trendUp />
          </View>

          {/* ── ANALYTICS CARD (chart) */}
          <PremiumCard style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View>
                <Text style={styles.chartTitle}>Activity Overview</Text>
                <Text style={styles.chartSub}>Member engagement this week</Text>
              </View>
              <View style={styles.chartBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live</Text>
              </View>
            </View>

            <BarChart data={weekActivity} height={72} />

            <View style={styles.weekLabels}>
              {weekLabels.map((l, i) => (
                <Text key={l} style={[styles.weekLabel, i === weekLabels.length - 1 && { color: COLORS.indigo, fontWeight: '700' }]}>{l}</Text>
              ))}
            </View>

            <View style={styles.chartFooter}>
              <View style={styles.chartLegend}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.indigo }]} />
                <Text style={styles.legendText}>Active Members</Text>
              </View>
              <Text style={styles.chartTotal}>Peak: {Math.max(...weekActivity)} members</Text>
            </View>
          </PremiumCard>

          {/* ── BUDGET OVERVIEW */}
          <View style={styles.statsRow}>
            <PremiumCard style={{ flex: 1 }}>
              <Text style={styles.miniCardTitle}>Budget Health</Text>
              <View style={styles.budgetRow}>
                <RingProgress percent={budgetPct} color={budgetPct > 80 ? COLORS.error : COLORS.success} size={64} />
                <View style={{ flex: 1, gap: 8 }}>
                  <View style={styles.budgetLine}>
                    <Text style={styles.budgetLabel}>Income</Text>
                    <Text style={[styles.budgetValue, { color: COLORS.success }]}>{formatCurrency(totalIncome)}</Text>
                  </View>
                  <View style={[styles.budgetBar, { backgroundColor: COLORS.border }]}>
                    <LinearGradient colors={GRADIENTS.success || ['#10B981','#065F46']} style={[styles.budgetBarFill, { width: '100%' }]} />
                  </View>
                  <View style={styles.budgetLine}>
                    <Text style={styles.budgetLabel}>Spent</Text>
                    <Text style={[styles.budgetValue, { color: COLORS.error }]}>{formatCurrency(totalExpense)}</Text>
                  </View>
                  <View style={[styles.budgetBar, { backgroundColor: COLORS.border }]}>
                    <LinearGradient colors={GRADIENTS.crimson} style={[styles.budgetBarFill, { width: `${Math.min(budgetPct, 100)}%` }]} />
                  </View>
                </View>
              </View>
            </PremiumCard>
          </View>

          {/* ── QUICK STATS ROW */}
          <View style={styles.statsRow}>
            <View style={styles.quickStatCard}>
              <LinearGradient colors={GRADIENTS.indigo} style={styles.quickStatIcon}>
                <MaterialCommunityIcons name="trophy" size={18} color="#fff" />
              </LinearGradient>
              <Text style={styles.quickStatVal}>{Math.round(totalMembers * 0.6)}</Text>
              <Text style={styles.quickStatLabel}>Active Members</Text>
            </View>
            <View style={styles.quickStatCard}>
              <LinearGradient colors={GRADIENTS.purple} style={styles.quickStatIcon}>
                <MaterialCommunityIcons name="bullhorn" size={18} color="#fff" />
              </LinearGradient>
              <Text style={styles.quickStatVal}>{budgets.length}</Text>
              <Text style={styles.quickStatLabel}>Transactions</Text>
            </View>
            <View style={styles.quickStatCard}>
              <LinearGradient colors={GRADIENTS.cyan} style={styles.quickStatIcon}>
                <MaterialCommunityIcons name="chart-bar" size={18} color="#fff" />
              </LinearGradient>
              <Text style={styles.quickStatVal}>{budgetPct}%</Text>
              <Text style={styles.quickStatLabel}>Budget Used</Text>
            </View>
          </View>

          {/* ── RECENT CLUBS */}
          <Text style={styles.sectionTitle}>Recent Clubs</Text>
          {clubs.length === 0 ? (
            <PremiumCard style={{ alignItems: 'center', paddingVertical: SPACING.xl }}>
              <MaterialCommunityIcons name="account-group-outline" size={40} color={COLORS.textMuted} />
              <Text style={{ color: COLORS.textSecond, marginTop: SPACING.m }}>No clubs yet. Create one!</Text>
            </PremiumCard>
          ) : (
            clubs.slice(0, 4).map(c => (
              <PremiumCard key={c.id} style={styles.clubRow}>
                <View style={styles.clubInitial}>
                  <Text style={styles.clubInitialText}>{c.name?.[0]?.toUpperCase() || 'C'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.clubName}>{c.name}</Text>
                  <Text style={styles.clubMeta}>{c.memberCount || 0} members</Text>
                </View>
                <View style={[styles.clubBadge, { backgroundColor: COLORS.indigoGlow, borderColor: COLORS.indigo + '44' }]}>
                  <Text style={[styles.clubBadgeText, { color: COLORS.indigo }]}>Active</Text>
                </View>
              </PremiumCard>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const GRADIENTS_SUCCESS = ['#10B981', '#065F46'];

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: 100 },
  header: {
    paddingHorizontal: SPACING.l, paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xl, overflow: 'hidden',
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  greeting: { fontSize: 13, color: COLORS.indigo, fontWeight: '600', letterSpacing: 0.3 },
  heroName: { fontSize: 30, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -1 },
  headerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.purpleGlow, borderRadius: RADIUS.pill,
    borderWidth: 1, borderColor: COLORS.purple + '55',
    paddingVertical: 5, paddingHorizontal: 10,
  },
  headerBadgeText: { fontSize: 11, color: COLORS.purpleLight, fontWeight: '700' },
  accentLine: { height: 1, opacity: 0.4, marginTop: SPACING.m },
  body: { padding: SPACING.l },
  statsRow: { flexDirection: 'row', gap: SPACING.s, marginBottom: SPACING.m },
  chartCard: { marginBottom: SPACING.m },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.m },
  chartTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  chartSub:   { fontSize: 12, color: COLORS.textSecond, marginTop: 2 },
  chartBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.successGlow, borderRadius: RADIUS.pill,
    paddingVertical: 3, paddingHorizontal: 8,
    borderWidth: 1, borderColor: COLORS.success + '44',
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success },
  liveText: { fontSize: 10, color: COLORS.success, fontWeight: '700' },
  weekLabels: { flexDirection: 'row', marginTop: 6 },
  weekLabel:  { flex: 1, fontSize: 9, color: COLORS.textMuted, textAlign: 'center', fontWeight: '500' },
  chartFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.m, paddingTop: SPACING.s, borderTopWidth: 1, borderTopColor: COLORS.border },
  chartLegend: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: COLORS.textSecond },
  chartTotal: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  miniCardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.m },
  budgetRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.m },
  budgetLine: { flexDirection: 'row', justifyContent: 'space-between' },
  budgetLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '500' },
  budgetValue: { fontSize: 13, fontWeight: '700' },
  budgetBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
  budgetBarFill: { height: '100%', borderRadius: 2 },
  quickStatCard: {
    flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.l,
    padding: SPACING.m, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'flex-start', ...SHADOWS.card,
  },
  quickStatIcon: {
    width: 36, height: 36, borderRadius: RADIUS.m,
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.s,
  },
  quickStatVal:   { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
  quickStatLabel: { fontSize: 10, color: COLORS.textSecond, marginTop: 2, fontWeight: '500' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.m, letterSpacing: -0.3 },
  clubRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.m, marginBottom: SPACING.s },
  clubInitial: {
    width: 40, height: 40, borderRadius: RADIUS.m,
    backgroundColor: COLORS.indigoGlow, borderWidth: 1, borderColor: COLORS.indigo + '44',
    justifyContent: 'center', alignItems: 'center',
  },
  clubInitialText: { fontSize: 18, fontWeight: '800', color: COLORS.indigo },
  clubName: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  clubMeta: { fontSize: 12, color: COLORS.textSecond, marginTop: 1 },
  clubBadge: { borderRadius: RADIUS.pill, paddingVertical: 4, paddingHorizontal: 10, borderWidth: 1 },
  clubBadgeText: { fontSize: 11, fontWeight: '700' },
});
