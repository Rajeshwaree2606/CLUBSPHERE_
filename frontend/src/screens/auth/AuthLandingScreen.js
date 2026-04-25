import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions, StatusBar,
  TouchableOpacity, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, RADIUS, SPACING, SHADOWS } from '../../utils/theme';
import GradientButton from '../../components/GradientButton';

const { width, height } = Dimensions.get('window');

// Mini bar chart for hero section (pure RN, no lib needed)
function MiniBarChart({ data = [40, 65, 45, 80, 60, 90, 75] }) {
  const max = Math.max(...data);
  return (
    <View style={chartStyles.wrap}>
      {data.map((v, i) => (
        <View key={i} style={chartStyles.barWrap}>
          <LinearGradient
            colors={i === data.length - 1 ? GRADIENTS.indigo : ['rgba(79,110,247,0.5)', 'rgba(79,110,247,0.15)']}
            style={[chartStyles.bar, { height: `${(v / max) * 100}%` }]}
          />
        </View>
      ))}
    </View>
  );
}
const chartStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 48, flex: 1 },
  barWrap: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { borderRadius: 3, width: '100%' },
});

// Floating stat bubble
function StatBubble({ icon, value, label, color, glow }) {
  return (
    <View style={[bubbleStyles.wrap, { borderColor: color + '44' }]}>
      <View style={[bubbleStyles.icon, { backgroundColor: glow }]}>
        <MaterialCommunityIcons name={icon} size={16} color={color} />
      </View>
      <View>
        <Text style={[bubbleStyles.value, { color }]}>{value}</Text>
        <Text style={bubbleStyles.label}>{label}</Text>
      </View>
    </View>
  );
}
const bubbleStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.l,
    borderWidth: 1, paddingVertical: 10, paddingHorizontal: 14,
    ...StyleSheet.flatten({}),
  },
  icon: { width: 32, height: 32, borderRadius: RADIUS.s, justifyContent: 'center', alignItems: 'center' },
  value: { fontSize: 15, fontWeight: '800', letterSpacing: -0.5 },
  label: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600', marginTop: 1 },
});

// Feature row
function Feature({ icon, title, desc, color }) {
  return (
    <View style={featStyles.row}>
      <View style={[featStyles.icon, { backgroundColor: color + '22', borderColor: color + '44' }]}>
        <MaterialCommunityIcons name={icon} size={18} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={featStyles.title}>{title}</Text>
        <Text style={featStyles.desc}>{desc}</Text>
      </View>
    </View>
  );
}
const featStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.m, paddingVertical: SPACING.m },
  icon: { width: 40, height: 40, borderRadius: RADIUS.m, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  desc:  { fontSize: 13, color: COLORS.textSecond, lineHeight: 18 },
});

const FEATURES = [
  { icon: 'google-circles-extended', title: 'Club Discovery',    desc: 'Browse and join campus clubs instantly',    color: COLORS.indigo  },
  { icon: 'calendar-star',           title: 'Event Management',  desc: 'Schedule, RSVP, and track attendance',      color: COLORS.cyan    },
  { icon: 'chart-line',              title: 'Live Analytics',    desc: 'Real-time budget and member stats',         color: COLORS.success },
  { icon: 'trophy',                  title: 'XP Leaderboard',    desc: 'Gamified campus engagement system',         color: COLORS.gold    },
  { icon: 'bullhorn',                title: 'Announcements',     desc: 'Push broadcasts to all members instantly',  color: COLORS.purple  },
];

export default function AuthLandingScreen({ navigation }) {
  const heroFade  = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(40)).current;
  const cardFade  = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(30)).current;
  const btnFade   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(heroFade,  { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.spring(heroSlide, { toValue: 0, tension: 45, friction: 10, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardFade,  { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(cardSlide, { toValue: 0, tension: 50, friction: 12, useNativeDriver: true }),
      ]),
      Animated.timing(btnFade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />



      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── HEADER NAV */}
        <View style={styles.nav}>
          <View style={styles.navLogo}>
            <LinearGradient colors={GRADIENTS.indigo} style={styles.navIcon}>
              <MaterialCommunityIcons name="hexagon-multiple" size={18} color="#fff" />
            </LinearGradient>
            <Text style={styles.navBrand}>ClubSphere</Text>
          </View>
          <TouchableOpacity style={styles.navLoginBtn} onPress={() => navigation.navigate('StudentLogin')}>
            <Text style={styles.navLoginText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* ── HERO SECTION */}
        <Animated.View style={[styles.hero, { opacity: heroFade, transform: [{ translateY: heroSlide }] }]}>
          {/* Badge */}
          <View style={styles.heroBadge}>
            <View style={styles.heroBadgeDot} />
            <Text style={styles.heroBadgeText}>Now Live — Campus Edition 2025</Text>
          </View>

          <Text style={styles.heroH1}>
            Your Campus.{'\n'}
            <Text style={styles.heroH1Blue}>Smarter. </Text>
            <Text style={styles.heroH1Purple}>Connected.</Text>
          </Text>

          <Text style={styles.heroSub}>
            ClubSphere is the all-in-one platform for managing clubs, events, budgets, and engagement — built for modern universities.
          </Text>

          {/* Live stat pills */}
          <View style={styles.statPills}>
            <StatBubble icon="account-group"  value="2.4K+" label="Students"  color={COLORS.indigo} glow={COLORS.indigoGlow} />
            <StatBubble icon="calendar-check" value="180+"  label="Events"    color={COLORS.cyan}   glow={COLORS.cyanGlow}   />
            <StatBubble icon="trophy"          value="94%"   label="Engagement" color={COLORS.success} glow={COLORS.successGlow} />
          </View>
        </Animated.View>

        {/* ── DASHBOARD PREVIEW CARD */}
        <Animated.View style={[styles.previewCard, { opacity: cardFade, transform: [{ translateY: cardSlide }] }]}>
          <LinearGradient colors={['#0D1526', '#131E33']} style={styles.previewInner}>
            {/* Fake top bar */}
            <View style={styles.previewTopBar}>
              <View style={styles.previewDots}>
                {['#EF4444','#F59E0B','#10B981'].map((c,i) => (
                  <View key={i} style={[styles.previewDot, { backgroundColor: c }]} />
                ))}
              </View>
              <Text style={styles.previewTitle}>Admin Dashboard — ClubSphere</Text>
            </View>

            {/* Mini stats in preview */}
            <View style={styles.previewStats}>
              {[
                { label: 'Active Clubs',  value: '24',    color: COLORS.indigo  },
                { label: 'Upcoming Events', value: '8',   color: COLORS.cyan    },
                { label: 'Total Members',  value: '1.2K', color: COLORS.success },
                { label: 'Budget Used',   value: '67%',   color: COLORS.gold    },
              ].map(s => (
                <View key={s.label} style={styles.previewStatCard}>
                  <Text style={[styles.previewStatVal, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.previewStatLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Mini bar chart */}
            <View style={styles.previewChart}>
              <Text style={styles.previewChartTitle}>Member Activity (This Week)</Text>
              <MiniBarChart data={[30, 52, 45, 78, 62, 88, 70]} />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── FEATURES LIST */}
        <Animated.View style={[styles.features, { opacity: cardFade }]}>
          <Text style={styles.featTitle}>Everything your campus needs</Text>
          <View style={styles.featDivider} />
          {FEATURES.map(f => <Feature key={f.title} {...f} />)}
        </Animated.View>

        {/* ── CTA BUTTONS */}
        <Animated.View style={[styles.ctas, { opacity: btnFade }]}>
          <Text style={styles.ctaHeadline}>Ready to get started?</Text>
          <Text style={styles.ctaSub}>Choose your role to enter the platform</Text>

          <View style={styles.ctaBtnRow}>
            <View style={{ flex: 1 }}>
              <GradientButton
                title="Student Portal"
                variant="indigo"
                icon="account-school"
                onPress={() => navigation.navigate('StudentLogin')}
              />
            </View>
            <View style={{ flex: 1 }}>
              <GradientButton
                title="Admin Console"
                variant="purple"
                icon="shield-crown"
                onPress={() => navigation.navigate('AdminLogin')}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.signupLink} onPress={() => navigation.navigate('StudentSignup')}>
            <Text style={styles.signupText}>New student? </Text>
            <Text style={styles.signupBold}>Create a free account →</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <Text style={styles.footerText}>ClubSphere Platform · Campus Edition v3.0</Text>
          <Text style={styles.footerSub}>Secure · Real-time · Mobile Ready</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },

  scroll: { paddingBottom: SPACING.xxl },

  // Nav
  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.l, paddingTop: SPACING.xl, paddingBottom: SPACING.m,
  },
  navLogo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  navIcon: {
    width: 34, height: 34, borderRadius: RADIUS.s,
    justifyContent: 'center', alignItems: 'center',
  },
  navBrand: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
  navLoginBtn: {
    paddingVertical: 8, paddingHorizontal: 18,
    borderRadius: RADIUS.pill, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.bgElevated,
  },
  navLoginText: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '600' },

  // Hero
  hero: {
    paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl, paddingBottom: SPACING.xl,
    alignItems: 'center',
  },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.indigoGlow, borderRadius: RADIUS.pill,
    borderWidth: 1, borderColor: COLORS.indigo + '55',
    paddingVertical: 6, paddingHorizontal: 14, marginBottom: SPACING.l,
  },
  heroBadgeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.success },
  heroBadgeText: { fontSize: 12, color: COLORS.indigoLight, fontWeight: '600', letterSpacing: 0.3 },
  heroH1: {
    fontSize: width > 600 ? 52 : 40, fontWeight: '900',
    color: COLORS.textPrimary, textAlign: 'center',
    letterSpacing: -1.5, lineHeight: width > 600 ? 60 : 48,
    marginBottom: SPACING.l,
  },
  heroH1Blue: { color: COLORS.indigo },
  heroH1Purple: { color: COLORS.purple },
  heroSub: {
    fontSize: 16, color: COLORS.textSecond, textAlign: 'center',
    lineHeight: 26, maxWidth: 500, marginBottom: SPACING.xl,
  },
  statPills: {
    flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.s, justifyContent: 'center',
  },

  // Dashboard preview card
  previewCard: {
    marginHorizontal: SPACING.l, borderRadius: RADIUS.xl,
    overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border,
    marginBottom: SPACING.xl,
    ...StyleSheet.flatten({}),
  },
  previewInner: { padding: SPACING.m },
  previewTopBar: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.m,
    marginBottom: SPACING.m, paddingBottom: SPACING.m,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  previewDots: { flexDirection: 'row', gap: 5 },
  previewDot: { width: 10, height: 10, borderRadius: 5 },
  previewTitle: { fontSize: 12, color: COLORS.textSecond, fontWeight: '500' },
  previewStats: { flexDirection: 'row', gap: SPACING.s, marginBottom: SPACING.m },
  previewStatCard: {
    flex: 1, backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.m,
    padding: SPACING.m, borderWidth: 1, borderColor: COLORS.border,
  },
  previewStatVal:   { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  previewStatLabel: { fontSize: 10, color: COLORS.textMuted, marginTop: 3, fontWeight: '500' },
  previewChart: {
    backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.m,
    padding: SPACING.m, borderWidth: 1, borderColor: COLORS.border,
  },
  previewChartTitle: { fontSize: 11, color: COLORS.textSecond, fontWeight: '600', marginBottom: SPACING.s },

  // Features
  features: { paddingHorizontal: SPACING.xl, marginBottom: SPACING.xl },
  featTitle: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5, marginBottom: SPACING.m },
  featDivider: { height: 1, backgroundColor: COLORS.border, marginBottom: SPACING.s },

  // CTAs
  ctas: {
    paddingHorizontal: SPACING.xl, marginBottom: SPACING.xl, alignItems: 'center',
  },
  ctaHeadline: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.8, textAlign: 'center', marginBottom: SPACING.s },
  ctaSub:      { fontSize: 15, color: COLORS.textSecond, textAlign: 'center', marginBottom: SPACING.xl },
  ctaBtnRow:   { flexDirection: 'row', gap: SPACING.m, width: '100%', marginBottom: SPACING.l },
  signupLink:  { flexDirection: 'row', alignItems: 'center' },
  signupText:  { fontSize: 14, color: COLORS.textSecond },
  signupBold:  { fontSize: 14, color: COLORS.indigo, fontWeight: '700' },

  // Footer
  footer: { alignItems: 'center', paddingHorizontal: SPACING.xl, paddingBottom: SPACING.l },
  footerDivider: { height: 1, backgroundColor: COLORS.border, width: '100%', marginBottom: SPACING.l },
  footerText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500', marginBottom: 4 },
  footerSub:  { fontSize: 11, color: COLORS.textMuted + '88' },
});
