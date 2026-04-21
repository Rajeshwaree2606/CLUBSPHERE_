import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

export default function ProgressBar({ current = 0, max = 100, label = 'XP' }) {
  const { theme } = useContext(ThemeContext);
  const percentage = (current / max) * 100;

  return (
    <View style={[styles.container, { marginTop: theme.spacing.m }]}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: theme.colors.surface }]}>{label}</Text>
        <Text style={[styles.text, { color: theme.colors.surface }]}>
          {current}/{max}
        </Text>
      </View>
      <View style={[styles.barContainer, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
        <View
          style={[
            styles.barFill,
            {
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: theme.colors.secondary,
            },
          ]}
        />
      </View>
      <Text style={[styles.percentage, { color: theme.colors.surface }]}>{Math.round(percentage)}% Complete</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  text: {
    fontSize: 12,
    opacity: 0.9,
  },
  barContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 12,
    opacity: 0.8,
    textAlign: 'right',
  },
});
