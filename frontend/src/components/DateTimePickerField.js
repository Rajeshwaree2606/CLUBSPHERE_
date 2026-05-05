/**
 * DateTimePickerField.js
 *
 * Cross-platform date/time picker:
 * - Web: uses a real HTML <input type="date"> or <input type="time"> rendered inline
 *        (browser shows native calendar / clock wheel — no typing allowed)
 * - Native: uses formatted display — typing blocked, shows placeholder
 *
 * Props:
 *   label       string
 *   value       string  "YYYY-MM-DD" for date, "HH:MM" for time (24h)
 *   onChange    fn(string)
 *   mode        "date" | "time"
 *   icon        MaterialCommunityIcons name
 *   placeholder string
 *   style       ViewStyle
 */
import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Platform, TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../utils/theme';

// ── Display formatters ────────────────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const formatDateDisplay = (val) => {
  if (!val) return '';
  const parts = val.split('-');
  if (parts.length !== 3) return val;
  const d = parseInt(parts[2], 10);
  const m = parseInt(parts[1], 10) - 1;
  const y = parts[0];
  return `${d} ${MONTHS[m] || ''} ${y}`;
};

export const formatTimeDisplay = (val) => {
  if (!val) return '';
  const [h, m] = val.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh   = h % 12 || 12;
  return `${hh}:${String(m || 0).padStart(2, '0')} ${ampm}`;
};

// ── Web component — renders a real <input> with full browser picker ───────────
// On web, we use dangerouslySetInnerHTML is not available in RN, but we can
// use a View + a real <input> element injected via ref for web.
function WebPicker({ mode, value, onChange, placeholder }) {
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);

  const display = mode === 'date'
    ? formatDateDisplay(value)
    : formatTimeDisplay(value);

  const handleClick = () => {
    // Programmatically trigger the browser's date/time picker
    if (inputRef.current) {
      try { inputRef.current.showPicker?.(); } catch (_) {}
      inputRef.current.focus();
    }
  };

  // On web, render a visible styled button + the real native input positioned over it
  return (
    <View style={[styles.container, focused && styles.focusedContainer]}>
      <TouchableOpacity
        style={styles.innerTouchable}
        onPress={handleClick}
        activeOpacity={0.8}
      >
        <Text style={display ? styles.displayText : styles.placeholderText}>
          {display || placeholder || (mode === 'date' ? 'Select date' : 'Select time')}
        </Text>
        <MaterialCommunityIcons
          name={mode === 'date' ? 'calendar-month' : 'clock-outline'}
          size={20}
          color={focused ? COLORS.gold : COLORS.textMuted}
        />
      </TouchableOpacity>

      {/* Native HTML input — covers the entire row for click capture */}
      {Platform.OS === 'web' && (
        <input
          ref={inputRef}
          type={mode === 'date' ? 'date' : 'time'}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            opacity: 0,
            cursor: 'pointer',
            width: '100%',
            height: '100%',
            border: 'none',
            background: 'transparent',
            zIndex: 10,
          }}
        />
      )}
    </View>
  );
}

// ── Native component — display only, no typing ───────────────────────────────
// On native you would normally integrate @react-native-community/datetimepicker
// but to avoid adding native deps, we show a disabled display with a message.
function NativePicker({ mode, value, onChange, placeholder }) {
  const display = mode === 'date'
    ? formatDateDisplay(value)
    : formatTimeDisplay(value);

  return (
    <View style={[styles.container]}>
      <View style={styles.innerTouchable}>
        <Text style={display ? styles.displayText : styles.placeholderText}>
          {display || placeholder || (mode === 'date' ? 'Tap to select' : 'Select time')}
        </Text>
        <MaterialCommunityIcons
          name={mode === 'date' ? 'calendar-month' : 'clock-outline'}
          size={20}
          color={COLORS.textMuted}
        />
      </View>
    </View>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
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

      {Platform.OS === 'web'
        ? <WebPicker mode={mode} value={value} onChange={onChange} placeholder={placeholder} />
        : <NativePicker mode={mode} value={value} onChange={onChange} placeholder={placeholder} />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:    { marginBottom: SPACING.m },
  labelRow:   { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  label: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecond,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  container: {
    position: 'relative',
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.m,
    borderWidth: 1.5, borderColor: COLORS.border,
    minHeight: 52, overflow: 'hidden',
  },
  focusedContainer: { borderColor: COLORS.gold, backgroundColor: '#1A1A26' },
  innerTouchable: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 14,
  },
  displayText:     { fontSize: 15, color: COLORS.textPrimary, flex: 1 },
  placeholderText: { fontSize: 15, color: COLORS.textMuted, flex: 1 },
});
