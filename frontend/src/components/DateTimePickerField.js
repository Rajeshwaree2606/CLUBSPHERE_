/**
 * DateTimePickerField.js
 *
 * - Date mode:  Web → native HTML calendar picker (no typing)
 *               Native → display only
 * - Time mode:  Custom modal with Hour / Minute / AM-PM columns
 *               Works identically on Web and Native — no typing allowed
 *               Stores "HH:MM" (24-hour) for backend, displays "3:00 AM"
 */
import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Platform, TouchableOpacity,
  Modal, ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '../utils/theme';

// ── Display formatters ────────────────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const formatDateDisplay = (val) => {
  if (!val) return '';
  const parts = val.split('-');
  if (parts.length !== 3) return val;
  const d = parseInt(parts[2], 10);
  const m = parseInt(parts[1], 10) - 1;
  return `${d} ${MONTHS[m] || ''} ${parts[0]}`;
};

export const formatTimeDisplay = (val) => {
  if (!val) return '';
  const [h, m] = val.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return val;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh   = h % 12 || 12;
  return `${hh}:${String(m).padStart(2, '0')} ${ampm}`;
};

// ── Convert 12h → 24h for backend ────────────────────────────────────────────
const to24h = (hour12, minute, ampm) => {
  let h = parseInt(hour12, 10);
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

// ── Parse existing 24h value back to 12h parts ───────────────────────────────
const parse24h = (val) => {
  if (!val) return { hour: '12', minute: '00', ampm: 'AM' };
  const [h, m] = val.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = String(h % 12 || 12);
  const minute = String(m || 0).padStart(2, '0');
  return { hour, minute, ampm };
};

const HOURS   = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
const AMPMS   = ['AM', 'PM'];

// ── Custom AM/PM Time Picker Modal ────────────────────────────────────────────
function TimePickerModal({ visible, value, onConfirm, onClose }) {
  const { hour: initH, minute: initM, ampm: initA } = parse24h(value);
  const [selHour,   setSelHour]   = useState(initH);
  const [selMinute, setSelMinute] = useState(initM);
  const [selAmpm,   setSelAmpm]   = useState(initA);

  // Reset to current value each time modal opens
  const prevVisible = useRef(false);
  if (visible && !prevVisible.current) {
    const p = parse24h(value);
    if (p.hour !== selHour)   setSelHour(p.hour);
    if (p.minute !== selMinute) setSelMinute(p.minute);
    if (p.ampm !== selAmpm)   setSelAmpm(p.ampm);
  }
  prevVisible.current = visible;

  const handleConfirm = () => {
    onConfirm(to24h(selHour, selMinute, selAmpm));
    onClose();
  };

  const Column = ({ items, selected, onSelect, width = 70 }) => (
    <ScrollView
      style={{ maxHeight: 220, width }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 4 }}
    >
      {items.map(item => {
        const isSelected = item === selected;
        return (
          <TouchableOpacity
            key={item}
            style={[tStyles.colItem, isSelected && tStyles.colItemSelected]}
            onPress={() => onSelect(item)}
            activeOpacity={0.7}
          >
            {isSelected && (
              <LinearGradient
                colors={['rgba(79,110,247,0.25)', 'rgba(124,58,237,0.25)']}
                style={StyleSheet.absoluteFill}
                borderRadius={RADIUS.m}
              />
            )}
            <Text style={[tStyles.colText, isSelected && tStyles.colTextSelected]}>
              {item}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={tStyles.overlay}>
        <View style={tStyles.sheet}>
          {/* Header */}
          <LinearGradient colors={['#4F6EF7', '#7C3AED']} style={tStyles.header}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#fff" />
            <Text style={tStyles.headerTitle}>Select Time</Text>
          </LinearGradient>

          {/* Preview */}
          <Text style={tStyles.preview}>
            {selHour}:{selMinute} {selAmpm}
          </Text>

          {/* Column labels */}
          <View style={tStyles.labelsRow}>
            <Text style={[tStyles.colLabel, { width: 70 }]}>Hour</Text>
            <View style={tStyles.colDivider} />
            <Text style={[tStyles.colLabel, { width: 70 }]}>Min</Text>
            <View style={tStyles.colDivider} />
            <Text style={[tStyles.colLabel, { width: 70 }]}>AM/PM</Text>
          </View>

          {/* Columns */}
          <View style={tStyles.columnsRow}>
            <Column items={HOURS}   selected={selHour}   onSelect={setSelHour}   />
            <View style={tStyles.colSep} />
            <Column items={MINUTES} selected={selMinute} onSelect={setSelMinute} />
            <View style={tStyles.colSep} />
            <Column items={AMPMS}   selected={selAmpm}   onSelect={setSelAmpm}   width={70} />
          </View>

          {/* Actions */}
          <View style={tStyles.actions}>
            <TouchableOpacity style={tStyles.cancelBtn} onPress={onClose}>
              <Text style={tStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tStyles.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
              <LinearGradient colors={['#4F6EF7', '#7C3AED']} style={tStyles.confirmGrad}>
                <Text style={tStyles.confirmText}>Confirm</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Web date picker (calendar) ────────────────────────────────────────────────
function WebDatePicker({ value, onChange, placeholder }) {
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const display = formatDateDisplay(value);

  return (
    <View style={[styles.container, focused && styles.focusedContainer]}>
      <TouchableOpacity
        style={styles.inner}
        onPress={() => { try { inputRef.current?.showPicker?.(); } catch (_) {} inputRef.current?.focus(); }}
        activeOpacity={0.8}
      >
        <Text style={display ? styles.displayText : styles.placeholderText}>
          {display || placeholder || 'Select date'}
        </Text>
        <MaterialCommunityIcons name="calendar-month" size={20} color={focused ? COLORS.gold : COLORS.textMuted} />
      </TouchableOpacity>
      {Platform.OS === 'web' && (
        <input
          ref={inputRef}
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            opacity: 0, cursor: 'pointer', width: '100%', height: '100%',
            border: 'none', background: 'transparent', zIndex: 10,
          }}
        />
      )}
    </View>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function DateTimePickerField({
  label, value, onChange, mode = 'date', icon, placeholder, style,
}) {
  const [showTimePicker, setShowTimePicker] = useState(false);

  const display = mode === 'date' ? formatDateDisplay(value) : formatTimeDisplay(value);

  return (
    <View style={[styles.wrapper, style]}>
      {label && (
        <View style={styles.labelRow}>
          {icon && <MaterialCommunityIcons name={icon} size={13} color={COLORS.textMuted} />}
          <Text style={styles.label}>{label}</Text>
        </View>
      )}

      {mode === 'date' && Platform.OS === 'web' ? (
        <WebDatePicker value={value} onChange={onChange} placeholder={placeholder} />
      ) : mode === 'time' ? (
        <>
          {/* Time: always use custom modal (web + native) */}
          <TouchableOpacity
            style={styles.container}
            onPress={() => setShowTimePicker(true)}
            activeOpacity={0.8}
          >
            <View style={styles.inner}>
              <Text style={display ? styles.displayText : styles.placeholderText}>
                {display || placeholder || 'Select time'}
              </Text>
              <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.textMuted} />
            </View>
          </TouchableOpacity>
          <TimePickerModal
            visible={showTimePicker}
            value={value}
            onConfirm={onChange}
            onClose={() => setShowTimePicker(false)}
          />
        </>
      ) : (
        /* Date on native — display only */
        <View style={styles.container}>
          <View style={styles.inner}>
            <Text style={display ? styles.displayText : styles.placeholderText}>
              {display || placeholder || 'Select date'}
            </Text>
            <MaterialCommunityIcons name="calendar-month" size={20} color={COLORS.textMuted} />
          </View>
        </View>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper:          { marginBottom: SPACING.m },
  labelRow:         { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  label: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecond, letterSpacing: 0.8,
    textTransform: 'uppercase', fontWeight: '700',
  },
  container: {
    position: 'relative', flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.m,
    borderWidth: 1.5, borderColor: COLORS.border, minHeight: 52, overflow: 'hidden',
  },
  focusedContainer: { borderColor: COLORS.gold, backgroundColor: '#1A1A26' },
  inner: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 14,
  },
  displayText:     { fontSize: 15, color: COLORS.textPrimary, flex: 1 },
  placeholderText: { fontSize: 15, color: COLORS.textMuted,   flex: 1 },
});

const tStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center', alignItems: 'center', padding: SPACING.l,
  },
  sheet: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl,
    width: '100%', maxWidth: 360, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.indigo + '44', ...SHADOWS.modal,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.s,
    paddingHorizontal: SPACING.l, paddingVertical: SPACING.m,
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
  preview: {
    fontSize: 32, fontWeight: '900', color: COLORS.textPrimary,
    textAlign: 'center', letterSpacing: -1, paddingVertical: SPACING.m,
  },
  labelsRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: SPACING.l, paddingBottom: SPACING.s,
  },
  colLabel: {
    fontSize: 11, fontWeight: '700', color: COLORS.textMuted,
    letterSpacing: 0.8, textTransform: 'uppercase', textAlign: 'center',
  },
  colDivider: { width: 1, height: 16, backgroundColor: COLORS.border, marginHorizontal: 8 },
  columnsRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start',
    paddingHorizontal: SPACING.l, paddingBottom: SPACING.m,
  },
  colSep: { width: 1, minHeight: 200, backgroundColor: COLORS.border, marginHorizontal: 8 },
  colItem: {
    paddingVertical: 10, paddingHorizontal: 8,
    marginVertical: 2, borderRadius: RADIUS.m,
    alignItems: 'center', overflow: 'hidden',
  },
  colItemSelected: { borderWidth: 1, borderColor: COLORS.indigo + '55' },
  colText:         { fontSize: 18, color: COLORS.textMuted, fontWeight: '500' },
  colTextSelected: { color: COLORS.indigoLight, fontWeight: '800', fontSize: 20 },
  actions: {
    flexDirection: 'row', gap: SPACING.m,
    padding: SPACING.l, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  cancelBtn: {
    flex: 1, paddingVertical: 13, borderRadius: RADIUS.m,
    backgroundColor: COLORS.bgElevated, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelText:  { color: COLORS.textSecond, fontSize: 15, fontWeight: '700' },
  confirmBtn:  { flex: 1, borderRadius: RADIUS.m, overflow: 'hidden' },
  confirmGrad: { paddingVertical: 13, alignItems: 'center' },
  confirmText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
