import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Dimensions, StatusBar, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../../utils/theme';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: 'hexagon-multiple',
    iconColor: '#4F6EF7',
    gradientBg: ['#0D1526', '#111827'],
    accentColors: ['#4F6EF7', '#7C3AED'],
    badge: 'Welcome',
    title: 'Welcome to\nClubSphere',
    subtitle: 'The all-in-one campus platform for managing clubs, events, and student engagement.',
    stats: [
      { icon: 'account-group',   label: '2,400+ Students', color: '#4F6EF7' },
      { icon: 'calendar-star',   label: '180+ Events',     color: '#06B6D4' },
    ],
  },
  {
    id: '2',
    icon: 'calendar-star',
    iconColor: '#06B6D4',
    gradientBg: ['#0A1220', '#0D1526'],
    accentColors: ['#06B6D4', '#4F6EF7'],
    badge: 'Manage',
    title: 'Clubs &\nEvents',
    subtitle: 'Discover and join clubs, RSVP to events, and never miss out on campus activities.',
    stats: [
      { icon: 'google-circles-extended', label: '24 Active Clubs', color: '#06B6D4' },
      { icon: 'map-marker-check',        label: 'Live Attendance',  color: '#10B981' },
    ],
  },
  {
    id: '3',
    icon: 'chart-line',
    iconColor: '#7C3AED',
    gradientBg: ['#0F1225', '#0A0F1A'],
    accentColors: ['#7C3AED', '#4F6EF7'],
    badge: 'Analytics',
    title: 'Track &\nGrow',
    subtitle: 'Real-time analytics, XP leaderboards, and budget insights — all in one dashboard.',
    stats: [
      { icon: 'trophy',    label: 'XP Leaderboard', color: '#F59E0B' },
      { icon: 'chart-bar', label: 'Live Analytics',  color: '#7C3AED' },
    ],
  },
];

// Mini animated bar chart illustration
function MiniChart({ colors }) {
  const bars = [40, 65, 45, 80, 55, 90, 70];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: 56, width: 120 }}>
      {bars.map((h, i) => (
        <LinearGradient
          key={i}
          colors={colors}
          style={{ flex: 1, height: `${h}%`, borderRadius: 4, opacity: i === bars.length - 1 ? 1 : 0.5 + i * 0.07 }}
        />
      ))}
    </View>
  );
}

export default function OnboardingScreen({ navigation }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const flatRef = useRef(null);
  const dotAnim = useRef(SLIDES.map(() => new Animated.Value(0))).current;

  const animateDots = (idx) => {
    dotAnim.forEach((a, i) =>
      Animated.spring(a, {
        toValue: i === idx ? 1 : 0,
        useNativeDriver: false,
        speed: 30,
        bounciness: 6,
      }).start()
    );
  };

  const onScroll = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    if (idx !== activeIdx) {
      setActiveIdx(idx);
      animateDots(idx);
    }
  };

  const goNext = () => {
    if (activeIdx < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIdx + 1, animated: true });
      setActiveIdx(activeIdx + 1);
      animateDots(activeIdx + 1);
    } else {
      navigation.replace('RoleSelect');
    }
  };

  const skip = () => navigation.replace('RoleSelect');

  const renderSlide = ({ item }) => (
    <LinearGradient colors={item.gradientBg} style={styles.slide}>


      {/* Badge */}
      <View style={[styles.badge, { backgroundColor: item.iconColor + '20', borderColor: item.iconColor + '55' }]}>
        <View style={[styles.badgeDot, { backgroundColor: item.iconColor }]} />
        <Text style={[styles.badgeText, { color: item.iconColor }]}>{item.badge}</Text>
      </View>

      {/* Icon illustration */}
      <View style={styles.iconArea}>
        <LinearGradient
          colors={item.accentColors}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.iconRing}
        >
          <View style={styles.iconInner}>
            <MaterialCommunityIcons name={item.icon} size={52} color={item.iconColor} />
          </View>
        </LinearGradient>

        {/* Mini chart below icon */}
        <View style={styles.chartArea}>
          <MiniChart colors={item.accentColors} />
        </View>
      </View>

      {/* Text content */}
      <View style={styles.textArea}>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
      </View>

      {/* Stat pills */}
      <View style={styles.statRow}>
        {item.stats.map(s => (
          <View key={s.label} style={[styles.statPill, { borderColor: s.color + '44', backgroundColor: s.color + '12' }]}>
            <MaterialCommunityIcons name={s.icon} size={14} color={s.color} />
            <Text style={[styles.statText, { color: s.color }]}>{s.label}</Text>
          </View>
        ))}
      </View>
    </LinearGradient>
  );

  const isLast = activeIdx === SLIDES.length - 1;
  const currentSlide = SLIDES[activeIdx];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Skip */}
      {!isLast && (
        <TouchableOpacity style={styles.skipBtn} onPress={skip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={s => s.id}
        horizontal pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={renderSlide}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
      />

      {/* Bottom controls */}
      <View style={styles.bottomBar}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => {
            const w = dotAnim[i].interpolate({ inputRange: [0, 1], outputRange: [8, 24] });
            const op = dotAnim[i].interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: i === activeIdx ? 24 : 8,
                    opacity: i === activeIdx ? 1 : 0.35,
                    backgroundColor: i === activeIdx ? currentSlide.iconColor : COLORS.textMuted,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* CTA Button */}
        <TouchableOpacity onPress={goNext} activeOpacity={0.85}>
          <LinearGradient
            colors={currentSlide.accentColors}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.ctaBtn}
          >
            <Text style={styles.ctaText}>{isLast ? 'Get Started' : 'Continue'}</Text>
            <MaterialCommunityIcons
              name={isLast ? 'arrow-right-circle' : 'chevron-right'}
              size={20} color="#fff"
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  slide: { width, flex: 1, paddingHorizontal: SPACING.xl, paddingTop: SPACING.xxl + 20, paddingBottom: 140 },


  skipBtn: {
    position: 'absolute', top: SPACING.xxl, right: SPACING.xl,
    zIndex: 10, paddingVertical: 6, paddingHorizontal: 14,
    backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.pill,
    borderWidth: 1, borderColor: COLORS.border,
  },
  skipText: { fontSize: 13, color: COLORS.textSecond, fontWeight: '600' },

  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', borderRadius: RADIUS.pill, borderWidth: 1,
    paddingVertical: 5, paddingHorizontal: 12, marginBottom: SPACING.xl,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },

  iconArea: { alignItems: 'center', marginBottom: SPACING.xl },
  iconRing: {
    width: 120, height: 120, borderRadius: 60,
    padding: 3, justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.l,
  },
  iconInner: {
    flex: 1, borderRadius: 57, backgroundColor: COLORS.bgCard,
    justifyContent: 'center', alignItems: 'center', width: '100%',
  },
  chartArea: { alignItems: 'center' },

  textArea: { marginBottom: SPACING.xl },
  slideTitle: {
    fontSize: 42, fontWeight: '900', color: COLORS.textPrimary,
    letterSpacing: -1.5, lineHeight: 50, marginBottom: SPACING.m,
  },
  slideSubtitle: {
    fontSize: 16, color: COLORS.textSecond, lineHeight: 26, maxWidth: 320,
  },

  statRow: { flexDirection: 'row', gap: SPACING.m, flexWrap: 'wrap' },
  statPill: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    borderRadius: RADIUS.pill, borderWidth: 1,
    paddingVertical: 8, paddingHorizontal: 14,
  },
  statText: { fontSize: 13, fontWeight: '700' },

  // Bottom
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl, paddingTop: SPACING.l,
    backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { height: 8, borderRadius: 4 },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 14, paddingHorizontal: 24,
    borderRadius: RADIUS.pill,
  },
  ctaText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
});
