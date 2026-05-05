import React, { useState, useContext, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, ScrollView,
  Platform, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../../utils/theme';

export default function LoginScreen({ navigation }) {
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState(null);
  const [showPass,  setShowPass]  = useState(false);
  const { login } = useContext(AuthContext);

  // Guard against double-tap — ref tracks in-flight request
  const inFlight = useRef(false);
  const passRef  = useRef(null);

  const handleLogin = async () => {
    if (inFlight.current || isLoading) return; // prevent double submit

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) { setError('Please enter your email.'); return; }
    if (!password)     { setError('Please enter your password.'); return; }

    inFlight.current = true;
    setIsLoading(true);
    setError(null);

    console.log('🔐 [Login] Attempting login for:', trimmedEmail);

    try {
      const result = await login(trimmedEmail, password);
      console.log('🔐 [Login] Result:', result);
      if (!result.success) {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (e) {
      console.error('🔐 [Login] Unexpected error:', e);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
      inFlight.current = false;
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo / Brand */}
        <View style={styles.brand}>
          <LinearGradient colors={['#4F6EF7', '#7C3AED']} style={styles.logoCircle}>
            <MaterialCommunityIcons name="google-circles-extended" size={36} color="#fff" />
          </LinearGradient>
          <Text style={styles.appName}>ClubSphere</Text>
          <Text style={styles.tagline}>Your campus, connected.</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back 👋</Text>
          <Text style={styles.subtitle}>Login to access your campus clubs</Text>

          {error ? (
            <View style={styles.errorBanner}>
              <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Email */}
          <View style={styles.inputWrap}>
            <MaterialCommunityIcons name="email-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={(t) => { setEmail(t); setError(null); }}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          {/* Password */}
          <View style={styles.inputWrap}>
            <MaterialCommunityIcons name="lock-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              ref={passRef}
              style={[styles.input, { flex: 1 }]}
              placeholder="Password"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={(t) => { setPassword(t); setError(null); }}
              secureTextEntry={!showPass}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity onPress={() => setShowPass(v => !v)} style={styles.eyeBtn}>
              <MaterialCommunityIcons
                name={showPass ? 'eye-off-outline' : 'eye-outline'}
                size={18} color={COLORS.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Login button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
            style={styles.btnWrap}
          >
            <LinearGradient colors={['#4F6EF7', '#7C3AED']} style={styles.btn}>
              {isLoading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.btnText}>Login</Text>
              }
            </LinearGradient>
          </TouchableOpacity>

          {/* Sign up link */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Signup')}
            style={styles.linkWrap}
          >
            <Text style={styles.linkText}>
              Don't have an account?{' '}
              <Text style={styles.linkHighlight}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hint */}
        <View style={styles.hint}>
          <Text style={styles.hintTitle}>Demo Accounts</Text>
          <Text style={styles.hintLine}>🎓 Student: student@test.com / student123</Text>
          <Text style={styles.hintLine}>⚙️ Admin: admin@test.com / admin123</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1, backgroundColor: COLORS.bg,
    paddingHorizontal: SPACING.l, paddingTop: 60, paddingBottom: 40,
  },
  brand: { alignItems: 'center', marginBottom: SPACING.xl },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.m,
    shadowColor: '#4F6EF7', shadowOpacity: 0.5, shadowRadius: 20, elevation: 10,
  },
  appName: { fontSize: 32, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: -1 },
  tagline: { fontSize: 14, color: COLORS.textMuted, marginTop: 4 },

  card: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl,
    padding: SPACING.l, borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  title:    { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: 14, color: COLORS.textSecond, marginBottom: SPACING.l },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(239,68,68,0.12)', borderRadius: RADIUS.m,
    padding: SPACING.m, marginBottom: SPACING.m,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
  },
  errorText: { color: '#EF4444', fontSize: 13, flex: 1, lineHeight: 18 },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.m,
    borderWidth: 1.5, borderColor: COLORS.border,
    marginBottom: SPACING.m, paddingRight: 12,
  },
  inputIcon: { paddingHorizontal: 12 },
  input: {
    flex: 1, paddingVertical: 14, fontSize: 15,
    color: COLORS.textPrimary,
  },
  eyeBtn: { padding: 4 },

  btnWrap: { marginTop: SPACING.s, borderRadius: RADIUS.m, overflow: 'hidden' },
  btn: {
    paddingVertical: 15, alignItems: 'center', borderRadius: RADIUS.m,
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },

  linkWrap: { marginTop: SPACING.l, alignItems: 'center' },
  linkText: { fontSize: 14, color: COLORS.textSecond },
  linkHighlight: { color: COLORS.indigoLight, fontWeight: '700' },

  hint: {
    marginTop: SPACING.xl, backgroundColor: COLORS.bgElevated,
    borderRadius: RADIUS.m, padding: SPACING.m,
    borderWidth: 1, borderColor: COLORS.border,
  },
  hintTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, marginBottom: 6, letterSpacing: 0.5 },
  hintLine:  { fontSize: 12, color: COLORS.textSecond, marginBottom: 2 },
});
