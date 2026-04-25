import React, { useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { DataContext } from '../../context/DataContext';
import { COLORS, GRADIENTS, RADIUS, SPACING, SHADOWS } from '../../utils/theme';
import PremiumCard from '../../components/PremiumCard';
import GradientButton from '../../components/GradientButton';
import XPBar from '../../components/XPBar';

const ACHIEVEMENTS = [
  { emoji: '🌱', label: 'First Step',    minXP: 0 },
  { emoji: '🔥', label: 'Active Member', minXP: 100 },
  { emoji: '⭐', label: 'Contributor',   minXP: 300 },
  { emoji: '💎', label: 'Elite',         minXP: 700 },
];

export default function StudentProfileScreen() {
  const { user, logout }   = useContext(AuthContext);
  const { certificates }   = useContext(DataContext);
  const xp = user?.xp || 0;
  const earned = ACHIEVEMENTS.filter(a => xp >= a.minXP);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero */}
        <LinearGradient colors={['#1A1A26', '#0A0A0F']} style={styles.hero}>
          <View style={styles.heroOrb} />
          <LinearGradient colors={GRADIENTS.gold} style={styles.avatarRing}>
            <View style={styles.avatarInner}>
              <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'S'}</Text>
            </View>
          </LinearGradient>
          <Text style={styles.heroName}>{user?.name || 'Student'}</Text>
          <View style={styles.levelBadge}>
            <MaterialCommunityIcons name="star-circle" size={13} color={COLORS.gold} />
            <Text style={styles.levelText}>Level {user?.level || 1} · {user?.xp || 0} XP</Text>
          </View>
          <View style={styles.xpSection}>
            <XPBar current={xp} max={1000} />
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Account info */}
          <PremiumCard style={{ marginBottom: SPACING.l }}>
            <Text style={styles.sectionLabel}>ACCOUNT INFO</Text>
            {[
              { icon: 'email-outline',    label: 'Email',  value: user?.email || '—' },
              { icon: 'account-outline',  label: 'Role',   value: user?.backendRole || 'Member' },
              { icon: 'identifier',       label: 'User ID',value: String(user?.id || '—') },
            ].map((row, i, arr) => (
              <View key={row.label}>
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <MaterialCommunityIcons name={row.icon} size={16} color={COLORS.gold} />
                  </View>
                  <View>
                    <Text style={styles.infoLabel}>{row.label}</Text>
                    <Text style={styles.infoValue}>{row.value}</Text>
                  </View>
                </View>
                {i < arr.length - 1 && <View style={styles.rowDivider} />}
              </View>
            ))}
          </PremiumCard>

          {/* Achievements */}
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achieveGrid}>
            {ACHIEVEMENTS.map(a => {
              const unlocked = xp >= a.minXP;
              return (
                <View key={a.label} style={[styles.achieveCard, unlocked && styles.achieveCardUnlocked]}>
                  {unlocked && <LinearGradient colors={GRADIENTS.goldSheen} style={StyleSheet.absoluteFill} borderRadius={RADIUS.l} />}
                  <Text style={[styles.achieveEmoji, !unlocked && { opacity: 0.3 }]}>{a.emoji}</Text>
                  <Text style={[styles.achieveLabel, !unlocked && { color: COLORS.textMuted }]}>{a.label}</Text>
                  {!unlocked && (
                    <Text style={styles.achieveLock}>{a.minXP} XP</Text>
                  )}
                </View>
              );
            })}
          </View>

          {/* Certificates */}
          {certificates.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>Certificates</Text>
              {certificates.map(cert => (
                <PremiumCard key={cert.id} style={{ marginBottom: SPACING.s }}>
                  <View style={styles.certRow}>
                    <View style={styles.certIcon}>
                      <MaterialCommunityIcons name="certificate-outline" size={22} color={COLORS.gold} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.certTitle} numberOfLines={1}>{cert.eventTitle}</Text>
                      <Text style={styles.certDate}>Issued: {cert.date}</Text>
                    </View>
                  </View>
                </PremiumCard>
              ))}
            </>
          )}

          {/* Logout */}
          <View style={{ marginTop: SPACING.xl }}>
            <GradientButton title="Sign Out" variant="danger" icon="logout" onPress={logout} />
          </View>
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
    paddingBottom: SPACING.xl, paddingHorizontal: SPACING.xl, overflow: 'hidden',
  },
  heroOrb: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(201,168,76,0.06)', right: -60, top: -60,
  },
  avatarRing: {
    width: 88, height: 88, borderRadius: 44, padding: 2.5,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.l, ...SHADOWS.gold,
  },
  avatarInner: {
    flex: 1, borderRadius: 42, width: '100%',
    backgroundColor: COLORS.bgCard, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 36, fontWeight: '800', color: COLORS.gold },
  heroName: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.8, marginBottom: SPACING.s },
  levelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.goldGlow, borderWidth: 1, borderColor: COLORS.goldDim,
    borderRadius: RADIUS.pill, paddingVertical: 5, paddingHorizontal: 12,
    marginBottom: SPACING.l,
  },
  levelText: { fontSize: 12, color: COLORS.gold, fontWeight: '700' },
  xpSection: { width: '100%' },
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
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.m, letterSpacing: -0.3 },
  achieveGrid: { flexDirection: 'row', gap: SPACING.s, flexWrap: 'wrap' },
  achieveCard: {
    width: '47%', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.l,
    padding: SPACING.m, alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.card, overflow: 'hidden',
  },
  achieveCardUnlocked: { borderColor: COLORS.goldDim },
  achieveEmoji: { fontSize: 32 },
  achieveLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  achieveLock: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  certRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.m },
  certIcon: {
    width: 44, height: 44, borderRadius: RADIUS.m,
    backgroundColor: COLORS.goldGlow, borderWidth: 1, borderColor: COLORS.goldDim,
    justifyContent: 'center', alignItems: 'center',
  },
  certTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  certDate:  { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
});
