import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, GRADIENTS, RADIUS, SPACING, SHADOWS } from '../../utils/theme';
import GradientButton from '../../components/GradientButton';
import PremiumCard from '../../components/PremiumCard';

const INFO_ROWS = [
  { icon: 'shield-crown', label: 'Role',   key: 'backendRole' },
  { icon: 'email-outline', label: 'Email', key: 'email' },
  { icon: 'identifier',   label: 'User ID', key: 'id' },
];

export default function AdminProfileScreen() {
  const { user, logout } = useContext(AuthContext);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Avatar hero */}
        <LinearGradient colors={['#1A1A26', '#0A0A0F']} style={styles.hero}>
          <View style={styles.heroOrb} />
          <LinearGradient colors={GRADIENTS.gold} style={styles.avatarRing}>
            <View style={styles.avatarInner}>
              <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'A'}</Text>
            </View>
          </LinearGradient>
          <Text style={styles.heroName}>{user?.name || 'Administrator'}</Text>
          <View style={styles.roleBadge}>
            <MaterialCommunityIcons name="shield-crown" size={13} color={COLORS.crimsonLight} />
            <Text style={styles.roleText}>{user?.backendRole || 'SuperAdmin'}</Text>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Info card */}
          <PremiumCard style={{ marginBottom: SPACING.l }}>
            <Text style={styles.sectionLabel}>ACCOUNT INFO</Text>
            {INFO_ROWS.map((row, i) => (
              <View key={row.key}>
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <MaterialCommunityIcons name={row.icon} size={16} color={COLORS.gold} />
                  </View>
                  <View>
                    <Text style={styles.infoLabel}>{row.label}</Text>
                    <Text style={styles.infoValue}>{user?.[row.key] || '—'}</Text>
                  </View>
                </View>
                {i < INFO_ROWS.length - 1 && <View style={styles.rowDivider} />}
              </View>
            ))}
          </PremiumCard>

          {/* Permissions card */}
          <PremiumCard variant="gold" style={{ marginBottom: SPACING.l }}>
            <Text style={styles.sectionLabel}>ADMIN PERMISSIONS</Text>
            {['Manage Clubs', 'Schedule Events', 'Broadcast Announcements', 'View Budget', 'Mark Attendance'].map(p => (
              <View key={p} style={styles.permRow}>
                <MaterialCommunityIcons name="check-circle" size={16} color={COLORS.success} />
                <Text style={styles.permText}>{p}</Text>
              </View>
            ))}
          </PremiumCard>

          {/* Logout */}
          <GradientButton title="Sign Out" variant="danger" icon="logout" onPress={logout} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: 120 },
  hero: {
    alignItems: 'center', paddingTop: SPACING.xxl + 12,
    paddingBottom: SPACING.xxl, overflow: 'hidden',
  },
  heroOrb: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(192,57,43,0.05)', right: -60, top: -60,
  },
  avatarRing: {
    width: 88, height: 88, borderRadius: 44,
    padding: 2.5, justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.l, ...SHADOWS.gold,
  },
  avatarInner: {
    flex: 1, borderRadius: 42, width: '100%',
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 36, fontWeight: '800', color: COLORS.gold },
  heroName: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.8, marginBottom: SPACING.s },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(192,57,43,0.12)', borderWidth: 1, borderColor: 'rgba(192,57,43,0.3)',
    borderRadius: RADIUS.pill, paddingVertical: 5, paddingHorizontal: 12,
  },
  roleText: { fontSize: 12, color: COLORS.crimsonLight, fontWeight: '700', letterSpacing: 0.5 },
  body: { padding: SPACING.l },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, color: COLORS.textMuted, marginBottom: SPACING.m },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.m, paddingVertical: SPACING.s },
  infoIcon: {
    width: 36, height: 36, borderRadius: RADIUS.s,
    backgroundColor: COLORS.goldGlow, justifyContent: 'center', alignItems: 'center',
  },
  infoLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', letterSpacing: 0.5 },
  infoValue: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '600', marginTop: 1 },
  rowDivider: { height: 1, backgroundColor: COLORS.border },
  permRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.m, paddingVertical: 7 },
  permText: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
});
