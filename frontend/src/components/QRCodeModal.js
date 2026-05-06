/**
 * QRCodeModal.js — v5 (react-native-qrcode-svg)
 *
 * ✅ Uses react-native-qrcode-svg (SVG-based, works in Expo Go Android/iOS)
 * ✅ Removed canvas-based `qrcode` npm package (was crashing with
 *    "You need to specify a canvas element" on React Native)
 *
 * QR value is a JSON string:
 *   { "eventId": "<id>", "qrToken": "<token>" }
 * Student scanner parses this to mark attendance.
 */
import React, { useEffect, useRef } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, Animated,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../utils/theme';

export default function QRCodeModal({ visible, event, onClose }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible || !event) return;

    // Pulse animation for QR code
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [visible, event?.id]);

  if (!event) return null;

  // ── Resolve QR token ──────────────────────────────────────────────────────
  // Priority: event.qr_token → event.qrToken → stable demo fallback
  const resolvedToken =
    event.qr_token ||
    event.qrToken  ||
    `demo-token-${event.id}`;

  // QR value: JSON that student scanner will parse
  const qrValue = JSON.stringify({
    eventId:  event.id,
    qrToken:  resolvedToken,
  });

  // Meta display
  const displayDate = event.date || event.event_date || '';
  const displayTime = event.start_time
    ? `${event.start_time}${event.end_time ? ' – ' + event.end_time : ''}`
    : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>

          {/* Header */}
          <LinearGradient colors={['#4F6EF7', '#7C3AED']} style={styles.headerGrad}>
            <MaterialCommunityIcons name="qrcode-scan" size={22} color="#fff" />
            <Text style={styles.headerTitle}>Attendance QR Code</Text>
          </LinearGradient>

          <ScrollView
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
          >
            {/* Event title */}
            <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>

            {/* Meta chips */}
            <View style={styles.metaRow}>
              {!!displayDate && (
                <View style={styles.metaChip}>
                  <MaterialCommunityIcons name="calendar" size={12} color={COLORS.indigo} />
                  <Text style={styles.metaText}>{displayDate}</Text>
                </View>
              )}
              {!!displayTime && (
                <View style={styles.metaChip}>
                  <MaterialCommunityIcons name="clock-outline" size={12} color={COLORS.indigo} />
                  <Text style={styles.metaText}>{displayTime}</Text>
                </View>
              )}
              {!!event.venue && event.venue !== 'TBA' && (
                <View style={styles.metaChip}>
                  <MaterialCommunityIcons name="map-marker-outline" size={12} color={COLORS.indigo} />
                  <Text style={styles.metaText}>{event.venue}</Text>
                </View>
              )}
            </View>

            {/* ── QR Code (react-native-qrcode-svg) ──────────────────────── */}
            <Animated.View
              style={[styles.qrWrapper, { transform: [{ scale: pulseAnim }] }]}
            >
              <QRCode
                value={qrValue}
                size={220}
                color="#0D1526"
                backgroundColor="#E8EEF8"
                quietZone={12}
                ecl="H"
              />
            </Animated.View>

            {/* Token hint */}
            <Text style={styles.tokenHint} numberOfLines={2} ellipsizeMode="middle">
              {resolvedToken}
            </Text>

            {/* Instructions */}
            <View style={styles.instructionBox}>
              <MaterialCommunityIcons name="projector-screen-outline" size={16} color={COLORS.indigoLight} />
              <Text style={styles.instructionText}>
                Show this on the projector or your screen. Students tap{' '}
                <Text style={{ fontWeight: '800', color: COLORS.indigoLight }}>Scan</Text>
                {' '}in their app to mark attendance instantly.
              </Text>
            </View>
          </ScrollView>

          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.85}>
            <LinearGradient colors={['#4F6EF7', '#7C3AED']} style={styles.closeBtnGrad}>
              <MaterialCommunityIcons name="close" size={18} color="#fff" />
              <Text style={styles.closeBtnText}>Close</Text>
            </LinearGradient>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.l,
  },
  sheet: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    width: '100%',
    maxWidth: 420,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.indigo + '44',
    ...SHADOWS.modal,
  },
  headerGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s,
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
  body: {
    padding: SPACING.l,
    alignItems: 'center',
    gap: SPACING.m,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  metaRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.indigoGlow,
    borderRadius: RADIUS.pill,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.indigo + '33',
  },
  metaText: { fontSize: 12, color: COLORS.indigoLight, fontWeight: '600' },
  qrWrapper: {
    backgroundColor: '#E8EEF8',
    borderRadius: RADIUS.l,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  tokenHint: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontFamily: 'monospace',
    paddingHorizontal: SPACING.m,
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.s,
    backgroundColor: COLORS.indigoGlow,
    borderRadius: RADIUS.m,
    padding: SPACING.m,
    borderWidth: 1,
    borderColor: COLORS.indigo + '33',
    alignSelf: 'stretch',
  },
  instructionText: { color: COLORS.textSecond, fontSize: 13, lineHeight: 19, flex: 1 },
  closeBtn:     { margin: SPACING.l, marginTop: 0, borderRadius: RADIUS.m, overflow: 'hidden' },
  closeBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  closeBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
