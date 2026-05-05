/**
 * DateTimePickerField.js
 *
 * - Date mode:  Web → native HTML calendar picker (no typing)
 *               Native → display only (no typing)
 * - Time mode:  Custom modal with Hour / Minute / AM-PM columns
 *               Works on Web and Native — no typing allowed
 *               Stores "HH:MM" (24h) for backend, displays "3:00 AM"
 */
import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Platform, TouchableOpacity,
  Modal, ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../utils/theme';

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
  if (isNaN(h) || isNaN(m)) return { hour: '12', minute: '00', ampm: 'AM' };
  const ampm  = h >= 12 ? 'PM' : 'AM';
  const hour  = String(h % 12 || 12);
  const minute = String(m || 0).padStart(2, '0');
  return { hour, minute, ampm };
};

const HOURS   = ['1','2','3','4','5','6','7','8','9','10','11','12'];
const MINUTES = ['00','05','10','15','20','25','30','35','40','45','50','55'];
const AMPMS   = ['AM','PM'];

// ── Scrollable column ─────────────────────────────────────────────────────────
function Column({ items, selected, onSelect }) {
  return (
    <ScrollView
      style={{ width: 72, maxHeight: 240 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 6 }}
    >
      {items.map((item) => {
        const active = item === selected;
        return (
          <TouchableOpacity
            key={item}
            style={[tStyles.colItem, active && tStyles.colItemActive]}
            onPress={() => onSelect(item)}
            activeOpacity={0.7}
          >
            {active && (
              <LinearGradient
                colors={['rgba(79,110,247,0.3)', 'rgba(124,58,237,0.2)']}
                style={StyleSheet.absoluteFill}
                borderRadius={RADIUS.m}
              />
            )}
            <Text style={[tStyles.colText, active && tStyles.colTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ── Custom AM/PM Time Picker Modal ────────────────────────────────────────────
function TimePickerModal({ visible, value, onConfirm, onClose }) {
  const [selHour,   setSelHour]   = useState('12');
  const [selMinute, setSelMinute] = useState('00');
  const [selAmpm,   setSelAmpm]   = useState('AM');

  // ✅ Correct React pattern: sync state in useEffect, not during render
  useEffect(() => {
    if (visible) {
      const p = parse24h(value);
      setSelHour(p.hour);
      setSelMinute(p.minute);
      setSelAmpm(p.ampm);
    }
  }, [visible]); // only run when modal opens/closes

  const handleConfirm = () => {
    onConfirm(to24h(selHour, selMinute, selAmpm));
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={tStyles.overlay}>
        <View style={tStyles.sheet}>
          {/* Header */}
          <LinearGradient colors={['#4F6EF7', '#7C3AED']} style={tStyles.header}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#fff" />
            <Text style={tStyles.headerTitle}>Select Time</Text>
          </LinearGradient>

          {/* Large preview */}
          <Text style={tStyles.preview}>
            {selHour}:{selMinute} {selAmpm}
          </Text>

          {/* Column labels */}
          <View style={tStyles.colLabels}>
            <Text style={[tStyles.colLabel, { width: 72 }]}>Hour</Text>
            <View style={tStyles.colSep} />
            <Text style={[tStyles.colLabel, { width: 72 }]}>Min</Text>
            <View style={tStyles.colSep} />
            <Text style={[tStyles.colLabel, { width: 72 }]}>AM/PM</Text>
          </View>

          {/* Scrollable columns */}
          <View style={tStyles.cols}>
            <Column items={HOURS}   selected={selHour}   onSelect={setSelHour}   />
            <View style={tStyles.colSep} />
            <Column items={MINUTES} selected={selMinute} onSelect={setSelMinute} />
            <View style={tStyles.colSep} />
            <Column items={AMPMS}   selected={selAmpm}   onSelect={setSelAmpm}   />
          </View>

          {/* Actions */}
          <View style={tStyles.actions}>
            <TouchableOpacity style={tStyles.cancelBtn} onPress={onClose}>
              <Text style={tStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tStyles.confirmWrap} onPress={handleConfirm} activeOpacity={0.85}>
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

// ── Web date picker ───────────────────────────────────────────────────────────
function WebDatePicker({ value, onChange, placeholder }) {
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const display = formatDateDisplay(value);

  const openPicker = () => {
    try { inputRef.current?.showPicker?.(); } catch (_) {}
    inputRef.current?.focus();
  };

  return (
    <View style={[fStyles.container, focused && fStyles.containerFocused]}>
      <TouchableOpacity style={fStyles.inner} onPress={openPicker} activeOpacity={0.8}>
        <Text style={display ? fStyles.valueText : fStyles.placeholderText}>
          {display || placeholder || 'Select date'}
        </Text>
        <MaterialCommunityIcons
          name="calendar-month" size={20}
          color={focused ? COLORS.gold : COLORS.textMuted}
        />
      </TouchableOpacity>
      {/* Transparent overlay input triggers native calendar */}
      <input
        ref={inputRef}
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={()  => setFocused(false)}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          opacity: 0, cursor: 'pointer', width: '100%', height: '100%',
          border: 'none', background: 'transparent', zIndex: 10,
        }}
      />
    </View>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function DateTimePickerField({
  label, value, onChange, mode = 'date', icon, placeholder, style,
}) {
  const [showTime, setShowTime] = useState(false);
  const display = mode === 'date' ? formatDateDisplay(value) : formatTimeDisplay(value);

  return (
    <View style={[fStyles.wrapper, style]}>
      {label && (
        <View style={fStyles.labelRow}>
          {icon && <MaterialCommunityIcons name={icon} size={13} color={COLORS.textMuted} />}
          <Text style={fStyles.label}>{label}</Text>
        </View>
      )}

      {mode === 'time' ? (
        /* ── Time: custom modal always (web + native) ── */
        <>
          <TouchableOpacity
            style={fStyles.container}
            onPress={() => setShowTime(true)}
            activeOpacity={0.8}
          >
            <View style={fStyles.inner}>
              <Text style={display ? fStyles.valueText : fStyles.placeholderText}>
                {display || placeholder || 'Select time'}
              </Text>
              <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.textMuted} />
            </View>
          </TouchableOpacity>
          <TimePickerModal
            visible={showTime}
            value={value}
            onConfirm={onChange}
            onClose={() => setShowTime(false)}
          />
        </>
      ) : Platform.OS === 'web' ? (
        /* ── Date on web: native calendar ── */
        <WebDatePicker value={value} onChange={onChange} placeholder={placeholder} />
      ) : (
        /* ── Date on native: display only ── */
        <View style={fStyles.container}>
          <View style={fStyles.inner}>
            <Text style={display ? fStyles.valueText : fStyles.placeholderText}>
              {display || placeholder || 'Select date'}
            </Text>
            <MaterialCommunityIcons name="calendar-month" size={20} color={COLORS.textMuted} />
          </View>
        </View>
      )}
    </View>
  );
}

// ── Field styles ──────────────────────────────────────────────────────────────
const fStyles = StyleSheet.create({
  wrapper:    { marginBottom: SPACING.m },
  labelRow:   { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
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
  containerFocused: { borderColor: COLORS.gold, backgroundColor: '#1A1A26' },
  inner: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 14,
  },
  valueText:       { fontSize: 15, color: COLORS.textPrimary, flex: 1 },
  placeholderText: { fontSize: 15, color: COLORS.textMuted,   flex: 1 },
});

// ── Time modal styles ─────────────────────────────────────────────────────────
const tStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.78)',
    justifyContent: 'center', alignItems: 'center', padding: SPACING.l,
  },
  sheet: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl,
    width: '100%', maxWidth: 340, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.indigo + '44',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.s,
    paddingHorizontal: SPACING.l, paddingVertical: SPACING.m,
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
  preview: {
    fontSize: 36, fontWeight: '900', color: COLORS.textPrimary,
    textAlign: 'center', paddingVertical: SPACING.m, letterSpacing: -1,
  },
  colLabels: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: SPACING.l, paddingBottom: SPACING.s,
  },
  colLabel: {
    fontSize: 11, fontWeight: '700', color: COLORS.textMuted,
    letterSpacing: 0.8, textTransform: 'uppercase', textAlign: 'center',
  },
  cols: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start',
    paddingHorizontal: SPACING.l, paddingBottom: SPACING.m,
  },
  colSep: { width: 1, minHeight: 240, backgroundColor: COLORS.border, marginHorizontal: 6 },
  colItem: {
    paddingVertical: 10, paddingHorizontal: 6,
    marginVertical: 2, borderRadius: RADIUS.m, alignItems: 'center', overflow: 'hidden',
  },
  colItemActive:  { borderWidth: 1, borderColor: COLORS.indigo + '55' },
  colText:        { fontSize: 18, color: COLORS.textMuted, fontWeight: '500' },
  colTextActive:  { color: COLORS.indigoLight, fontWeight: '800', fontSize: 20 },
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
  confirmWrap: { flex: 1, borderRadius: RADIUS.m, overflow: 'hidden' },
  confirmGrad: { paddingVertical: 13, alignItems: 'center' },
  confirmText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
