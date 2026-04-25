import React, { useEffect, useRef } from 'react';
import {
  Modal, View, Text, StyleSheet, Animated, TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '../utils/theme';
import GradientButton from './GradientButton';

/**
 * ConfirmModal — premium delete/action confirm dialog.
 * Replaces ALL native Alert() calls.
 */
export default function ConfirmModal({
  visible,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger',  // 'danger' | 'gold'
  // Legacy prop support
  theme,
}) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 70, friction: 12, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 0.85, tension: 70, friction: 12, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const iconName  = variant === 'danger' ? 'alert-circle-outline' : 'check-circle-outline';
  const iconColor = variant === 'danger' ? COLORS.error : COLORS.gold;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onCancel} activeOpacity={1} />
        <Animated.View style={[styles.dialog, { transform: [{ scale: scaleAnim }] }]}>
          <View style={[styles.iconWrap, { backgroundColor: `${iconColor}1A` }]}>
            <MaterialCommunityIcons name={iconName} size={32} color={iconColor} />
          </View>

          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.actions}>
            <GradientButton
              title={cancelLabel}
              variant="ghost"
              onPress={onCancel}
              style={{ flex: 1 }}
              fullWidth={false}
            />
            <GradientButton
              title={confirmLabel}
              variant={variant === 'danger' ? 'danger' : 'gold'}
              onPress={onConfirm}
              style={{ flex: 1 }}
              fullWidth={false}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  dialog: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.modal,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.s,
    fontWeight: '700',
  },
  message: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecond,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.l,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.m,
    width: '100%',
    marginTop: SPACING.m,
  },
});
