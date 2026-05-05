/**
 * DateTimePickerField.js
 *
 * Cross-platform date/time picker:
 * - Web:    native HTML <input type="date"> / <input type="time"> (no extra deps)
 * - Native: shows a simple numeric keyboard with formatted display
 *
 * Props:
 *   label       string
 *   value       string  (ISO date "YYYY-MM-DD" or time "HH:MM")
 *   onChange    fn(string)
 *   mode        "date" | "time"
 *   icon        MaterialCommunityIcons name
 *   placeholder string
 */
import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Platform, TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../utils/theme';

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatDateDisplay = (val) => {
  if (!val) return '';
  // val is "YYYY-MM-DD"
  const parts = val.split('-');
  if (parts.length !== 3) return val;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const m = parseInt(parts[1], 10) - 1;
  return `${parts[2]} ${months[m] || ''} ${parts[0]}`;
};

const formatTimeDisplay = (val) => {
  if (!val) return '';
  // val is "HH:MM"
  const [h, m] = val.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh   = h % 12 || 12;
  return `${hh}:${String(m || 0).padStart(2, '0')} ${ampm}`;
};

// ── Web: inject a hidden <input> and trigger it via ref ───────────────────────
function WebDateInput({ mode, value, onChange, placeholder }) {
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);

  const display = mode === 'date'
    ? (value ? formatDateDisplay(value) : '')
    : (value ? formatTimeDisplay(value)  : '');

  if (Platform.OS !== 'web') return null;

  return (
    <View style={styles.webWrap}>
      {/* Visible styled box */}
      <TouchableOpacity
        style={[styles.container, focused && styles.focusedContainer]}
        onPress={() => inputRef.current?.focus()}
        activeOpacity={0.8}
      >
        <Text style={display ? styles.displayText : styles.placeholderText}>
          {display || placeholder}
        </Text>
        <MaterialCommunityIcons
          name={mode === 'date' ? 'calendar-month' : 'clock-outline'}
          size={18}
          color={focused ? COLORS.gold : COLORS.textMuted}
        />
      </TouchableOpacity>

      {/* Invisible native input overlaid — captures the date picker */}
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={value}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        dataSet={{ type: mode === 'date' ? 'date' : 'time' }}
      />
    </View>
  );
}

// ── Native: simple formatted text input ───────────────────────────────────────
function NativeDateInput({ mode, value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);

  const handleChange = (text) => {
    if (mode === 'date') {
      // Auto-format YYYY-MM-DD as user types
      let clean = text.replace(/[^0-9]/g, '');
      if (clean.length > 4) clean = clean.slice(0,4) + '-' + clean.slice(4);
      if (clean.length > 7) clean = clean.slice(0,7) + '-' + clean.slice(7,9);
      onChange(clean.slice(0, 10));
    } else {
      // Auto-format HH:MM
      let clean = text.replace(/[^0-9]/g, '');
      if (clean.length > 2) clean = clean.slice(0,2) + ':' + clean.slice(2,4);
      onChange(clean.slice(0, 5));
    }
  };

  return (
    <View style={[styles.container, focused && styles.focusedContainer]}>
      <TextInput
        style={styles.nativeInput}
        value={value}
        onChangeText={handleChange}
        placeholder={placeholder || (mode === 'date' ? 'YYYY-MM-DD' : 'HH:MM')}
        placeholderTextColor={COLORS.textMuted}
        keyboardType="numeric"
        maxLength={mode === 'date' ? 10 : 5}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <MaterialCommunityIcons
        name={mode === 'date' ? 'calendar-month' : 'clock-outline'}
        size={18}
        color={focused ? COLORS.gold : COLORS.textMuted}
        style={{ marginRight: 14 }}
      />
    </View>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function DateTimePickerField({
  label,
  value,
  onChange,
  mode = 'date',
  icon,
  placeholder,
  style,
}) {
  return (
    <View style={[styles.wrapper, style]}>
      {label && (
        <View style={styles.labelRow}>
          {icon && (
            <MaterialCommunityIcons name={icon} size={13} color={COLORS.textMuted} />
          )}
          <Text style={styles.label}>{label}</Text>
        </View>
      )}

      {Platform.OS === 'web' ? (
        <WebDateInput mode={mode} value={value} onChange={onChange} placeholder={placeholder} />
      ) : (
        <NativeDateInput mode={mode} value={value} onChange={onChange} placeholder={placeholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: SPACING.m },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  label: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecond,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  container: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.m,
    borderWidth: 1.5, borderColor: COLORS.border,
    minHeight: 52, paddingHorizontal: 14,
  },
  focusedContainer: { borderColor: COLORS.gold, backgroundColor: '#1A1A26' },
  displayText:     { fontSize: 15, color: COLORS.textPrimary, flex: 1 },
  placeholderText: { fontSize: 15, color: COLORS.textMuted, flex: 1 },

  // Web: overlay hidden input
  webWrap: { position: 'relative' },
  hiddenInput: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    opacity: 0, zIndex: 10,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },

  // Native text input inside container
  nativeInput: {
    flex: 1, fontSize: 15, color: COLORS.textPrimary,
    paddingVertical: 14,
  },
});
