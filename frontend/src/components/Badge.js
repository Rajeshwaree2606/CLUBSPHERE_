import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

export default function Badge({ label, status = 'neutral' }) {
  const { theme } = useContext(ThemeContext);

  const getColors = () => {
    switch(status) {
      case 'success': return { bg: theme.colors.secondaryLight, text: theme.colors.secondary };
      case 'danger': return { bg: theme.colors.errorLight, text: theme.colors.error };
      case 'warning': return { bg: '#FEF3C7', text: '#D97706' }; // Amber
      case 'primary': return { bg: theme.colors.primaryLight, text: theme.colors.primary };
      default: return { bg: theme.colors.border, text: theme.colors.textSecondary };
    }
  };

  const colors = getColors();

  return (
    <View style={[{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: theme.borderRadius.round, alignSelf: 'flex-start', backgroundColor: colors.bg }]}>
      <Text style={[{ fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', color: colors.text }]}>{label}</Text>
    </View>
  );
}
