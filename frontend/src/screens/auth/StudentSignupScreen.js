import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  StatusBar, ScrollView, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, RADIUS, SPACING } from '../../utils/theme';
import GradientButton from '../../components/GradientButton';
import PremiumInput from '../../components/PremiumInput';

const { height } = Dimensions.get('window');

export default function StudentSignupScreen({ navigation }) {
  const [name,            setName]            = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signup } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 12, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill out all fields.'); return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.'); return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    setIsLoading(true); setError(null);
    const result = await signup(name, email, password, 'Member');
    setIsLoading(false);
    if (!result.success) setError(result.message || 'Signup failed. Please try again.');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />


      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: SPACING.xl }}>
          <View style={styles.backCircle}>
            <MaterialCommunityIcons name="arrow-left" size={20} color={COLORS.gold} />
          </View>
        </TouchableOpacity>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.badge}>
            <MaterialCommunityIcons name="account-plus" size={14} color={COLORS.gold} />
            <Text style={styles.badgeText}>New Student</Text>
          </View>

          <Text style={styles.title}>Join{'\n'}ClubSphere ✨</Text>
          <Text style={styles.subtitle}>Create your account and start building your campus story</Text>

          <LinearGradient colors={['transparent', COLORS.gold, 'transparent']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.divider} />

          {error && (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={16} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <PremiumInput label="Full Name" placeholder="Your full name" value={name}
            onChangeText={setName} leftIcon="account-outline" autoCapitalize="words" />
          <PremiumInput label="Email Address" placeholder="you@campus.edu" value={email}
            onChangeText={setEmail} keyboardType="email-address" leftIcon="email-outline" />
          <PremiumInput label="Password" placeholder="Min 6 characters" value={password}
            onChangeText={setPassword} secureTextEntry leftIcon="lock-outline" />
          <PremiumInput label="Confirm Password" placeholder="Repeat password" value={confirmPassword}
            onChangeText={setConfirmPassword} secureTextEntry leftIcon="lock-check-outline" />

          <View style={{ marginTop: SPACING.m }}>
            <GradientButton title="Create Account" variant="gold" icon="account-check"
              onPress={handleSignup} loading={isLoading} />
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('StudentLogin')}>
              <Text style={styles.loginLink}>Sign in →</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },

  scroll: {
    flexGrow: 1, paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  backCircle: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bgElevated,
    borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center',
    alignItems: 'center', alignSelf: 'flex-start',
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.goldGlow, borderWidth: 1, borderColor: COLORS.goldDim,
    borderRadius: RADIUS.pill, paddingVertical: 5, paddingHorizontal: 12,
    alignSelf: 'flex-start', marginBottom: SPACING.l,
  },
  badgeText: { fontSize: 12, color: COLORS.gold, fontWeight: '700', letterSpacing: 0.5 },
  title: { fontSize: 40, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -1.5, lineHeight: 48, marginBottom: SPACING.s },
  subtitle: { fontSize: 15, color: COLORS.textSecond, marginBottom: SPACING.l, lineHeight: 22 },
  divider: { height: 1, opacity: 0.35, marginBottom: SPACING.l },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.s,
    backgroundColor: COLORS.errorGlow, borderWidth: 1, borderColor: `${COLORS.error}44`,
    borderRadius: RADIUS.m, padding: SPACING.m, marginBottom: SPACING.m,
  },
  errorText: { color: COLORS.error, fontSize: 13, flex: 1 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xl },
  loginText: { color: COLORS.textSecond, fontSize: 14 },
  loginLink: { color: COLORS.gold, fontSize: 14, fontWeight: '700' },
});
