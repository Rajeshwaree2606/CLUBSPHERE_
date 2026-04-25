import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../utils/theme';

/**
 * PremiumCard — deep navy card with optional accent border.
 * variant: 'default' | 'indigo' | 'purple' | 'cyan' | 'gold' | 'elevated'
 */
export default function PremiumCard({ children, style, variant = 'default' }) {
  const BORDER_MAP = {
    default:  COLORS.border,
    indigo:   COLORS.indigo + '55',
    purple:   COLORS.purple + '55',
    cyan:     COLORS.cyan   + '55',
    gold:     COLORS.gold   + '55',
    elevated: COLORS.border,
  };

  const borderColor = BORDER_MAP[variant] || COLORS.border;

  return (
    <View style={[
      styles.card,
      { borderColor },
      variant === 'elevated' && styles.elevated,
      style,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.l,
    padding: 18,
    marginBottom: 10,
    borderWidth: 1,
    ...SHADOWS.card,
  },
  elevated: {
    backgroundColor: COLORS.bgElevated,
    ...SHADOWS.indigo,
  },
});
