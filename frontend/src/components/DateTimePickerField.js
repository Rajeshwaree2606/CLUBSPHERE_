/**
 * DateTimePickerField.js — v3
 *
 * Date mode:
 *   - Web  → native HTML <input type="date"> (invisible overlay)
 *   - Android/iOS → @react-native-community/datetimepicker (native OS picker)
 *
 * Time mode:
 *   - ALL platforms → custom 3-column modal (Hour / Minute / AM-PM)
 *   - No manual typing. Stores "HH:MM" 24h for backend, displays "3:00 AM"
 */
import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Platform, TouchableOpacity,
  Modal, ScrollView, Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../utils/theme';

const { width: SCREEN_W } = Dimensions.get('window');

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

// ── Single scrollable column ──────────────────────────────────────────────────
function Column({ items, selected, onSelect }) {
  return (
    <ScrollView
      style={tStyles.colScroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 8 }}
      keyboardShouldPersistTaps="always"
      nestedScrollEnabled
    >
      {items.map((item) => {
        const active = item === selected;
        return (
          <TouchableOpacity
            key={item}
            style={[tStyles.colItem, active && tStyles.colItemActive]}
            onPress={() => onSelect(item)}
            activeOpacity={0.6}
          >
            {active && (
              <LinearGradient
                colors={['rgba(79,110,247,0.35)', 'rgba(124,58,237,0.25)']}
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

  // Sync selections when modal opens — useEffect is the correct React pattern
  useEffect(() => {
    if (visible) {
      const p = parse24h(value);
      setSelHour(p.hour);
      setSelMinute(p.minute);
      setSelAmpm(p.ampm);
    }
  }, [visible]);

  const handleConfirm = () => {
    onConfirm(to24h(selHour, selMinute, selAmpm));
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={tStyles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {}}
          style={tStyles.sheet}
        >
          {/* Header */}
          <LinearGradient colors={['#4F6EF7', '#7C3AED']} style={tStyles.header}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#fff" />
            <Text style={tStyles.headerTitle}>Select Time</Text>
          </LinearGradient>

          {/* Large live preview */}
          <View style={tStyles.previewWrap}>
            <Text style={tStyles.preview}>
              {selHour}:{selMinute}{' '}
              <Text style={tStyles.previewAmpm}>{selAmpm}</Text>
            </Text>
          </View>

          {/* Column labels */}
          <View style={tStyles.colLabels}>
            <Text style={tStyles.colLabel}>Hour</Text>
            <View style={tStyles.colSep} />
            <Text style={tStyles.colLabel}>Min</Text>
            <View style={tStyles.colSep} />
            <Text style={tStyles.colLabel}>AM/PM</Text>
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
            <TouchableOpacity
              style={tStyles.confirmWrap}
              onPress={handleConfirm}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#4F6EF7', '#7C3AED']} style={tStyles.confirmGrad}>
                <Text style={tStyles.confirmText}>Confirm</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ── Native Date Picker (Android / iOS) ───────────────────────────────────────
function NativeDatePicker({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  const display = formatDateDisplay(value);

  // Parse current value to Date object
  const currentDate = value
    ? (() => { const [y,m,d] = value.split('-').map(Number); return new Date(y, m-1, d); })()
    : new Date();

  const handleChange = (event, selectedDate) => {
    // On Android the picker closes automatically; on iOS we close manually
    if (Platform.OS === 'android') setShow(false);
    if (event.type === 'dismissed') { setShow(false); return; }
    if (selectedDate) {
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const d = String(selectedDate.getDate()).padStart(2, '0');
      onChange(`${y}-${m}-${d}`);
    }
    if (Platform.OS === 'ios') setShow(false);
  };

  // Lazy require so Metro web bundler never touches this module
  const DateTimePicker = Platform.OS !== 'web'
    ? require('@react-native-community/datetimepicker').default
    : null;

  return (
    <>
      <TouchableOpacity
        style={fStyles.container}
        onPress={() => setShow(true)}
        activeOpacity={0.8}
      >
        <View style={fStyles.inner}>
          <Text style={display ? fStyles.valueText : fStyles.placeholderText}>
            {display || placeholder || 'Select date'}
          </Text>
          <MaterialCommunityIcons name="calendar-month" size={20} color={COLORS.gold} />
        </View>
      </TouchableOpacity>

      {show && DateTimePicker && (
        <DateTimePicker
          value={currentDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
          onChange={handleChange}
          minimumDate={new Date(2020, 0, 1)}
          maximumDate={new Date(2035, 11, 31)}
          themeVariant="dark"
        />
      )}
    </>
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
        /* ── Time: custom modal (web + native) ── */
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
              <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.indigo} />
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
        /* ── Date on web ── */
        <WebDatePicker value={value} onChange={onChange} placeholder={placeholder} />
      ) : (
        /* ── Date on Android / iOS ── */
        <NativeDatePicker value={value} onChange={onChange} placeholder={placeholder} />
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
const COL_W = Math.min(80, (SCREEN_W - 100) / 3); // responsive column width

const tStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.82)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1,
    borderColor: COLORS.indigo + '44',
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.s,
    paddingHorizontal: SPACING.l, paddingVertical: SPACING.m,
    borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
  previewWrap: { alignItems: 'center', paddingVertical: SPACING.m },
  preview: {
    fontSize: 40, fontWeight: '900', color: '#FFFFFF',
    letterSpacing: -1,
  },
  previewAmpm: { fontSize: 24, fontWeight: '700', color: COLORS.indigoLight },
  colLabels: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: SPACING.l, paddingBottom: SPACING.s,
  },
  colLabel: {
    width: COL_W,
    fontSize: 11, fontWeight: '800', color: COLORS.textSecond,
    letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center',
  },
  cols: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start',
    paddingHorizontal: SPACING.l, paddingBottom: SPACING.s,
    height: 260,
  },
  colScroll: {
    width: COL_W,
    height: 260,
  },
  colSep: {
    width: 1, height: 260, backgroundColor: COLORS.border, marginHorizontal: 8,
  },
  colItem: {
    height: 48, // fixed height for every row — no clipping
    justifyContent: 'center', alignItems: 'center',
    borderRadius: RADIUS.m, marginVertical: 2, overflow: 'hidden',
    paddingHorizontal: 4,
  },
  colItemActive: { borderWidth: 1.5, borderColor: COLORS.indigo + '88' },
  colText: {
    fontSize: 20, color: '#8899BB', fontWeight: '600', textAlign: 'center',
  },
  colTextActive: {
    color: '#FFFFFF', fontWeight: '900', fontSize: 22,
  },
  actions: {
    flexDirection: 'row', gap: SPACING.m,
    paddingHorizontal: SPACING.l, paddingVertical: SPACING.m,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: RADIUS.m,
    backgroundColor: COLORS.bgElevated, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelText:  { color: COLORS.textSecond, fontSize: 15, fontWeight: '700' },
  confirmWrap: { flex: 1, borderRadius: RADIUS.m, overflow: 'hidden' },
  confirmGrad: { paddingVertical: 14, alignItems: 'center' },
  confirmText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
