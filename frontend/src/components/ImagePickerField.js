/**
 * ImagePickerField.js
 *
 * Web-safe image picker.
 * On web: uses native HTML <input type="file"> (no expo-image-picker at all)
 * On native: uses expo-image-picker via platform file split
 */
import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Platform, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../utils/theme';

export default function ImagePickerField({ image, onImageSelected, style }) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // ── Web: read selected file as base64 data URI ─────────────────────────────
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

  const openPicker = () => {
    fileInputRef.current?.click();
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
        /* ── Preview ── */
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
        /* ── Upload button ── */
        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={openPicker}
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

      {/* Hidden web file input — Metro never includes this on native */}
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
    borderWidth: 1.5, borderColor: COLORS.indigo + '44',
    borderStyle: 'dashed', paddingVertical: SPACING.l,
    alignItems: 'center', gap: SPACING.s,
  },
  uploadText: { fontSize: 14, fontWeight: '600', color: COLORS.indigoLight },
  uploadHint: { fontSize: 12, color: COLORS.textMuted },
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
});
