/**
 * QRScannerScreen.js  — STUDENT ONLY
 *
 * - Web: shows a clean "Use Mobile App to Scan" message (CameraView not available on web)
 * - Native: full QR scanner with camera permission, scan → attendance marking → confetti
 *
 * This screen is ONLY in StudentTabs — admins never reach this screen.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Dimensions, StatusBar, Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { apiPost } from '../../services/api';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../../utils/theme';

const { width } = Dimensions.get('window');
const SCAN_BOX  = width * 0.68;

// ─── Confetti Particle ────────────────────────────────────────────────────────
function Particle({ delay }) {
  const tx  = useRef(new Animated.Value(0)).current;
  const ty  = useRef(new Animated.Value(0)).current;
  const op  = useRef(new Animated.Value(1)).current;
  const sc  = useRef(new Animated.Value(0)).current;

  const PALETTE = ['#4F6EF7','#7C3AED','#10B981','#F59E0B','#EF4444','#06B6D4'];
  const color   = PALETTE[Math.floor(Math.random() * PALETTE.length)];
  const destX   = (Math.random() - 0.5) * width;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(sc, { toValue: 1,    duration: 180, useNativeDriver: true }),
        Animated.timing(tx, { toValue: destX, duration: 850, useNativeDriver: true }),
        Animated.timing(ty, { toValue: -(Math.random() * 260 + 80), duration: 850, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(380),
          Animated.timing(op, { toValue: 0, duration: 470, useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute', bottom: '45%', left: '50%',
        width: 10, height: 10, borderRadius: 5, backgroundColor: color,
        transform: [{ translateX: tx }, { translateY: ty }, { scale: sc }],
        opacity: op,
      }}
    />
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────
function SuccessView({ data, onReset }) {
  const scale = useRef(new Animated.Value(0)).current;
  const fade  = useRef(new Animated.Value(0)).current;
  const tick  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1, tension: 55, friction: 8, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.spring(tick, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const TAGS = ['Java', 'Python', 'C++', 'DSA', 'Web Dev', 'AI/ML'];

  return (
    <View style={ss.overlay}>
      {Array.from({ length: 20 }).map((_, i) => <Particle key={i} delay={i * 45} />)}

      <Animated.View style={[ss.card, { transform: [{ scale }] }]}>
        <LinearGradient colors={['#059669','#10B981']} style={ss.tickCircle}>
          <Animated.View style={{ transform: [{ scale: tick }] }}>
            <MaterialCommunityIcons name="check-bold" size={52} color="#fff" />
          </Animated.View>
        </LinearGradient>

        <Animated.View style={{ opacity: fade, alignItems: 'center', gap: SPACING.m }}>
          <Text style={ss.headline}>Attendance Marked!</Text>
          <Text style={ss.subhead}>✅ Successfully Checked In</Text>

          <View style={ss.infoRow}>
            <MaterialCommunityIcons name="calendar-star" size={15} color={COLORS.indigo} />
            <Text style={ss.infoText} numberOfLines={2}>{data?.event_title || 'Event'}</Text>
          </View>

          {!!data?.event_venue && (
            <View style={ss.infoRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={15} color={COLORS.indigo} />
              <Text style={ss.infoText}>{data.event_venue}</Text>
            </View>
          )}

          <LinearGradient colors={['#4F6EF7','#7C3AED']} style={ss.xpPill}>
            <MaterialCommunityIcons name="star-four-points" size={14} color="#fff" />
            <Text style={ss.xpText}>+{data?.xp_earned || 50} XP Earned 🚀</Text>
          </LinearGradient>

          <Text style={ss.welcome}>Welcome to Coding Club 🚀</Text>

          <View style={ss.tagsRow}>
            {TAGS.map(t => (
              <View key={t} style={ss.tag}>
                <Text style={ss.tagText}>{t}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={ss.btn} onPress={onReset}>
            <Text style={ss.btnText}>Scan Another QR</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

// ─── Duplicate scan screen ────────────────────────────────────────────────────
function DuplicateView({ eventTitle, onReset }) {
  return (
    <View style={ss.overlay}>
      <View style={[ss.card, { borderColor: COLORS.gold + '66' }]}>
        <View style={[ss.tickCircle, { backgroundColor: '#D97706' }]}>
          <MaterialCommunityIcons name="check-circle" size={52} color="#fff" />
        </View>
        <Text style={ss.headline}>Already Marked!</Text>
        <Text style={ss.subhead}>Attendance already recorded for:</Text>
        <Text style={[ss.infoText, { fontWeight: '700', textAlign: 'center', marginTop: 4 }]}>{eventTitle}</Text>
        <TouchableOpacity style={[ss.btn, { marginTop: SPACING.l }]} onPress={onReset}>
          <Text style={ss.btnText}>OK, Got It</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Web fallback (camera not available in browser) ───────────────────────────
function WebScannerFallback() {
  return (
    <View style={styles.center}>
      <LinearGradient colors={['#0D1526','#111827']} style={StyleSheet.absoluteFill} />
      <View style={styles.webCard}>
        <LinearGradient
          colors={['rgba(79,110,247,0.15)','rgba(124,58,237,0.08)']}
          style={StyleSheet.absoluteFill}
          borderRadius={RADIUS.xl}
        />
        <MaterialCommunityIcons name="cellphone-check" size={64} color={COLORS.indigo} />
        <Text style={styles.webTitle}>Use ClubSphere Mobile App</Text>
        <Text style={styles.webSub}>
          QR scanning requires your phone camera.{'\n'}
          Open this app on your mobile device to mark attendance.
        </Text>
        <View style={styles.stepsWrap}>
          {[
            { icon: 'cellphone', text: 'Open ClubSphere on your phone' },
            { icon: 'account-circle', text: 'Login as Student' },
            { icon: 'qrcode-scan', text: 'Tap "Scan" in the bottom nav' },
            { icon: 'camera', text: 'Point at the QR shown by Admin' },
          ].map((s, i) => (
            <View key={i} style={styles.stepRow}>
              <LinearGradient colors={['#4F6EF7','#7C3AED']} style={styles.stepBadge}>
                <Text style={styles.stepNum}>{i + 1}</Text>
              </LinearGradient>
              <MaterialCommunityIcons name={s.icon} size={18} color={COLORS.indigoLight} />
              <Text style={styles.stepText}>{s.text}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Native Camera Scanner ────────────────────────────────────────────────────
function NativeScanner() {
  // Lazy import so Metro web bundler never processes expo-camera
  const { CameraView, useCameraPermissions } = require('expo-camera');

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned,   setScanned]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState(null);
  const [duplicate, setDuplicate] = useState(null);
  const [error,     setError]     = useState(null);

  const cornerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(cornerAnim, { toValue: 1, duration: 850, useNativeDriver: true }),
        Animated.timing(cornerAnim, { toValue: 0, duration: 850, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleScan = async ({ data: rawData }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);
    setError(null);
    try {
      const res = await apiPost('/api/attendance/scan', { qr_token: rawData });
      setResult(res?.data?.data);
    } catch (e) {
      const status = e?.response?.status;
      const msg    = e?.response?.data?.message || 'Scan failed. Try again.';
      if (status === 409) {
        setDuplicate(e?.response?.data?.data?.event_title || 'this event');
      } else {
        setError(msg);
        setTimeout(() => { setScanned(false); setError(null); }, 2800);
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setScanned(false); setResult(null); setDuplicate(null); setError(null);
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons name="camera-outline" size={48} color={COLORS.textMuted} />
        <Text style={styles.permText}>Requesting camera access…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons name="camera-off" size={52} color={COLORS.error} />
        <Text style={styles.permText}>Camera permission denied.</Text>
        <Text style={[styles.permText, { fontSize: 13, marginTop: 4, textAlign: 'center' }]}>
          Enable it in Settings to scan QR codes.
        </Text>
        <TouchableOpacity style={styles.grantBtn} onPress={requestPermission}>
          <Text style={styles.grantBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (result)    return <SuccessView   data={result}   onReset={reset} />;
  if (duplicate) return <DuplicateView eventTitle={duplicate} onReset={reset} />;

  const cornerOpacity = cornerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] });
  const scanLineY     = cornerAnim.interpolate({ inputRange: [0, 1], outputRange: [0, SCAN_BOX - 3] });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <LinearGradient colors={['#0D1526','#070C18']} style={styles.header}>
        <MaterialCommunityIcons name="qrcode-scan" size={22} color={COLORS.indigo} />
        <View>
          <Text style={styles.headerTitle}>Scan Attendance QR</Text>
          <Text style={styles.headerSub}>Point at the QR on the projector / teacher's screen</Text>
        </View>
      </LinearGradient>

      {/* Camera */}
      <View style={styles.cameraWrap}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={scanned ? undefined : handleScan}
        />

        {/* Overlay with cut-out */}
        <View style={styles.overlayTop}    pointerEvents="none" />
        <View style={styles.overlayMidRow} pointerEvents="none">
          <View style={styles.overlaySide} />
          <View style={styles.scanBox}>
            {[
              { top: 0, left: 0,     borderTopWidth: 3,    borderLeftWidth: 3   },
              { top: 0, right: 0,    borderTopWidth: 3,    borderRightWidth: 3  },
              { bottom: 0, left: 0,  borderBottomWidth: 3, borderLeftWidth: 3   },
              { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3  },
            ].map((s, i) => (
              <Animated.View
                key={i}
                pointerEvents="none"
                style={[styles.corner, s, { borderColor: COLORS.indigo, opacity: cornerOpacity }]}
              />
            ))}
            <Animated.View
              pointerEvents="none"
              style={[styles.scanLine, { transform: [{ translateY: scanLineY }] }]}
            />
          </View>
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBot} pointerEvents="none" />

        {error && (
          <View style={styles.errToast}>
            <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#fff" />
            <Text style={styles.errText}>{error}</Text>
          </View>
        )}

        {loading && (
          <View style={styles.loadingBadge}>
            <MaterialCommunityIcons name="loading" size={18} color={COLORS.indigo} />
            <Text style={styles.loadingText}>Marking attendance…</Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <LinearGradient colors={['#070C18','#0D1526']} style={styles.footer}>
        <MaterialCommunityIcons name="information-outline" size={15} color={COLORS.textMuted} />
        <Text style={styles.footerText}>
          Ask your teacher/admin to generate a QR code from the Events screen
        </Text>
      </LinearGradient>
    </View>
  );
}

// ─── Main Export — routes to web fallback or native scanner ──────────────────
export default function QRScannerScreen() {
  if (Platform.OS === 'web') {
    return <WebScannerFallback />;
  }
  return <NativeScanner />;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const DARK = 'rgba(5,8,20,0.72)';

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.bg, gap: SPACING.m, paddingHorizontal: SPACING.xl,
    position: 'relative',
  },
  permText:  { color: COLORS.textSecond, fontSize: 15, textAlign: 'center' },
  grantBtn:  {
    marginTop: SPACING.m, backgroundColor: COLORS.indigo,
    borderRadius: RADIUS.m, paddingVertical: 12, paddingHorizontal: 28,
  },
  grantBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Web fallback
  webCard: {
    borderRadius: RADIUS.xl, padding: SPACING.xl, alignItems: 'center',
    gap: SPACING.m, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.indigo + '33',
    width: '100%', maxWidth: 400, ...SHADOWS.card,
  },
  webTitle: {
    fontSize: 22, fontWeight: '900', color: COLORS.textPrimary,
    textAlign: 'center', letterSpacing: -0.5,
  },
  webSub: {
    fontSize: 14, color: COLORS.textSecond, textAlign: 'center', lineHeight: 21,
  },
  stepsWrap: { alignSelf: 'stretch', gap: SPACING.s },
  stepRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.m,
    backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.m,
    padding: SPACING.m, borderWidth: 1, borderColor: COLORS.border,
  },
  stepBadge: {
    width: 24, height: 24, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  stepNum:  { color: '#fff', fontSize: 12, fontWeight: '800' },
  stepText: { flex: 1, fontSize: 13, color: COLORS.textSecond, fontWeight: '500' },

  // Camera
  header: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.m,
    paddingTop: 52, paddingBottom: SPACING.m, paddingHorizontal: SPACING.l,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary },
  headerSub:   { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  cameraWrap:  { flex: 1, position: 'relative' },

  overlayTop:    { height: '18%', backgroundColor: DARK },
  overlayMidRow: { flexDirection: 'row', height: SCAN_BOX },
  overlaySide:   { flex: 1, backgroundColor: DARK },
  overlayBot:    { flex: 1, backgroundColor: DARK },

  scanBox: { width: SCAN_BOX, height: SCAN_BOX, borderRadius: 14, overflow: 'hidden' },
  corner:  { position: 'absolute', width: 28, height: 28, borderRadius: 4 },
  scanLine: {
    position: 'absolute', left: 8, right: 8, height: 2,
    backgroundColor: COLORS.indigo,
    shadowColor: COLORS.indigo, shadowOpacity: 0.9, shadowRadius: 6, elevation: 5,
  },

  errToast: {
    position: 'absolute', bottom: 16, left: 16, right: 16,
    backgroundColor: 'rgba(239,68,68,0.9)', borderRadius: RADIUS.m,
    flexDirection: 'row', alignItems: 'center', gap: 8, padding: SPACING.m,
  },
  errText: { color: '#fff', fontSize: 13, flex: 1 },

  loadingBadge: {
    position: 'absolute', bottom: 16, left: 16, right: 16,
    backgroundColor: 'rgba(13,21,38,0.95)', borderRadius: RADIUS.m,
    flexDirection: 'row', alignItems: 'center', gap: 8, padding: SPACING.m,
    borderWidth: 1, borderColor: COLORS.indigo + '55',
  },
  loadingText: { color: COLORS.textPrimary, fontSize: 14 },

  footer: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.s,
    padding: SPACING.l, paddingBottom: 36,
  },
  footerText: { color: COLORS.textMuted, fontSize: 13, flex: 1, lineHeight: 18 },
});

// ─── Result card styles ───────────────────────────────────────────────────────
const ss = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: COLORS.bg,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: SPACING.l, paddingTop: 52,
  },
  card: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.success + '55',
    padding: SPACING.xl, alignItems: 'center', width: '100%',
    gap: SPACING.s, ...SHADOWS.card,
  },
  tickCircle: {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.s,
    shadowColor: '#10B981', shadowOpacity: 0.5, shadowRadius: 20, elevation: 10,
  },
  headline: {
    fontSize: 28, fontWeight: '900', color: COLORS.textPrimary,
    letterSpacing: -1, textAlign: 'center',
  },
  subhead:  { fontSize: 15, color: COLORS.success, fontWeight: '600', textAlign: 'center' },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.indigoGlow, borderRadius: RADIUS.m,
    paddingVertical: 8, paddingHorizontal: 14, alignSelf: 'stretch',
    borderWidth: 1, borderColor: COLORS.indigo + '33',
  },
  infoText: { color: COLORS.textPrimary, fontSize: 14, flex: 1 },
  xpPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: RADIUS.pill, paddingVertical: 8, paddingHorizontal: 20,
  },
  xpText:   { color: '#fff', fontSize: 15, fontWeight: '800' },
  welcome: {
    fontSize: 16, fontWeight: '700', color: COLORS.indigoLight, textAlign: 'center',
  },
  tagsRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  tag: {
    backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.pill,
    paddingVertical: 4, paddingHorizontal: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  tagText: { color: COLORS.textSecond, fontSize: 12, fontWeight: '600' },
  btn: {
    backgroundColor: COLORS.indigo, borderRadius: RADIUS.m,
    paddingVertical: 14, alignSelf: 'stretch', alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
