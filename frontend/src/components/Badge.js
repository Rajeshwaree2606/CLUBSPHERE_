import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';

export default function Badge({ label, status = 'primary' }) {
  const getBackgroundColor = () => {
    switch (status) {
      case 'primary':
        return theme.colors.primaryLight;
      case 'secondary':
        return '#d1fae5';
      case 'accent':
        return '#fef3c7';
      case 'error':
        return '#fee2e2';
      default:
        return theme.colors.primaryLight;
    }
  };

  const getTextColor = () => {
    switch (status) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'accent':
        return theme.colors.accent;
      case 'error':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getBackgroundColor() }]}>
      <Text style={[styles.text, { color: getTextColor() }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.s,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
