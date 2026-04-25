import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../../utils/theme';

const { width } = Dimensions.get('window');

function RoleCard({ icon, title, subtitle, accentColor, gradientColors, onPress, delay }) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 12, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const onPressIn  = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 40 }).start();
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 40 }).start();

  return (
    <Animated.View style={[
      styles.cardWrap,
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] },
    ]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.9}
        style={[styles.card, { borderColor: accentColor + '44' }]}
      >
        {/* Subtle gradient overlay */}
        <LinearGradient
          colors={[accentColor + '12', 'transparent']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          borderRadius={20}
        />

        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.iconBox}
        >
          <MaterialCommunityIcons name={icon} size={32} color="#fff" />
        </LinearGradient>

        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>

        <View style={[styles.arrow, { backgroundColor: accentColor + '22' }]}>
          <MaterialCommunityIcons name="arrow-right" size={18} color={accentColor} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function RoleSelectScreen({ navigation }) {
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroFade,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(heroSlide, { toValue: 0, tension: 50, friction: 12, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />



      <View style={styles.inner}>
        {/* Header */}
        <Animated.View style={{ opacity: heroFade, transform: [{ translateY: heroSlide }], alignItems: 'center', marginBottom: SPACING.xxl }}>
          {/* Logo */}
          <LinearGradient
            colors={['#4F6EF7', '#7C3AED']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.logoRing}
          >
            <View style={styles.logoInner}>
              <MaterialCommunityIcons name="hexagon-multiple" size={28} color={COLORS.indigo} />
            </View>
          </LinearGradient>

          <Text style={styles.heroTitle}>Who are you?</Text>
          <Text style={styles.heroSub}>Select your role to continue into{'\n'}ClubSphere</Text>
        </Animated.View>

        {/* Role cards */}
        <RoleCard
          icon="account-school"
          title="Student"
          subtitle="Explore clubs, join events & track your campus journey"
          accentColor={COLORS.indigo}
          gradientColors={['#4F6EF7', '#2A3F9E']}
          onPress={() => navigation.navigate('StudentLogin')}
          delay={200}
        />

        <RoleCard
          icon="shield-crown"
          title="Admin"
          subtitle="Manage clubs, events, budgets & member analytics"
          accentColor={COLORS.purple}
          gradientColors={['#7C3AED', '#4C1D95']}
          onPress={() => navigation.navigate('AdminLogin')}
          delay={350}
        />

        {/* Sign up nudge */}
        <Animated.View style={[styles.signupRow, { opacity: heroFade }]}>
          <Text style={styles.signupText}>New to ClubSphere? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('StudentSignup')}>
            <Text style={styles.signupLink}>Create account →</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },

  inner: {
    flex: 1, paddingHorizontal: SPACING.xl,
    justifyContent: 'center', paddingBottom: SPACING.xl,
  },

  logoRing: {
    width: 72, height: 72, borderRadius: 36,
    padding: 2, justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.l,
  },
  logoInner: {
    flex: 1, borderRadius: 34, backgroundColor: COLORS.bgCard,
    justifyContent: 'center', alignItems: 'center', width: '100%',
  },
  heroTitle: {
    fontSize: 38, fontWeight: '900', color: COLORS.textPrimary,
    letterSpacing: -1.2, textAlign: 'center', marginBottom: SPACING.s,
  },
  heroSub: {
    fontSize: 15, color: COLORS.textSecond,
    textAlign: 'center', lineHeight: 24,
  },

  cardWrap: { marginBottom: SPACING.m },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.m,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl,
    borderWidth: 1.5, padding: SPACING.l, overflow: 'hidden',
  },
  iconBox: {
    width: 60, height: 60, borderRadius: RADIUS.l,
    justifyContent: 'center', alignItems: 'center',
  },
  cardTitle:    { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.4, marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: COLORS.textSecond, lineHeight: 19 },
  arrow: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },

  signupRow: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', marginTop: SPACING.xl,
  },
  signupText: { fontSize: 14, color: COLORS.textSecond },
  signupLink: { fontSize: 14, color: COLORS.indigo, fontWeight: '700' },
});
