/**
 * QRCodeModal.js
 *
 * Displays a scannable QR code for an event.
 * Uses the `qrcode` npm package to generate a base64 PNG that works
 * on both Web and React Native (no native module required).
 */
import React, { useEffect, useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, ScrollView,
} from 'react-native';
import QRCode from 'qrcode';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../utils/theme';

export default function QRCodeModal({ visible, event, onClose }) {
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  useEffect(() => {
    if (!visible || !event?.qr_token) {
      setQrDataUrl(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    // Generate QR as base64 PNG data URL
    QRCode.toDataURL(event.qr_token, {
      width: 320,
      margin: 2,
      color: { dark: '#0D1526', light: '#E2E8F0' },
      errorCorrectionLevel: 'H',
    })
      .then(url => { setQrDataUrl(url); setLoading(false); })
      .catch(err => { setError('Failed to generate QR code'); setLoading(false); });
  }, [visible, event?.qr_token]);

  if (!event) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <LinearGradient colors={['#4F6EF7', '#7C3AED']} style={styles.headerGrad}>
            <MaterialCommunityIcons name="qrcode-scan" size={24} color="#fff" />
            <Text style={styles.headerTitle}>Attendance QR Code</Text>
          </LinearGradient>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {/* Event info */}
            <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>

            <View style={styles.metaRow}>
              {event.date && (
                <View style={styles.metaChip}>
                  <MaterialCommunityIcons name="calendar" size={13} color={COLORS.indigo} />
                  <Text style={styles.metaText}>{event.date}</Text>
                </View>
              )}
              {event.venue && event.venue !== 'TBA' && (
                <View style={styles.metaChip}>
                  <MaterialCommunityIcons name="map-marker-outline" size={13} color={COLORS.indigo} />
                  <Text style={styles.metaText}>{event.venue}</Text>
                </View>
              )}
            </View>

            {/* QR Code */}
            <View style={styles.qrWrapper}>
              {loading && (
                <View style={styles.qrPlaceholder}>
                  <ActivityIndicator size="large" color={COLORS.indigo} />
                  <Text style={styles.qrHint}>Generating QR code…</Text>
                </View>
              )}
              {error && (
                <View style={styles.qrPlaceholder}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={36} color={COLORS.error} />
                  <Text style={[styles.qrHint, { color: COLORS.error }]}>{error}</Text>
                </View>
              )}
              {!loading && !error && qrDataUrl && (
                <Image
                  source={{ uri: qrDataUrl }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              )}
              {!event.qr_token && (
                <View style={styles.qrPlaceholder}>
                  <MaterialCommunityIcons name="qrcode-remove" size={36} color={COLORS.textMuted} />
                  <Text style={styles.qrHint}>No QR token for this event.</Text>
                  <Text style={[styles.qrHint, { fontSize: 12, marginTop: 4 }]}>
                    Re-create the event to auto-generate one.
                  </Text>
                </View>
              )}
            </View>

            {/* Instructions */}
            <View style={styles.instructionBox}>
              <MaterialCommunityIcons name="information-outline" size={16} color={COLORS.indigoLight} />
              <Text style={styles.instructionText}>
                Show this QR code on your screen or projector. Students tap{' '}
                <Text style={{ fontWeight: '800', color: COLORS.indigoLight }}>Scan</Text>
                {' '}in the app to mark their attendance instantly.
              </Text>
            </View>
          </ScrollView>

          {/* Close */}
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
    flex: 1, backgroundColor: 'rgba(0,0,0,0.78)',
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
    padding: SPACING.l, paddingVertical: SPACING.m,
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
  body: { padding: SPACING.l, alignItems: 'center', gap: SPACING.m },
  eventTitle: {
    fontSize: 20, fontWeight: '900', color: COLORS.textPrimary,
    textAlign: 'center', letterSpacing: -0.5,
  },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.indigoGlow, borderRadius: RADIUS.pill,
    paddingVertical: 5, paddingHorizontal: 12,
    borderWidth: 1, borderColor: COLORS.indigo + '33',
  },
  metaText: { fontSize: 12, color: COLORS.indigoLight, fontWeight: '600' },
  qrWrapper: {
    backgroundColor: '#E2E8F0', borderRadius: RADIUS.l,
    padding: SPACING.s, alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.card, minHeight: 200,
  },
  qrImage: { width: 240, height: 240 },
  qrPlaceholder: {
    width: 240, height: 200, alignItems: 'center',
    justifyContent: 'center', gap: SPACING.s,
  },
  qrHint: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center' },
  instructionBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.s,
    backgroundColor: COLORS.indigoGlow, borderRadius: RADIUS.m,
    padding: SPACING.m, borderWidth: 1, borderColor: COLORS.indigo + '33',
    alignSelf: 'stretch',
  },
  instructionText: {
    color: COLORS.textSecond, fontSize: 13, lineHeight: 19, flex: 1,
  },
  closeBtn: { margin: SPACING.l, marginTop: 0, borderRadius: RADIUS.m, overflow: 'hidden' },
  closeBtnGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14,
  },
  closeBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
