import React, { useContext } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

export default function ProgressBar({ current, max, label = true }) {
  const { theme } = useContext(ThemeContext);
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <View style={{ marginTop: theme.spacing.s }}>
      <View style={[{ height: 10, backgroundColor: theme.colors.border, borderRadius: 5, overflow: 'hidden' }]}>
         <View style={[{ height: '100%', backgroundColor: theme.colors.accent, borderRadius: 5, width: `${percentage}%` }]} />
      </View>
      {label && (
         <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <Text style={[{ fontSize: 12, color: theme.colors.textSecondary }]}>XP Points (Level Progression)</Text>
            <Text style={[{ fontSize: 12, fontWeight: '700', color: theme.colors.primary }]}>{current} / {max}</Text>
         </View>
      )}
    </View>
  );
}
