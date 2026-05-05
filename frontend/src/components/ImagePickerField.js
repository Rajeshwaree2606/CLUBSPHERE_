/**
 * ImagePickerField.js
 *
 * Optional event image picker.
 * - Web:    file input (pick from filesystem)
 * - Native: Action sheet → Camera OR Gallery (expo-image-picker)
 *
 * Returns a base64 data URI string via onImageSelected(uri)
 * Pass null to clear the image.
 */
import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Modal, Platform, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, RADIUS, SPACING, SHADOWS, TYPOGRAPHY } from '../utils/theme';

export default function ImagePickerField({ image, onImageSelected, style }) {
  const [actionVisible, setActionVisible] = useState(false);
  const [loading,       setLoading]       = useState(false);
  const fileInputRef = useRef(null);

  // ── Request permission helper ──────────────────────────────────────────────
  const requestPermission = async (type) => {
    if (Platform.OS === 'web') return true;
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  };

  // ── Pick from gallery ──────────────────────────────────────────────────────
  const pickFromGallery = async () => {
    setActionVisible(false);
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
      return;
    }
    const ok = await requestPermission('gallery');
    if (!ok) return;
    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.7,
        base64: true,
      });
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        const uri = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        onImageSelected(uri);
      }
    } catch (e) {
      console.warn('Gallery pick error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Take photo with camera ─────────────────────────────────────────────────
  const takePhoto = async () => {
    setActionVisible(false);
    const ok = await requestPermission('camera');
    if (!ok) return;
    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.7,
        base64: true,
      });
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        const uri = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        onImageSelected(uri);
      }
    } catch (e) {
      console.warn('Camera error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Web file input handler ────────────────────────────────────────────────
  const handleWebFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      onImageSelected(ev.target.result); // base64 data URI
      setLoading(false);
    };
    reader.onerror = () => setLoading(false);
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  return (
    <View style={[styles.wrapper, style]}>
      {/* Label */}
      <View style={styles.labelRow}>
        <MaterialCommunityIcons name="image-outline" size={13} color={COLORS.textMuted} />
        <Text style={styles.label}>Event Image <Text style={styles.optional}>(optional)</Text></Text>
      </View>

      {image ? (
        /* ── Preview ── */
        <View style={styles.previewWrap}>
          <Image source={{ uri: image }} style={styles.preview} resizeMode="cover" />
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => onImageSelected(null)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <LinearGradient colors={['#DC2626','#991B1B']} style={styles.removeBtnGrad}>
              <MaterialCommunityIcons name="close" size={14} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.changeBtn} onPress={() => setActionVisible(true)}>
            <Text style={styles.changeBtnText}>Change Image</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* ── Upload button ── */
        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={() => Platform.OS === 'web' ? fileInputRef.current?.click() : setActionVisible(true)}
          activeOpacity={0.7}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.indigo} />
          ) : (
            <>
              <MaterialCommunityIcons name="image-plus" size={28} color={COLORS.indigo} />
              <Text style={styles.uploadText}>Tap to add event image</Text>
              <Text style={styles.uploadHint}>JPG, PNG — 16:9 recommended</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Web: hidden file input */}
      {Platform.OS === 'web' && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleWebFile}
          style={{ display: 'none' }}
        />
      )}

      {/* Native action sheet modal */}
      <Modal
        visible={actionVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setActionVisible(false)}
      >
        <TouchableOpacity
          style={styles.sheetOverlay}
          activeOpacity={1}
          onPress={() => setActionVisible(false)}
        >
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Add Event Image</Text>

            <TouchableOpacity style={styles.sheetOption} onPress={takePhoto}>
              <LinearGradient colors={['rgba(79,110,247,0.15)','rgba(79,110,247,0.05)']} style={StyleSheet.absoluteFill} borderRadius={RADIUS.m} />
              <MaterialCommunityIcons name="camera-outline" size={22} color={COLORS.indigo} />
              <Text style={styles.sheetOptionText}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetOption} onPress={pickFromGallery}>
              <LinearGradient colors={['rgba(79,110,247,0.15)','rgba(79,110,247,0.05)']} style={StyleSheet.absoluteFill} borderRadius={RADIUS.m} />
              <MaterialCommunityIcons name="image-multiple-outline" size={22} color={COLORS.indigo} />
              <Text style={styles.sheetOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetCancel} onPress={() => setActionVisible(false)}>
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  optional: { color: COLORS.textMuted, textTransform: 'none', fontWeight: '500', letterSpacing: 0 },

  // Upload button
  uploadBtn: {
    backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.m,
    borderWidth: 1.5, borderColor: COLORS.indigo + '44',
    borderStyle: 'dashed', paddingVertical: SPACING.l,
    alignItems: 'center', gap: SPACING.s,
  },
  uploadText: { fontSize: 14, fontWeight: '600', color: COLORS.indigoLight },
  uploadHint: { fontSize: 12, color: COLORS.textMuted },

  // Preview
  previewWrap: { borderRadius: RADIUS.l, overflow: 'hidden', position: 'relative' },
  preview:     { width: '100%', height: 160, borderRadius: RADIUS.l },
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
    backgroundColor: 'rgba(0,0,0,0.55)', paddingVertical: 8, alignItems: 'center',
  },
  changeBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Bottom sheet
  sheetOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.bgCard, borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl, padding: SPACING.l, paddingBottom: 36,
    borderTopWidth: 1, borderColor: COLORS.border, gap: SPACING.s,
  },
  sheetTitle: {
    fontSize: 16, fontWeight: '800', color: COLORS.textPrimary,
    textAlign: 'center', marginBottom: SPACING.s,
  },
  sheetOption: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.m,
    borderRadius: RADIUS.m, padding: SPACING.m, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.indigo + '33',
  },
  sheetOptionText: { fontSize: 16, color: COLORS.textPrimary, fontWeight: '600' },
  sheetCancel: {
    paddingVertical: SPACING.m, alignItems: 'center', marginTop: SPACING.s,
  },
  sheetCancelText: { color: COLORS.textSecond, fontSize: 15, fontWeight: '600' },
});
