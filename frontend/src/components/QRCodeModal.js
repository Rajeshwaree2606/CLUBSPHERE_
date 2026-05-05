/**
 * QRCodeModal.js
 *
 * Displays a scannable QR code for an event.
 * - If event has qr_token: renders it immediately
 * - If event has no qr_token: calls GET /api/events/:id/qr to auto-generate one
 * Uses `qrcode` npm package → base64 PNG → Image (works on web + native, no native modules)
 */
import React, { useEffect, useState, useRef } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, ScrollView, Animated,
} from 'react-native';
import QRCode from 'qrcode';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../utils/theme';
import { apiGet } from '../services/api';

export default function QRCodeModal({ visible, event, onClose }) {
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [token,     setToken]     = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible || !event) {
      setQrDataUrl(null);
      setToken(null);
      setError(null);
      return;
    }

    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 800, useNativeDriver: true }),
      ])
    ).start();

    loadQR();
  }, [visible, event?.id]);

  const loadQR = async () => {
    setLoading(true);
    setError(null);
    setQrDataUrl(null);

    try {
      let qrToken = event?.qr_token;

      // If no token in state, call backend to get/generate one
      if (!qrToken) {
        const res = await apiGet(`/api/events/${event.id}/qr`);
        qrToken = res?.data?.data?.qr_token;
      }

      if (!qrToken) throw new Error('No QR token available');

      setToken(qrToken);

      // Render QR as base64 PNG
      const dataUrl = await QRCode.toDataURL(qrToken, {
        width: 300,
        margin: 2,
        color: { dark: '#0D1526', light: '#E8EEF8' },
        errorCorrectionLevel: 'H',
      });
      setQrDataUrl(dataUrl);
    } catch (e) {
      console.error('QR load error:', e.message);
      setError(e?.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  if (!event) return null;

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

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {/* Event info */}
            <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>

            <View style={styles.metaRow}>
              {event.date && (
                <View style={styles.metaChip}>
                  <MaterialCommunityIcons name="calendar" size={12} color={COLORS.indigo} />
                  <Text style={styles.metaText}>{event.date}</Text>
                </View>
              )}
              {event.start_time && (
                <View style={styles.metaChip}>
                  <MaterialCommunityIcons name="clock-outline" size={12} color={COLORS.indigo} />
                  <Text style={styles.metaText}>
                    {event.start_time}{event.end_time ? ' – ' + event.end_time : ''}
                  </Text>
                </View>
              )}
              {event.venue && event.venue !== 'TBA' && (
                <View style={styles.metaChip}>
                  <MaterialCommunityIcons name="map-marker-outline" size={12} color={COLORS.indigo} />
                  <Text style={styles.metaText}>{event.venue}</Text>
                </View>
              )}
            </View>

            {/* QR Code */}
            <Animated.View
              style={[styles.qrWrapper, { transform: [{ scale: pulseAnim }] }]}
            >
              {loading && (
                <View style={styles.qrPlaceholder}>
                  <ActivityIndicator size="large" color={COLORS.indigo} />
                  <Text style={styles.qrHint}>Generating QR code…</Text>
                </View>
              )}
              {!loading && error && (
                <View style={styles.qrPlaceholder}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={36} color={COLORS.error} />
                  <Text style={[styles.qrHint, { color: COLORS.error }]}>{error}</Text>
                  <TouchableOpacity style={styles.retryBtn} onPress={loadQR}>
                    <Text style={styles.retryText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}
              {!loading && !error && qrDataUrl && (
                <Image source={{ uri: qrDataUrl }} style={styles.qrImage} resizeMode="contain" />
              )}
            </Animated.View>

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
    flex: 1, backgroundColor: 'rgba(0,0,0,0.82)',
    justifyContent: 'center', alignItems: 'center',
    padding: SPACING.l,
  },
  sheet: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl,
    width: '100%', maxWidth: 420, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.indigo + '44', ...SHADOWS.modal,
  },
  headerGrad: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.s,
    paddingHorizontal: SPACING.l, paddingVertical: SPACING.m,
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
  body: { padding: SPACING.l, alignItems: 'center', gap: SPACING.m },
  eventTitle: {
    fontSize: 20, fontWeight: '900', color: COLORS.textPrimary,
    textAlign: 'center', letterSpacing: -0.5,
  },
  metaRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.indigoGlow, borderRadius: RADIUS.pill,
    paddingVertical: 5, paddingHorizontal: 12,
    borderWidth: 1, borderColor: COLORS.indigo + '33',
  },
  metaText: { fontSize: 12, color: COLORS.indigoLight, fontWeight: '600' },
  qrWrapper: {
    backgroundColor: '#E8EEF8', borderRadius: RADIUS.l,
    padding: 8, alignItems: 'center', justifyContent: 'center',
    minHeight: 220, ...SHADOWS.card,
  },
  qrImage:       { width: 240, height: 240 },
  qrPlaceholder: { width: 240, minHeight: 200, alignItems: 'center', justifyContent: 'center', gap: SPACING.m },
  qrHint:        { color: COLORS.textMuted, fontSize: 14, textAlign: 'center' },
  retryBtn: {
    backgroundColor: COLORS.indigo, borderRadius: RADIUS.m,
    paddingVertical: 8, paddingHorizontal: 20,
  },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  instructionBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.s,
    backgroundColor: COLORS.indigoGlow, borderRadius: RADIUS.m,
    padding: SPACING.m, borderWidth: 1, borderColor: COLORS.indigo + '33',
    alignSelf: 'stretch',
  },
  instructionText: { color: COLORS.textSecond, fontSize: 13, lineHeight: 19, flex: 1 },
  closeBtn:     { margin: SPACING.l, marginTop: 0, borderRadius: RADIUS.m, overflow: 'hidden' },
  closeBtnGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14,
  },
  closeBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
