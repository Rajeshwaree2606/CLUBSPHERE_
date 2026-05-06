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
import GoogleSignInButton from '../../components/GoogleSignInButton';

const { height } = Dimensions.get('window');

export default function StudentLoginScreen({ navigation }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const { login, loginWithGoogle } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 12, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setIsLoading(true); setError(null);
    const result = await login(email, password, 'student');
    setIsLoading(false);
    if (!result.success) setError(result.message || 'Login failed. Check your credentials.');
  };

  const handleGoogleSignIn = async (idToken) => {
    setIsLoading(true); setError(null);
    const result = await loginWithGoogle(idToken);
    setIsLoading(false);
    if (!result.success) setError(result.message || 'Google sign-in failed.');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />



      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Role badge */}
          <View style={styles.badge}>
            <LinearGradient colors={['#4F6EF7', '#7C3AED']} style={styles.badgeIcon}>
              <MaterialCommunityIcons name="account-school" size={13} color="#fff" />
            </LinearGradient>
            <Text style={styles.badgeText}>Student Portal</Text>
          </View>

          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>Access your campus dashboard and activities</Text>

          {/* Divider */}
          <LinearGradient
            colors={['transparent', COLORS.indigo, 'transparent']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.divider}
          />

          {/* Error */}
          {error && (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={15} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Inputs */}
          <PremiumInput
            label="Email Address"
            placeholder="you@campus.edu"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            leftIcon="email-outline"
          />
          <PremiumInput
            label="Password"
            placeholder="Min 6 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon="lock-outline"
          />

          {/* Demo hint */}
          <View style={styles.hintBox}>
            <MaterialCommunityIcons name="information-outline" size={13} color={COLORS.textMuted} />
            <Text style={styles.hintText}>Demo: student@campus.edu / student123</Text>
          </View>

          <View style={{ marginTop: SPACING.m }}>
            <GradientButton
              title="Sign In"
              variant="indigo"
              icon="login"
              onPress={handleLogin}
              loading={isLoading}
            />
            <GoogleSignInButton
              onSignIn={handleGoogleSignIn}
              onError={setError}
              loading={isLoading}
            />
          </View>

          {/* Sign up */}
          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('StudentSignup')}>
              <Text style={styles.signupLink}>Create one →</Text>
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
    flexGrow: 1, paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl, paddingBottom: SPACING.xxl,
    justifyContent: 'center', minHeight: height * 0.85,
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: COLORS.bgElevated, borderWidth: 1, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
    alignSelf: 'flex-start', marginBottom: SPACING.xl,
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    alignSelf: 'flex-start', marginBottom: SPACING.l,
    backgroundColor: COLORS.indigoGlow, borderRadius: RADIUS.pill,
    borderWidth: 1, borderColor: COLORS.indigo + '44',
    paddingVertical: 6, paddingHorizontal: 12,
  },
  badgeIcon: {
    width: 22, height: 22, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center',
  },
  badgeText: { fontSize: 12, color: COLORS.indigoLight, fontWeight: '700', letterSpacing: 0.3 },
  title: {
    fontSize: 40, fontWeight: '900', color: COLORS.textPrimary,
    letterSpacing: -1.5, lineHeight: 48, marginBottom: SPACING.s,
  },
  subtitle: { fontSize: 15, color: COLORS.textSecond, marginBottom: SPACING.l, lineHeight: 22 },
  divider: { height: 1, opacity: 0.35, marginBottom: SPACING.l },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.s,
    backgroundColor: COLORS.errorGlow, borderWidth: 1,
    borderColor: COLORS.error + '44', borderRadius: RADIUS.m,
    padding: SPACING.m, marginBottom: SPACING.m,
  },
  errorText: { color: COLORS.error, fontSize: 13, flex: 1 },
  hintBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: SPACING.m, backgroundColor: COLORS.bgElevated,
    borderRadius: RADIUS.s, padding: SPACING.s,
  },
  hintText: { color: COLORS.textMuted, fontSize: 12 },
  signupRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xl },
  signupText: { color: COLORS.textSecond, fontSize: 14 },
  signupLink: { color: COLORS.indigo, fontSize: 14, fontWeight: '700' },
});
