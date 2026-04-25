import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, TYPOGRAPHY } from '../utils/theme';

export default function XPBar({ current = 0, max = 1000, label }) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const pct = Math.min(current / max, 1);

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: pct,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [current, max]);

  const width = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <Text style={styles.label}>{label || `${current} XP`}</Text>
        <Text style={styles.max}>{max} XP</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width }]}>
          <LinearGradient
            colors={[COLORS.goldLight, COLORS.gold]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        {/* Shimmer dot */}
        <Animated.View style={[styles.glow, { left: width }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { ...TYPOGRAPHY.caption, color: COLORS.gold, fontWeight: '700' },
  max: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
  track: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: RADIUS.pill,
    overflow: 'visible',
  },
  fill: {
    height: '100%',
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -3,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.goldLight,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
});
