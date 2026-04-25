import React, { useState, useRef } from 'react';
import {
  View, TextInput, Text, StyleSheet, Animated,
  TouchableOpacity, Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../utils/theme';

export default function PremiumInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  leftIcon,
  multiline,
  numberOfLines,
  editable = true,
  error,
  style,
  inputStyle,
  autoCapitalize = 'none',
  webType,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const borderColor = isFocused
    ? (error ? COLORS.error : COLORS.gold)
    : (error ? COLORS.error : COLORS.border);

  const isSecure = secureTextEntry && !showPassword;

  const inputProps = Platform.OS === 'web' && webType
    ? { dataSet: { type: webType } }
    : {};

  return (
    <View style={[styles.wrapper, style]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}

      <View style={[
        styles.container,
        { borderColor },
        isFocused && styles.focusedContainer,
        error && styles.errorContainer,
      ]}>
        {/* Focus glow overlay (web-safe, non-blocking) */}
        {isFocused && (
          <View style={styles.glow} pointerEvents="none" />
        )}

        {leftIcon && (
          <View style={styles.leftIconWrap} pointerEvents="none">
            <MaterialCommunityIcons
              name={leftIcon}
              size={18}
              color={isFocused ? COLORS.gold : COLORS.textMuted}
            />
          </View>
        )}

        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithIcon,
            multiline && {
              height: numberOfLines ? numberOfLines * 26 : 80,
              textAlignVertical: 'top',
              paddingTop: 14,
            },
            !editable && styles.disabled,
            inputStyle,
            // Web: remove outline ring, use our custom border instead
            Platform.OS === 'web' && { outline: 'none' },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || label}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          {...inputProps}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(p => !p)}
            style={styles.eyeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.m,
  },
  label: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecond,
    marginBottom: 6,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgElevated,
    borderRadius: RADIUS.m,
    borderWidth: 1.5,
    // NOTE: NO overflow:hidden — this blocks pointer events on web
    position: 'relative',
    minHeight: 52,
  },
  focusedContainer: {
    backgroundColor: '#1A1A26',
  },
  errorContainer: {
    borderColor: COLORS.error,
  },
  glow: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(201,168,76,0.07)',
    borderRadius: RADIUS.m,
    zIndex: 0,
  },
  leftIconWrap: {
    paddingLeft: 14,
    paddingRight: 6,
    zIndex: 1,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '400',
    zIndex: 1,
    // Required on web for border-box model
    ...(Platform.OS === 'web' ? {
      outlineStyle: 'none',
      outlineWidth: 0,
      cursor: 'text',
    } : {}),
  },
  inputWithIcon: {
    paddingLeft: 4,
  },
  disabled: {
    color: COLORS.textMuted,
    opacity: 0.6,
  },
  eyeBtn: {
    padding: 14,
    zIndex: 2,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 5,
    marginLeft: 2,
  },
});
