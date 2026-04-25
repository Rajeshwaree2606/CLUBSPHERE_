import React, { useRef } from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ActivityIndicator,
  Animated, View, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../utils/theme';

/**
 * GradientButton — premium animated button
 * variant: 'indigo' | 'purple' | 'cyan' | 'gold' | 'crimson' | 'danger' | 'success' | 'outline' | 'ghost'
 */
export default function GradientButton({
  title, onPress, variant = 'indigo', icon, iconRight,
  loading = false, disabled = false,
  size = 'medium', style, textStyle, fullWidth = true,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 40 }).start();

  const gradientMap = {
    indigo:   ['#4F6EF7', '#2A3F9E'],
    purple:   ['#7C3AED', '#4C1D95'],
    cyan:     ['#06B6D4', '#0284C7'],
    gold:     ['#F59E0B', '#D97706'],
    crimson:  ['#DC2626', '#991B1B'],
    danger:   ['#EF4444', '#B91C1C'],
    success:  ['#10B981', '#065F46'],
  };

  const shadowMap = {
    indigo: SHADOWS.indigo,
    gold:   SHADOWS.gold,
  };

  const heights   = { small: 38, medium: 52, large: 60 };
  const fontSizes = { small: 13, medium: 15, large: 17 };
  const paddingH  = { small: 16, medium: 24, large: 32 };

  const isGradient = Object.keys(gradientMap).includes(variant);
  const isOutline  = variant === 'outline';
  const isGhost    = variant === 'ghost';

  // For gradient variants: dark text? No — use white text for all except gold
  const textColor = isOutline || isGhost
    ? COLORS.indigo
    : variant === 'gold' ? COLORS.bgCard : '#FFFFFF';

  const iconColor = textColor;

  const content = (
    <View style={[
      styles.inner,
      { height: heights[size], paddingHorizontal: paddingH[size], opacity: disabled ? 0.4 : 1 },
    ]}>
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon && !iconRight && (
            <MaterialCommunityIcons
              name={icon} size={size === 'small' ? 16 : 20}
              color={iconColor} style={{ marginRight: 8 }}
            />
          )}
          <Text style={[styles.label, { fontSize: fontSizes[size], color: textColor, fontWeight: '700' }, textStyle]}>
            {title}
          </Text>
          {icon && iconRight && (
            <MaterialCommunityIcons
              name={icon} size={size === 'small' ? 16 : 20}
              color={iconColor} style={{ marginLeft: 8 }}
            />
          )}
        </>
      )}
    </View>
  );

  return (
    <Animated.View style={[{ transform: [{ scale }] }, fullWidth && { width: '100%' }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled || loading}
        activeOpacity={0.85}
        style={{ borderRadius: RADIUS.m, overflow: 'hidden' }}
      >
        {isGradient ? (
          <LinearGradient
            colors={gradientMap[variant]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ borderRadius: RADIUS.m, ...(shadowMap[variant] || SHADOWS.card) }}
          >
            {content}
          </LinearGradient>
        ) : isOutline ? (
          <View style={[styles.outlineWrap, { borderRadius: RADIUS.m }]}>
            {content}
          </View>
        ) : (
          <View style={[styles.ghostWrap, { borderRadius: RADIUS.m }]}>
            {content}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  inner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  label: { letterSpacing: 0.3 },
  outlineWrap: {
    borderWidth: 1.5, borderColor: COLORS.indigo,
    backgroundColor: COLORS.indigoGlow,
  },
  ghostWrap: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
});
