import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';

export default function ProgressBar({ current = 0, max = 100, label = 'XP' }) {
  const percentage = (current / max) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.text}>
          {current}/{max}
        </Text>
      </View>
      <View style={styles.barContainer}>
        <View
          style={[
            styles.barFill,
            {
              width: `${Math.min(percentage, 100)}%`,
            },
          ]}
        />
      </View>
      <Text style={styles.percentage}>{Math.round(percentage)}% Complete</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.m,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.surface,
  },
  text: {
    fontSize: 12,
    color: theme.colors.surface,
    opacity: 0.9,
  },
  barContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: theme.spacing.s,
  },
  barFill: {
    height: '100%',
    backgroundColor: theme.colors.secondary,
    borderRadius: 4,
  },
  percentage: {
    fontSize: 12,
    color: theme.colors.surface,
    opacity: 0.8,
    textAlign: 'right',
  },
});
