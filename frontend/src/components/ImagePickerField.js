/**
 * ImagePickerField.js — v3
 *
 * Cross-platform image picker:
 * - Web:    hidden <input type="file"> → FileReader → base64
 * - Native: ActionSheet (Camera / Gallery) via expo-image-picker (lazy require)
 *
 * Image is OPTIONAL — parent can submit without it.
 */
import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Platform, ActivityIndicator, Alert, ActionSheetIOS,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../utils/theme';

// ── Lazy helpers for native only ──────────────────────────────────────────────
const pickFromGallery = async () => {
  try {
    const IP = require('expo-image-picker');
    const { status } = await IP.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library in Settings to upload an event image.',
        [{ text: 'OK' }]
      );
      return null;
    }
    const result = await IP.launchImageLibraryAsync({
      mediaTypes: IP.MediaTypeOptions
        ? IP.MediaTypeOptions.Images
        : ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.65,
      base64: true,
    });
    if (result.canceled || !result.assets?.[0]) return null;
    const asset = result.assets[0];
    return asset.base64
      ? `data:image/jpeg;base64,${asset.base64}`
      : asset.uri;
  } catch (e) {
    console.warn('Gallery error:', e.message);
    Alert.alert('Gallery Error', e.message);
    return null;
  }
};

const pickFromCamera = async () => {
  try {
    const IP = require('expo-image-picker');
    const { status } = await IP.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission',
        'Please allow camera access in Settings to take an event photo.',
        [{ text: 'OK' }]
      );
      return null;
    }
    const result = await IP.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.65,
      base64: true,
    });
    if (result.canceled || !result.assets?.[0]) return null;
    const asset = result.assets[0];
    return asset.base64
      ? `data:image/jpeg;base64,${asset.base64}`
      : asset.uri;
  } catch (e) {
    console.warn('Camera error:', e.message);
    Alert.alert('Camera Error', e.message);
    return null;
  }
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function ImagePickerField({ image, onImageSelected, style }) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null); // web only

  // ── Web: FileReader ─────────────────────────────────────────────────────────
  const handleWebFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload  = (ev) => { onImageSelected(ev.target.result); setLoading(false); };
    reader.onerror = ()   => setLoading(false);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ── Native: ActionSheet → Camera or Gallery ─────────────────────────────────
  const openNativePicker = () => {
    const options = ['Camera', 'Choose from Gallery', 'Cancel'];
    const cancelIndex = 2;

    if (Platform.OS === 'ios') {
      // iOS native ActionSheet
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: cancelIndex, title: 'Add Event Image' },
        async (idx) => {
          if (idx === 0) {
            setLoading(true);
            const uri = await pickFromCamera();
            if (uri) onImageSelected(uri);
            setLoading(false);
          } else if (idx === 1) {
            setLoading(true);
            const uri = await pickFromGallery();
            if (uri) onImageSelected(uri);
            setLoading(false);
          }
        }
      );
    } else {
      // Android: Alert.alert as action sheet substitute
      Alert.alert(
        'Add Event Image',
        'Choose an option',
        [
          {
            text: '📷  Camera',
            onPress: async () => {
              setLoading(true);
              const uri = await pickFromCamera();
              if (uri) onImageSelected(uri);
              setLoading(false);
            },
          },
          {
            text: '🖼️  Choose from Gallery',
            onPress: async () => {
              setLoading(true);
              const uri = await pickFromGallery();
              if (uri) onImageSelected(uri);
              setLoading(false);
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
    }
  };

  // ── Unified open trigger ────────────────────────────────────────────────────
  const openPicker = () => {
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
    } else {
      openNativePicker();
    }
  };

  return (
    <View style={[styles.wrapper, style]}>
      {/* Label */}
      <View style={styles.labelRow}>
        <MaterialCommunityIcons name="image-outline" size={13} color={COLORS.textMuted} />
        <Text style={styles.label}>
          Event Image{' '}
          <Text style={styles.optional}>(optional)</Text>
        </Text>
      </View>

      {image ? (
        /* ── Preview with Remove + Change ── */
        <View style={styles.previewWrap}>
          <Image source={{ uri: image }} style={styles.preview} resizeMode="cover" />
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => onImageSelected(null)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <LinearGradient colors={['#DC2626', '#991B1B']} style={styles.removeBtnGrad}>
              <MaterialCommunityIcons name="close" size={14} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.changeBtn} onPress={openPicker}>
            <Text style={styles.changeBtnText}>Change Image</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* ── Upload Button ── */
        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={openPicker}
          activeOpacity={0.75}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.indigo} size="small" />
          ) : (
            <>
              <MaterialCommunityIcons name="image-plus" size={30} color={COLORS.indigo} />
              <Text style={styles.uploadText}>Tap to add event image</Text>
              <Text style={styles.uploadHint}>
                {Platform.OS === 'web' ? 'JPG, PNG' : 'Camera or Gallery'}
                {' '}— optional
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Web-only hidden file input — Metro never bundles this on native */}
      {Platform.OS === 'web' && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleWebFile}
          style={{ display: 'none' }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:  { marginBottom: SPACING.m },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  label: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecond, letterSpacing: 0.8,
    textTransform: 'uppercase', fontWeight: '700',
  },
  optional: {
    color: COLORS.textMuted, textTransform: 'none',
    fontWeight: '500', letterSpacing: 0,
  },
  uploadBtn: {
    backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.m,
    borderWidth: 1.5, borderColor: COLORS.indigo + '55',
    borderStyle: 'dashed', paddingVertical: SPACING.xl,
    alignItems: 'center', gap: SPACING.s,
  },
  uploadText: { fontSize: 14, fontWeight: '700', color: COLORS.indigoLight },
  uploadHint: { fontSize: 12, color: COLORS.textMuted },
  previewWrap: {
    borderRadius: RADIUS.l, overflow: 'hidden', position: 'relative',
  },
  preview: { width: '100%', height: 160, borderRadius: RADIUS.l },
  removeBtn: {
    position: 'absolute', top: 8, right: 8,
    borderRadius: RADIUS.pill, overflow: 'hidden',
  },
  removeBtnGrad: {
    width: 28, height: 28, borderRadius: RADIUS.pill,
    justifyContent: 'center', alignItems: 'center',
  },
  changeBtn: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 8, alignItems: 'center',
  },
  changeBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
