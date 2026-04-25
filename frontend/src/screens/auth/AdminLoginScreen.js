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

export default function AdminLoginScreen({ navigation }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
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
    const result = await login(email, password);
    setIsLoading(false);
    if (!result.success) setError(result.message || 'Login failed. Check admin credentials.');
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
            <LinearGradient colors={['#7C3AED', '#4C1D95']} style={styles.badgeIcon}>
              <MaterialCommunityIcons name="shield-crown" size={13} color="#fff" />
            </LinearGradient>
            <Text style={styles.badgeText}>Admin Console</Text>
          </View>

          <Text style={styles.title}>Admin{'\n'}Sign In</Text>
          <Text style={styles.subtitle}>Manage your campus platform from one place</Text>

          {/* Divider */}
          <LinearGradient
            colors={['transparent', COLORS.purple, 'transparent']}
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
            label="Admin Email"
            placeholder="admin@campus.edu"
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
            <Text style={styles.hintText}>Demo: admin@test.com / admin123</Text>
          </View>

          <View style={{ marginTop: SPACING.m }}>
            <GradientButton
              title="Sign In as Admin"
              variant="purple"
              icon="shield-crown"
              onPress={handleLogin}
              loading={isLoading}
            />
          </View>

          {/* Secure note */}
          <View style={styles.secureNote}>
            <MaterialCommunityIcons name="shield-check" size={14} color={COLORS.success} />
            <Text style={styles.secureText}>Secured with encrypted session management</Text>
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
    backgroundColor: COLORS.purpleGlow, borderRadius: RADIUS.pill,
    borderWidth: 1, borderColor: COLORS.purple + '44',
    paddingVertical: 6, paddingHorizontal: 12,
  },
  badgeIcon: {
    width: 22, height: 22, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center',
  },
  badgeText: { fontSize: 12, color: COLORS.purpleLight, fontWeight: '700', letterSpacing: 0.3 },
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
  secureNote: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    justifyContent: 'center', marginTop: SPACING.xl,
    paddingTop: SPACING.l, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  secureText: { fontSize: 12, color: COLORS.textMuted },
});
