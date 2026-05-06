import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../../utils/theme';
import { apiPost } from '../../services/api';
import Toast from 'react-native-toast-message';

// Web fallback — camera not available
function WebFallback({ navigation }) {
  return (
    <View style={styles.center}>
      <MaterialCommunityIcons name="camera-off" size={56} color={COLORS.textMuted} />
      <Text style={styles.errorText}>Camera Not Available</Text>
      <Text style={[styles.text, { marginBottom: SPACING.l, textAlign: 'center', paddingHorizontal: SPACING.xl }]}>
        QR scanning requires a mobile device with a camera. Please use the Expo Go app on your phone to scan attendance QR codes.
      </Text>
      <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
        <Text style={styles.btnText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

// Native camera scanner
function NativeScanner({ navigation }) {
  const { CameraView, useCameraPermissions } = require('expo-camera');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);

    try {
      const response = await apiPost('/api/attendance/scan', { token: data });
      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response.data.message || 'Attendance marked!',
        });
        setTimeout(() => navigation.goBack(), 1500);
      }
    } catch (error) {
      console.error('Scan Error:', error.response?.data || error.message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to mark attendance',
      });
      setTimeout(() => setScanned(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No access to camera</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { marginTop: 10, backgroundColor: COLORS.textMuted }]} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Scan Attendance QR</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.overlay}>
          <View style={styles.scanBox} />
          {scanned && !loading && (
             <TouchableOpacity style={styles.rescanBtn} onPress={() => setScanned(false)}>
               <Text style={styles.rescanText}>Tap to Scan Again</Text>
             </TouchableOpacity>
          )}
          {loading && (
             <Text style={styles.loadingText}>Processing...</Text>
          )}
        </View>
      </View>
    </View>
  );
}

export default function ScanQRScreen({ navigation }) {
  if (Platform.OS === 'web') {
    return <WebFallback navigation={navigation} />;
  }
  return <NativeScanner navigation={navigation} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  text: { color: COLORS.textSecond, fontSize: 14 },
  errorText: { color: COLORS.crimson, fontWeight: '700', fontSize: 18, marginBottom: SPACING.m, marginTop: SPACING.l },
  btn: { backgroundColor: COLORS.indigo, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.m, borderRadius: RADIUS.m },
  btnText: { color: COLORS.white, fontWeight: '700' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.l, paddingTop: SPACING.xl, paddingBottom: SPACING.m,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 18 },
  cameraContainer: { flex: 1, position: 'relative' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scanBox: {
    width: 250, height: 250,
    borderWidth: 2, borderColor: COLORS.indigo,
    backgroundColor: 'transparent',
    borderRadius: RADIUS.m
  },
  rescanBtn: {
    position: 'absolute', bottom: 50,
    backgroundColor: COLORS.indigo, padding: SPACING.m, borderRadius: RADIUS.m
  },
  rescanText: { color: COLORS.white, fontWeight: '700' },
  loadingText: { position: 'absolute', bottom: 50, color: COLORS.gold, fontWeight: '700', fontSize: 16 }
});
