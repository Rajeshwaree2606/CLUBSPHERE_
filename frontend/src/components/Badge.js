import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

export default function Badge({ label, status = 'primary' }) {
  const { theme } = useContext(ThemeContext);

  const getBackgroundColor = () => {
    switch (status) {
      case 'primary':
        return theme.colors.primaryLight;
      case 'secondary':
        return theme.colors.secondaryLight;
      case 'accent':
        return theme.colors.accentLight || '#fef3c7';
      case 'error':
        return theme.colors.errorLight;
      case 'success':
        return theme.colors.successLight || '#dcfce7';
      case 'warning':
        return theme.colors.warningLight || '#fef3c7';
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
      case 'success':
        return theme.colors.success || '#22c55e';
      case 'warning':
        return theme.colors.warning || '#f59e0b';
      default:
        return theme.colors.primary;
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getBackgroundColor(), borderRadius: theme.borderRadius.s }]}>
      <Text style={[styles.text, { color: getTextColor() }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
