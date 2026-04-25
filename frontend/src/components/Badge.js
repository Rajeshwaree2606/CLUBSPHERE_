/**
 * Badge.js — Premium pill badge component.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../utils/theme';

const STATUS_STYLES = {
  primary: { bg: COLORS.goldGlow,    border: COLORS.goldDim,   text: COLORS.gold         },
  success: { bg: COLORS.successGlow, border: `${COLORS.success}44`, text: COLORS.success },
  error:   { bg: COLORS.errorGlow,   border: `${COLORS.error}44`,   text: COLORS.error   },
  warning: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', text: COLORS.warning },
  default: { bg: COLORS.bgElevated,  border: COLORS.border,    text: COLORS.textSecond   },
};

export default function Badge({ label, status = 'default' }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.default;
  return (
    <View style={[styles.badge, { backgroundColor: s.bg, borderColor: s.border }]}>
      <Text style={[styles.text, { color: s.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: RADIUS.pill, borderWidth: 1,
    paddingVertical: 3, paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
});
